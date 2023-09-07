import { Currency, CurrencyAmount, TradeType } from "@panaromafinance/panaromaswap_sdkcore";
import { useMemo } from "react";
import { InterfaceTrade, TradeState } from "state/routing/types";
import { useRoutingAPITrade } from "state/routing/useRoutingAPITrade";

import useAutoRouterSupported from "./useAutoRouterSupported";
import { useClientSideV2edgeTrade } from "./useClientSideV2edgeTrade";
import useDebounce from "./useDebounce";
import useIsWindowVisible from "./useIsWindowVisible";

/**
 * Returns the best v1+v2edge trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState;
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined;
} {
  const autoRouterSupported = useAutoRouterSupported();
  const isWindowVisible = useIsWindowVisible();

  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(
      () => [amountSpecified, otherCurrency],
      [amountSpecified, otherCurrency]
    ),
    200
  );

  const routingAPITrade = useRoutingAPITrade(
    tradeType,
    autoRouterSupported && isWindowVisible ? debouncedAmount : undefined,
    debouncedOtherCurrency
  );

  // console.log(routingAPITrade)
  const isLoading = routingAPITrade.state === TradeState.LOADING;
  const useFallback =
    !autoRouterSupported || routingAPITrade.state === TradeState.NO_ROUTE_FOUND;

  // only use client side router if routing api trade failed or is not supported
  const bestV2edgeTrade = useClientSideV2edgeTrade(
    tradeType,
    useFallback ? debouncedAmount : undefined,
    useFallback ? debouncedOtherCurrency : undefined
  );
  // console.log(bestV2edgeTrade)
  // only return gas estimate from api if routing api trade is used
  return useMemo(
    () => ({
      ...(useFallback ? bestV2edgeTrade : routingAPITrade),
      ...(isLoading ? { state: TradeState.LOADING } : {})
    }),
    [bestV2edgeTrade, isLoading, routingAPITrade, useFallback]
  );
}
