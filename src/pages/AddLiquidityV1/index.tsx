import {
  ButtonError,
  ButtonLight,
  ButtonPrimary
} from "../../components/Button";
import { BlueCard, LightCard, OutlineCard } from "../../components/Card";
import { AutoColumn, ColumnCenter } from "../../components/Column";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import { AddRemoveTabs } from "../../components/NavigationTabs";
import { MinimalPositionCard } from "../../components/PositionCard";
import Row, { RowBetween, RowFlat } from "../../components/Row";
import TransactionConfirmationModal, {
  ConfirmationModalContent
} from "../../components/TransactionConfirmationModal";
import { ZERO_PERCENT } from "../../constants/misc";
import { WRAPPED_NATIVE_CURRENCY } from "../../constants/tokens";
import { useCurrency } from "../../hooks/Tokens";
import {
  ApprovalState,
  useApproveCallback
} from "../../hooks/useApproveCallback";
import { useTokenContract, useV1RouterContract } from "../../hooks/useContract";
import { useIsSwapUnsupported } from "../../hooks/useIsSwapUnsupported";
import useTransactionDeadline from "../../hooks/useTransactionDeadline";
import { PairState } from "../../hooks/useV1Pairs";
import { useToggleWalletModal } from "../../state/application/hooks";
import { Field } from "../../state/mint/actions";
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState
} from "../../state/mint/hooks";
import { useTransactionAdder } from "../../state/transactions/hooks";
import { TransactionType } from "../../state/transactions/types";
import {
  useIsExpertMode,
  useUserSlippageToleranceWithDefault
} from "../../state/user/hooks";
import { ThemedText } from "../../theme";
import { calculateGasMargin } from "../../utils/calculateGasMargin";
import { calculateSlippageAmount } from "../../utils/calculateSlippageAmount";
import { currencyId } from "../../utils/currencyId";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
// import AppBody from '../AppBody'
import { Dots, Wrapper } from "../Pool/styleds";
import { ConfirmAddModalBottom } from "./ConfirmAddModalBottom";
import { PoolPriceBar } from "./PoolPriceBar";
import { BigNumber } from "@ethersproject/bignumber";
import { TransactionResponse } from "@ethersproject/providers";
import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { TraceEvent } from "components/AmplitudeAnalytics/TraceEvent";
import {
  ElementName,
  Event,
  EventName
} from "components/AmplitudeAnalytics/constants";
import { SwitchLocaleLink } from "components/SwitchLocaleLink";
import { sendEvent } from "components/analytics";
// import UnsupportedCurrencyFooter from "components/swap/UnsupportedCurrencyFooter";
// import TotalTokensLocked from "pages/TTL/TotalTokensLocked";
// import TransactionTable from "pages/TransactionTable";
import { Currency, CurrencyAmount, Percent } from "@panaromafinance/panaromaswap_sdkcore";
import { useCallback, useContext, useState, useEffect } from "react";
import { Plus } from "react-feather";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components/macro";
import { SupportedChainId } from "constants/chains";

import { addPopup } from "state/application/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";
import Modal from "components/Modal";
import allowanceCheckABI from "../../abis/allowanceCheckABI.json";
import Web3 from "web3";
import { RPC_URLS } from "constants/networks";
import { opacify } from "theme/utils";
import { MdWarning } from "react-icons/md";
import CopyHelper from "components/AccountDetails/Copy";
import { FaRegCopy } from "react-icons/fa";
import ERC20_ABI from "../../abis/erc20.json";

import integrityCheck from "../integrityCheck";
import { getConnection, getIsMetaMask, getConnectionName } from "connection/utils";
import { updateSelectedWallet } from "state/user/reducer";
import { removeConnectedWallet } from "state/wallets/reducer";

const DEFAULT_ADD_V1_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

const AddLiquidityBody = styled.div<{ margin?: string; maxWidth?: string }>`
  position: relative;
  margin-top: ${({ margin }) => margin ?? "0px"};
  max-width: ${({ maxWidth }) => maxWidth ?? "480px"};
  background: ${({ theme }) => theme.deprecated_bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  // margin-top: 1rem;
  margin: auto;
`;

const Select = styled.select`
  color: ${({ theme }) => theme.deprecated_text1};
  background: ${({ theme }) => theme.deprecated_bg0};
`;

const StyledCard = styled(OutlineCard)`
  padding: 12px;
  border: 1px solid ${({ theme }) => opacify(24, theme.deprecated_error)};
`;

const SwapText = styled.div`
  background: ${({ theme }) => theme.deprecated_bg0};
`;

export default function AddLiquidity() {
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA?: string;
    currencyIdB?: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [disbtn, setDisbtn] = useState(true);
  const [disSupplybtn, setDisSupplybtn] = useState(false);
  const [token, setToken] = useState("");
  const [errors, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [directSwap, setDirectSwap] = useState(true);
  const [baseurl] = useState(process.env['REACT_APP_BASE_URL']);
  const [baseAuthURL] = useState(process.env['REACT_APP_AUTH_BASE_URL']);
  const [baseGAuthURL] = useState(process.env['REACT_APP_GAUTH_BASE_URL']);
  const { account, chainId, provider, connector } = useWeb3React();
  const [validAPIRoute, setValidAPIRoute] = useState("");
  const [registerAPIRoute, setRegisterAPIRoute] = useState("");

  const [showApprove, setShowApprove] = useState<{ type: string; show: boolean }>({ type: '', show: false })
  const [showWarningA, setShowWarningA] = useState<boolean>(false)
  const [showWarningB, setShowWarningB] = useState<boolean>(false)

  const [resultA, setResultA] = useState<number>()
  const [resultB, setResultB] = useState<number>()

  const [showAAllowance, setShowAAllowance] = useState<boolean>(false)
  const [showBAllowance, setShowBAllowance] = useState<boolean>(false)


  const [tokenAAllowance, setTokenAAllowance] = useState<number>(0)
  const [tokenBAllowance, setTokenBAllowance] = useState<number>(0)

  const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
  const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  });

  const checkAuth = () => {
    // console.log(account, "select address");
    const payload = { metaMaskPrivateKey: account };
    // console.log(payload, "payload");
    axios
      .get(baseGAuthURL + "checkauthenticator/" + account)
      .then(function (response) {
        // console.log("&&&&&&&& response", response);
        if (response.data.status === 1) {
          setShowAuth(true);
          setDirectSwap(false);
        } else if (response.data.status === 2) {
          setShowAuth(false);
          setDirectSwap(true);
        } else if (response.data.status === 0) {
          setShowAuth(false);
          setDirectSwap(true);
        }
      });
  };

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
        // console.log("@@@@ response", response);
        if (response.data) {
          setDisbtn(false);
          setError("");
        } else {
          setError("Invalid Code. Please enter the correct code from authenticator");
        }
      });
    //console.log(token);
  };

  const theme = useContext(ThemeContext);

  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  const wrappedNativeCurrency = chainId
    ? WRAPPED_NATIVE_CURRENCY[chainId]
    : undefined;

  const oneCurrencyIsWETH = Boolean(
    chainId &&
    wrappedNativeCurrency &&
    ((currencyA && currencyA.equals(wrappedNativeCurrency)) ||
      (currencyB && currencyB.equals(wrappedNativeCurrency)))
  );

  const toggleWalletModal = useToggleWalletModal(); // toggle wallet when disconnected

  const expertMode = useIsExpertMode();

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState();
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings
  const allowedSlippage = useUserSlippageToleranceWithDefault(
    DEFAULT_ADD_V1_SLIPPAGE_TOLERANCE
  ); // custom from users
  const [txHash, setTxHash] = useState<string>("");

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity
      ? otherTypedValue
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ""
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(currencyBalances[field])
    };
  }, {});

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? "0")
    };
  }, {});

  const router = useV1RouterContract();
  const tokenContract = useTokenContract(currencyIdA);
  const tokenContractB = useTokenContract(currencyIdB);

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    router?.address
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    router?.address
  );

  const abiPANA = allowanceCheckABI as any;
  const allowanceClearABI = ERC20_ABI as any;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(RPC_URLS[chainId ? chainId.toString() : ""])
  );

  useEffect(() => {
    if (approvalB === ApprovalState.PENDING || approvalA === ApprovalState.PENDING) {
      showApprove.type === "input" ? getAllowance(Field.CURRENCY_A) : getAllowance(Field.CURRENCY_B) // to check the cap amount user enter
    }
    showApprove.type === "input" ? setShowApprove({ type: 'input', show: false }) : setShowApprove({ type: 'output', show: false })

    getAllowanceOfTokens(currencyIdA!)
    getAllowanceOfTokens(currencyIdB!)

  }, [approvalA, approvalB])

  async function getAllowanceOfTokens(currency: any) {
    try {
      const contract = new web3.eth.Contract(abiPANA, currency)

      // console.log("787878 currency, router?.address, Field.CURRENCY_A", currency, router?.address, Field.CURRENCY_A);

      const result = await contract.methods.allowance(account, router?.address).call();
      const tokenDecimal = currency === currencyIdA ? currencyA?.decimals : currencyB?.decimals
      const convertedResult = result / (10 ** tokenDecimal!)

      currency === currencyIdA ? setTokenAAllowance(convertedResult) : setTokenBAllowance(convertedResult)
      // console.log("convertedResult currency", convertedResult);

      if (currency === currencyIdA) {
        if (parseFloat(formattedAmounts[Field.CURRENCY_A]) > convertedResult && convertedResult !== 0) {
          setShowAAllowance(true)
        } else {
          // setShowWarning(false)
          setShowAAllowance(false)
        }
      } else {
        if (parseFloat(formattedAmounts[Field.CURRENCY_B]) > convertedResult && convertedResult !== 0) {
          setShowBAllowance(true)
        } else {
          // setShowWarning(false)
          setShowBAllowance(false)
        }
      }

    } catch (error) {
      console.log(error)
    }
  }

  function getAllowance(currency: string | number) {

    // Define the ERC-20 token contract
    const id = showApprove.type === "input" ? currencyIdA : currencyIdB
    const contract = new web3.eth.Contract(abiPANA, id)

    setTimeout(async () => {
      try {
        const result = await contract.methods.allowance(account, router?.address).call();
        const tokenDecimal = showApprove.type === "input" ? currencyA?.decimals : currencyB?.decimals
        const convertedResult = result / (10 ** tokenDecimal!)
        showApprove.type === "input" ? setResultA(convertedResult) : setResultB(convertedResult)

        if (result > Number(parsedAmounts[currency]?.quotient)) {
          showApprove.type === "input" ? setShowWarningA(true) : setShowWarningB(true)
        } else {
          showApprove.type === "input" ? setShowWarningA(false) : setShowWarningB(false)
        }
      } catch (error) {
        console.log(error)
      }
    }, 5000);
  }

  async function onClearAllowance(currency: any, isTokenA?: boolean) {

    try {
      const contract = new web3.eth.Contract(allowanceClearABI, currency)

      // console.log("allowance clear, currency, router?.address, isTokenA", currencyIdA, currency, router?.address);

      const tokenContractApproval = currency === currencyIdA ? tokenContract : tokenContractB;
      const test = tokenContractApproval ? await tokenContractApproval
        .approve(
          router ? router.address : "",
          "0"
        ) : "";

      if (test) {
        addTransaction(test, {
          type: TransactionType.CLEAR
        });
        setTimeout(() => {
          getAllowanceOfTokens(currency)
          currency === currencyIdA ? setShowWarningA(false) : setShowWarningB(false)
        }, 10000);

      }

    } catch (error) {
      console.log(error)
    }
  }

  const addTransaction = useTransactionAdder();

  async function onAdd() {
    if (!chainId || !provider || !account || !router) return;

    // const integrity = await integrityCheck(account, chainId, baseAuthURL)	
    // if(integrity) {

    const {
      [Field.CURRENCY_A]: parsedAmountA,
      [Field.CURRENCY_B]: parsedAmountB
    } = parsedAmounts;
    if (
      !parsedAmountA ||
      !parsedAmountB ||
      !currencyA ||
      !currencyB ||
      !deadline
    ) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        parsedAmountA,
        noLiquidity ? ZERO_PERCENT : allowedSlippage
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        parsedAmountB,
        noLiquidity ? ZERO_PERCENT : allowedSlippage
      )[0]
    };

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (currencyA.isNative || currencyB.isNative) {
      const tokenBIsETH = currencyB.isNative;
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [
        (tokenBIsETH ? currencyA : currencyB)?.wrapped?.address ?? "", // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).quotient.toString(), // token desired
        amountsMin[
          tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
        ].toString(), // token min
        amountsMin[
          tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
        ].toString(), // eth min
        account,
        deadline.toHexString()
      ];
      value = BigNumber.from(
        (tokenBIsETH ? parsedAmountB : parsedAmountA).quotient.toString()
      );
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        currencyA?.wrapped?.address ?? "",
        currencyB?.wrapped?.address ?? "",
        parsedAmountA.quotient.toString(),
        parsedAmountB.quotient.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString()
      ];
      value = null;
    }

    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then((response) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            type: TransactionType.ADD_LIQUIDITY_V1_POOL,
            baseCurrencyId: currencyId(currencyA),
            expectedAmountBaseRaw:
              parsedAmounts[Field.CURRENCY_A]?.quotient.toString() ?? "0",
            quoteCurrencyId: currencyId(currencyB),
            expectedAmountQuoteRaw:
              parsedAmounts[Field.CURRENCY_B]?.quotient.toString() ?? "0"
          });

          setTxHash(response.hash);

          sendEvent({
            category: "Liquidity",
            action: "Add",
            label: [
              currencies[Field.CURRENCY_A]?.symbol,
              currencies[Field.CURRENCY_B]?.symbol
            ].join("/")
          });
        })
      )
      .catch((error) => {
        setAttemptingTxn(false);
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {

          console.error(error, "transaction rejected");

          dispatch(
            addPopup({
              content: { rejectAction: error.code ? error.code : "Failed" },
              key: `reject-action`
            })
          )
        } else {
          dispatch(
            addPopup({
              content: { rejectAction: error.message ? error.message : "Failed" },
              key: `reject-action`
            })
          )
        }
      });
    // } else {
    //   const walletType = getConnectionName(
    //       getConnection(connector).type,
    //       getIsMetaMask()
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

  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" $borderRadius="20px">
          <RowFlat>
            <Text
              fontSize="48px"
              fontWeight={500}
              lineHeight="42px"
              marginRight={10}>
              {currencies[Field.CURRENCY_A]?.symbol +
                "/" +
                currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: "20px" }} className="justify-content-between align-items-center">
          <Text
            fontSize="35px"
            fontWeight={500}
            lineHeight="42px"
            marginRight={10}>
            {liquidityMinted?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <Text fontSize="24px">
            {currencies[Field.CURRENCY_A]?.symbol +
              "/" +
              currencies[Field.CURRENCY_B]?.symbol +
              " Pool Tokens"}
          </Text>
        </Row>
        <ThemedText.DeprecatedItalic
          fontSize={12}
          textAlign="left"
          padding={"8px 0 0 0 "}>
          <Trans>
            Output is estimated. If the price changes by more than{" "}
            {allowedSlippage.toSignificant(4)}% your transaction will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
        loading={loading}
      />
    );
  };

  const pendingText = (
    <Trans>
      Supplying {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}{" "}
      {currencies[Field.CURRENCY_A]?.symbol} and{" "}
      {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}{" "}
      {currencies[Field.CURRENCY_B]?.symbol}
    </Trans>
  );

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA);
      if (newCurrencyIdA === currencyIdB) {
        navigate(`/add/v1/${currencyIdB}/${currencyIdA}`);
      } else {
        navigate(`/add/v1/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdB, navigate, currencyIdA]
  );
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB);
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          navigate(`/add/v1/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          navigate(`/add/v1/${newCurrencyIdB}`);
        }
      } else {
        navigate(
          `/add/v1/${currencyIdA ? currencyIdA : "ETH"}/${newCurrencyIdB}`
        );
      }
    },
    [currencyIdA, navigate, currencyIdB]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput("");
    }
    setTxHash("");
  }, [onFieldAInput, txHash]);

  const { pathname } = useLocation();
  const isCreate = pathname.includes("/create");

  const addIsUnsupported = useIsSwapUnsupported(
    currencies?.CURRENCY_A,
    currencies?.CURRENCY_B
  );

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


    // setTimeout(() => {
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
        //   console.log("@@@@@ response isValidAddress", response);

        if (response.data) {
          if (response.data.status) {
            if (response.data.message) {
              if (response.data.message.risk.toLowerCase() === "severity") {
                // block the account
                setDisSupplybtn(true);

                setError("Alert! Address seems suspicious! Please contact administrator");
              }
              else {

                const integrity = await integrityCheck(account, chainId, baseAuthURL, rpcurl)

                if (integrity) {
                  setShowConfirm(true);
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
            registerAddress();
          setLoading(false)

        } else {
          setError("Invalid token. Please validate the token");
          setLoading(false)
        }
      });

    // }, 5000);
    // console.log(token);

  }

  async function registerAddress() {

    if (!chainId || !account) return;

    const registerAPIRouteValue = await updateAddressRouteFunc();

    // setShowConfirm(true);

    // setTimeout(() => {

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
        //  console.log("@@@@@ response registerAddress", response);

        if (response.data) {
          if (response.data.status) {
            setLoading(true);
            isAddressValid();
            setShowConfirm(true)
            setError("");
          }
          else {
            isAddressValid();
            setError("Invalid token. Please validate the token. Contact Administrator");
          }

        } else {
          setError("Invalid token. Please validate the token");
        }
      });
    // }, 5000);
  }

  function getFormattedValue(inputCurrencyData: any) {
    // var num = 0.0000249999;
    let count = 0;

    if (inputCurrencyData) {
      const numString = inputCurrencyData.toString()
      const number5 = parseFloat(inputCurrencyData);

      const temp = numString.split(".")

      if (temp.length > 1) {
        for (let i = 0; i < temp[1].length; i++) {
          if (temp[1][i] === "0")
            count++
        }
        // const scale5 = count + 2;

        return roundNumberV1(number5, count + 2);
      }
      else
        return roundNumberV1(number5, count + 2);
    }
    else
      return 0;
  }

  function roundNumberV1(num: any, scale: any) {
    if (!("" + num).includes("e")) {
      return +(Math.round(Number(num + "e+" + scale)) + "e-" + scale);
    } else {
      const arr = ("" + num).split("e");
      let sig = ""
      if (+arr[1] + scale > 0) {
        sig = "+";
      }
      const i = +arr[0] + "e" + sig + (+arr[1] + scale);
      const j = Math.round(Number(i));
      const k = +(j + "e-" + scale);

      return k;
    }

  }

  // const [liquidityPeriod, setliquidityPeriod] = useState('')

  // const liquidityPeriods = [
  //   { month: '1 Month', value: '1' },
  //   { month: '2 Month', value: '2' },
  //   { month: '3 Month', value: '3' },
  //   { month: '4 Month', value: '4' },
  //   { month: '5 Month', value: '5' },
  //   { month: '6 Month', value: '6' },
  //   { month: '7 Month', value: '7' },
  //   { month: '8 Month', value: '8' },
  //   { month: '9 Month', value: '9' },
  //   { month: '10 Month', value: '10' },
  //   { month: '11 Month', value: '11' },
  //   { month: '12 Month', value: '12' },
  // ]

  const dismissModal = useCallback(() => {
    showApprove.type === "input" ? setShowApprove({ type: 'input', show: false }) : setShowApprove({ type: 'output', show: false })
  }, [setShowApprove]);

  return (
    <>
      {/* <div className="col-md-4"> */}

      {/* <div className="row mt-5"> */}
      <Modal isOpen={showApprove.show} onDismiss={dismissModal} maxHeight={90}>
        <div className="d-flex flex-column p-3">
          <Trans> Make sure to enter right amount for adding liquidity for token </Trans> {" "}{showApprove.type === "input" ? currencies[Field.CURRENCY_A]?.symbol : currencies[Field.CURRENCY_B]?.symbol}

          <CopyHelper toCopy={Number(Number(showApprove.type === "input" ? getFormattedValue(formattedAmounts[Field.CURRENCY_A]) : getFormattedValue(formattedAmounts[Field.CURRENCY_B]))).toFixed(8)} iconPosition="top">
            <div className="d-flex align-items-center gap-2" style={{ marginLeft: "-6px" }}>
              <span>
                Metamask Approval value : {Number(Number(showApprove.type === "input" ? getFormattedValue(formattedAmounts[Field.CURRENCY_A]) : getFormattedValue(formattedAmounts[Field.CURRENCY_B])))}
              </span>
              <FaRegCopy className="account-icon text-light p-2" style={{ backgroundColor: "#0d6efd", fontSize: '2rem' }} />
            </div>
          </CopyHelper>
          <div className="d-flex gap-2 mt-2">
            <ButtonLight onClick={() => showApprove.type === "input" ? setShowApprove({ type: 'input', show: false }) : setShowApprove({ type: 'output', show: false })}>Cancel</ButtonLight>
            <ButtonPrimary onClick={showApprove.type === "input" ? approveACallback : approveBCallback}>Confirm</ButtonPrimary>
          </div>
        </div>
      </Modal>
      {
        pathname.includes("/add") ? (
          <SwapText className="p-3 rounded-4 mb-5"><Trans>By adding liquidity you&apos;ll earn 0.2% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</Trans></SwapText>
          // <SwapText className="p-3 rounded-4 mb-5 bg-dark"><Trans>By adding liquidity you&apos;ll earn 0.2% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</Trans></SwapText>
        ) : null
      }
      <div className={pathname.includes("/add") ? "" : "col-md-4 m-auto"}>
        <div className="d-lg-flex justify-content-between">
          {!addIsUnsupported ? (
            pair && !noLiquidity && pairState !== PairState.INVALID ? (
              <div className="mt-0 m-auto">
                <AutoColumn
                  style={{
                    minWidth: "20rem",
                    width: "100%",
                    maxWidth: "400px",
                    margin: "auto auto 25px"
                  }}>
                  <MinimalPositionCard
                    showUnwrapped={oneCurrencyIsWETH}
                    pair={pair}
                  />
                </AutoColumn>
              </div>
            ) : null
          ) : (null
            // <UnsupportedCurrencyFooter
            //   show={addIsUnsupported}
            //   currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
            // />
          )}
          <div className="mb-5 m-auto">
            <AddLiquidityBody>
              <AddRemoveTabs
                creating={isCreate}
                adding={true}
                defaultSlippage={DEFAULT_ADD_V1_SLIPPAGE_TOLERANCE}
              />
              <Wrapper>
                <TransactionConfirmationModal
                  isOpen={showConfirm}
                  onDismiss={handleDismissConfirmation}
                  attemptingTxn={attemptingTxn}
                  hash={txHash}
                  content={() => (
                    <ConfirmationModalContent
                      title={
                        noLiquidity ? (
                          <Trans>You are creating a pool</Trans>
                        ) : (
                          <Trans>You will receive</Trans>
                        )
                      }
                      onDismiss={handleDismissConfirmation}
                      topContent={modalHeader}
                      bottomContent={modalBottom}
                    />
                  )}
                  pendingText={pendingText}
                  currencyToAdd={pair?.liquidityToken}
                />
                <AutoColumn gap="20px">
                  {noLiquidity ||
                    (isCreate ? (
                      <ColumnCenter>
                        <BlueCard>
                          <AutoColumn gap="10px">
                            <ThemedText.DeprecatedLink
                              fontWeight={600}
                              color={"deprecated_primaryText1"}>
                              <Trans>
                                You are the first liquidity provider.
                              </Trans>
                            </ThemedText.DeprecatedLink>
                            <ThemedText.DeprecatedLink
                              fontWeight={400}
                              color={"deprecated_primaryText1"}>
                              <Trans>
                                The ratio of tokens you add will set the price
                                of this pool.
                              </Trans>
                            </ThemedText.DeprecatedLink>
                            <ThemedText.DeprecatedLink
                              fontWeight={400}
                              color={"deprecated_primaryText1"}>
                              <Trans>
                                Once you are happy with the rate click supply to
                                review.
                              </Trans>
                            </ThemedText.DeprecatedLink>
                          </AutoColumn>
                        </BlueCard>
                      </ColumnCenter>
                    ) : (
                      <ColumnCenter>
                        <BlueCard>
                          <AutoColumn gap="10px">
                            <ThemedText.DeprecatedLink
                              fontWeight={400}
                              color={"deprecated_primaryText1"}>
                              <Trans>
                                <b>
                                  <Trans>Tip:</Trans>
                                </b>{" "}
                                When you add liquidity, you will receive pool
                                tokens representing your position. These tokens
                                automatically earn fees proportional to your
                                share of the pool, and can be redeemed at any
                                time.
                              </Trans>
                            </ThemedText.DeprecatedLink>
                          </AutoColumn>
                        </BlueCard>
                      </ColumnCenter>
                    ))}
                  <CurrencyInputPanel
                    value={formattedAmounts[Field.CURRENCY_A]}
                    onUserInput={onFieldAInput}
                    onMax={() => {
                      onFieldAInput(
                        maxAmounts[Field.CURRENCY_A]?.toExact() ?? ""
                      );
                    }}
                    onCurrencySelect={handleCurrencyASelect}
                    showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                    currency={currencies[Field.CURRENCY_A] ?? null}
                    id="add-liquidity-input-tokena"
                    showCommonBases
                    showAllowance={true}
                    allowanceValue={tokenAAllowance}
                    showClear={tokenAAllowance !== 0 && parseFloat(formattedAmounts[Field.CURRENCY_A]) > tokenAAllowance}
                    onClearAllowance={() => onClearAllowance(currencyIdA, true)}
                  />
                  <ColumnCenter>
                    <Plus size="16" color={theme.deprecated_text2} />
                  </ColumnCenter>
                  <CurrencyInputPanel
                    value={formattedAmounts[Field.CURRENCY_B]}
                    onUserInput={onFieldBInput}
                    onCurrencySelect={handleCurrencyBSelect}
                    onMax={() => {
                      onFieldBInput(
                        maxAmounts[Field.CURRENCY_B]?.toExact() ?? ""
                      );
                    }}
                    showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                    currency={currencies[Field.CURRENCY_B] ?? null}
                    id="add-liquidity-input-tokenb"
                    showCommonBases
                    showAllowance={true}
                    allowanceValue={tokenBAllowance}
                    showClear={tokenBAllowance !== 0 && parseFloat(formattedAmounts[Field.CURRENCY_B]) > tokenBAllowance}
                    onClearAllowance={() => onClearAllowance(currencyIdB, false)}
                  />
                  {/* <div>
                    {parseFloat(formattedAmounts[Field.CURRENCY_A])}
                  </div> */}
                  {/* <div className="">
                        <Select className="form-select" aria-label="Default select example">
                          <option selected>Select a month</option>
                          {liquidityPeriods.map((liquidityPeriod) => (
                            <option key={liquidityPeriod.toString()} value={liquidityPeriod.value}>
                              {liquidityPeriod.month}
                            </option>
                          ))}
                        </Select>
                      </div> */}
                  {
                    showAAllowance ? (
                      <StyledCard>
                        <div className="d-flex gap-2">
                          <MdWarning size={20} color={theme.deprecated_error} />
                          <ThemedText.DeprecatedSubHeader color={theme.deprecated_error}>
                            <Trans>To proceed, clear the allowance for {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                          </ThemedText.DeprecatedSubHeader>
                        </div>
                      </StyledCard>
                    ) : null
                  }
                  {
                    showBAllowance ? (
                      <StyledCard>
                        <div className="d-flex gap-2">
                          <MdWarning size={20} color={theme.deprecated_error} />
                          <ThemedText.DeprecatedSubHeader color={theme.deprecated_error}>
                            <Trans>To proceed, clear the allowance for {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                          </ThemedText.DeprecatedSubHeader>
                        </div>
                      </StyledCard>
                    ) : null
                  }
                  {
                    showWarningA || showWarningB ? (
                      <StyledCard>
                        <div className="d-flex gap-2">
                          <MdWarning size={20} color={theme.deprecated_error} />
                          <ThemedText.DeprecatedSubHeader color={theme.deprecated_error}>
                            <Trans>Cap difference warning</Trans>
                            {
                              showWarningA ? (
                                <div className="d-flex flex-column">
                                  <span>For {currencies[Field.CURRENCY_A]?.symbol} :</span>
                                  <div>
                                    <span style={{ color: "#858484" }}><Trans>It was suppposed to be:</Trans> </span>
                                    <span style={{ color: theme.deprecated_text1 }}>{formattedAmounts[Field.CURRENCY_A]}</span>
                                  </div>
                                  <div>
                                    <span style={{ color: "#858484" }}><Trans>But you&apos;ve entered:</Trans> </span>
                                    <span style={{ color: theme.deprecated_text1 }}>{resultA}</span>
                                  </div>
                                </div>
                              ) : null
                            }
                            {
                              showWarningB ? (
                                <div className="d-flex flex-column">
                                  <span>For {currencies[Field.CURRENCY_B]?.symbol} :</span>
                                  <div>
                                    <span style={{ color: "#858484" }}><Trans>It was suppposed to be:</Trans> </span>
                                    <span style={{ color: theme.deprecated_text1 }}>{formattedAmounts[Field.CURRENCY_B]}</span>
                                  </div>
                                  <div>
                                    <span style={{ color: "#858484" }}><Trans>But you&apos;ve entered:</Trans> </span>
                                    <span style={{ color: theme.deprecated_text1 }}>{resultB}</span>
                                  </div>
                                </div>
                              ) : null
                            }
                          </ThemedText.DeprecatedSubHeader>
                        </div>
                      </StyledCard>
                    ) : null
                  }
                  {currencies[Field.CURRENCY_A] &&
                    currencies[Field.CURRENCY_B] &&
                    pairState !== PairState.INVALID && (
                      <>
                        <LightCard padding="0px" $borderRadius={"20px"}>
                          <RowBetween padding="1rem">
                            <ThemedText.DeprecatedSubHeader
                              fontWeight={500}
                              fontSize={14}>
                              {noLiquidity ? (
                                <Trans>Initial prices and pool share</Trans>
                              ) : (
                                <Trans>Prices and pool share</Trans>
                              )}
                            </ThemedText.DeprecatedSubHeader>
                          </RowBetween>{" "}
                          <LightCard padding="1rem" $borderRadius={"20px"}>
                            <PoolPriceBar
                              currencies={currencies}
                              poolTokenPercentage={poolTokenPercentage}
                              noLiquidity={noLiquidity}
                              price={price}
                            />
                          </LightCard>
                        </LightCard>
                      </>
                    )}

                  {addIsUnsupported ? (
                    <ButtonPrimary disabled={true}>
                      <ThemedText.DeprecatedMain mb="4px">
                        <Trans>Unsupported Asset</Trans>
                      </ThemedText.DeprecatedMain>
                    </ButtonPrimary>
                  ) : !account ? (
                    <TraceEvent
                      events={[Event.onClick]}
                      name={EventName.CONNECT_WALLET_BUTTON_CLICKED}
                      properties={{ received_swap_quote: false }}
                      element={ElementName.CONNECT_WALLET_BUTTON}>
                      <ButtonLight onClick={toggleWalletModal}>
                        <Trans>Connect Wallet</Trans>
                      </ButtonLight>
                    </TraceEvent>
                  ) : (
                    <AutoColumn gap={"md"}>
                      {(approvalA === ApprovalState.NOT_APPROVED ||
                        approvalA === ApprovalState.PENDING ||
                        approvalB === ApprovalState.NOT_APPROVED ||
                        approvalB === ApprovalState.PENDING) &&
                        isValid && (
                          <RowBetween>
                            {approvalA !== ApprovalState.APPROVED && (
                              <ButtonPrimary
                                // onClick={approveACallback}
                                onClick={() => setShowApprove({ type: 'input', show: true })}
                                disabled={approvalA === ApprovalState.PENDING || showAAllowance}
                                width={
                                  approvalB !== ApprovalState.APPROVED
                                    ? "48%"
                                    : "100%"
                                }>
                                {approvalA === ApprovalState.PENDING ? (
                                  <Dots>
                                    <Trans>
                                      Approving{" "}
                                      {currencies[Field.CURRENCY_A]?.symbol}
                                    </Trans>
                                  </Dots>
                                ) : (
                                  <Trans>
                                    Approve{" "}
                                    {currencies[Field.CURRENCY_A]?.symbol}
                                  </Trans>
                                )}
                              </ButtonPrimary>
                            )}
                            {approvalB !== ApprovalState.APPROVED && (
                              <ButtonPrimary
                                // onClick={approveBCallback}
                                onClick={() => setShowApprove({ type: 'output', show: true })}
                                disabled={approvalB === ApprovalState.PENDING || showBAllowance}
                                width={
                                  approvalA !== ApprovalState.APPROVED
                                    ? "48%"
                                    : "100%"
                                }>
                                {approvalB === ApprovalState.PENDING ? (
                                  <Dots>
                                    <Trans>
                                      Approving{" "}
                                      {currencies[Field.CURRENCY_B]?.symbol}
                                    </Trans>
                                  </Dots>
                                ) : (
                                  <Trans>
                                    Approve{" "}
                                    {currencies[Field.CURRENCY_B]?.symbol}
                                  </Trans>
                                )}
                              </ButtonPrimary>
                            )}
                          </RowBetween>
                        )}
                      {showAuth ? (
                        <div>
                          {
                            isValid && parsedAmounts[Field.CURRENCY_A] && parsedAmounts[Field.CURRENCY_B] ? (
                              <div>
                                <div className="verify-token">
                                  <div className="inbutContainer">
                                    <div className="custom-search twofa">
                                      <input
                                        onChange={(e) => { e.target.value = e.target.value.slice(0, 6); setToken(e.target.value) }}
                                        type="number"
                                        className="px-5 py-3 rounded border-0 w-100"
                                        placeholder="Enter 2FA"
                                      />
                                    </div>
                                  </div>
                                  <button onClick={verify} className="ed-btn">
                                    Verify
                                  </button>
                                </div>
                                <p className="tokenValidation">{errors}</p>
                              </div>
                            ) : null
                          }
                          <ButtonError
                            onClick={() => {
                              expertMode ? onAdd() : registerAddress();
                            }}
                            disabled={
                              !isValid ||
                              approvalA !== ApprovalState.APPROVED ||
                              approvalB !== ApprovalState.APPROVED ||
                              disbtn
                            }
                            error={
                              !isValid &&
                              !!parsedAmounts[Field.CURRENCY_A] &&
                              !!parsedAmounts[Field.CURRENCY_B]
                            }>
                            <Text fontSize={20} fontWeight={500}>
                              {error ?? <Trans>Supply</Trans>}
                            </Text>
                          </ButtonError>

                          {/* {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
                        </div>
                      ) : null}

                      {directSwap ? (
                        <div className="w-100">
                          <ButtonError
                            onClick={() => {
                              expertMode ? onAdd() : registerAddress();
                            }}
                            disabled={
                              !isValid ||
                              approvalA !== ApprovalState.APPROVED ||
                              approvalB !== ApprovalState.APPROVED ||
                              disSupplybtn
                            }
                            error={
                              !isValid &&
                              !!parsedAmounts[Field.CURRENCY_A] &&
                              !!parsedAmounts[Field.CURRENCY_B]
                            }>
                            <Text fontSize={20} fontWeight={500}>
                              {error ?? <Trans>Supply</Trans>}
                            </Text>
                          </ButtonError>

                          {/* {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
                          <p className="tokenValidation">{errors}</p>
                        </div>
                      ) : null}
                      {/* <ButtonError
                            onClick={() => {
                              expertMode ? onAdd() : setShowConfirm(true)
                            }}
                            disabled={
                              !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                            }
                            error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                          >
                            <Text fontSize={20} fontWeight={500}>
                              {error ?? <Trans>Supply</Trans>}
                            </Text>
                          </ButtonError> */}
                    </AutoColumn>
                  )}
                </AutoColumn>
              </Wrapper>
            </AddLiquidityBody>
          </div>
        </div>
      </div>



      {/* <div className="row">
        <div className="col-md-8 mb-3">
          <TransactionTable />
        </div>
        <TotalTokensLocked />
      </div> */}
      {/* <TotalTokensLocked />

          <div className="col-md-12 mt-5">
            <TransactionTable />
          </div> */}
      {/* </div>
      </div> */}
      <SwitchLocaleLink />


    </>
  );
}