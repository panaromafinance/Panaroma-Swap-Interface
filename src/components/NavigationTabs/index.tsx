import { Trans } from "@lingui/macro";
import { Percent } from "@panaromafinance/panaromaswap_sdkcore";
import useTheme from "hooks/useTheme";
import { ReactNode } from "react";
import { ArrowLeft } from "react-feather";
import { Link as HistoryLink, useLocation } from "react-router-dom";
import { Box } from "rebass";
import { useAppDispatch } from "state/hooks";
import { resetMintState } from "state/mint/actions";
import { resetMintState as resetMintV2edgeState } from "state/mint/v2edge/actions";
import styled from "styled-components/macro";
import { ThemedText } from "theme";

import Row, { RowBetween } from "../Row";
import SettingsTab from "../Settings";

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`;

const StyledHistoryLink = styled(HistoryLink) <{ flex: string | undefined }>`
  flex: ${({ flex }) => flex ?? "none"};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex: none;
    margin-right: 10px;
  `};
`;

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.deprecated_text1};
`;

export function FindPoolTabs({ origin }: { origin: string }) {
  return (
    <Tabs>
      <RowBetween style={{ padding: "1rem 1rem 0 1rem", position: "relative" }}>
        <HistoryLink to={origin}>
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)"
          }}>
          <Trans>Import V1 Pool</Trans>
        </ActiveText>
      </RowBetween>
    </Tabs>
  );
}

export function AddRemoveTabs({
  adding,
  creating,
  defaultSlippage,
  positionID,
  children,
  locking,
  withdraw
}: {
  adding: boolean;
  creating: boolean;
  defaultSlippage: Percent;
  positionID?: string | undefined;
  showBackLink?: boolean;
  children?: ReactNode | undefined;
  locking?: boolean;
  withdraw?: boolean
}) {
  const theme = useTheme();
  // reset states on back
  const dispatch = useAppDispatch();
  const location = useLocation();

  // detect if back should redirect to v2edge or v1 pool page
  const poolLink = location.pathname.includes("add/v1")
    ? "/pool/v1"
    : "/pool/v1" + (!!positionID ? `/${positionID.toString()}` : "");

  return (
    <Tabs>
      <RowBetween style={{ padding: "1rem 1rem 0 1rem" }}>
        <StyledHistoryLink
          to={poolLink}
          onClick={() => {
            if (adding) {
              // not 100% sure both of these are needed
              dispatch(resetMintState());
              dispatch(resetMintV2edgeState());
            }
          }}
          flex={children ? "1" : undefined}>
          <StyledArrowLeft stroke={theme.deprecated_text2} />
        </StyledHistoryLink>
        <ThemedText.DeprecatedMediumHeader
          fontWeight={500}
          fontSize={20}
          style={{
            flex: "1",
            margin: "auto",
            textAlign: children ? "start" : "center"
          }}>
          {creating ? (
            <Trans>Create a pair</Trans>
          ) : adding ? (
            <Trans>Add Liquidity</Trans>
          ) : locking ? (
            <Trans>Lock Liquidity</Trans>
          ) : withdraw ? (
            <Trans>Withdraw Liquidity</Trans>
          ) : (
            <Trans>Remove Liquidity</Trans>
          )}
        </ThemedText.DeprecatedMediumHeader>
        <Box style={{ marginRight: ".5rem" }}>{children}</Box>
        <SettingsTab placeholderSlippage={defaultSlippage} />
      </RowBetween>
    </Tabs>
  );
}

export function CreateProposalTabs() {
  return (
    <Tabs>
      <Row style={{ padding: "1rem 1rem 0 1rem" }}>
        <HistoryLink to="/vote">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText style={{ marginLeft: "auto", marginRight: "auto" }}>
          Create Proposal
        </ActiveText>
      </Row>
    </Tabs>
  );
}
