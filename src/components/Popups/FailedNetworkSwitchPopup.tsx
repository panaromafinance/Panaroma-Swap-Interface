import { Trans } from "@lingui/macro";
import { getChainInfo } from "constants/chainInfo";
import { SupportedChainId } from "constants/chains";
import { useContext } from "react";
import { AlertCircle } from "react-feather";
import styled, { ThemeContext } from "styled-components/macro";

import { ThemedText } from "../../theme";
import { AutoColumn } from "../Column";
import { AutoRow } from "../Row";

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`;

export default function FailedNetworkSwitchPopup({
  chainId
}: {
  chainId: SupportedChainId;
}) {
  const chainInfo = getChainInfo(chainId);
  const theme = useContext(ThemeContext);

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <AlertCircle color={theme.deprecated_red1} size={24} />
      </div>
      <AutoColumn gap="8px">
        <ThemedText.DeprecatedBody fontWeight={500}>
          <Trans>
            Failed to switch networks from the Panaromaswap Interface. In order
            to use Panaromaswap on {chainInfo?.label} {" "}
            change the network in your wallet. We are only supporting POLYGON network.
          </Trans>
        </ThemedText.DeprecatedBody>
      </AutoColumn>
    </RowNoFlex>
  );
}
