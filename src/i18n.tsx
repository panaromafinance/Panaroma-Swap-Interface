import { SupportedLocale } from "constants/locales";
import { initialLocale, useActiveLocale } from "hooks/useActiveLocale";
import { dynamicActivate, Provider } from "lib/i18n";
import { ReactNode, useCallback, useEffect } from "react";
import { useUserLocaleManager } from "state/user/hooks";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { updateInfuraflag, updateProvider } from "state/user/reducer";
import Web3 from "web3";
import { RPC_URLS } from "constants/networks";
import { SupportedChainId } from "constants/chains";

dynamicActivate(initialLocale);

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
if (typeof INFURA_KEY === "undefined") {
  throw new Error(
    `REACT_APP_INFURA_KEY must be a defined environment variable`
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useActiveLocale();
  const [, setUserLocale] = useUserLocaleManager();

  const dispatch = useAppDispatch();

  const quickNodeState = useAppSelector((state) => state.user.isQuickNode)
  const isQuickNode = quickNodeState === undefined ? false : quickNodeState
  const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)

  // console.log(isQuickNode, quickNodeState, "isQuickNode");

  const provider = `https://mainnet.infura.io/v3/${INFURA_KEY}`;

  const web3Provider = new Web3.providers.HttpProvider(provider);
  const web3 = new Web3(web3Provider);
  const timer = Number(process.env.REACT_APP_TIMER)

  const utcCurrentTimeNow = new Date();
  // console.log(new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate(), 0, 0, 0)))
  const utcMinTimetoCheck = new Date();
  utcMinTimetoCheck.setUTCHours(0)
  utcMinTimetoCheck.setUTCMinutes(0)
  utcMinTimetoCheck.setUTCSeconds(0)

  const utcMaxTimeToCheck = new Date();
  utcMaxTimeToCheck.setUTCHours(0)
  utcMaxTimeToCheck.setUTCMinutes(59)
  utcMaxTimeToCheck.setUTCSeconds(59)

  const isTimeFrame = utcMinTimetoCheck < utcCurrentTimeNow && utcMaxTimeToCheck > utcCurrentTimeNow;
  const rpcData = JSON.parse(localStorage.getItem("redux_localstorage_simple_user")!)

  useEffect(() => {
    rpcData.isQuickNode = false
    rpcData.rpcUrl = RPC_URLS
    localStorage.setItem("redux_localstorage_simple_user", JSON.stringify(rpcData));
    checkValidUrl()
  }, [])

  setInterval(() => checkValidUrl(), timer); //timer for 1 minute: 60000

  async function checkValidUrl() {
    try {
      // if (rpcData)
      //   localStorage.removeItem("redux_localstorage_simple_user")

      if (rpcData?.isQuickNode) {
        if (isTimeFrame) {
          dispatch(updateInfuraflag({ isQuickNode: false }))
          dispatch(updateProvider({ rpcUrl: RPC_URLS }))
          rpcData.rpcUrl = RPC_URLS
          rpcData.isQuickNode = false
          localStorage.setItem("redux_localstorage_simple_user", JSON.stringify(rpcData));
        }
      }
      else {
        const result = await web3.eth.getBlockNumber();
        console.log("123 result", result);
        if (result) {
          if (!rpcurlQuickNode || rpcurlQuickNode !== RPC_URLS ) {
            dispatch(updateProvider({ rpcUrl: RPC_URLS }))
            dispatch(updateInfuraflag({ isQuickNode: false }))
            rpcData.rpcUrl = RPC_URLS
            rpcData.isQuickNode = false
            localStorage.setItem("redux_localstorage_simple_user", JSON.stringify(rpcData));
          }
        }
      }
    } catch (err) {
      console.log("123 err", err);
      if (err?.message.includes("count exceeded")) {
        dispatch(updateInfuraflag({ isQuickNode: true }))
        dispatch(updateProvider({
          rpcUrl: {
            [SupportedChainId.MAINNET]: `https://young-distinguished-wish.quiknode.pro/5847a774b4342976e36424ec208e9881499ab5eb/`,
            [SupportedChainId.GOERLI]: `https://late-snowy-spree.ethereum-goerli.quiknode.pro/d8b05401840f0b403d9e85d8bf284dabccaedfca/`,
            [SupportedChainId.OPTIMISM]: `https://still-restless-brook.optimism.quiknode.pro/852cfd239fdf09a123151455f5a0b1713b9af12b/`,
            [SupportedChainId.OPTIMISTIC_GOERLI]: `https://smart-compatible-forest.optimism-goerli.quiknode.pro/c89b2d67b31ff3ec352eed2e9f53f4699398ab41/`,
            [SupportedChainId.ARBITRUM_ONE]: `https://falling-spring-spree.arbitrum-mainnet.quiknode.pro/a905ec64e4a919463ed20b8dbcc98fe4320c2194/`,
            [SupportedChainId.ARBITRUM_GOERLI]: `https://proud-burned-putty.arbitrum-goerli.quiknode.pro/60b4312f53ac19345ed411144a4ad96d9002fe86/`,
            [SupportedChainId.POLYGON]: `https://dry-alien-aura.matic.quiknode.pro/912ad5bf5047ab28554965b3ae46ce0d4f976cca/`,
            [SupportedChainId.POLYGON_MUMBAI]: `https://light-warmhearted-shape.matic-testnet.discover.quiknode.pro/2c2c5a4057e54f6bf01753d67128b6d8a50556c5/`,
            [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
            [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
            [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
            [SupportedChainId.CELO]: `https://forno.celo.org`,
            [SupportedChainId.CELO_ALFAJORES]: `https://alfajores-forno.celo-testnet.org`,
          }
        }))
        if (rpcData) {
          rpcData.rpcUrl = {
            [SupportedChainId.MAINNET]: `https://young-distinguished-wish.quiknode.pro/5847a774b4342976e36424ec208e9881499ab5eb/`,
            [SupportedChainId.GOERLI]: `https://late-snowy-spree.ethereum-goerli.quiknode.pro/d8b05401840f0b403d9e85d8bf284dabccaedfca/`,
            [SupportedChainId.OPTIMISM]: `https://still-restless-brook.optimism.quiknode.pro/852cfd239fdf09a123151455f5a0b1713b9af12b/`,
            [SupportedChainId.OPTIMISTIC_GOERLI]: `https://smart-compatible-forest.optimism-goerli.quiknode.pro/c89b2d67b31ff3ec352eed2e9f53f4699398ab41/`,
            [SupportedChainId.ARBITRUM_ONE]: `https://falling-spring-spree.arbitrum-mainnet.quiknode.pro/a905ec64e4a919463ed20b8dbcc98fe4320c2194/`,
            [SupportedChainId.ARBITRUM_GOERLI]: `https://proud-burned-putty.arbitrum-goerli.quiknode.pro/60b4312f53ac19345ed411144a4ad96d9002fe86/`,
            [SupportedChainId.POLYGON]: `https://dry-alien-aura.matic.quiknode.pro/912ad5bf5047ab28554965b3ae46ce0d4f976cca/`,
            [SupportedChainId.POLYGON_MUMBAI]: `https://light-warmhearted-shape.matic-testnet.discover.quiknode.pro/2c2c5a4057e54f6bf01753d67128b6d8a50556c5/`,
          }
          rpcData.isQuickNode = true
          localStorage.setItem("redux_localstorage_simple_user", JSON.stringify(rpcData));
        }
      }
      // window.location.reload();
    }
  }

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      document.documentElement.setAttribute("lang", locale);
      setUserLocale(locale); // stores the selected locale to persist across sessions
    },
    [setUserLocale]
  );

  return (
    <Provider
      locale={locale}
      forceRenderAfterLocaleChange={false}
      onActivate={onActivate}>
      {children}
    </Provider>
  );
}