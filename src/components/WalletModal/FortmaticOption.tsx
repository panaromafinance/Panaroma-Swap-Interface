import { Connector } from "@web3-react/types";
import FORTMATIC_ICON_URL from "assets/images/fortmaticIcon.png";
import { ConnectionType, fortmaticConnection } from "connection";
import { getConnectionName } from "connection/utils";

import Option from "./Option";

const BASE_PROPS = {
  color: "#6748FF",
  icon: FORTMATIC_ICON_URL,
  id: "fortmatic"
};

export function FortmaticOption({
  tryActivation,
  disabled
}: {
  tryActivation: (connector: Connector) => void;
  disabled?: boolean
}) {
  const isActive = fortmaticConnection.hooks.useIsActive();
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      disabled={disabled}
      onClick={() => tryActivation(fortmaticConnection.connector)}
      header={getConnectionName(ConnectionType.FORTMATIC)}
    />
  );
}
