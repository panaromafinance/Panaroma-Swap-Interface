import { useContext } from "react";
import { XCircle } from "react-feather";
import styled, { ThemeContext } from "styled-components/macro";

import { ThemedText } from "../../theme";
import { AutoColumn } from "../Column";
import { AutoRow } from "../Row";

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`;

export default function RejectPopup({
    message
  }: {
    message: string;
  }) {
  const theme = useContext(ThemeContext);

  return (
    <RowNoFlex>
        <div style={{ paddingRight: 16 }}>
          <XCircle color={theme.deprecated_red1} size={24} />
        </div>
        <AutoColumn gap="8px">
            <ThemedText.DeprecatedBody fontWeight={500}>
                {message}
            </ThemedText.DeprecatedBody>
        </AutoColumn>
    </RowNoFlex>
  );
}
