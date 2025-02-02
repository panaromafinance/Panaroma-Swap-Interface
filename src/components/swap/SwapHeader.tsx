import { Trans } from "@lingui/macro";
import { Percent } from "@panaromafinance/panaromaswap_sdkcore";
import styled from "styled-components/macro";

import { ThemedText } from "../../theme";
import { RowBetween, RowFixed } from "../Row";
import SettingsTab from "../Settings";

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.deprecated_text2};
`;

export default function SwapHeader({
  allowedSlippage
}: {
  allowedSlippage: Percent;
}) {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <ThemedText.DeprecatedBlack
            fontWeight={500}
            fontSize={16}
            style={{ marginRight: "8px" }}>
            <Trans>Swap</Trans>
          </ThemedText.DeprecatedBlack>
        </RowFixed>
        <RowFixed>
          <SettingsTab placeholderSlippage={allowedSlippage} />
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  );
}
