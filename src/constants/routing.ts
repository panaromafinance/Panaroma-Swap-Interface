// a list of tokens by chain
import { Currency, Token } from "@panaromafinance/panaromaswap_sdkcore";

import { SupportedChainId } from "./chains";
import {
  AMPL,
  CEUR_CELO,
  CEUR_CELO_ALFAJORES,
  CMC02_CELO,
  CUSD_CELO,
  CUSD_CELO_ALFAJORES,
  DAI,
  DAI_ARBITRUM_ONE,
  DAI_OPTIMISM,
  DAI_POLYGON,
  ETH2X_FLI,
  FEI,
  FRAX,
  FXS,
  nativeOnChain,
  PANA_ARBITRIUM,
  PANA_MAINNET,
  PANA_OPTIMISM,
  PANA_POLYGON,
  PORTAL_ETH_CELO,
  PORTAL_USDC_CELO,
  renBTC,
  rETH2,
  sETH2,
  SWISE,
  TRIBE,
  USDC_ARBITRUM,
  USDC_MAINNET,
  USDC_OPTIMISM,
  USDC_POLYGON,
  USDT,
  USDT_ARBITRUM_ONE,
  USDT_OPTIMISM,
  USDT_POLYGON,
  WBTC,
  
  WETH_POLYGON,
  // WETH_POLYGON_MUMBAI,
  WRAPPED_NATIVE_CURRENCY
} from "./tokens";
import { WBTC_MAINNET } from "@panaromafinance/panaromaswap_smartorderrouter";

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

type ChainCurrencyList = {
  readonly [chainId: number]: Currency[];
};

const WRAPPED_NATIVE_CURRENCIES_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCY)
    .map(([key, value]) => [key, [value]])
    .filter(Boolean)
);

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [SupportedChainId.MAINNET]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.MAINNET],
    DAI,
    USDC_MAINNET,
    USDT,
    PANA_MAINNET
  ],
  [SupportedChainId.OPTIMISM]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.OPTIMISM],
    DAI_OPTIMISM,
    USDT_OPTIMISM,
    PANA_OPTIMISM
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.ARBITRUM_ONE],
    DAI_ARBITRUM_ONE,
    USDT_ARBITRUM_ONE,
    PANA_ARBITRIUM
  ],
  [SupportedChainId.POLYGON]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.POLYGON],
    DAI_POLYGON,
    USDC_POLYGON,
    USDT_POLYGON,
    WETH_POLYGON,
    PANA_POLYGON
  ],
  [SupportedChainId.CELO]: [
    CUSD_CELO,
    CEUR_CELO,
    CMC02_CELO,
    PORTAL_USDC_CELO,
    PORTAL_ETH_CELO
  ]
};
export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {
  [SupportedChainId.MAINNET]: {
    "0xF16E4d813f4DcfDe4c5b44f305c908742De84eF0": [ETH2X_FLI],
    [rETH2.address]: [sETH2],
    [SWISE.address]: [sETH2],
    [FEI.address]: [TRIBE],
    [TRIBE.address]: [FEI],
    [FRAX.address]: [FXS],
    [FXS.address]: [FRAX],
    [WBTC.address]: [renBTC],
    [renBTC.address]: [WBTC]
  }
};
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {
  [SupportedChainId.MAINNET]: {
    [AMPL.address]: [
      DAI,
      WRAPPED_NATIVE_CURRENCY[SupportedChainId.MAINNET] as Token
    ]
  }
};

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainCurrencyList = {
  [SupportedChainId.MAINNET]: [
    nativeOnChain(SupportedChainId.MAINNET),
    PANA_MAINNET,
    DAI,
    USDC_MAINNET,
    USDT,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.MAINNET] as Token
  ],
  [SupportedChainId.ROPSTEN]: [
    nativeOnChain(SupportedChainId.ROPSTEN),
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.ROPSTEN] as Token
  ],
  [SupportedChainId.RINKEBY]: [
    nativeOnChain(SupportedChainId.RINKEBY),
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.RINKEBY] as Token
  ],
  [SupportedChainId.GOERLI]: [
    nativeOnChain(SupportedChainId.GOERLI),
    PANA_MAINNET,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.GOERLI] as Token
  ],
  [SupportedChainId.KOVAN]: [
    nativeOnChain(SupportedChainId.KOVAN),
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.KOVAN] as Token
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    nativeOnChain(SupportedChainId.ARBITRUM_ONE),
    PANA_ARBITRIUM,
    DAI_ARBITRUM_ONE,
    USDC_ARBITRUM,
    USDT_ARBITRUM_ONE,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.ARBITRUM_ONE] as Token
  ],
  [SupportedChainId.ARBITRUM_GOERLI]: [
    nativeOnChain(SupportedChainId.ARBITRUM_GOERLI),
    PANA_ARBITRIUM,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.ARBITRUM_GOERLI] as Token
  ],
  [SupportedChainId.OPTIMISM]: [
    nativeOnChain(SupportedChainId.OPTIMISM),
    PANA_OPTIMISM,
    DAI_OPTIMISM,
    USDC_OPTIMISM,
    USDT_OPTIMISM,
  ],
  [SupportedChainId.OPTIMISTIC_GOERLI]: [
    nativeOnChain(SupportedChainId.OPTIMISTIC_GOERLI),
    PANA_OPTIMISM,
  ],
  [SupportedChainId.POLYGON]: [
    nativeOnChain(SupportedChainId.POLYGON),
    PANA_POLYGON,
    // WETH_POLYGON,
    USDC_POLYGON,
    DAI_POLYGON,
    USDT_POLYGON,
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    nativeOnChain(SupportedChainId.POLYGON_MUMBAI),
    PANA_POLYGON,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.POLYGON_MUMBAI] as Token,
    // WETH_POLYGON_MUMBAI
  ],

  [SupportedChainId.CELO]: [
    nativeOnChain(SupportedChainId.CELO),
    CEUR_CELO,
    CUSD_CELO,
    PORTAL_ETH_CELO,
    PORTAL_USDC_CELO,
    CMC02_CELO
  ],
  [SupportedChainId.CELO_ALFAJORES]: [
    nativeOnChain(SupportedChainId.CELO_ALFAJORES),
    CUSD_CELO_ALFAJORES,
    CEUR_CELO_ALFAJORES
  ]
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [SupportedChainId.MAINNET]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.MAINNET],
    DAI,
    USDC_MAINNET,
    USDT,
    WBTC_MAINNET,
    PANA_MAINNET
  ]
};
export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
  [SupportedChainId.MAINNET]: [
    [
      new Token(
        SupportedChainId.MAINNET,
        "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
        8,
        "cDAI",
        "Compound Dai"
      ),
      new Token(
        SupportedChainId.MAINNET,
        "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
        8,
        "cUSDC",
        "Compound USD Coin"
      )
    ],
    [USDC_MAINNET, USDT],
    [DAI, USDT]
  ]
};
