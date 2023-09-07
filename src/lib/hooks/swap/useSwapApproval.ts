import { Protocol, Trade } from "@panaromafinance/panaromaswap_routersdk";
import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType
} from "@panaromafinance/panaromaswap_sdkcore";
import { Pair, Route as V1Route, Trade as V1Trade } from "@panaromafinance/panaromaswap_v1sdk";
import { Pool, Route as V2edgeRoute, Trade as V2edgeTrade } from "@panaromafinance/panaromaswap_v2edgesdk";
import { useWeb3React } from "@web3-react/core";
import {
  SWAP_ROUTER_ADDRESSES,
  V1_ROUTER_ADDRESS,
  V2edge_ROUTER_ADDRESS
} from "constants/addresses";
import { useMemo } from "react";
import {
  getTxOptimizedSwapRouter,
  SwapRouterVersion
} from "utils/getTxOptimizedSwapRouter";

import {
  ApprovalState,
  useApproval,
  useApprovalStateForSpender
} from "../useApproval";
export { ApprovalState } from "../useApproval";

/** Returns approval state for all known swap routers */
function useSwapApprovalStates(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): { v1: ApprovalState; v2edge: ApprovalState; v1V2edge: ApprovalState } {
  const { chainId } = useWeb3React();

  const amountToApprove = useMemo(
    () =>
      trade && trade.inputAmount.currency.isToken
        ? trade.maximumAmountIn(allowedSlippage)
        : undefined,
    [trade, allowedSlippage]
  );

  //console.log("+++ amountToApprove", amountToApprove);
  const test = amountToApprove?.quotient.toString();
  // console.log("+++ amountToApprove 2", test);
  //console.log("+++ amountToApprove 2 trade", trade);
  // amountToApprove.quotient = amountToApprove?.quotient + 1%;

  const v1RouterAddress = chainId ? V1_ROUTER_ADDRESS[chainId] : undefined;
  const v2edgeRouterAddress = chainId ? V2edge_ROUTER_ADDRESS[chainId] : undefined;
  const swapRouterAddress = chainId
    ? SWAP_ROUTER_ADDRESSES[chainId]
    : undefined;
  const v1 = useApprovalStateForSpender(
    amountToApprove,
    v1RouterAddress,
    useIsPendingApproval
  );
  const v2edge = useApprovalStateForSpender(
    amountToApprove,
    v2edgeRouterAddress,
    useIsPendingApproval
  );
  const v1V2edge = useApprovalStateForSpender(
    amountToApprove,
    swapRouterAddress,
    useIsPendingApproval
  );

  return useMemo(() => ({ v1, v2edge, v1V2edge }), [v1, v1V2edge, v2edge]);
}

export function useSwapRouterAddress(
  trade:
    | V1Trade<Currency, Currency, TradeType>
    | V2edgeTrade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined
) {
  const { chainId } = useWeb3React();
  return useMemo(
    () =>
      chainId
        ? trade instanceof V1Trade
          ? V1_ROUTER_ADDRESS[chainId]
          : trade instanceof V2edgeTrade
          ? V2edge_ROUTER_ADDRESS[chainId]
          : SWAP_ROUTER_ADDRESSES[chainId]
        : undefined,
    [chainId, trade]
  );
}

// wraps useApproveCallback in the context of a swap
export default function useSwapApproval(
  trade:
    | V1Trade<Currency, Currency, TradeType>
    | V2edgeTrade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency> // defaults to trade.maximumAmountIn(allowedSlippage)
) {
  const amountToApprove = useMemo(
    () =>
      amount ||
      (trade && trade.inputAmount.currency.isToken
        ? trade.maximumAmountIn(allowedSlippage)
        : undefined),
    [amount, trade, allowedSlippage]
  );
  const spender = useSwapRouterAddress(trade);

  return useApproval(amountToApprove, spender, useIsPendingApproval);
}

export function useSwapApprovalOptimizedTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
):
  | V1Trade<Currency, Currency, TradeType>
  | V2edgeTrade<Currency, Currency, TradeType>
  | Trade<Currency, Currency, TradeType>
  | undefined {
  const onlyV1Routes = trade?.routes.every(
    (route) => route.protocol === Protocol.V1
  );
  const onlyV2edgeRoutes = trade?.routes.every(
    // (route) => route.protocol === Protocol.V2edge
    // [TODO]
    (route) => route.protocol === Protocol.V1
  );
  const tradeHasSplits = (trade?.routes.length ?? 0) > 1;

  const approvalStates = useSwapApprovalStates(
    trade,
    allowedSlippage,
    useIsPendingApproval
  );

  const optimizedSwapRouter = useMemo(
    () =>
      getTxOptimizedSwapRouter({
        onlyV1Routes,
        onlyV2edgeRoutes,
        tradeHasSplits,
        approvalStates
      }),
    [approvalStates, tradeHasSplits, onlyV1Routes, onlyV2edgeRoutes]
  );

  return useMemo(() => {
    if (!trade) return undefined;

    try {
      switch (optimizedSwapRouter) {
        case SwapRouterVersion.V1V2edge:
          return trade;
        case SwapRouterVersion.V1:
          const pairs = trade.swaps[0].route.pools.filter(
            (pool) => pool instanceof Pair
          ) as Pair[];
          const v1Route = new V1Route(
            pairs,
            trade.inputAmount.currency,
            trade.outputAmount.currency
          );
          return new V1Trade(v1Route, trade.inputAmount, trade.tradeType);
        case SwapRouterVersion.V2edge:
          return V2edgeTrade.createUncheckedTradeWithMultipleRoutes({
            routes: trade.swaps.map(({ route, inputAmount, outputAmount }) => ({
              route: new V2edgeRoute(
                route.pools.filter((p): p is Pool => p instanceof Pool),
                inputAmount.currency,
                outputAmount.currency
              ),
              inputAmount,
              outputAmount
            })),
            tradeType: trade.tradeType
          });
        default:
          return undefined;
      }
    } catch (e) {
      console.debug(e);
      return undefined;
    }
  }, [trade, optimizedSwapRouter]);
}
