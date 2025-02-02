import { Trans } from "@lingui/macro";
import CopyHelper from "components/AccountDetails/Copy";
import Column from "components/Column";
import useTheme from "hooks/useTheme";
import { AlertOctagon } from "react-feather";
import styled from "styled-components/macro";
import { ExternalLink, ThemedText } from "theme";

import Modal from "../Modal";

const ContentWrapper = styled(Column)`
  align-items: center;
  margin: 32px;
  text-align: center;
`;
const WarningIcon = styled(AlertOctagon)`
  min-height: 22px;
  min-width: 22px;
  color: ${({ theme }) => theme.deprecated_warning};
`;
const Copy = styled(CopyHelper)`
  font-size: 12px;
`;

interface ConnectedAccountBlockedProps {
  account: string | null | undefined;
  isOpen: boolean;
}

export default function ConnectedAccountBlocked(
  props: ConnectedAccountBlockedProps
) {
  const theme = useTheme();
  return (
    <Modal isOpen={props.isOpen} onDismiss={Function.prototype()}>
      <ContentWrapper>
        <WarningIcon />
        <ThemedText.DeprecatedLargeHeader
          lineHeight={2}
          marginBottom={1}
          marginTop={1}>
          <Trans>Blocked Address</Trans>
        </ThemedText.DeprecatedLargeHeader>
        <ThemedText.DeprecatedDarkGray fontSize={12} marginBottom={12}>
          {props.account}
        </ThemedText.DeprecatedDarkGray>
        <ThemedText.DeprecatedMain fontSize={14} marginBottom={12}>
          <Trans>
            This address is blocked on the Panaromaswap Labs interface because it is
            associated with one or more
          </Trans>{" "}
          <ExternalLink href="https://help.panaromaswap.org/en/articles/6149816">
            <Trans>blocked activities</Trans>
          </ExternalLink>
          .
        </ThemedText.DeprecatedMain>
        <ThemedText.DeprecatedMain fontSize={12}>
          <Trans>
            If you believe this is an error, please send an email including your
            address to{" "}
          </Trans>{" "}
        </ThemedText.DeprecatedMain>
        <Copy
          iconSize={12}
          toCopy="compliance@panaromaswap.org"
          color={theme.deprecated_primary1}
          iconPosition="right">
          compliance@panaromaswap.org
        </Copy>
      </ContentWrapper>
    </Modal>
  );
}
