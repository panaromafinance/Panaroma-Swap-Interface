import {
  Currency,
  CurrencyAmount,
  Token,
  TradeType
} from "@panaromafinance/panaromaswap_sdkcore";
import { Pair, Route as V1Route } from "@panaromafinance/panaromaswap_v1sdk";
import { FeeAmount, Pool, Route as V2edgeRoute } from "@panaromafinance/panaromaswap_v2edgesdk";

import { nativeOnChain } from "../../constants/tokens";
import {
  GetQuoteResult,
  InterfaceTrade,
  V1PoolInRoute,
  V2edgePoolInRoute
} from "./types";

/**
 * Transforms a Routing API quote into an array of routes that can be used to create
 * a `Trade`.
 */
export function computeRoutes(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  tradeType: TradeType,
  quoteResult: Pick<GetQuoteResult, "route"> | undefined
) {
  if (!quoteResult || !quoteResult.route || !currencyIn || !currencyOut)
    return undefined;

  if (quoteResult.route.length === 0) return [];

  const parsedTokenIn = parseToken(quoteResult.route[0][0].tokenIn);
  const parsedTokenOut = parseToken(
    quoteResult.route[0][quoteResult.route[0].length - 1].tokenOut
  );

  if (parsedTokenIn.address !== currencyIn.wrapped.address) return undefined;
  if (parsedTokenOut.address !== currencyOut.wrapped.address) return undefined;

  const parsedCurrencyIn = currencyIn.isNative
    ? nativeOnChain(currencyIn.chainId)
    : parsedTokenIn;
  const parsedCurrencyOut = currencyOut.isNative
    ? nativeOnChain(currencyOut.chainId)
    : parsedTokenOut;

  try {
    return quoteResult.route.map((route) => {
      if (route.length === 0) {
        throw new Error("Expected route to have at least one pair or pool");
      }
      const rawAmountIn = route[0].amountIn;
      const rawAmountOut = route[route.length - 1].amountOut;

      if (!rawAmountIn || !rawAmountOut) {
        throw new Error("Expected both amountIn and amountOut to be present");
      }

      return {
        routev2edge: isV2edgeRoute(route)
          ? new V2edgeRoute(
              route.map(parsePool),
              parsedCurrencyIn,
              parsedCurrencyOut
            )
          : null,
        routev1: !isV2edgeRoute(route)
          ? new V1Route(
              route.map(parsePair),
              parsedCurrencyIn,
              parsedCurrencyOut
            )
          : null,
        inputAmount: CurrencyAmount.fromRawAmount(
          parsedCurrencyIn,
          rawAmountIn
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
          parsedCurrencyOut,
          rawAmountOut
        )
      };
    });
  } catch (e) {
    // `Route` constructor may throw if inputs/outputs are temporarily out of sync
    // (RTK-Query always returns the latest data which may not be the right inputs/outputs)
    // This is not fatal and will fix itself in future render cycles
    console.error(e);
    return undefined;
  }
}

export function transformRoutesToTrade<TTradeType extends TradeType>(
  route: ReturnType<typeof computeRoutes>,
  tradeType: TTradeType,
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
): InterfaceTrade<Currency, Currency, TTradeType> {
  return new InterfaceTrade({
    v1Routes:
      route
        ?.filter(
          (
            r
          ): r is typeof route[0] & {
            routev1: NonNullable<typeof route[0]["routev1"]>;
          } => r.routev1 !== null
        )
        .map(({ routev1, inputAmount, outputAmount }) => ({
          routev1,
          inputAmount,
          outputAmount
        })) ?? [],
    v2edgeRoutes:
      route
        ?.filter(
          (
            r
          ): r is typeof route[0] & {
            routev2edge: NonNullable<typeof route[0]["routev2edge"]>;
          } => r.routev2edge !== null
        )
        .map(({ routev2edge, inputAmount, outputAmount }) => ({
          routev2edge,
          inputAmount,
          outputAmount
        })) ?? [],
    tradeType,
    gasUseEstimateUSD
  });
}

const parseToken = ({
  address,
  chainId,
  decimals,
  symbol
}: GetQuoteResult["route"][0][0]["tokenIn"]): Token => {
  return new Token(chainId, address, parseInt(decimals.toString()), symbol);
};

const parsePool = ({
  fee,
  sqrtRatioX96,
  liquidity,
  tickCurrent,
  tokenIn,
  tokenOut
}: V2edgePoolInRoute): Pool =>
  new Pool(
    parseToken(tokenIn),
    parseToken(tokenOut),
    parseInt(fee) as FeeAmount,
    sqrtRatioX96,
    liquidity,
    parseInt(tickCurrent)
  );

const parsePair = ({ reserve0, reserve1 }: V1PoolInRoute): Pair =>
  new Pair(
    CurrencyAmount.fromRawAmount(parseToken(reserve0.token), reserve0.quotient),
    CurrencyAmount.fromRawAmount(parseToken(reserve1.token), reserve1.quotient)
  );

function isV2edgeRoute(
  route: V2edgePoolInRoute[] | V1PoolInRoute[]
): route is V2edgePoolInRoute[] {
  return route[0].type === "v2edge-pool";
}
