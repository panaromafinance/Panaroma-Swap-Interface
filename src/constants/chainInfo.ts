import ethereumLogoUrl from "assets/images/ethereum-logo.png";
import arbitrumLogoUrl from "assets/svg/arbitrum_logo.svg";
import celoLogo from "assets/svg/celo_logo.svg";
import optimismLogoUrl from "assets/svg/optimistic_ethereum.svg";
import polygonMaticLogo from "assets/svg/polygon-matic-logo.svg";
import ms from "ms.macro";

import {
  SupportedChainId,
  SupportedL1ChainId,
  SupportedL2ChainId
} from "./chains";
import { ARBITRUM_LIST, CELO_LIST, MAINNET_LIST, OPTIMISM_LIST, POLYGON_LIST } from "./lists";

export enum NetworkType {
  L1,
  L2
}

interface BaseChainInfo {
  readonly networkType: NetworkType;
  readonly blockWaitMsBeforeWarning?: number;
  readonly docs: string;
  readonly bridge?: string;
  readonly explorer: string;
  readonly infoLink: string;
  readonly logoUrl: string;
  readonly label: string;
  readonly helpCenterUrl?: string;
  readonly nativeCurrency: {
    name: string; // e.g. 'Goerli ETH',
    symbol: string; // e.g. 'gorETH',
    decimals: number; // e.g. 18,
  };
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1;
  readonly defaultListUrl: string;
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2;
  readonly bridge: string;
  readonly statusPage?: string;
  readonly defaultListUrl: string;
}

export type ChainInfoMap = {
  readonly [chainId: number]: L1ChainInfo | L2ChainInfo;
} & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo;
} & { readonly [chainId in SupportedL1ChainId]: L1ChainInfo };

const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: "https://docs.panaromaswap.org/",
    explorer: "https://etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/",
    label: "Ethereum",
    defaultListUrl: MAINNET_LIST,
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  },
  [SupportedChainId.RINKEBY]: {
    networkType: NetworkType.L1,
    docs: "https://docs.panaromaswap.org/",
    explorer: "https://rinkeby.etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/",
    label: "Rinkeby",
    defaultListUrl: CELO_LIST,
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: "Rinkeby Ether", symbol: "rETH", decimals: 18 }
  },
  [SupportedChainId.ROPSTEN]: {
    networkType: NetworkType.L1,
    docs: "https://docs.panaromaswap.org/",
    explorer: "https://ropsten.etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/",
    label: "Ropsten",
    defaultListUrl: CELO_LIST,
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: "Ropsten Ether", symbol: "ropETH", decimals: 18 }
  },
  [SupportedChainId.KOVAN]: {
    networkType: NetworkType.L1,
    docs: "https://docs.panaromaswap.org/",
    explorer: "https://kovan.etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/",
    label: "Kovan",
    defaultListUrl: CELO_LIST,
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: "Kovan Ether", symbol: "kovETH", decimals: 18 }
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: "https://docs.panaromaswap.org/",
    explorer: "https://goerli.etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/",
    label: "Görli",
    defaultListUrl: MAINNET_LIST,
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: "Görli Ether", symbol: "görETH", decimals: 18 }
  },
  [SupportedChainId.OPTIMISM]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`25m`,
    bridge: "https://app.optimism.io/bridge",
    defaultListUrl: OPTIMISM_LIST,
    docs: "https://optimism.io/",
    explorer: "https://optimistic.etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/optimism/",
    label: "Optimism",
    logoUrl: optimismLogoUrl,
    statusPage: "https://optimism.io/status",
    helpCenterUrl:
      "https://help.panaromaswap.org/en/collections/3137778-panaromaswap-on-optimistic-ethereum-oξ",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  },
  [SupportedChainId.OPTIMISTIC_GOERLI]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`25m`,
    bridge: "https://app.optimism.io/bridge",
    defaultListUrl: OPTIMISM_LIST,
    docs: "https://optimism.io/",
    explorer: "https://goerli-optimism.etherscan.io/",
    infoLink: "https://info.panaromaswap.org/#/optimism/",
    label: "Optimistic Goerli",
    logoUrl: optimismLogoUrl,
    statusPage: "https://optimism.io/status",
    helpCenterUrl:
      "https://help.panaromaswap.org/en/collections/3137778-panaromaswap-on-optimistic-ethereum-oξ",
    nativeCurrency: {
      name: "Optimistic Goerli Ether",
      symbol: "ETH",
      decimals: 18
    }
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: "https://bridge.arbitrum.io/",
    docs: "https://offchainlabs.com/",
    explorer: "https://arbiscan.io/",
    infoLink: "https://info.panaromaswap.org/#/arbitrum",
    label: "Arbitrum",
    logoUrl: arbitrumLogoUrl,
    defaultListUrl: ARBITRUM_LIST,
    helpCenterUrl:
      "https://help.panaromaswap.org/en/collections/3137787-panaromaswap-on-arbitrum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  },
  [SupportedChainId.ARBITRUM_GOERLI]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: "https://bridge.arbitrum.io/",
    docs: "https://offchainlabs.com/",
    explorer: "https://goerli.arbiscan.io/",
    infoLink: "https://info.panaromaswap.org/#/arbitrum/",
    label: "Arbitrum Goerli",
    logoUrl: arbitrumLogoUrl,
    defaultListUrl: ARBITRUM_LIST,
    helpCenterUrl:
      "https://help.panaromaswap.org/en/collections/3137787-panaromaswap-on-arbitrum",
    nativeCurrency: {
      name: "Goerli Arbitrum Ether",
      symbol: "ETH",
      decimals: 18
    }
  },
  [SupportedChainId.POLYGON]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: "https://wallet.polygon.technology/bridge",
    docs: "https://polygon.io/",
    explorer: "https://polygonscan.com/",
    infoLink: "https://info.panaromaswap.org/#/polygon/",
    label: "Polygon",
    logoUrl: polygonMaticLogo,
    defaultListUrl: POLYGON_LIST,
    nativeCurrency: { name: "Polygon Matic", symbol: "MATIC", decimals: 18 }
  },
  [SupportedChainId.POLYGON_MUMBAI]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: "https://wallet.polygon.technology/bridge",
    docs: "https://polygon.io/",
    explorer: "https://mumbai.polygonscan.com/",
    infoLink: "https://info.panaromaswap.org/#/polygon/",
    label: "Polygon Mumbai",
    logoUrl: polygonMaticLogo,
    defaultListUrl: POLYGON_LIST,
    nativeCurrency: {
      name: "Polygon Mumbai Matic",
      symbol: "mMATIC",
      decimals: 18
    }
  },
  [SupportedChainId.CELO]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: "https://www.portalbridge.com/#/transfer",
    docs: "https://docs.celo.org/",
    explorer: "https://celoscan.io/",
    infoLink: "https://info.panaromaswap.org/#/celo",
    label: "Celo",
    logoUrl: celoLogo,
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    defaultListUrl: CELO_LIST
  },
  [SupportedChainId.CELO_ALFAJORES]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: "https://www.portalbridge.com/#/transfer",
    docs: "https://docs.celo.org/",
    explorer: "https://alfajores-blockscout.celo-testnet.org/",
    infoLink: "https://info.panaromaswap.org/#/celo",
    label: "Celo Alfajores",
    logoUrl: celoLogo,
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    defaultListUrl: CELO_LIST
  }
};

export function getChainInfo(chainId: SupportedL1ChainId): L1ChainInfo;
export function getChainInfo(chainId: SupportedL2ChainId): L2ChainInfo;
export function getChainInfo(
  chainId: SupportedChainId
): L1ChainInfo | L2ChainInfo;
export function getChainInfo(
  chainId:
    | SupportedChainId
    | SupportedL1ChainId
    | SupportedL2ChainId
    | number
    | undefined
): L1ChainInfo | L2ChainInfo | undefined;

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * SupportedChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined;
  }
  return undefined;
}

export const MAINNET_INFO = CHAIN_INFO[SupportedChainId.MAINNET];
export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? MAINNET_INFO;
}
