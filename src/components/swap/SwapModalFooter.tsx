import { Trans } from "@lingui/macro";
import { Currency, Percent, TradeType } from "@panaromafinance/panaromaswap_sdkcore";
import {
  ElementName,
  Event,
  EventName
} from "components/AmplitudeAnalytics/constants";
import { TraceEvent } from "components/AmplitudeAnalytics/TraceEvent";
import {
  formatPercentInBasisPointsNumber,
  formatToDecimal,
  getDurationFromDateMilliseconds,
  getDurationUntilTimestampSeconds,
  getTokenAddress
} from "components/AmplitudeAnalytics/utils";
import { useStablecoinValue } from "hooks/useStablecoinPrice";
import useTransactionDeadline from "hooks/useTransactionDeadline";
import { ReactNode } from "react";
import { Text } from "rebass";
import { InterfaceTrade } from "state/routing/types";
import {
  useClientSideRouter,
  useUserSlippageTolerance
} from "state/user/hooks";
import { computeRealizedPriceImpact } from "utils/prices";

import { ButtonError, ButtonLight } from "../Button";
import { AutoRow } from "../Row";
import { SwapCallbackError } from "./styleds";
import styled, { keyframes } from "styled-components/macro";

const StyledPolling = styled.div`
  display: flex;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-left: 10px;
  align-items: center;
  color: ${({ theme }) => theme.deprecated_text1};
  transition: 250ms ease color;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;


const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.deprecated_primaryText1};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: 250ms ease border-color;
  left: -3px;
  top: -3px;
`;

const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.deprecated_bg2};
  transition: 250ms ease background-color;
`;


interface AnalyticsEventProps {
  trade: InterfaceTrade<Currency, Currency, TradeType>;
  txHash: string | undefined;
  allowedSlippage: Percent;
  transactionDeadlineSecondsSinceEpoch: number | undefined;
  isAutoSlippage: boolean;
  isAutoRouterApi: boolean;
  tokenInAmountUsd: string | undefined;
  tokenOutAmountUsd: string | undefined;
  swapQuoteReceivedDate: Date | undefined;
}

const formatAnalyticsEventProperties = ({
  trade,
  txHash,
  allowedSlippage,
  transactionDeadlineSecondsSinceEpoch,
  isAutoSlippage,
  isAutoRouterApi,
  tokenInAmountUsd,
  tokenOutAmountUsd,
  swapQuoteReceivedDate
}: AnalyticsEventProps) => ({
  estimated_network_fee_usd: trade.gasUseEstimateUSD
    ? formatToDecimal(trade.gasUseEstimateUSD, 2)
    : undefined,
  transaction_hash: txHash,
  transaction_deadline_seconds: getDurationUntilTimestampSeconds(
    transactionDeadlineSecondsSinceEpoch
  ),
  token_in_amount_usd: tokenInAmountUsd
    ? parseFloat(tokenInAmountUsd)
    : undefined,
  token_out_amount_usd: tokenOutAmountUsd
    ? parseFloat(tokenOutAmountUsd)
    : undefined,
  token_in_address: getTokenAddress(trade.inputAmount.currency),
  token_out_address: getTokenAddress(trade.outputAmount.currency),
  token_in_symbol: trade.inputAmount.currency.symbol,
  token_out_symbol: trade.outputAmount.currency.symbol,
  token_in_amount: formatToDecimal(
    trade.inputAmount,
    trade.inputAmount.currency.decimals
  ),
  token_out_amount: formatToDecimal(
    trade.outputAmount,
    trade.outputAmount.currency.decimals
  ),
  price_impact_basis_points: formatPercentInBasisPointsNumber(
    computeRealizedPriceImpact(trade)
  ),
  allowed_slippage_basis_points:
    formatPercentInBasisPointsNumber(allowedSlippage),
  is_auto_router_api: isAutoRouterApi,
  is_auto_slippage: isAutoSlippage,
  chain_id:
    trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
      ? trade.inputAmount.currency.chainId
      : undefined,
  duration_from_first_quote_to_swap_submission_milliseconds:
    swapQuoteReceivedDate
      ? getDurationFromDateMilliseconds(swapQuoteReceivedDate)
      : undefined
});

export default function SwapModalFooter({
  trade,
  allowedSlippage,
  txHash,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
  loading
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>;
  txHash: string | undefined;
  allowedSlippage: Percent;
  onConfirm: () => void;
  swapErrorMessage: ReactNode | undefined;
  disabledConfirm: boolean;
  swapQuoteReceivedDate: Date | undefined;
  loading?: boolean;
}) {
  const transactionDeadlineSecondsSinceEpoch =
    useTransactionDeadline()?.toNumber(); // in seconds since epoch
  const isAutoSlippage = useUserSlippageTolerance() === "auto";
  const [clientSideRouter] = useClientSideRouter();
  const tokenInAmountUsd = useStablecoinValue(trade.inputAmount)?.toFixed(2);
  const tokenOutAmountUsd = useStablecoinValue(trade.outputAmount)?.toFixed(2);

  return (
    <>
      <AutoRow>
        <TraceEvent
          events={[Event.onClick]}
          element={ElementName.CONFIRM_SWAP_BUTTON}
          name={EventName.SWAP_SUBMITTED}
          properties={formatAnalyticsEventProperties({
            trade,
            txHash,
            allowedSlippage,
            transactionDeadlineSecondsSinceEpoch,
            isAutoSlippage,
            isAutoRouterApi: !clientSideRouter,
            tokenInAmountUsd,
            tokenOutAmountUsd,
            swapQuoteReceivedDate
          })}>
          {loading ? (
            <ButtonLight>
              <StyledPolling>
                <StyledPollingDot>
                  <Spinner />
                </StyledPollingDot>
              </StyledPolling>
              Checking Wallet Integrity...
            </ButtonLight>
            ) : (

              <ButtonError
                onClick={onConfirm}
                disabled={disabledConfirm}
                style={{ margin: "10px 0 0 0" }}
                id={ElementName.CONFIRM_SWAP_BUTTON}>
                <Text fontSize={20} fontWeight={500}>
                  <Trans>Confirm Swap</Trans>
                </Text>
              </ButtonError>
            )
          } 
        </TraceEvent>

        {swapErrorMessage ? (
          <SwapCallbackError error={swapErrorMessage} />
        ) : null}
      </AutoRow>
    </>
  );
}