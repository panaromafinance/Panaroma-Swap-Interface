import { Trans } from "@lingui/macro";
import { Percent } from "@panaromafinance/panaromaswap_sdkcore";
import { OutlineCard } from "components/Card";
import { useContext } from "react";
import styled, { ThemeContext } from "styled-components/macro";
import { opacify } from "theme/utils";

import { ThemedText } from "../../theme";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";
import { MouseoverTooltip } from "../Tooltip";
import { formatPriceImpact } from "./FormattedPriceImpact";

const StyledCard = styled(OutlineCard)`
  padding: 12px;
  border: 1px solid ${({ theme }) => opacify(24, theme.deprecated_error)};
`;

interface PriceImpactWarningProps {
  priceImpact: Percent;
}

export default function PriceImpactWarning({
  priceImpact
}: PriceImpactWarningProps) {
  const theme = useContext(ThemeContext);

  return (
    <StyledCard>
      <AutoColumn gap="8px">
        <MouseoverTooltip
          text={
            <Trans>
              A swap of this size may have a high price impact, given the
              current liquidity in the pool. There may be a large difference
              between the amount of your input token and what you will receive
              in the output token
            </Trans>
          }>
          <RowBetween>
            <RowFixed>
              <ThemedText.DeprecatedSubHeader color={theme.deprecated_error}>
                <Trans>Price impact warning</Trans>
              </ThemedText.DeprecatedSubHeader>
            </RowFixed>
            <ThemedText.DeprecatedLabel
              textAlign="right"
              fontSize={14}
              color={theme.deprecated_error}>
              {formatPriceImpact(priceImpact)}
            </ThemedText.DeprecatedLabel>
          </RowBetween>
        </MouseoverTooltip>
      </AutoColumn>
    </StyledCard>
  );
}
