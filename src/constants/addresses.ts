import { FACTORY_ADDRESS as V1_FACTORY_ADDRESS } from "@panaromafinance/panaromaswap_v1sdk";
import { FACTORY_ADDRESS as V2edge_FACTORY_ADDRESS } from "@panaromafinance/panaromaswap_v2edgesdk";

import { constructSameAddressMap } from "../utils/constructSameAddressMap";
import { SupportedChainId } from "./chains";
// import { POOL_INIT_CODE_HASH } from '@panaromafinance/panaromaswap_v2edgesdk'
// import { INIT_CODE_HASH } from '@panaromafinance/panaromaswap_v1sdk'

type AddressMap = { [chainId: number]: string };

export const PANA_ADDRESS: AddressMap = constructSameAddressMap(
  "0x4e5E55bAeEf3bc747D22123cE4ADE3661c916a3e"
);

export const V1_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(
  V1_FACTORY_ADDRESS,
  [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON
  ]
);
//pheriphery
export const V1_ROUTER_ADDRESS: AddressMap = constructSameAddressMap(
  "0x7CB563d432797ec531B910e69b1156B2A1493115",
  [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON
  ]
);

// celo v2edge addresses
const CELO_V2edge_CORE_FACTORY_ADDRESSES =
  "0x0000000000000000000000000000000000000000";
const CELO_V2edge_ROUTER_ADDRESS = "0x0000000000000000000000000000000000000000";
const CELO_V2edge_MIGRATOR_ADDRESSES = "0x0000000000000000000000000000000000000000";
const CELO_MULTICALL_ADDRESS = "0x0000000000000000000000000000000000000000";
const CELO_QUOTER_ADDRESSES = "0x0000000000000000000000000000000000000000";
const CELO_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES =
  "0x0000000000000000000000000000000000000000";
const CELO_TICK_LENS_ADDRESSES = "0x0000000000000000000000000000000000000000";

/* V2edge Contract Addresses */
export const V2edge_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V2edge_FACTORY_ADDRESS, [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON
  ]),
};

export const V2edge_ROUTER_ADDRESS: AddressMap = {
  ...constructSameAddressMap("0x0000000000000000000000000000000000000000", [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON,
    SupportedChainId.POLYGON_MUMBAI
  ]),
};

export const V2edge_MIGRATOR_ADDRESSES: AddressMap = {
  ...constructSameAddressMap("0x0000000000000000000000000000000000000000", [
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON
  ]),
};

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap("0x26DbFd559b4F2d14B60FAE913514bC330848fD36", [
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.OPTIMISM,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.ARBITRUM_ONE
  ]),
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap("0xcB3A1874D28c9e016E3D2666002eaD9d104c30e0", [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON,
    SupportedChainId.POLYGON_MUMBAI
  ]),
};

/**
 * The oldest V0 governance address
 */
export const GOVERNANCE_ALPHA_V0_ADDRESSES: AddressMap =
  constructSameAddressMap("0x0000000000000000000000000000000000000000");
/**
 * The older V1 governance address
 */
export const GOVERNANCE_ALPHA_V1_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: "0x0000000000000000000000000000000000000000"
};
/**
 * The latest governor bravo that is currently admin of timelock
 */
export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: "0x0000000000000000000000000000000000000000"
};

export const TIMELOCK_ADDRESS: AddressMap = constructSameAddressMap(
  "0x0000000000000000000000000000000000000000"
);

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: "0x0000000000000000000000000000000000000000"
};

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: "0x0000000000000000000000000000000000000000"
};

export const QUOTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap("0x0000000000000000000000000000000000000000", [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON
  ]),
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap("0x0000000000000000000000000000000000000000", [
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.ARBITRUM_GOERLI,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON
  ]),
};

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  [SupportedChainId.ROPSTEN]: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  [SupportedChainId.GOERLI]: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  [SupportedChainId.RINKEBY]: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
};

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: "0x0000000000000000000000000000000000000000"
};

export const TICK_LENS_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: "0x0000000000000000000000000000000000000000",
  [SupportedChainId.ARBITRUM_GOERLI]:
    "0x0000000000000000000000000000000000000000",
};
