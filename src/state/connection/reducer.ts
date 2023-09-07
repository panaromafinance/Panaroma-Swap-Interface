import { createSlice } from "@reduxjs/toolkit";
import { ConnectionType } from "connection";

export interface ConnectionState {
  errorByConnectionType: Record<ConnectionType, string | undefined>;
}

export const initialState: ConnectionState = {
  errorByConnectionType: {
    ["INJECTED"]: undefined,
    ["FORTMATIC"]: undefined,
    ["WALLET_CONNECT"]: undefined,
    ["COINBASE_WALLET"]: undefined,
    ["NETWORK"]: undefined,
    ["GNOSIS_SAFE"]: undefined
  }
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    updateConnectionError(
      state,
      {
        payload: { connectionType, error }
      }: {
        payload: { connectionType: ConnectionType; error: string | undefined };
      }
    ) {
      state.errorByConnectionType[connectionType] = error;
    }
  }
});

export const { updateConnectionError } = connectionSlice.actions;
export default connectionSlice.reducer;
