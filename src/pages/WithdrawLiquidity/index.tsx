// import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
// import { TransactionResponse } from "@ethersproject/providers";
import { Trans } from "@lingui/macro";
import { Currency, Percent } from "@panaromafinance/panaromaswap_sdkcore";
import { useWeb3React } from "@web3-react/core";
import {
    ElementName,
    Event,
    EventName
} from "components/AmplitudeAnalytics/constants";
import { TraceEvent } from "components/AmplitudeAnalytics/TraceEvent";
// import { sendEvent } from "components/analytics";
import { useV1LiquidityTokenPermit } from "hooks/useV1LiquidityTokenPermit";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Plus } from "react-feather";
import { useNavigate, useParams } from "react-router-dom";
import { Text } from "rebass";
import { ThemeContext } from "styled-components/macro";

import {
    ButtonError,
    ButtonLight,
    ButtonPrimary
} from "../../components/Button";
import { BlueCard, LightCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import CurrencyLogo from "../../components/CurrencyLogo";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import { AddRemoveTabs } from "../../components/NavigationTabs";
// import { MinimalPositionCard } from "../../components/PositionCard";
import Row, { RowBetween, RowFixed } from "../../components/Row";
import Slider from "../../components/Slider";
// import { Dots } from "../../components/swap/styleds";
import TransactionConfirmationModal, {
    ConfirmationModalContent
} from "../../components/TransactionConfirmationModal";
import { WRAPPED_NATIVE_CURRENCY } from "../../constants/tokens";
import { useCurrency } from "../../hooks/Tokens";
import {
    useApproveCallback
} from "../../hooks/useApproveCallback";
import { usePairContract } from "../../hooks/useContract";
import useDebouncedChangeHandler from "../../hooks/useDebouncedChangeHandler";
import useTransactionDeadline from "../../hooks/useTransactionDeadline";
import { useToggleWalletModal } from "../../state/application/hooks";
import { Field } from "../../state/burn/actions";
import {
    useBurnActionHandlers,
    useBurnState,
    useDerivedBurnInfo
} from "../../state/burn/hooks";
import { useTransactionAdder } from "../../state/transactions/hooks";
import { TransactionType } from "../../state/transactions/types";
import { useUserSlippageToleranceWithDefault } from "../../state/user/hooks";
import { ThemedText } from "../../theme";
// import { calculateGasMargin } from "../../utils/calculateGasMargin";
// import { calculateSlippageAmount } from "../../utils/calculateSlippageAmount";
import { currencyId } from "../../utils/currencyId";
import AppBody from "../AppBody";
import { MaxButton, Wrapper } from "../Pool/styleds";
import axios from "axios";
import Web3 from "web3";
import moment from "moment";
import { SupportedChainId } from "constants/chains";
import { RPC_URLS } from "constants/networks";
import { addPopup } from "state/application/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100);

export default function WithdrawLiquidity() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currencyIdA, currencyIdB, lpToken, lockIndex, lockId, amountHolding0, lockContract } = useParams<{
        currencyIdA: string;
        currencyIdB: string;
        lpToken: string;
        lockContract: string;
        amountHolding0: string;
        lockIndex: string;
        lockId: string;
    }>();

    // parsedAmounts[Field.LIQUIDITY] = amountHolding0;

    // console.log("===== lockIndex", lockIndex);

    const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
    const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

    const [withdrawAmount, setWithdrawAmount] = useState("0");

    const [currencyA, currencyB] = [
        useCurrency(currencyIdA) ?? undefined,
        useCurrency(currencyIdB) ?? undefined
    ];
    const { account, chainId, provider } = useWeb3React();
    const [tokenA, tokenB] = useMemo(
        () => [currencyA?.wrapped, currencyB?.wrapped],
        [currencyA, currencyB]
    );

    const theme = useContext(ThemeContext);

    // toggle wallet when disconnected
    const toggleWalletModal = useToggleWalletModal();

    // burn state
    const { independentField, typedValue } = useBurnState();
    const { pair, parsedAmounts, error } = useDerivedBurnInfo(
        currencyA ?? undefined,
        currencyB ?? undefined
    );
    const { onUserInput: _onUserInput } = useBurnActionHandlers();
    const isValid = !error;

    // modal and loading
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [showDetailed, setShowDetailed] = useState<boolean>(true);
    const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm

    // txn values
    const [txHash, setTxHash] = useState<string>("");
    const deadline = useTransactionDeadline();
    const allowedSlippage = useUserSlippageToleranceWithDefault(
        DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE
    );

    const [percentValue, setPercentValue] = useState(0)

    const formattedAmounts = {
        [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo(
            "0"
        )
            ? "0"
            : percentValue ? percentValue.toString() : "<1",
        [Field.LIQUIDITY]:
            independentField === amountHolding0
                ? typedValue
                : amountHolding0 ?? "",
        [Field.CURRENCY_A]:
            independentField === Field.CURRENCY_A
                ? typedValue
                : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? "",
        [Field.CURRENCY_B]:
            independentField === Field.CURRENCY_B
                ? typedValue
                : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ""
    };

    const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(
        new Percent("1")
    );

    // pair contract
    const pairContract: Contract | null = usePairContract(
        pair?.liquidityToken?.address
    );

    // const router = useV1RouterContract();
    const lockRouterFactoryAddress = process.env['REACT_APP_LOCK_ROUTER_FACTORY_ADDRESS'] || "";

    // allowance handling
    const { gatherPermitSignature, signatureData } = useV1LiquidityTokenPermit(
        parsedAmounts[Field.LIQUIDITY],
        lockRouterFactoryAddress
    );
    const [approval, approveCallback] = useApproveCallback(
        parsedAmounts[Field.LIQUIDITY],
        lockRouterFactoryAddress
    );

    const minDate = moment(new Date(Date.now() + (3600 * 1000 * 24))).format("YYYY-MM-DD");
    const totalWithDrawabaleAmount = Number(Number(amountHolding0) / 10 ** 18).toFixed(18);


    // wrapped onUserInput to clear signatures
    const onUserInput = useCallback(

        (field: Field, typedValue: string) => {
            const withdrawableAmount = Number(Number(totalWithDrawabaleAmount) * (parseInt(typedValue) / 100)).toFixed(18);

            setWithdrawAmount(field === Field.LIQUIDITY_PERCENT ? withdrawableAmount : typedValue)

            if(field === Field.LIQUIDITY) {
                const withdrawInPercentage = Math.round(Number(typedValue) / Number(totalWithDrawabaleAmount) * 100);
                const value = withdrawInPercentage > 100 ? 0 : withdrawInPercentage

                setPercentValue(value)
            }

            return _onUserInput(Field.LIQUIDITY, field === Field.LIQUIDITY_PERCENT ? withdrawableAmount : typedValue);

        },
        [_onUserInput]
    );

    const onLiquidityInput = useCallback(
        (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
        [onUserInput]
    );
    const onCurrencyAInput = useCallback(
        (typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue),
        [onUserInput]
    );
    const onCurrencyBInput = useCallback(
        (typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue),
        [onUserInput]
    );

    const [timeStamp, setTimeStamp] = useState("");
    const [timeStampNumberOfDays, setTimeStampNumberOfDays] = useState("");

    // tx sending
    const addTransaction = useTransactionAdder();



    async function onLock() {
        const _lptoken = pair?.liquidityToken.address
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY];


        const _amount = liquidityAmount?.numerator[0];
        // console.log("!!!!!",
        //     _lptoken,
        //     "_lptoken",
        //     _amount,
        //     "_amount",
        //     account,
        //     "account",
        //     timeStamp,
        //     "timeStamp"
        // );
        const web3 = new Web3(
            new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
        );
        const contract = process.env['REACT_APP_LOCK_ROUTER_FACTORY_ADDRESS'] || "";
        const td = web3.eth.abi.encodeFunctionCall(
            {
                name: "createLocking",
                type: "function",
                inputs: [
                    {
                        type: "address",
                        name: "_lpToken"
                    },
                    {
                        type: "uint256",
                        name: "_amount"
                    },
                    {
                        type: "uint256",
                        name: "_unlock_date"
                    }
                ]
            },
            [_lptoken ? _lptoken.toString() : "", _amount ? _amount.toString() : "", timeStamp.toString()]
        );

        //console.log(td, "createLocking i am called");

        const txns = {
            from: account,
            to: contract,
            data: td
        };

        //console.log(txns, "txns i am called");

        const txHashh = await window.ethereum?.request({
            method: "eth_sendTransaction",
            params: [txns]
        });

        // console.log(txHashh, "txHashh i am called");

        setTimeout(async function () {
            navigate("/pool/v1")
        }, 15000);
    }

    function modalHeader() {
        return (
            <AutoColumn gap={"md"} style={{ marginTop: "20px" }}>
                <RowBetween align="flex-end">
                    <Text fontSize={24} fontWeight={500}>
                        {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
                    </Text>
                    <RowFixed gap="4px">
                        <CurrencyLogo currency={currencyA} size={"24px"} />
                        <Text fontSize={24} fontWeight={500} style={{ marginLeft: "10px" }}>
                            {currencyA?.symbol}
                        </Text>
                    </RowFixed>
                </RowBetween>
                <RowFixed>
                    <Plus size="16" color={theme.deprecated_text2} />
                </RowFixed>
                <RowBetween align="flex-end">
                    <Text fontSize={24} fontWeight={500}>
                        {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
                    </Text>
                    <RowFixed gap="4px">
                        <CurrencyLogo currency={currencyB} size={"24px"} />
                        <Text fontSize={24} fontWeight={500} style={{ marginLeft: "10px" }}>
                            {currencyB?.symbol}
                        </Text>
                    </RowFixed>
                </RowBetween>

                <ThemedText.DeprecatedItalic
                    fontSize={12}
                    color={theme.deprecated_text2}
                    textAlign="left"
                    padding={"12px 0 0 0"}>
                    <Trans>
                        Output is estimated. If the price changes by more than{" "}
                        {allowedSlippage.toSignificant(4)}% your transaction will revert.
                    </Trans>
                </ThemedText.DeprecatedItalic>
            </AutoColumn>
        );
    }

    function modalBottom() {
        return (
            <>
                <RowBetween>
                    <Text color={theme.deprecated_text2} fontWeight={500} fontSize={16}>
                        <Trans>
                            {currencyA?.symbol}/{currencyB?.symbol} Locked
                        </Trans>
                    </Text>
                    <RowFixed>
                        <DoubleCurrencyLogo
                            currency0={currencyA}
                            currency1={currencyB}
                            margin={true}
                        />
                        <Text fontWeight={500} fontSize={16}>
                            {withdrawAmount}
                            {/* {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)} */}
                        </Text>
                    </RowFixed>
                </RowBetween>
                {pair && (
                    <>
                        <RowBetween>
                            <Text
                                color={theme.deprecated_text2}
                                fontWeight={500}
                                fontSize={16}>
                                <Trans>Price</Trans>
                            </Text>
                            <Text
                                fontWeight={500}
                                fontSize={16}
                                color={theme.deprecated_text1}>
                                1 {currencyA?.symbol} ={" "}
                                {tokenA ? pair.priceOf(tokenA).toSignificant(6) : "-"}{" "}
                                {currencyB?.symbol}
                            </Text>
                        </RowBetween>
                        <RowBetween>
                            <div />
                            <Text
                                fontWeight={500}
                                fontSize={16}
                                color={theme.deprecated_text1}>
                                1 {currencyB?.symbol} ={" "}
                                {tokenB ? pair.priceOf(tokenB).toSignificant(6) : "-"}{" "}
                                {currencyA?.symbol}
                            </Text>
                        </RowBetween>
                    </>
                )}
                <ButtonPrimary
                    // disabled={
                    //     !(approval === ApprovalState.APPROVED)
                    // }
                    onClick={withDrawFunction}>
                    <Text fontWeight={500} fontSize={20}>
                        <Trans>Confirm</Trans>
                    </Text>
                </ButtonPrimary>
            </>
        );
    }

    const pendingText = (
        <Trans>
            Withdrawing {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}{" "}
            {currencyA?.symbol} and
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}{" "} {currencyB?.symbol}
        </Trans>
    );

    const liquidityPercentChangeCallback = useCallback(
        (value: number) => {
            // console.log("===== setInnerLiquidityPercentage", value);

            onUserInput(Field.LIQUIDITY_PERCENT, value.toString());
        },
        [onUserInput]
    );

    const oneCurrencyIsETH = currencyA?.isNative || currencyB?.isNative;

    const oneCurrencyIsWETH = Boolean(
        chainId &&
        WRAPPED_NATIVE_CURRENCY[chainId] &&
        ((currencyA && WRAPPED_NATIVE_CURRENCY[chainId]?.equals(currencyA)) ||
            (currencyB && WRAPPED_NATIVE_CURRENCY[chainId]?.equals(currencyB)))
    );

    const handleSelectCurrencyA = useCallback(
        (currency: Currency) => {
            if (currencyIdB && currencyId(currency) === currencyIdB) {
                navigate(`/lock/v1/${currencyId(currency)}/${currencyIdA}`);
            } else {
                navigate(`/lock/v1/${currencyId(currency)}/${currencyIdB}`);
            }
        },
        [currencyIdA, currencyIdB, navigate]
    );
    const handleSelectCurrencyB = useCallback(
        (currency: Currency) => {
            if (currencyIdA && currencyId(currency) === currencyIdA) {
                navigate(`/lock/v1/${currencyIdB}/${currencyId(currency)}`);
            } else {
                navigate(`/lock/v1/${currencyIdA}/${currencyId(currency)}`);
            }
        },
        [currencyIdA, currencyIdB, navigate]
    );

    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false);
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.LIQUIDITY_PERCENT, "0");
        }
        setTxHash("");
    }, [onUserInput, txHash]);

    const [innerLiquidityPercentage, setInnerLiquidityPercentage] =
        useDebouncedChangeHandler(
            Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
            liquidityPercentChangeCallback
        );

    const [token, setToken] = useState("");
    const [errors, setError] = useState("");
    const [showAuth, setShowAuth] = useState(false);
    const [baseGAuthURL] = useState(process.env['REACT_APP_GAUTH_BASE_URL']);
    const [disbtn, setDisbtn] = useState(false);
    const [is2FAVerified, setIs2FAVerified] = useState(false);

    const checkAuth = () => {
        //  console.log(account, "select address");
        const payload = { metaMaskPrivateKey: account };
        //  console.log(payload, "payload");
        axios
            .get(baseGAuthURL + "checkauthenticator/" + account)
            .then(function (response) {
                // console.log("&&&&&&&& response", response);
                if (response.data.status === 1) {
                    setShowAuth(true);
                    setDisbtn(true)

                    // setDirectSwap(false);
                } else if (response.data.status === 2) {
                    setShowAuth(false);
                    setIs2FAVerified(true);
                    // setDirectSwap(true);
                } else if (response.data.status === 0) {
                    setShowAuth(false);
                    setDisbtn(false);
                    setIs2FAVerified(true);
                    // setDirectSwap(true);
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
                    setShowAuth(false);
                    setIs2FAVerified(true);
                } else {
                    setIs2FAVerified(false);

                    setError("Invalid Code. Please enter the correct code from authenticator");
                }
            });
        // console.log(token);
    };

    useEffect(() => {
        checkAuth();
        onUserInput(Field.LIQUIDITY_PERCENT, "0");
    }, [])
    // checkAuth();

    async function withDrawFunction() {
        let web3 = new Web3(
            new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
        );

        //Update web3 based on chainid
        switch (chainId) {
            case SupportedChainId.ARBITRUM_ONE:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.ARBITRUM_ONE])
                );
                break;
            case SupportedChainId.ARBITRUM_GOERLI:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.ARBITRUM_GOERLI])
                );
                break;
            case SupportedChainId.GOERLI:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.GOERLI])
                );
                break;
            case SupportedChainId.MAINNET:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.MAINNET])
                );
                break;
            case SupportedChainId.OPTIMISM:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.OPTIMISM])
                );
                break;
            case SupportedChainId.OPTIMISTIC_GOERLI:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.OPTIMISTIC_GOERLI])
                );
                break;
            case SupportedChainId.POLYGON:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.POLYGON])
                );
                break;
            case SupportedChainId.POLYGON_MUMBAI:
                web3 = new Web3(
                    new Web3.providers.HttpProvider(rpcurl[SupportedChainId.POLYGON_MUMBAI])
                );
                break;
            default:
                web3 = new Web3(
                    new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
                );
        }

        const _lptoken = lpToken?.trim();
        const _index = lockIndex;
        const _lockID = lockId;
        const _amount = Number(withdrawAmount) * 10 ** 18;
        const _lockContract = lockContract;


        // console.log("+-* _lptoken", _lptoken, _index, _lockID, _amount, _lockContract);

        setAttemptingTxn(true);

        const td = web3.eth.abi.encodeFunctionCall(
            {
                name: "withdraw",
                type: "function",
                inputs: [
                    {
                        type: "address",
                        name: "_lpToken"
                    },
                    {
                        type: "uint256",
                        name: "_index"
                    },
                    {
                        type: "uint256",
                        name: "_lockID"
                    },
                    {
                        type: "uint256",
                        name: "_amount"
                    }
                ]
            },
            [_lptoken ? _lptoken : "", _index ? _index : "",
            _lockID ? _lockID : "", Math.trunc(_amount).toString()]
        );

        // console.log(td, "withdraw..");

        const txns = {
            from: account,
            to: _lockContract,
            data: td
        };

        try {
            const txHashh = await window.ethereum?.request({
                method: "eth_sendTransaction",
                params: [txns]
            });

            if (txHashh) {
                setAttemptingTxn(false);
                addTransaction(txHashh, {
                    type: TransactionType.WITHDRAW_LIQUIDITY_STAKING,
                    token0Address: currencyIdA!,
                    token1Address: currencyIdB!
                });

                setTxHash(txHashh);
            }
        } catch (error) {
            dispatch(
                addPopup({
                    content: { rejectAction: error.message ? error.message : "Failed" },
                    key: `reject-action`
                })
            )
            setAttemptingTxn(false)
        }
    }

    return (
        <>
            <AppBody>
                <AddRemoveTabs
                    creating={false}
                    adding={false}
                    defaultSlippage={DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE}
                    locking={false}
                    withdraw={true}
                />
                <Wrapper>
                    <TransactionConfirmationModal
                        isOpen={showConfirm}
                        onDismiss={handleDismissConfirmation}
                        attemptingTxn={attemptingTxn}
                        hash={txHash ? txHash : ""}
                        content={() => (
                            <ConfirmationModalContent
                                title={<Trans>You are going to Withdraw</Trans>}
                                onDismiss={handleDismissConfirmation}
                                topContent={modalHeader}
                                bottomContent={modalBottom}
                            />
                        )}
                        pendingText={pendingText}
                    />
                    <AutoColumn gap="md">
                        <BlueCard>
                            <AutoColumn gap="10px">
                                <ThemedText.DeprecatedLink
                                    fontWeight={400}
                                    color={"deprecated_primaryText1"}>
                                    <Trans>
                                        <b>Tip:</b> Withdraw pool tokens converts your position back
                                        into underlying tokens at the current rate, proportional to
                                        your share of the pool. Accrued fees are included in the
                                        amounts you receive.
                                    </Trans>
                                </ThemedText.DeprecatedLink>
                            </AutoColumn>
                        </BlueCard>
                        <LightCard>
                            <AutoColumn gap="20px">
                                <RowBetween>
                                    <Text fontWeight={500}>
                                        <Trans>Withdraw Amount</Trans>
                                        <br />
                                        <Trans>Balance : {totalWithDrawabaleAmount}</Trans>
                                    </Text>
                                    {/* <ClickableText
                                        fontWeight={500}
                                        onClick={() => {
                                            setShowDetailed(!showDetailed);
                                        }}>
                                        {showDetailed ? (
                                            <Trans>Simple</Trans>
                                        ) : (
                                            <Trans>Detailed</Trans>
                                        )}
                                    </ClickableText> */}
                                </RowBetween>
                                <Row style={{ alignItems: "flex-end" }}>
                                    <Text fontSize={72} fontWeight={500}>
                                        {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                                    </Text>
                                </Row>
                                {showDetailed && (
                                    <>
                                        <Slider
                                            value={percentValue}
                                            onChange={(val) => {
                                                setPercentValue(val)
                                                onUserInput(Field.LIQUIDITY_PERCENT, val.toString())
                                            }
                                            }
                                        />
                                        <RowBetween>
                                            <MaxButton
                                                onClick={() => {
                                                    setPercentValue(25)
                                                    onUserInput(Field.LIQUIDITY_PERCENT, "25")
                                                }
                                                }
                                                width="20%">
                                                25%
                                            </MaxButton>
                                            <MaxButton
                                                onClick={() => {
                                                    setPercentValue(50)
                                                    onUserInput(Field.LIQUIDITY_PERCENT, "50")
                                                }
                                                }
                                                width="20%">
                                                50%
                                            </MaxButton>
                                            <MaxButton
                                                onClick={() => {
                                                    setPercentValue(75)
                                                    onUserInput(Field.LIQUIDITY_PERCENT, "75")
                                                }
                                                }
                                                width="20%">
                                                75%
                                            </MaxButton>
                                            <MaxButton
                                                onClick={() => {
                                                    setPercentValue(100)
                                                    onUserInput(Field.LIQUIDITY_PERCENT, "100")
                                                }
                                                }
                                                width="20%">
                                                Max
                                            </MaxButton>
                                        </RowBetween>
                                    </>
                                )}
                            </AutoColumn>
                        </LightCard>


                        {showDetailed && (
                            <>
                                <CurrencyInputPanel
                                    value={withdrawAmount}
                                    onUserInput={onLiquidityInput}
                                    // onChange={setInnerLiquidityPercentage}
                                    onMax={() => {
                                        setPercentValue(100)
                                        onUserInput(Field.LIQUIDITY_PERCENT, "100");
                                    }}
                                    showMaxButton={!atMaxAmount}
                                    currency={pair?.liquidityToken}
                                    pair={pair}
                                    id="liquidity-amount123"
                                    withdraw={true}
                                />
                                {/* <input type="number" value={withdrawAmount} onChange={onLiquidityInput}></input> */}

                            </>
                        )}

                        <div style={{ position: "relative" }}>
                            {!account ? (
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
                                <div>
                                    {showAuth ?
                                        isValid && withdrawAmount ? (
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
                                        : null}

                                    {is2FAVerified ? (<RowBetween>
                                        <ButtonError

                                            onClick={() => {
                                                if (parseFloat(withdrawAmount) > 0) {
                                                    //withdraw
                                                    setShowConfirm(true)
                                                }
                                                else {
                                                    setError("Withdraw amount should be greater than 0");

                                                    throw new Error("Withdraw amount should be greater than 0");
                                                }


                                            }}>
                                            <Text fontSize={16} fontWeight={500}>
                                                <Trans>Withdraw</Trans>
                                            </Text>
                                        </ButtonError>
                                        <p className="tokenValidation">{errors}</p>
                                    </RowBetween>) : null}

                                </div>
                            )}
                        </div>
                    </AutoColumn>
                </Wrapper>
            </AppBody >

            {/* {
                pair ? (
                    <AutoColumn
                        style={{
                            minWidth: "20rem",
                            width: "100%",
                            maxWidth: "400px",
                            marginTop: "1rem"
                        }} >
                        <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                    </AutoColumn >
                ) : null
            } */}
        </>
    );
}
