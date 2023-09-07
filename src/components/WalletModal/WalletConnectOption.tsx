import { Connector } from "@web3-react/types";
import WALLET_CONNECT_ICON_URL from "assets/images/walletConnectIcon.svg";
import { ConnectionType, walletConnectConnection } from "connection";
import { getConnectionName } from "connection/utils";

import Option from "./Option";

const BASE_PROPS = {
  color: "#4196FC",
  icon: WALLET_CONNECT_ICON_URL,
  id: "wallet-connect"
};

export function WalletConnectOption({
  tryActivation,
  disabled
}: {
  tryActivation: (connector: Connector) => void;
  disabled?: boolean
}) {
  const isActive = walletConnectConnection.hooks.useIsActive();
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      disabled={disabled}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  );
}
