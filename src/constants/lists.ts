// import panaromaswapPOLYGON from './tokenLists/panaromaswapPOLYGON.json';

const AAVE_LIST = "tokenlist.aave.eth";
const BA_LIST =
  "https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json";
const CMC_ALL_LIST =
  "https://api.coinmarketcap.com/data-api/v2edge/panaromaswap/all.json";
const COINGECKO_LIST = "https://tokens.coingecko.com/panaromaswap/all.json";
const COMPOUND_LIST =
  "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json";
const GEMINI_LIST = "https://www.gemini.com/panaromaswap/manifest.json";
const KLEROS_LIST = "t2crtokens.eth";
const ROLL_LIST = "https://app.tryroll.com/tokens.json";
const SET_LIST =
  "https://raw.githubusercontent.com/SetProtocol/panaromaswap-tokenlist/main/set.tokenlist.json";
const WRAPPED_LIST = "wrapped.tokensoft.eth";

// export const OPTIMISM_LIST = "https://static.optimism.io/optimism.tokenlist.json";
// export const OPTIMISM_LIST = JSON.stringify(panaromaswapOPTIMISM);
// export const ARBITRUM_LIST = "https://bridge.arbitrum.io/token-list-42161.json";
// export const ARBITRUM_LIST = JSON.stringify(panaromaswapARBITRUM);
export const POLYGON_LIST = "https://raw.githubusercontent.com/panaromafinance/tokens-list/main/panaromaswap-polygon.json";
export const MAINNET_LIST = "https://raw.githubusercontent.com/panaromafinance/tokens-list/main/panaromaswap-mainnet.json";
export const ARBITRUM_LIST = "https://raw.githubusercontent.com/panaromafinance/tokens-list/main/panaromaswap-arbitrum.json";
export const OPTIMISM_LIST = "https://raw.githubusercontent.com/panaromafinance/tokens-list/main/panaromaswap-optimism.json";

export const CELO_LIST =
  "https://celo-org.github.io/celo-token-list/celo.tokenlist.json";

export const UNSUPPORTED_LIST_URLS: string[] = [BA_LIST];

// console.log("1 - 9898", JSON.stringify(panaromaswapARBITRUM));
// console.log("1 - 9898", ARBITRUM_LIST);

// this is the default list of lists that are exposed to users
// lower index == higher priority for token import
const DEFAULT_LIST_OF_LISTS_TO_DISPLAY: string[] = [
  // COMPOUND_LIST,
  // AAVE_LIST,
  // CMC_ALL_LIST,
  // COINGECKO_LIST,
  // KLEROS_LIST,
  // GEMINI_LIST,
  // WRAPPED_LIST,
  // SET_LIST,
  // ROLL_LIST,
  ARBITRUM_LIST,
  OPTIMISM_LIST,
  POLYGON_LIST,
  MAINNET_LIST
  // CELO_LIST
];

export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...DEFAULT_LIST_OF_LISTS_TO_DISPLAY,
  ...UNSUPPORTED_LIST_URLS // need to load dynamic unsupported tokens as well
];

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [POLYGON_LIST, MAINNET_LIST, OPTIMISM_LIST, ARBITRUM_LIST];
