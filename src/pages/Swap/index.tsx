/* eslint-disable @typescript-eslint/no-unused-vars */
import { Trans } from "@lingui/macro";
import { Trade } from "@panaromafinance/panaromaswap_routersdk";
import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType
} from "@panaromafinance/panaromaswap_sdkcore";
import { Trade as V1Trade } from "@panaromafinance/panaromaswap_v1sdk";
import { Trade as V2edgeTrade } from "@panaromafinance/panaromaswap_v2edgesdk";
import { useWeb3React } from "@web3-react/core";
import { sendAnalyticsEvent } from "components/AmplitudeAnalytics";
import {
  ElementName,
  Event,
  EventName,
  PageName,
  SectionName
} from "components/AmplitudeAnalytics/constants";
import { Trace } from "components/AmplitudeAnalytics/Trace";
import { TraceEvent } from "components/AmplitudeAnalytics/TraceEvent";
import {
  formatPercentInBasisPointsNumber,
  formatToDecimal,
  getDurationFromDateMilliseconds,
  getTokenAddress
} from "components/AmplitudeAnalytics/utils";
import { sendEvent } from "components/analytics";
// import { NetworkAlert } from "components/NetworkAlert/NetworkAlert";
import PriceImpactWarning from "components/swap/PriceImpactWarning";
import SwapDetailsDropdown from "components/swap/SwapDetailsDropdown";
import UnsupportedCurrencyFooter from "components/swap/UnsupportedCurrencyFooter";
import { MouseoverTooltip } from "components/Tooltip";
import { isSupportedChain, SupportedChainId } from "constants/chains";
import { useSwapCallback } from "hooks/useSwapCallback";
import useTransactionDeadline from "hooks/useTransactionDeadline";
import JSBI from "jsbi";
import TransactionTable from "pages/TransactionTable";
// import TotalTokensLocked from "pages/TTL/TotalTokensLocked";
import {
  Context,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { ReactNode } from "react";
import { ArrowDown, CheckCircle, HelpCircle } from "react-feather";
import { useNavigate } from "react-router-dom";
import
// TradingViewWidget, 
{ Themes }
  from "react-tradingview-widget";
import { Text } from "rebass";
import { useToggleWalletModal } from "state/application/hooks";
import { InterfaceTrade } from "state/routing/types";
import { TradeState } from "state/routing/types";
import styled, { DefaultTheme, ThemeContext } from "styled-components/macro";

import AddressInputPanel from "../../components/AddressInputPanel";
import {
  ButtonConfirmed,
  ButtonError,
  ButtonLight,
  ButtonPrimary
} from "../../components/Button";
import { GreyCard, OutlineCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import CurrencyLogo from "../../components/CurrencyLogo";
import Loader from "../../components/Loader";
import { AutoRow } from "../../components/Row";
import confirmPriceImpactWithoutFee from "../../components/swap/confirmPriceImpactWithoutFee";
import ConfirmSwapModal from "../../components/swap/ConfirmSwapModal";
import {
  ArrowWrapper,
  SwapCallbackError,
  Wrapper
} from "../../components/swap/styleds";
import SwapHeader from "../../components/swap/SwapHeader";
import { SwitchLocaleLink } from "../../components/SwitchLocaleLink";
import TokenWarningModal from "../../components/TokenWarningModal";
import { TOKEN_SHORTHANDS } from "../../constants/tokens";
import { useGlobalTransactions } from '../../contexts/GlobalData'
import { useAllTokens, useCurrency } from "../../hooks/Tokens";
import {
  ApprovalState,
  useApprovalOptimizedTrade,
  useApproveCallbackFromTrade
} from "../../hooks/useApproveCallback";
import useENSAddress from "../../hooks/useENSAddress";
import {
  useERC20PermitFromTrade,
  UseERC20PermitState
} from "../../hooks/useERC20Permit";
import useIsArgentWallet from "../../hooks/useIsArgentWallet";
import { useIsSwapUnsupported } from "../../hooks/useIsSwapUnsupported";
import { useStablecoinValue } from "../../hooks/useStablecoinPrice";
import useWrapCallback, {
  WrapErrorText,
  WrapType
} from "../../hooks/useWrapCallback";
import { Field } from "../../state/swap/actions";
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from "../../state/swap/hooks";
import { useExpertModeManager } from "../../state/user/hooks";
import { LinkStyledButton, ThemedText } from "../../theme";
import { computeFiatValuePriceImpact } from "../../utils/computeFiatValuePriceImpact";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import {
  computeRealizedPriceImpact,
  warningSeverity
} from "../../utils/prices";
import { supportedChainId } from "../../utils/supportedChainId";
import AppBody from "../AppBody";
import axios from "axios";
// import TradingViewChart from "pages/TransactionTable";
// import TradingViewChart from '../TradingviewChart'

import { getTimeframe } from '../../utils'


import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import { timeframeOptions } from '../../constants'
import { MdOutlineContentCopy, MdWarning } from "react-icons/md";

import Toast from "react-bootstrap/Toast";
import { MouseoverTooltipContent } from "components/Tooltip";
import { ResponsiveTooltipContainer } from "../../components/swap/styleds";
import Card from "components/Card";

import { addPopup } from "state/application/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";
import Modal from "components/Modal";
import CopyHelper from "components/AccountDetails/Copy";
import { FaRegCopy } from "react-icons/fa";
import { RPC_URLS } from "constants/networks";
import allowanceCheckABI from "../../abis/allowanceCheckABI.json"
import Web3 from "web3";
import ERC20_ABI from "../../abis/erc20.json";
import { useTokenContract, useV1RouterContract } from "hooks/useContract";
import { opacify } from "theme/utils";
import { useTransactionAdder } from "state/transactions/hooks";
import { TransactionType } from "state/transactions/types";
import { V1_ROUTER_ADDRESS, V2edge_ROUTER_ADDRESS, SWAP_ROUTER_ADDRESSES } from "constants/addresses";

import integrityCheck from "../integrityCheck";
import { getConnection, getIsMetaMask, getConnectionName } from "connection/utils";
import { updateSelectedWallet } from "state/user/reducer";
import { removeConnectedWallet } from "state/wallets/reducer";

const AlertWrapper = styled.div`
  max-width: 460px;
  width: 100%;
`;

const smallText = { fontSize: "small" }

const ToastDiv = styled.div`
  z-index: 1;
  position: absolute;
  right: 10px;
  top: 7rem;
`;

// const SwapText = styled.div`
//   background: ${({ theme }) => theme.deprecated_bg0};
// `;

const StyledCard = styled(OutlineCard)`
  padding: 12px;
  border: 1px solid ${({ theme }) => opacify(24, theme.deprecated_error)};
`;

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return (
    !!swapInputError &&
    !!trade &&
    (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
  );
}




const formatApproveTokenTxnSubmittedEventProperties = (
  approvalOptimizedTrade:
    | Trade<Currency, Currency, TradeType>
    | V1Trade<Currency, Currency, TradeType>
    | V2edgeTrade<Currency, Currency, TradeType>
    | undefined
) => {
  if (!approvalOptimizedTrade) return {};
  return {
    chain_id: approvalOptimizedTrade.inputAmount.currency.chainId,
    token_symbol: approvalOptimizedTrade.inputAmount.currency.symbol,
    token_address: getTokenAddress(approvalOptimizedTrade.inputAmount.currency)
  };
};

const formatWrapTokenTxnSubmittedEventProperties = (
  inputCurrency: Currency | null | undefined,
  outputCurrency: Currency | null | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined
) => {
  if (!inputCurrency || !outputCurrency || !parsedAmount) return {};
  return {
    token_in_address: getTokenAddress(inputCurrency),
    token_out_address: getTokenAddress(outputCurrency),
    token_in_symbol: inputCurrency.symbol,
    token_out_symbol: outputCurrency.symbol,
    chain_id: inputCurrency.chainId,
    amount: parsedAmount
      ? formatToDecimal(parsedAmount, parsedAmount?.currency.decimals)
      : undefined
  };
};

function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b;
  } else if (a) {
    return a;
  } else if (b) {
    return b;
  }
  return undefined;
}

const formatSwapQuoteReceivedEventProperties = (
  trade: InterfaceTrade<Currency, Currency, TradeType>,
  fetchingSwapQuoteStartTime: Date | undefined
) => {
  return {
    token_in_symbol: trade.inputAmount.currency.symbol,
    token_out_symbol: trade.outputAmount.currency.symbol,
    token_in_address: getTokenAddress(trade.inputAmount.currency),
    token_out_address: getTokenAddress(trade.outputAmount.currency),
    price_impact_basis_points: trade
      ? formatPercentInBasisPointsNumber(computeRealizedPriceImpact(trade))
      : undefined,
    estimated_network_fee_usd: trade.gasUseEstimateUSD
      ? formatToDecimal(trade.gasUseEstimateUSD, 2)
      : undefined,
    chain_id:
      trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
        ? trade.inputAmount.currency.chainId
        : undefined,
    token_in_amount: formatToDecimal(
      trade.inputAmount,
      trade.inputAmount.currency.decimals
    ),
    token_out_amount: formatToDecimal(
      trade.outputAmount,
      trade.outputAmount.currency.decimals
    ),
    quote_latency_milliseconds: fetchingSwapQuoteStartTime
      ? getDurationFromDateMilliseconds(fetchingSwapQuoteStartTime)
      : undefined
  };
};

export default function Swap() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { account, chainId, connector } = useWeb3React();
  const loadedUrlParams = useDefaultsFromURLSearch();
  const [newSwapQuoteNeedsLogging, setNewSwapQuoteNeedsLogging] =
    useState(true);
  const [fetchingSwapQuoteStartTime, setFetchingSwapQuoteStartTime] = useState<
    Date | undefined
  >();

  // console.log("1234 loadedUrlParams", loadedUrlParams);
  const [baseGAuthURL] = useState(process.env['REACT_APP_GAUTH_BASE_URL']);
  const [baseAuthURL] = useState(process.env['REACT_APP_AUTH_BASE_URL']);
  const [token, setToken] = useState("");
  const [disbtn, setDisbtn] = useState(false);
  const [errors, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [validAPIRoute, setValidAPIRoute] = useState("isValidAddressPolygon");
  const [registerAPIRoute, setRegisterAPIRoute] = useState("registerAddressPolygon");

  const [show, toggleShow] = useState(false);

  const [showApprove, setShowApprove] = useState<boolean>(false)
  const [result, setResult] = useState<number>()
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [showAAllowance, setShowAAllowance] = useState<boolean>(false)
  const [tokenAAllowance, setTokenAAllowance] = useState<number>(0)

  const [loading, setLoading] = useState<boolean>(false);

  const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
  const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

  const checkAuth = () => {
    // console.log(account, "select address");
    const payload = { metaMaskPrivateKey: account };
    // console.log(payload, "payload");
    axios
      .get(baseGAuthURL + "checkauthenticator/" + account)
      .then(function (response) {
        // console.log("&&&&&&&& response", response);
        if (response.data.status === 1) {
          setDisbtn(true);
          // setIsVerified(false);
        } else if (response.data.status === 2) {
          setDisbtn(false);
          setIsVerified(true);

        } else if (response.data.status === 0) {
          setDisbtn(false);
          setIsVerified(true);

          // setShowAuth(false);
          // setDirectSwap(true);
        }
      });
  };

  checkAuth();

  const verify = () => {
    const payload = { token, metaMaskPrivateKey: account };
    axios
      .post(baseGAuthURL + "verify", {
        method: "POST",
        metaMaskPrivateKey: account,
        token,
        headers: {
          // 'Authorization': `bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(function (response) {
        //console.log("@@@@ response", response);
        if (response.data) {
          setDisbtn(false);
          setError("");
          setIsVerified(true)
        } else {
          setIsVerified(false)
          setError("Invalid Code. Please enter the correct code from authenticator");
        }
      });
    //console.log(token);
  };

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.[Field.INPUT]?.currencyId),
    useCurrency(loadedUrlParams?.[Field.OUTPUT]?.currencyId)
  ];
  const [dismissTokenWarning, setDismissTokenWarning] =
    useState<boolean>(false);
  const urlLoadedTokens: Token[] = useMemo(
    () =>
      [loadedInputCurrency, loadedOutputCurrency]?.filter(
        (c): c is Token => c?.isToken ?? false
      ) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault = useMemo(
    () =>
      urlLoadedTokens &&
      urlLoadedTokens
        .filter((token: Token) => {
          return !Boolean(token.address in defaultTokens);
        })
        .filter((token: Token) => {
          // Any token addresses that are loaded from the shorthands map do not need to show the import URL
          const supported = supportedChainId(chainId);
          if (!supported) return true;
          return !Object.keys(TOKEN_SHORTHANDS).some((shorthand) => {
            const shorthandTokenAddress =
              TOKEN_SHORTHANDS[shorthand][supported];
            return (
              shorthandTokenAddress && shorthandTokenAddress === token.address
            );
          });
        }),
    [chainId, defaultTokens, urlLoadedTokens]
  );

  const theme = useContext(ThemeContext as Context<DefaultTheme>);

  const [darkLightM, setdarkLightM] = useState(Themes.DARK);
  const [languageSwitch, setlanguageSwitch] = useState("");
  const transactions = useGlobalTransactions()


  const chartMode = () => {
    const modeLS = JSON.parse(
      localStorage.getItem("redux_localstorage_simple_user") || "{}"
    );
    if (modeLS) {
      // eslint-disable-next-line eqeqeq
      if (modeLS.userDarkMode == true) {
        setdarkLightM(Themes.DARK);
      } else {
        setdarkLightM(Themes.LIGHT);
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chartLanguage = () => {
    const modeLS = JSON.parse(
      localStorage.getItem("redux_localstorage_simple_user") || "{}"
    );
    if (modeLS) {
      const slicing = modeLS.userLocale;
      if (slicing) {
        const langTwoChars = slicing.slice(0, 2);
        setlanguageSwitch(langTwoChars);
      }
    }
  };

  useEffect(() => {
    chartMode();
    chartLanguage();

    // checkAuth();

  }, [darkLightM, chartLanguage]);

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal();

  // for expert mode
  const [isExpertMode] = useExpertModeManager();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo();

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError
  } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  );
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount
        }
        : {
          [Field.INPUT]:
            independentField === Field.INPUT
              ? parsedAmount
              : trade?.inputAmount,
          [Field.OUTPUT]:
            independentField === Field.OUTPUT
              ? parsedAmount
              : trade?.outputAmount
        },
    [independentField, parsedAmount, showWrap, trade]
  );

  // console.log("kkkk trade?.outputAmount", trade?.outputAmount);


  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      !trade?.swaps,
      TradeState.LOADING === tradeState,
      TradeState.SYNCING === tradeState
    ],
    [trade, tradeState]
  );

  // show price estimates based on wrap trade
  const inputValue = showWrap ? parsedAmount : trade?.inputAmount;
  const outputValue = showWrap ? parsedAmount : trade?.outputAmount;
  const fiatValueInput = useStablecoinValue(inputValue);
  const fiatValueOutput = useStablecoinValue(outputValue);
  const stablecoinPriceImpact = useMemo(
    () =>
      routeIsSyncing
        ? undefined
        : computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput),
    [fiatValueInput, fiatValueOutput, routeIsSyncing]
  );

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput]
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput]
  );

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
    navigate("/swap/");
  }, [navigate]);

  // modal and loading
  const [
    { showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash },
    setSwapState
  ] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  });

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ""
        : parsedAmounts[dependentField]?.toSignificant(6) ?? ""
    }),
    [dependentField, independentField, parsedAmounts, showWrap, typedValue]
  );

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
    currencies[Field.OUTPUT] &&
    parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  );

  const approvalOptimizedTrade = useApprovalOptimizedTrade(
    trade,
    allowedSlippage
  );
  const approvalOptimizedTradeString =
    approvalOptimizedTrade instanceof V1Trade
      ? "V1SwapRouter"
      : approvalOptimizedTrade instanceof V2edgeTrade
        ? "V2edgeSwapRouter"
        : "SwapRouter";

  // console.log(approvalOptimizedTradeString)
  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(
    approvalOptimizedTrade,
    allowedSlippage
  );
  // console.log(approvalState, approveCallback)
  const transactionDeadline = useTransactionDeadline();
  const {
    state: signatureState,
    signatureData,
    gatherPermitSignature
  } = useERC20PermitFromTrade(
    approvalOptimizedTrade,
    allowedSlippage,
    transactionDeadline
  );

  const handleApprove = useCallback(async () => {
    if (
      signatureState === UseERC20PermitState.NOT_SIGNED &&
      gatherPermitSignature
    ) {
      try {
        await gatherPermitSignature();
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback();
        }
      }
    } else {
      await approveCallback();

      sendEvent({
        category: "Swap",
        action: "Approve",
        label: [
          approvalOptimizedTradeString,
          approvalOptimizedTrade?.inputAmount?.currency.symbol
        ].join("/")
      });
    }
  }, [
    signatureState,
    gatherPermitSignature,
    approveCallback,
    approvalOptimizedTradeString,
    approvalOptimizedTrade?.inputAmount?.currency.symbol
  ]);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  const abiPANA = allowanceCheckABI as any;
  const allowanceClearABI = ERC20_ABI as any;
  const router = useV1RouterContract();
  // const id = currencies[Field.INPUT]?.address as any;
  const token_address = approvalOptimizedTrade?.inputAmount?.currency as any;
  const tokenContract: any = useTokenContract(token_address?.address);
  const addTransaction = useTransactionAdder();
  // const spender = useSwapRouterAddress(trade);
  const spender = trade instanceof V1Trade
    ? V1_ROUTER_ADDRESS[chainId!]
    : trade instanceof V2edgeTrade
      ? V2edge_ROUTER_ADDRESS[chainId!]
      : SWAP_ROUTER_ADDRESSES[chainId!];
  const isRouter1 = trade instanceof V1Trade
    ? true
    : trade instanceof V2edgeTrade
      ? false
      : false


  const web3 = new Web3(
    new Web3.providers.HttpProvider(RPC_URLS[chainId ? chainId.toString() : ""])
  );

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    // console.log("98988");

    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
      getAllowance(Field.INPUT)
    }
    setShowApprove(false)

    getAllowanceOfTokens(token_address?.address)
  }, [approvalState, approvalSubmitted]);

  async function getAllowanceOfTokens(currency: any) {
    try {
      if (token_address?.address) {
        const contract = new web3.eth.Contract(abiPANA, token_address?.address)
        // console.log("0787878 spender, loadedInputCurrency, id, isRouter1, token_address", spender, loadedInputCurrency, isRouter1, token_address?.address);

        // console.log("1787878 currency, router?.address, approvalOptimizedTrade, approvalOptimizedTradeString", currency, router?.address, approvalOptimizedTrade, approvalOptimizedTradeString);

        const result = await contract.methods.allowance(account, spender).call();
        const tokenDecimal = currencies[Field.INPUT]?.decimals
        const convertedResult = result / (10 ** tokenDecimal!)

        setTokenAAllowance(convertedResult)

        if (parseFloat(formattedAmounts[Field.INPUT]) > convertedResult && convertedResult !== 0) {
          setShowAAllowance(true)
        } else {
          setShowAAllowance(false)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  function getAllowance(currency: string | number) {

    // Define the ERC-20 token contract
    if (token_address?.address) {
      const contract = new web3.eth.Contract(abiPANA, token_address?.address)

      setTimeout(async () => {
        try {
          const result = await contract.methods.allowance(account, spender).call();
          const tokenDecimal = loadedInputCurrency?.decimals
          const convertedResult = result / (10 ** tokenDecimal!)
          setResult(convertedResult);
          result > Number(parsedAmounts[currency]?.quotient) ? setShowWarning(true) : setShowWarning(false)
        } catch (error) {
          console.log(error)
        }
      }, 5000);
    }
  }

  async function onClearAllowance(currency: any) {

    try {
      const contract = new web3.eth.Contract(allowanceClearABI, currency)

      const tokenContractApproval = tokenContract
      const test = tokenContractApproval ? await tokenContractApproval
        .approve(
          spender,
          "0"
        ) : "";

      if (test) {
        addTransaction(test, {
          type: TransactionType.CLEAR
        });
        setTimeout(() => {
          getAllowanceOfTokens(currency)
        }, 5000);
      }

    } catch (error) {
      console.log(error)
    }
  }

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  );
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
    !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount)
  );

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    approvalOptimizedTrade,
    allowedSlippage,
    recipient,
    signatureData
  );

  const handleSwap = useCallback(async () => {

    // debugger
    // const integrity = await integrityCheck(account, chainId, baseAuthURL)	

    // if(integrity) {

    if (!swapCallback) {
      return;
    }
    if (
      stablecoinPriceImpact &&
      !confirmPriceImpactWithoutFee(stablecoinPriceImpact)
    ) {
      return;
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined
    });
    swapCallback()
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash
        });
        sendEvent({
          category: "Swap",
          action: "transaction hash",
          label: hash
        });
        sendEvent({
          category: "Swap",
          action:
            recipient === null
              ? "Swap w/o Send"
              : (recipientAddress ?? recipient) === account
                ? "Swap w/o Send + recipient"
                : "Swap w/ Send",
          label: [
            approvalOptimizedTradeString,
            approvalOptimizedTrade?.inputAmount?.currency?.symbol,
            approvalOptimizedTrade?.outputAmount?.currency?.symbol,
            "MH"
          ].join("/")
        });
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        });
        dispatch(
          addPopup({
            content: { rejectAction: error.message ? error.message : "Failed" },
            key: `reject-action`
          })
        )
      });
    // } else {
    //   const walletType = getConnectionName(
    //     getConnection(connector).type,
    //     getIsMetaMask()
    //   );
    //   if (connector.deactivate) {
    //       connector.deactivate();
    //   } else {
    //       connector.resetState();
    //   }

    //   dispatch(updateSelectedWallet({ wallet: undefined }));
    //   dispatch(
    //       removeConnectedWallet({ account, walletType })
    //   );
    //   dispatch(
    //     addPopup({
    //         content: { rejectAction: "Wallet Integrity Check Failed" },
    //         key: `reject-action`
    //     })
    //   )
    // }
  }, [
    swapCallback,
    stablecoinPriceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    approvalOptimizedTradeString,
    approvalOptimizedTrade?.inputAmount?.currency?.symbol,
    approvalOptimizedTrade?.outputAmount?.currency?.symbol,
  ]);

  async function updateAddressRouteFunc() {
    switch (chainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:
        return "registerAddressArbitrum";

        // setValidAPIRoute("isValidAddressArbitrum");
        // setRegisterAPIRoute("registerAddressArbitrum");
        break;
      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:
        return "registerAddressETH";

        // setValidAPIRoute("isValidAddressETH");
        // setRegisterAPIRoute("registerAddressETH");
        break;
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        return "registerAddressOptimism";

        // setValidAPIRoute("isValidAddressOptimism");
        // setRegisterAPIRoute("registerAddressOptimism");
        break;
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        return "registerAddressPolygon";

        // setValidAPIRoute("isValidAddressPolygon");
        // setRegisterAPIRoute("registerAddressPolygon");
        break;
      default:
        return "registerAddressPolygon";

        // setValidAPIRoute("isValidAddressPolygon");
        // setRegisterAPIRoute("registerAddressPolygon");
        break;
    }
  }

  async function updateIsValidAddressRouteFunc() {
    switch (chainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:
        return "isValidAddressArbitrum"
        // setValidAPIRoute("isValidAddressArbitrum");
        // setRegisterAPIRoute("registerAddressArbitrum");
        break;
      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:
        return "isValidAddressETH"

        // setValidAPIRoute("isValidAddressETH");
        // setRegisterAPIRoute("registerAddressETH");
        break;
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        return "isValidAddressOptimism"

        // setValidAPIRoute("isValidAddressOptimism");
        // setRegisterAPIRoute("registerAddressOptimism");
        break;
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        return "isValidAddressPolygon";

        // setValidAPIRoute("isValidAddressPolygon");
        // setRegisterAPIRoute("registerAddressPolygon");
        break;
      default:
        return "isValidAddressPolygon"

        // setValidAPIRoute("isValidAddressPolygon");
        // setRegisterAPIRoute("registerAddressPolygon");
        break;
    }
  }

  async function isAddressValid() {
    const validAPIRouteValue = await updateIsValidAddressRouteFunc();

    axios
      .post(baseAuthURL + validAPIRouteValue, {
        method: "POST",
        address: account,
        token,
        headers: {
          // 'Authorization': `bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(async function (response) {
        //console.log("@@@@@ response isValidAddress", response);

        if (response.data) {
          if (response.data.status) {
            if (response.data.message) {
              if (response.data.message.risk.toLowerCase() === "severity") {
                // block the account
                // setDisSupplybtn(true);
                setSwapState({
                  tradeToConfirm: trade,
                  attemptingTxn: false,
                  swapErrorMessage: undefined,
                  showConfirm: false,
                  txHash: undefined
                });

                setError("Alert! Address seems suspicious! Please contact administrator");
              }
              else {

                const integrity = await integrityCheck(account, chainId, baseAuthURL, rpcurl)

                if (integrity) {
                  setSwapState({
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined
                  });
                  setError("");
                } else {
                  const walletType = getConnectionName(
                    getConnection(connector).type,
                    getIsMetaMask()
                  );
                  if (connector.deactivate) {
                    connector.deactivate();
                  } else {
                    connector.resetState();
                  }

                  dispatch(updateSelectedWallet({ wallet: undefined }));
                  dispatch(
                    removeConnectedWallet({ account, walletType })
                  );
                  dispatch(
                    addPopup({
                      content: { rejectAction: "Wallet Integrity Check Failed" },
                      key: `reject-action`
                    })
                  )
                }
              }
            }
            setLoading(false)
          }
          else if (response.data.status === false && response.data.error.includes("403")) {
            setError("Invalid token. Please validate the token. Contact Administrator");
            setLoading(false)
          }
          else
            // registerAddress();
            setLoading(false)

        } else {
          setError("Invalid token. Please validate the token");
          setLoading(false)
        }
      });
    //console.log(token);

  }

  async function registerAddress() {
    if (!chainId || !account) return;

    const registerAPIRouteValue = await updateAddressRouteFunc();

    axios
      .post(baseAuthURL + registerAPIRouteValue, {
        method: "POST",
        address: account,
        token,
        headers: {
          // 'Authorization': `bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(function (response) {
        // console.log("@@@@@ response registerAddress", response);

        if (response.data) {
          if (response.data.status) {
            setLoading(true);
            isAddressValid();
            setSwapState({
              tradeToConfirm: trade,
              attemptingTxn: false,
              swapErrorMessage: undefined,
              showConfirm: true,
              txHash: undefined
            });
            // setShowConfirm(true)
            setError("");
          }
          else {
            isAddressValid();
            setError("Invalid token. Please validate the token. Contact Administrator");
          }

        } else {
          setError("Invalid token. Please validate the token");
        }
      }).catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm: false,
          swapErrorMessage: error.message,
          txHash: undefined
        });
        dispatch(
          addPopup({
            content: { rejectAction: error.message ? error.message : "Failed" },
            key: `reject-action`
          })
        )
      });
  }
  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<
    Date | undefined
  >();

  // warnings on the greater of fiat value price impact and execution price impact
  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    const marketPriceImpact = trade?.priceImpact
      ? computeRealizedPriceImpact(trade)
      : undefined;
    const largerPriceImpact = largerPercentValue(
      marketPriceImpact,
      stablecoinPriceImpact
    );
    return {
      priceImpactSeverity: warningSeverity(largerPriceImpact),
      largerPriceImpact
    };
  }, [stablecoinPriceImpact, trade]);

  const isArgentWallet = useIsArgentWallet();

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash
    });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, "");
    }
    checkAuth();

  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      getAllowanceOfTokens(token_address?.address)
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection]
  );

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact());
    sendEvent({
      category: "Swap",
      action: "Max"
    });
  }, [maxInputAmount, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) =>
      onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  );

  const swapIsUnsupported = useIsSwapUnsupported(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT]
  );

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3;

  // console.log("1111 currencies[Field.INPUT] ", currencies[Field.INPUT]);
  // console.log("1111 currencies[Field.OUTPUT] ", currencies[Field.OUTPUT]);


  // Handle time based logging events and event properties.
  useEffect(() => {
    //console.log("@@@@ transactions transactions", transactions);

    const now = new Date();
    // If a trade exists, and we need to log the receipt of this new swap quote:
    if (newSwapQuoteNeedsLogging && !!trade) {
      // Set the current datetime as the time of receipt of latest swap quote.
      setSwapQuoteReceivedDate(now);
      // Log swap quote.
      sendAnalyticsEvent(
        EventName.SWAP_QUOTE_RECEIVED,
        formatSwapQuoteReceivedEventProperties(
          trade,
          fetchingSwapQuoteStartTime
        )
      );
      // Latest swap quote has just been logged, so we don't need to log the current trade anymore
      // unless user inputs change again and a new trade is in the process of being generated.
      setNewSwapQuoteNeedsLogging(false);
      // New quote is not being fetched, so set start time of quote fetch to undefined.
      setFetchingSwapQuoteStartTime(undefined);

      // getTokenAAddress(trade);
    }
    // If another swap quote is being loaded based on changed user inputs:
    if (routeIsLoading) {
      setNewSwapQuoteNeedsLogging(true);
      if (!fetchingSwapQuoteStartTime) setFetchingSwapQuoteStartTime(now);
    }
  }, [
    newSwapQuoteNeedsLogging,
    routeIsSyncing,
    routeIsLoading,
    fetchingSwapQuoteStartTime,
    trade,
    setSwapQuoteReceivedDate,
    transactions
  ]);

  const approveTokenButtonDisabled =
    approvalState !== ApprovalState.NOT_APPROVED ||
    approvalSubmitted ||
    signatureState === UseERC20PermitState.SIGNED;

  const CHART_VIEW = {
    VOLUME: 'Volume',
    LIQUIDITY: 'Liquidity',
  }

  const VOLUME_WINDOW = {
    WEEKLY: 'WEEKLY',
    DAYS: 'DAYS',
  }

  const [chartView, setChartView] = useState(CHART_VIEW.LIQUIDITY)

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME
  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)

  const [dailyData, weeklyData] = useGlobalChartData()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD, oneWeekVolume, weeklyVolumeChange } =
    useGlobalData()

  // based on window, get starttim
  const utcStartTime = getTimeframe(timeWindow)

  //console.log("@@@@ dailyData", dailyData);

  const chartDataFiltered = useMemo(() => {
    const currentData = volumeWindow === VOLUME_WINDOW.DAYS ? dailyData : weeklyData
    return (
      currentData &&
      Object.keys(currentData)
        ?.map((key) => {
          const item = currentData[key]
          if (item.date > utcStartTime) {
            return item
          } else {
            return true
          }
        })
        .filter((item) => {
          return !!item
        })
    )
  }, [dailyData, utcStartTime, volumeWindow, weeklyData])

  const dismissModal = useCallback(() => {
    console.log(showApprove, "0000");
    setShowApprove(false)
  }, [setShowApprove])

  return (
    <Trace page={PageName.SWAP_PAGE} shouldLogImpression>
      <>
        <Modal isOpen={showApprove} onDismiss={dismissModal} maxHeight={90}>
          <div className="d-flex flex-column p-3">
            <Trans> Make sure to enter right amount for adding liquidity for token </Trans> {" "}{currencies[Field.INPUT]?.symbol}
            <CopyHelper toCopy={isRouter1 ? Number(Number(formattedAmounts[Field.INPUT]) + Number(formattedAmounts[Field.INPUT]) * (1 / 1000)).toFixed(8) :
              Number(Number(formattedAmounts[Field.INPUT])).toFixed(8)} iconPosition="top">
              <div className="d-flex align-items-center gap-2" style={{ marginLeft: "-6px" }}>
                <span>
                  Metamask Approval value : {isRouter1 ? Number(Number(formattedAmounts[Field.INPUT]) + Number(formattedAmounts[Field.INPUT]) * (1 / 1000)).toFixed(8) :
                    Number(Number(formattedAmounts[Field.INPUT])).toFixed(8)}
                </span>
                <FaRegCopy className="account-icon text-light p-2" style={{ backgroundColor: "#0d6efd", fontSize: '2rem' }} />
              </div>
            </CopyHelper>
            <div className="d-flex gap-2 mt-2">
              <ButtonLight onClick={() => setShowApprove(false)}>Cancel</ButtonLight>
              <ButtonPrimary onClick={handleApprove}>Confirm</ButtonPrimary>
            </div>
          </div>
        </Modal>
        <ToastDiv>
          <Toast show={show} onClose={() => toggleShow(false)} autohide={true} delay={1000} className="bg-success">
            <Toast.Body>
              <strong className="mr-auto">Copied!</strong>
            </Toast.Body>
          </Toast>
        </ToastDiv>
        <TokenWarningModal
          isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
          tokens={importTokensNotInDefault}
          onConfirm={handleConfirmTokenWarning}
          onDismiss={handleDismissTokenWarning}
        />

        {/* <SwapText className="p-3 rounded-4 mb-5"><Trans>By adding liquidity you&apos;ll earn 0.2% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</Trans></SwapText> */}

        <div className="row mb-5">
          <div className="tradingView col-md-8">
            {/* <TradingViewWidget
              symbol="BINANCE:ETHUSDT"
              theme={darkLightM}
              locale={languageSwitch}
              autosize
            /> */}
            {/* <TradingViewChart
              data={dailyData}
              base={totalLiquidityUSD}
              baseChange={liquidityChangeUSD}
              title="Liquidity"
              field="totalLiquidityUSD"
              // width={}
              type="AREA"
            /> */}
          </div>
          <div className="col-md-12">
            <AppBody>
              <SwapHeader allowedSlippage={allowedSlippage} />
              <Wrapper id="swap-page">
                <ConfirmSwapModal
                  isOpen={showConfirm}
                  trade={trade}
                  originalTrade={tradeToConfirm}
                  onAcceptChanges={handleAcceptChanges}
                  attemptingTxn={attemptingTxn}
                  txHash={txHash}
                  recipient={recipient}
                  allowedSlippage={allowedSlippage}
                  onConfirm={handleSwap}
                  swapErrorMessage={swapErrorMessage}
                  onDismiss={handleConfirmDismiss}
                  swapQuoteReceivedDate={swapQuoteReceivedDate}
                  loading={loading}
                />

                <AutoColumn gap={"sm"}>
                  <div style={{ display: "relative" }}>
                    <Trace section={SectionName.CURRENCY_INPUT_PANEL}>
                      <CurrencyInputPanel
                        label={
                          independentField === Field.OUTPUT && !showWrap ? (
                            <Trans>From (at most)</Trans>
                          ) : (
                            <Trans>From</Trans>
                          )
                        }
                        value={formattedAmounts[Field.INPUT]}
                        showMaxButton={showMaxButton}
                        currency={currencies[Field.INPUT] ?? null}
                        onUserInput={handleTypeInput}
                        onMax={handleMaxInput}
                        fiatValue={fiatValueInput ?? undefined}
                        onCurrencySelect={handleInputSelect}
                        otherCurrency={currencies[Field.OUTPUT]}
                        showCommonBases={true}
                        id={SectionName.CURRENCY_INPUT_PANEL}
                        loading={
                          independentField === Field.OUTPUT && routeIsSyncing
                        }
                        showAllowance={true}
                        allowanceValue={tokenAAllowance}
                        showClear={tokenAAllowance !== 0 && parseFloat(formattedAmounts[Field.INPUT]) > tokenAAllowance}
                        onClearAllowance={() => onClearAllowance(token_address?.address)}
                      />
                    </Trace>
                    <ArrowWrapper clickable={isSupportedChain(chainId)}>
                      <TraceEvent
                        events={[Event.onClick]}
                        name={EventName.SWAP_TOKENS_REVERSED}
                        element={ElementName.SWAP_TOKENS_REVERSE_ARROW_BUTTON}>
                        <ArrowDown
                          size="16"
                          onClick={() => {
                            setApprovalSubmitted(false); // reset 2 step UI for approvals
                            onSwitchTokens();
                          }}
                          color={
                            currencies[Field.INPUT] && currencies[Field.OUTPUT]
                              ? theme.deprecated_text1
                              : theme.deprecated_text3
                          }
                        />
                      </TraceEvent>
                    </ArrowWrapper>
                    <Trace section={SectionName.CURRENCY_OUTPUT_PANEL}>
                      <CurrencyInputPanel
                        value={formattedAmounts[Field.OUTPUT]}
                        onUserInput={handleTypeOutput}
                        label={
                          independentField === Field.INPUT && !showWrap ? (
                            <Trans>To (at least)</Trans>
                          ) : (
                            <Trans>To</Trans>
                          )
                        }
                        showMaxButton={false}
                        hideBalance={false}
                        fiatValue={fiatValueOutput ?? undefined}
                        priceImpact={stablecoinPriceImpact}
                        currency={currencies[Field.OUTPUT] ?? null}
                        onCurrencySelect={handleOutputSelect}
                        otherCurrency={currencies[Field.INPUT]}
                        showCommonBases={true}
                        id={SectionName.CURRENCY_OUTPUT_PANEL}
                        loading={independentField === Field.INPUT && routeIsSyncing}
                      />
                    </Trace>
                  </div>
                  {
                    showAAllowance && showApproveFlow ? (
                      <StyledCard>
                        <div className="d-flex gap-2">
                          <MdWarning size={20} color={theme.deprecated_error} />
                          <ThemedText.DeprecatedSubHeader color={theme.deprecated_error}>
                            <Trans>To proceed, clear the allowance for {currencies[Field.INPUT]?.symbol}</Trans>
                          </ThemedText.DeprecatedSubHeader>
                        </div>
                      </StyledCard>
                    ) : null
                  }
                  {
                    showWarning ? (
                      <StyledCard>
                        <div className="d-flex gap-2">
                          <MdWarning size={20} color={theme.deprecated_error} />
                          <ThemedText.DeprecatedSubHeader color={theme.deprecated_error}>
                            <Trans>Cap difference warning</Trans>
                            <div className="d-flex flex-column">
                              <div>
                                <span style={{ color: "#858484" }}><Trans>It was suppposed to be:</Trans> </span>
                                <span style={{ color: theme.deprecated_text1 }}>{formattedAmounts[Field.INPUT]}</span>
                              </div>
                              <div>
                                <span style={{ color: "#858484" }}><Trans>But you&apos;ve entered:</Trans> </span>
                                <span style={{ color: theme.deprecated_text1 }}>{result}</span>
                              </div>
                            </div>
                          </ThemedText.DeprecatedSubHeader>
                        </div>
                      </StyledCard>
                    ) : null
                  }

                  {recipient !== null && !showWrap ? (
                    <>
                      <AutoRow
                        justify="space-between"
                        style={{ padding: "0 1rem" }}>
                        <ArrowWrapper clickable={false}>
                          <ArrowDown size="16" color={theme.deprecated_text2} />
                        </ArrowWrapper>
                        <LinkStyledButton
                          id="remove-recipient-button"
                          onClick={() => onChangeRecipient(null)}>
                          <Trans>- Remove recipient</Trans>
                        </LinkStyledButton>
                      </AutoRow>
                      <AddressInputPanel
                        id="recipient"
                        value={recipient}
                        onChange={onChangeRecipient}
                      />
                    </>
                  ) : null}
                  {!showWrap &&
                    userHasSpecifiedInputOutput &&
                    (trade || routeIsLoading || routeIsSyncing) && (
                      <div>
                        {showApproveFlow ?
                          <div className="d-flex align-items-center gap-2 my-2">
                            <MouseoverTooltipContent
                              wrap={false}
                              content={
                                <ResponsiveTooltipContainer
                                  origin="top right"
                                  style={{ padding: "0" }}>
                                  <Card padding="12px">
                                    <span style={smallText}>Swap Value + Referral Value</span>
                                  </Card>
                                </ResponsiveTooltipContainer>
                              }
                              placement="bottom"
                            >
                              <span className="material-icons orange600"><MdWarning size={20} /></span>
                            </MouseoverTooltipContent>
                            <span>Metamask Approval value :  {isRouter1 ? Number(Number(formattedAmounts[Field.INPUT]) + Number(formattedAmounts[Field.INPUT]) * (1 / 1000)).toFixed(8) :
                              Number(Number(formattedAmounts[Field.INPUT])).toFixed(8)}</span>
                            <button className="btn btn-primary px-2 py-1" onClick={() => {
                              navigator.clipboard.writeText(isRouter1 ? Number(Number(formattedAmounts[Field.INPUT]) + Number(formattedAmounts[Field.INPUT]) * (1 / 1000)).toFixed(8) :
                                Number(Number(formattedAmounts[Field.INPUT])).toFixed(8)); toggleShow(true)
                            }}>
                              <MdOutlineContentCopy size={13} />
                            </button>
                          </div> : null}

                        <SwapDetailsDropdown
                          trade={trade}
                          syncing={routeIsSyncing}
                          loading={routeIsLoading}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                          allowedSlippage={allowedSlippage}
                        />
                      </div>
                    )}
                  {showPriceImpactWarning && (
                    <PriceImpactWarning priceImpact={largerPriceImpact} />
                  )}
                  <div>
                    {swapIsUnsupported ? (
                      <ButtonPrimary disabled={true}>
                        <ThemedText.DeprecatedMain mb="4px">
                          <Trans>Unsupported Asset</Trans>
                        </ThemedText.DeprecatedMain>
                      </ButtonPrimary>
                    ) : !account ? (
                      <TraceEvent
                        events={[Event.onClick]}
                        name={EventName.CONNECT_WALLET_BUTTON_CLICKED}
                        properties={{
                          received_swap_quote: getIsValidSwapQuote(
                            trade,
                            tradeState,
                            swapInputError
                          )
                        }}
                        element={ElementName.CONNECT_WALLET_BUTTON}>
                        <ButtonLight onClick={toggleWalletModal}>
                          <Trans>Connect Wallet</Trans>
                        </ButtonLight>
                      </TraceEvent>
                    ) : showWrap ? (
                      <TraceEvent
                        events={[Event.onClick]}
                        name={EventName.WRAP_TOKEN_TXN_SUBMITTED}
                        element={ElementName.WRAP_TOKEN_BUTTON}
                        properties={formatWrapTokenTxnSubmittedEventProperties(
                          currencies[Field.INPUT],
                          currencies[Field.OUTPUT],
                          parsedAmount
                        )}
                        shouldLogImpression={!Boolean(wrapInputError)}>
                        <ButtonPrimary
                          disabled={Boolean(wrapInputError)}
                          onClick={onWrap}>
                          {wrapInputError ? (
                            <WrapErrorText wrapInputError={wrapInputError} />
                          ) : wrapType === WrapType.WRAP ? (
                            <Trans>Wrap</Trans>
                          ) : wrapType === WrapType.UNWRAP ? (
                            <Trans>Unwrap</Trans>
                          ) : null}
                        </ButtonPrimary>
                      </TraceEvent>
                    ) : routeNotFound &&
                      userHasSpecifiedInputOutput &&
                      !routeIsLoading &&
                      !routeIsSyncing ? (
                      <GreyCard style={{ textAlign: "center" }}>
                        <ThemedText.DeprecatedMain mb="4px">
                          <Trans>Insufficient liquidity for this trade.</Trans>
                        </ThemedText.DeprecatedMain>
                      </GreyCard>
                    ) : showApproveFlow ? (
                      <AutoRow style={{ flexWrap: "nowrap", width: "100%" }}>
                        <AutoColumn style={{ width: "100%" }} gap="12px">
                          <TraceEvent
                            events={[Event.onClick]}
                            name={EventName.APPROVE_TOKEN_TXN_SUBMITTED}
                            element={ElementName.APPROVE_TOKEN_BUTTON}
                            properties={formatApproveTokenTxnSubmittedEventProperties(
                              approvalOptimizedTrade
                            )}
                            shouldLogImpression={!approveTokenButtonDisabled}>
                            <ButtonConfirmed
                              // onClick={handleApprove}
                              onClick={() => setShowApprove(true)}
                              disabled={approveTokenButtonDisabled}
                              width="100%"
                              altDisabledStyle={
                                approvalState === ApprovalState.PENDING
                              } // show solid button while waiting
                              confirmed={
                                approvalState === ApprovalState.APPROVED ||
                                signatureState === UseERC20PermitState.SIGNED
                              }>
                              <AutoRow
                                justify="space-between"
                                style={{ flexWrap: "nowrap" }}>
                                <span
                                  style={{ display: "flex", alignItems: "center" }}>
                                  <CurrencyLogo
                                    currency={currencies[Field.INPUT]}
                                    size={"20px"}
                                    style={{ marginRight: "8px", flexShrink: 0 }}
                                  />
                                  {/* we need to shorten this string on mobile */}
                                  {approvalState === ApprovalState.APPROVED ||
                                    signatureState === UseERC20PermitState.SIGNED ? (
                                    <Trans>
                                      You can now trade{" "}
                                      {currencies[Field.INPUT]?.symbol}
                                    </Trans>
                                  ) : (
                                    <Trans>
                                      Allow the Panaromaswap Protocol to use your{" "}
                                      {currencies[Field.INPUT]?.symbol}
                                    </Trans>
                                  )}
                                </span>
                                {approvalState === ApprovalState.PENDING ? (
                                  <Loader stroke="white" />
                                ) : (approvalSubmitted &&
                                  approvalState === ApprovalState.APPROVED) ||
                                  signatureState === UseERC20PermitState.SIGNED ? (
                                  <CheckCircle
                                    size="20"
                                    color={theme.deprecated_green1}
                                  />
                                ) : (
                                  <MouseoverTooltip
                                    text={
                                      <Trans>
                                        You must give the Panaromaswap smart
                                        contracts permission to use your{" "}
                                        {currencies[Field.INPUT]?.symbol}. You only
                                        have to do this once per token.
                                      </Trans>
                                    }>
                                    <HelpCircle
                                      size="20"
                                      color={"deprecated_white"}
                                      style={{ marginLeft: "8px" }}
                                    />
                                  </MouseoverTooltip>
                                )}
                              </AutoRow>
                            </ButtonConfirmed>
                          </TraceEvent>
                          {isValid && disbtn && !isVerified ? (<div>
                            <div className="verify-token">
                              <div className="inbutContainer">
                                <div className="custom-search">
                                  <input
                                    type="text"
                                    onChange={(e) => setToken(e.target.value)}
                                    className="custom-search-input"
                                    placeholder="Enter 2FA"
                                  />
                                </div>
                              </div>
                              <button onClick={verify} className="ed-btn">
                                Verify
                              </button>
                            </div>
                            <p className="tokenValidation">{errors}</p>
                          </div>) : null}
                          {isVerified ? (<ButtonError
                            onClick={() => {
                              if (isExpertMode) {
                                handleSwap();
                              } else {
                                registerAddress();
                                // setSwapState({
                                //   tradeToConfirm: trade,
                                //   attemptingTxn: false,
                                //   swapErrorMessage: undefined,
                                //   showConfirm: true,
                                //   txHash: undefined
                                // });
                              }
                            }}
                            width="100%"
                            id="swap-button"
                            disabled={
                              !isValid ||
                              routeIsSyncing ||
                              routeIsLoading ||
                              (approvalState !== ApprovalState.APPROVED &&
                                signatureState !== UseERC20PermitState.SIGNED) ||
                              priceImpactTooHigh
                            }
                            error={isValid && priceImpactSeverity > 2}>
                            <Text fontSize={16} fontWeight={500}>
                              {priceImpactTooHigh ? (
                                <Trans>High Price Impact</Trans>
                              ) : trade && priceImpactSeverity > 2 ? (
                                <Trans>Swap Anyway</Trans>
                              ) : (
                                <Trans>Swap</Trans>
                              )}
                            </Text>
                          </ButtonError>) :
                            null}

                        </AutoColumn>
                      </AutoRow>
                    ) : (
                      <div>
                        {isValid && disbtn && !isVerified ? (
                          <div>
                            <div className="verify-token">
                              <div className="inbutContainer">
                                <div className="custom-search twofa">
                                  <input
                                    onChange={(e) => { e.target.value = e.target.value.slice(0, 6); setToken(e.target.value) }}
                                    type="number"
                                    className="px-5 py-3 rounded border-0"
                                    placeholder="Enter 2FA"
                                  />
                                </div>
                              </div>
                              <button onClick={verify} className="ed-btn">
                                Verify
                              </button>
                            </div>
                            <p className="tokenValidation">{errors}</p>
                          </div>) : null}
                        {isVerified ? (<ButtonError
                          onClick={() => {
                            if (isExpertMode) {
                              handleSwap();
                            } else {
                              registerAddress();
                              // setSwapState({
                              //   tradeToConfirm: trade,
                              //   attemptingTxn: false,
                              //   swapErrorMessage: undefined,
                              //   showConfirm: true,
                              //   txHash: undefined
                              // });
                            }
                          }}
                          id="swap-button"
                          disabled={
                            !isValid ||
                            routeIsSyncing ||
                            routeIsLoading ||
                            priceImpactTooHigh ||
                            !!swapCallbackError
                          }
                          error={
                            isValid && priceImpactSeverity > 2 && !swapCallbackError
                          }>
                          <Text fontSize={20} fontWeight={500}>
                            {swapInputError ? (
                              swapInputError
                            ) : routeIsSyncing || routeIsLoading ? (
                              <Trans>Swap</Trans>
                            ) : priceImpactSeverity > 2 ? (
                              <Trans>Swap Anyway</Trans>
                            ) : priceImpactTooHigh ? (
                              <Trans>Price Impact Too High</Trans>
                            ) : (
                              <Trans>Swap</Trans>
                            )}
                          </Text>
                        </ButtonError>) :
                          null}

                      </div>
                    )}
                    {isExpertMode && swapErrorMessage ? (
                      <SwapCallbackError error={swapErrorMessage} />
                    ) : null}
                  </div>
                </AutoColumn>
              </Wrapper>
            </AppBody>
          </div>
          {/* <TotalTokensLocked /> */}
        </div>

        <div className="row">
          <div className="col-md-12 mb-3">
            <TransactionTable transactions={transactions} />
          </div>
          {/* <TotalTokensLocked /> */}
        </div>


        {/* <AlertWrapper>
          <NetworkAlert />
        </AlertWrapper> */}
        <SwitchLocaleLink />
        {!swapIsUnsupported ? null : (
          <UnsupportedCurrencyFooter
            show={swapIsUnsupported}
            currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
          />
        )}
      </>
    </Trace >
  );
}