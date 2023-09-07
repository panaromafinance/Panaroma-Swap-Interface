import { Trans } from "@lingui/macro";
import {
  Currency,
  CurrencyAmount,
  Fraction,
  Percent
} from "@panaromafinance/panaromaswap_sdkcore";
import { Text } from "rebass";

import { ButtonLight, ButtonPrimary } from "../../components/Button";
import CurrencyLogo from "../../components/CurrencyLogo";
import { RowBetween, RowFixed } from "../../components/Row";
import { Field } from "../../state/mint/actions";
import { ThemedText } from "../../theme";
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

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
  loading
}: {
  noLiquidity?: boolean;
  price?: Fraction;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  poolTokenPercentage?: Percent;
  onAdd: () => void;
  loading?: boolean;
}) {
  return (
    <>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{currencies[Field.CURRENCY_A]?.symbol} Deposited</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CurrencyLogo
            currency={currencies[Field.CURRENCY_A]}
            style={{ marginRight: "8px" }}
          />
          <ThemedText.DeprecatedBody>
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{currencies[Field.CURRENCY_B]?.symbol} Deposited</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CurrencyLogo
            currency={currencies[Field.CURRENCY_B]}
            style={{ marginRight: "8px" }}
          />
          <ThemedText.DeprecatedBody>
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Rates</Trans>
        </ThemedText.DeprecatedBody>
        <ThemedText.DeprecatedBody>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(
            4
          )} ${currencies[Field.CURRENCY_B]?.symbol}`}
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <RowBetween style={{ justifyContent: "flex-end" }}>
        <ThemedText.DeprecatedBody>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price
            ?.invert()
            .toSignificant(4)} ${currencies[Field.CURRENCY_A]?.symbol}`}
        </ThemedText.DeprecatedBody>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Share of Pool:</Trans>
        </ThemedText.DeprecatedBody>
        <ThemedText.DeprecatedBody>
          <Trans>
            {noLiquidity ? "100" : poolTokenPercentage?.toSignificant(4)}%
          </Trans>
        </ThemedText.DeprecatedBody>
      </RowBetween>
        {
          loading ? (
            <ButtonLight>
              <StyledPolling>
                <StyledPollingDot>
                  <Spinner />
                </StyledPollingDot>
              </StyledPolling>
              Checking Wallet Integrity...
            </ButtonLight>
          ) : (
            <ButtonPrimary style={{ margin: "20px 0 0 0" }} onClick={onAdd}>
              <Text fontWeight={500} fontSize={20}>
                {
                  noLiquidity ? (
                    <Trans>Create Pool & Supply</Trans>
                  ) : (
                    <Trans>Confirm Supply</Trans>
                  )
                }
              </Text>
            </ButtonPrimary>
          )
        }
    </>
  );
}