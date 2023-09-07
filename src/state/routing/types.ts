import { Trade } from "@panaromafinance/panaromaswap_routersdk";
import {
  Currency,
  CurrencyAmount,
  Token,
  TradeType
} from "@panaromafinance/panaromaswap_sdkcore";
import { Route as V1Route } from "@panaromafinance/panaromaswap_v1sdk";
import { Route as V2edgeRoute } from "@panaromafinance/panaromaswap_v2edgesdk";

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING
}

// from https://github.com/Panaromaswap/routing-api/blob/main/lib/handlers/schema.ts

export type TokenInRoute = Pick<
  Token,
  "address" | "chainId" | "symbol" | "decimals"
>;

export type V2edgePoolInRoute = {
  type: "v2edge-pool";
  tokenIn: TokenInRoute;
  tokenOut: TokenInRoute;
  sqrtRatioX96: string;
  liquidity: string;
  tickCurrent: string;
  fee: string;
  amountIn?: string;
  amountOut?: string;

  // not used in the interface
  address?: string;
};

export type V1Reserve = {
  token: TokenInRoute;
  quotient: string;
};

export type V1PoolInRoute = {
  type: "v1-pool";
  tokenIn: TokenInRoute;
  tokenOut: TokenInRoute;
  reserve0: V1Reserve;
  reserve1: V1Reserve;
  amountIn?: string;
  amountOut?: string;

  // not used in the interface
  // avoid returning it from the client-side smart-order-router
  address?: string;
};

export interface GetQuoteResult {
  quoteId?: string;
  blockNumber: string;
  amount: string;
  amountDecimals: string;
  gasPriceWei: string;
  gasUseEstimate: string;
  gasUseEstimateQuote: string;
  gasUseEstimateQuoteDecimals: string;
  gasUseEstimateUSD: string;
  methodParameters?: { calldata: string; value: string };
  quote: string;
  quoteDecimals: string;
  quoteGasAdjusted: string;
  quoteGasAdjustedDecimals: string;
  route: Array<V2edgePoolInRoute[] | V1PoolInRoute[]>;
  routeString: string;
}

export class InterfaceTrade<
  TInput extends Currency,
  TOutput extends Currency,
  TTradeType extends TradeType
> extends Trade<TInput, TOutput, TTradeType> {
  gasUseEstimateUSD: CurrencyAmount<Token> | null | undefined;

  constructor({
    gasUseEstimateUSD,
    ...routes
  }: {
    gasUseEstimateUSD?: CurrencyAmount<Token> | undefined | null;
    v1Routes: {
      routev1: V1Route<TInput, TOutput>;
      inputAmount: CurrencyAmount<TInput>;
      outputAmount: CurrencyAmount<TOutput>;
    }[];
    v2edgeRoutes: {
      routev2edge: V2edgeRoute<TInput, TOutput>;
      inputAmount: CurrencyAmount<TInput>;
      outputAmount: CurrencyAmount<TOutput>;
    }[];
    tradeType: TTradeType;
  }) {
    super(routes);
    this.gasUseEstimateUSD = gasUseEstimateUSD;
  }
}
