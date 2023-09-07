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
import { ArrowDown, Plus } from "react-feather";
import { useNavigate, useParams } from "react-router-dom";
import { Text } from "rebass";
import { ThemeContext } from "styled-components/macro";

import {
    ButtonConfirmed,
    ButtonError,
    ButtonLight,
    ButtonPrimary
} from "../../components/Button";
import { BlueCard, LightCard } from "../../components/Card";
import { AutoColumn, ColumnCenter } from "../../components/Column";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import CurrencyLogo from "../../components/CurrencyLogo";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import { AddRemoveTabs } from "../../components/NavigationTabs";
import { MinimalPositionCard } from "../../components/PositionCard";
import Row, { RowBetween, RowFixed } from "../../components/Row";
import Slider from "../../components/Slider";
import { Dots } from "../../components/swap/styleds";
import TransactionConfirmationModal, {
    ConfirmationModalContent
} from "../../components/TransactionConfirmationModal";
import { WRAPPED_NATIVE_CURRENCY } from "../../constants/tokens";
import { useCurrency } from "../../hooks/Tokens";
import {
    ApprovalState,
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
import { StyledInternalLink, ThemedText } from "../../theme";
// import { calculateGasMargin } from "../../utils/calculateGasMargin";
import { calculateSlippageAmount } from "../../utils/calculateSlippageAmount";
import { currencyId } from "../../utils/currencyId";
import AppBody from "../AppBody";
import { ClickableText, MaxButton, Wrapper } from "../Pool/styleds";
import axios from "axios";
import Web3 from "web3";
import moment from "moment";
import { SupportedChainId } from "constants/chains";
import { RPC_URLS } from "constants/networks";
import { addPopup } from "state/application/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 99);

export default function LockLiquidity() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currencyIdA, currencyIdB } = useParams<{
        currencyIdA: string;
        currencyIdB: string;
    }>();
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
    const [showDetailed, setShowDetailed] = useState<boolean>(false);
    const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm
    const [approvePending, setApprovePending] = useState(false)

    // txn values
    const [txHash, setTxHash] = useState<string>("");
    const deadline = useTransactionDeadline();
    const allowedSlippage = useUserSlippageToleranceWithDefault(
        DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE
    );

    const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
    const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

    const formattedAmounts = {
        [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo(
            "0"
        )
            ? "0"
            : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent("1", "99"))
                ? "<1"
                : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
        [Field.LIQUIDITY]:
            independentField === Field.LIQUIDITY
                ? typedValue
                : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? "",
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

    const minDate = moment(new Date(Date.now())).format("YYYY-MM-DD");

    function wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const getTransactionResult = (hash: string) => {
        if (!provider || !chainId) throw new Error("No provider or chainId");
        return provider.getTransactionReceipt(hash).then(async (receipt) => {
            if (receipt === null) {
                await wait(250 + Math.round(Math.random() * Math.max(0, 1000 - 250))) // default minwait for 250 and maxwait for 1000
                getTransactionResult(hash);
            } else {
                if (receipt && receipt.status === 1) {
                    setApprovePending(false)
                } else {
                    setApprovePending(true)
                }
            };
        }).catch((error) => {
            console.log(error);
        })
    };

    async function onAttemptToApprove() {
        if (!pairContract || !pair || !provider || !deadline || !timeStamp) {
            setError("All the fields are mandatory. Date");

            throw new Error("missing dependencies");
        }

        setError("");

        const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
        if (!liquidityAmount) setError("Liquidity amount is missing");


        const _lptoken = pair.liquidityToken.address;

        // const _amount = parseFloat(liquidityAmount.numerator[0]) * 10 ** 18;
        const _amount = Number(liquidityAmount?.toSignificant(18)) * (10 ** 18);
        // console.log(
        //     _amount,
        //     "_amount",
        //     // timeStamp,
        //     "timeStamp",
        //     lockRouterFactoryAddress,
        //     "factoryAddresses"
        // );
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
        setApprovePending(true);

        const lockFactoryAddress = process.env['REACT_APP_LOCK_ROUTER_FACTORY_ADDRESS'] || "";
        const Tdata = web3.eth.abi.encodeFunctionCall(
            {
                name: "approve",
                type: "function",
                inputs: [
                    {
                        type: "address",
                        name: "spender"
                    },
                    {
                        type: "uint256",
                        name: "value"
                    }
                ]
            },
            [lockFactoryAddress.toString(), _amount.toString()]
        );
        // console.log(Tdata);
        const params = {
            from: account,
            to: _lptoken,
            data: Tdata
        };

        try {
            const d_resp = await window.ethereum?.request({
                method: "eth_sendTransaction",
                params: [params]
            });

            if (d_resp) {
                addTransaction(d_resp, {
                    type: TransactionType.APPROVAL,
                    tokenAddress: 'string',
                    spender: 'string'
                });
                getTransactionResult(d_resp)
            }
        } catch (error) {
            setApprovePending(false)
            dispatch(
                addPopup({
                    content: { rejectAction: error.message ? error.message : "Failed" },
                    key: `reject-action`
                })
            )
        }
        // try {
        //     const d_resp = await window.ethereum?.request({
        //         method: "eth_sendTransaction",
        //         params: [params]
        //     });

        //     // console.log(d_resp, "d_resp");
        //     if (d_resp == null) {
        //         console.log("in valid response");
        //     } else {
        //         // await approveCallback();



        //         // approval === ApprovalState.APPROVED

        //         // setTimeout(async function () {

        //         //     await approveCallback();



        //         // }, 15000);
        //     }
        // } catch (error) {
        //     dispatch(
        //         addPopup({
        //             content: { rejectAction: error.message ? error.message : "Failed" },
        //             key: `reject-action`
        //         })
        //     )
        // }
    }

    // wrapped onUserInput to clear signatures
    const onUserInput = useCallback(
        (field: Field, typedValue: string) => {
            return _onUserInput(field, typedValue);
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

    async function onRemove() {
        if (!chainId || !provider || !account || !deadline || !lockRouterFactoryAddress)
            throw new Error("missing dependencies");
        const {
            [Field.CURRENCY_A]: currencyAmountA,
            [Field.CURRENCY_B]: currencyAmountB
        } = parsedAmounts;
        if (!currencyAmountA || !currencyAmountB) {
            throw new Error("missing currency amounts");
        }

        const amountsMin = {
            [Field.CURRENCY_A]: calculateSlippageAmount(
                currencyAmountA,
                allowedSlippage
            )[0],
            [Field.CURRENCY_B]: calculateSlippageAmount(
                currencyAmountB,
                allowedSlippage
            )[0]
        };

        if (!currencyA || !currencyB) throw new Error("missing tokens");
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
        if (!liquidityAmount) throw new Error("missing liquidity amount");

        const currencyBIsETH = currencyB.isNative;
        const oneCurrencyIsETH = currencyA.isNative || currencyBIsETH;

        if (!tokenA || !tokenB) throw new Error("could not wrap");

        let methodNames: string[],
            args: Array<string | string[] | number | boolean>;
        // we have approval, use normal remove liquidity
        if (approval === ApprovalState.APPROVED) {
            // removeLiquidityETH
            if (oneCurrencyIsETH) {
                methodNames = [
                    "removeLiquidityETH",
                    "removeLiquidityETHSupportingFeeOnTransferTokens"
                ];
                args = [
                    currencyBIsETH ? tokenA.address : tokenB.address,
                    liquidityAmount.quotient.toString(),
                    amountsMin[
                        currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
                    ].toString(),
                    amountsMin[
                        currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
                    ].toString(),
                    account,
                    deadline.toHexString()
                ];
            }
            // removeLiquidity
            else {
                methodNames = ["removeLiquidity"];
                args = [
                    tokenA.address,
                    tokenB.address,
                    liquidityAmount.quotient.toString(),
                    amountsMin[Field.CURRENCY_A].toString(),
                    amountsMin[Field.CURRENCY_B].toString(),
                    account,
                    deadline.toHexString()
                ];
            }
        }
        // we have a signature, use permit versions of remove liquidity
        else if (signatureData !== null) {
            // removeLiquidityETHWithPermit
            if (oneCurrencyIsETH) {
                methodNames = [
                    "removeLiquidityETHWithPermit",
                    "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens"
                ];
                args = [
                    currencyBIsETH ? tokenA.address : tokenB.address,
                    liquidityAmount.quotient.toString(),
                    amountsMin[
                        currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
                    ].toString(),
                    amountsMin[
                        currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
                    ].toString(),
                    account,
                    signatureData.deadline,
                    false,
                    signatureData.v,
                    signatureData.r,
                    signatureData.s
                ];
            }
            // removeLiquidityETHWithPermit
            else {
                methodNames = ["removeLiquidityWithPermit"];
                args = [
                    tokenA.address,
                    tokenB.address,
                    liquidityAmount.quotient.toString(),
                    amountsMin[Field.CURRENCY_A].toString(),
                    amountsMin[Field.CURRENCY_B].toString(),
                    account,
                    signatureData.deadline,
                    false,
                    signatureData.v,
                    signatureData.r,
                    signatureData.s
                ];
            }
        } else {
            throw new Error(
                "Attempting to confirm without approval or a signature. Please contact support."
            );
        }

        // const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
        //     methodNames.map((methodName) =>
        //         router.estimateGas[methodName](...args)
        //             .then((estimateGas) => calculateGasMargin(estimateGas))
        //             .catch((error) => {
        //                 console.error(`estimateGas failed`, methodName, args, error);
        //                 return undefined;
        //             })
        //     )
        // );

        // const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
        //     (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate)
        // );

        // all estimations failed...
        // if (indexOfSuccessfulEstimation === -1) {
        //     console.error("This transaction would fail. Please contact support.");
        // } else {
        //     const methodName = methodNames[indexOfSuccessfulEstimation];
        //     const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

        //     setAttemptingTxn(true);
        // await router[methodName](...args, {
        //     gasLimit: safeGasEstimate
        // })
        //     .then((response: TransactionResponse) => {
        //         setAttemptingTxn(false);

        //         addTransaction(response, {
        //             type: TransactionType.REMOVE_LIQUIDITY_V2edge,
        //             baseCurrencyId: currencyId(currencyA),
        //             quoteCurrencyId: currencyId(currencyB),
        //             expectedAmountBaseRaw:
        //                 parsedAmounts[Field.CURRENCY_A]?.quotient.toString() ?? "0",
        //             expectedAmountQuoteRaw:
        //                 parsedAmounts[Field.CURRENCY_B]?.quotient.toString() ?? "0"
        //         });

        //         setTxHash(response.hash);

        //         sendEvent({
        //             category: "Liquidity",
        //             action: "Remove",
        //             label: [currencyA.symbol, currencyB.symbol].join("/")
        //         });
        //     })
        //     .catch((error: Error) => {
        //         setAttemptingTxn(false);
        //         // we only care if the error is something _other_ than the user rejected the tx
        //         console.error(error);
        //     });
        // }
    }


    async function onLock() {
        const _lptoken = pair?.liquidityToken.address
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
        if (!liquidityAmount) setError("Liquidity amount is missing");

        const _amount = Number(liquidityAmount?.toSignificant(18)) * (10 ** 18);
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

        const contract = process.env['REACT_APP_LOCK_ROUTER_FACTORY_ADDRESS'] || "";

        setAttemptingTxn(true);

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

        //  console.log(td, "createLocking i am called");

        const txns = {
            from: account,
            to: contract,
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
                    type: TransactionType.LOCK_LIQUIDITY,
                    token0Address: currencyIdA!,
                    token1Address: currencyIdB!
                });

                setTxHash(txHashh);
            }
        } catch (error) {
            setAttemptingTxn(false)

            dispatch(
                addPopup({
                    content: { rejectAction: error.message ? error.message : "Failed" },
                    key: `reject-action`
                })

            )
        }
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        // console.log(
        //     event.target.value,
        //     "hello date changes",
        //     moment(event.target.value).unix()
        // );


        // var now = new Date();
        // now.setMinutes(now.getMinutes()); // timestamp
        // now = new Date(now); // Date object
        //  console.log("event.target.value", event.target.value);

        const date2 = new Date(moment.utc(event.target.value).toString());
        date2.setUTCHours(23)
        date2.setUTCMinutes(59)
        date2.setUTCSeconds(59)

        // console.log("123456", moment(date2).unix().toString());

        setTimeStamp(moment(date2).unix().toString());
        setTimeStampNumberOfDays(timeAgo(date2));
    }

    const timeAgo = (date) => {
        // const startDate = moment().startOf('day');
        const startDate = new Date().toUTCString()
        const endDate = moment(date);

        const m1 = moment(moment(startDate), 'DD-MM-YYYY HH:mm');
        const m2 = moment(moment(date), 'DD-MM-YYYY HH:mm');
        const m3 = m2.diff(m1, 'minutes');
        const m4 = m2.diff(m1, 'h');
        const numdays = Math.floor(m3 / 1440);
        const numhours = Math.floor((m3 % 1440) / 60);
        const numminutes = Math.floor((m3 % 1440) % 60);
        // return numdays + " day(s) " + numhours + "h " + numminutes + "m";
        if (numdays < 0) {
            setError("Lock date should be Future");
            setTimeStamp("")
        }
        else
            setError("");

        // return numdays + " day(s) ";
        return numdays + " day(s) " + numhours + "h " + numminutes + "m";



        // const seconds = Math.floor((new Date() - date) / 1000);

        // let interval = Math.floor(seconds / 31536000);
        // if (interval > 1) {
        //     return interval + ' years ago';
        // }

        // interval = Math.floor(seconds / 2592000);
        // if (interval > 1) {
        //     return interval + ' months ago';
        // }

        // interval = Math.floor(seconds / 86400);
        // if (interval > 1) {
        //     return interval + ' days ago';
        // }

        // interval = Math.floor(seconds / 3600);
        // if (interval > 1) {
        //     return interval + ' hours ago';
        // }

        // interval = Math.floor(seconds / 60);
        // if (interval > 1) {
        //     return interval + ' minutes ago';
        // }

        // if (seconds < 10) return 'just now';

        // return Math.floor(seconds) + ' seconds ago';
    };

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
                            {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
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
                    disabled={
                        !(approval === ApprovalState.APPROVED || signatureData !== null)
                    }
                    onClick={onLock}>
                    <Text fontWeight={500} fontSize={20}>
                        <Trans>Confirm</Trans>
                    </Text>
                </ButtonPrimary>
            </>
        );
    }

    const pendingText = (
        <Trans>
            Locking {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}{" "}
            {currencyA?.symbol} and
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencyB?.symbol}
        </Trans>
    );

    const liquidityPercentChangeCallback = useCallback(
        (value: number) => {
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
        // console.log(payload, "payload");
        axios
            .get(baseGAuthURL + "checkauthenticator/" + account)
            .then(function (response) {
                //console.log("&&&&&&&& response", response);
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
                //  console.log("@@@@ response", response);
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
    }, [])
    // checkAuth();

    return (
        <>
            <div className="d-lg-flex">
                {
                    pair ? (
                        <AutoColumn
                            style={{
                                minWidth: "20rem",
                                width: "100%",
                                maxWidth: "400px",
                                margin: "0 auto",
                                height: "fit-content"
                            }} >
                            <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                        </AutoColumn >
                    ) : null
                }

                <AppBody>
                    <AddRemoveTabs
                        creating={false}
                        adding={false}
                        defaultSlippage={DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE}
                        locking={true}
                    />
                    <Wrapper>
                        <TransactionConfirmationModal
                            isOpen={showConfirm}
                            onDismiss={handleDismissConfirmation}
                            attemptingTxn={attemptingTxn}
                            hash={txHash ? txHash : ""}
                            content={() => (
                                <ConfirmationModalContent
                                    title={<Trans>You are going to Lock for {""} {timeStampNumberOfDays}</Trans>}
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
                                            <b>Tip:</b> Locking pool tokens converts your position back
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
                                            <Trans>Lock Amount</Trans>
                                        </Text>
                                        <ClickableText
                                            fontWeight={500}
                                            onClick={() => {
                                                setShowDetailed(!showDetailed);
                                            }}>
                                            {showDetailed ? (
                                                <Trans>Simple</Trans>
                                            ) : (
                                                <Trans>Detailed</Trans>
                                            )}
                                        </ClickableText>
                                    </RowBetween>
                                    <Row style={{ alignItems: "flex-end" }}>
                                        <Text fontSize={72} fontWeight={500}>
                                            {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                                        </Text>
                                    </Row>
                                    {!showDetailed && (
                                        <>
                                            <Slider
                                                value={innerLiquidityPercentage}
                                                onChange={setInnerLiquidityPercentage}
                                                max={99}
                                            />
                                            <RowBetween>
                                                <MaxButton
                                                    onClick={() =>
                                                        onUserInput(Field.LIQUIDITY_PERCENT, "25")
                                                    }
                                                    width="20%">
                                                    25%
                                                </MaxButton>
                                                <MaxButton
                                                    onClick={() =>
                                                        onUserInput(Field.LIQUIDITY_PERCENT, "50")
                                                    }
                                                    width="20%">
                                                    50%
                                                </MaxButton>
                                                <MaxButton
                                                    onClick={() =>
                                                        onUserInput(Field.LIQUIDITY_PERCENT, "75")
                                                    }
                                                    width="20%">
                                                    75%
                                                </MaxButton>
                                                <MaxButton
                                                    onClick={() =>
                                                        onUserInput(Field.LIQUIDITY_PERCENT, "99")
                                                    }
                                                    width="20%">
                                                    Max
                                                </MaxButton>
                                            </RowBetween>
                                        </>
                                    )}
                                </AutoColumn>
                            </LightCard>
                            {!showDetailed && (
                                <>
                                    <ColumnCenter>
                                        <ArrowDown size="16" color={theme.deprecated_text2} />
                                    </ColumnCenter>
                                    <LightCard>
                                        <AutoColumn gap="10px">
                                            <RowBetween>
                                                <Text fontSize={24} fontWeight={500}>
                                                    {formattedAmounts[Field.CURRENCY_A] || "-"}
                                                </Text>
                                                <RowFixed>
                                                    <CurrencyLogo
                                                        currency={currencyA}
                                                        style={{ marginRight: "12px" }}
                                                    />
                                                    <Text
                                                        fontSize={24}
                                                        fontWeight={500}
                                                        id="remove-liquidity-tokena-symbol">
                                                        {currencyA?.symbol}
                                                    </Text>
                                                </RowFixed>
                                            </RowBetween>
                                            <RowBetween>
                                                <Text fontSize={24} fontWeight={500}>
                                                    {formattedAmounts[Field.CURRENCY_B] || "-"}
                                                </Text>
                                                <RowFixed>
                                                    <CurrencyLogo
                                                        currency={currencyB}
                                                        style={{ marginRight: "12px" }}
                                                    />
                                                    <Text
                                                        fontSize={24}
                                                        fontWeight={500}
                                                        id="remove-liquidity-tokenb-symbol">
                                                        {currencyB?.symbol}
                                                    </Text>
                                                </RowFixed>
                                            </RowBetween>
                                            {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                                                <RowBetween style={{ justifyContent: "flex-end" }}>
                                                    {oneCurrencyIsETH ? (
                                                        <StyledInternalLink
                                                            to={`/lock/v1/${currencyA?.isNative &&
                                                                chainId &&
                                                                WRAPPED_NATIVE_CURRENCY[chainId]
                                                                ? WRAPPED_NATIVE_CURRENCY[chainId]?.address
                                                                : currencyIdA
                                                                }/${currencyB?.isNative &&
                                                                    chainId &&
                                                                    WRAPPED_NATIVE_CURRENCY[chainId]
                                                                    ? WRAPPED_NATIVE_CURRENCY[chainId]?.address
                                                                    : currencyIdB
                                                                }`}>
                                                            Receive WETH
                                                        </StyledInternalLink>
                                                    ) : oneCurrencyIsWETH ? (
                                                        <StyledInternalLink
                                                            to={`/lock/v1/${currencyA &&
                                                                WRAPPED_NATIVE_CURRENCY[chainId]?.equals(
                                                                    currencyA
                                                                )
                                                                ? "ETH"
                                                                : currencyIdA
                                                                }/${currencyB &&
                                                                    WRAPPED_NATIVE_CURRENCY[chainId]?.equals(
                                                                        currencyB
                                                                    )
                                                                    ? "ETH"
                                                                    : currencyIdB
                                                                }`}>
                                                            Receive ETH
                                                        </StyledInternalLink>
                                                    ) : null}
                                                </RowBetween>
                                            ) : null}
                                        </AutoColumn>
                                    </LightCard>
                                </>
                            )}

                            {showDetailed && (
                                <>
                                    <CurrencyInputPanel
                                        value={formattedAmounts[Field.LIQUIDITY]}
                                        onUserInput={onLiquidityInput}
                                        onMax={() => {
                                            onUserInput(Field.LIQUIDITY_PERCENT, "99");
                                        }}
                                        showMaxButton={!atMaxAmount}
                                        currency={pair?.liquidityToken}
                                        pair={pair}
                                        id="liquidity-amount"
                                    />
                                    <ColumnCenter>
                                        <ArrowDown size="16" color={theme.deprecated_text2} />
                                    </ColumnCenter>
                                    <CurrencyInputPanel
                                        hideBalance={true}
                                        value={formattedAmounts[Field.CURRENCY_A]}
                                        onUserInput={onCurrencyAInput}
                                        onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, "99")}
                                        showMaxButton={!atMaxAmount}
                                        currency={currencyA}
                                        label={"Output"}
                                        onCurrencySelect={handleSelectCurrencyA}
                                        id="remove-liquidity-tokena"
                                    />
                                    <ColumnCenter>
                                        <Plus size="16" color={theme.deprecated_text2} />
                                    </ColumnCenter>
                                    <CurrencyInputPanel
                                        hideBalance={true}
                                        value={formattedAmounts[Field.CURRENCY_B]}
                                        onUserInput={onCurrencyBInput}
                                        onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, "99")}
                                        showMaxButton={!atMaxAmount}
                                        currency={currencyB}
                                        label={"Output"}
                                        onCurrencySelect={handleSelectCurrencyB}
                                        id="remove-liquidity-tokenb"
                                    />
                                </>
                            )}
                            {pair && (
                                <div style={{ padding: "10px 20px" }}>
                                    <RowBetween>
                                        <Trans>Price:</Trans>
                                        <div>
                                            1 {currencyA?.symbol} ={" "}
                                            {tokenA ? pair.priceOf(tokenA).toSignificant(6) : "-"}{" "}
                                            {currencyB?.symbol}
                                        </div>
                                    </RowBetween>
                                    <RowBetween>
                                        <div />
                                        <div>
                                            1 {currencyB?.symbol} ={" "}
                                            {tokenB ? pair.priceOf(tokenB).toSignificant(6) : "-"}{" "}
                                            {currencyA?.symbol}
                                        </div>
                                    </RowBetween>
                                    <RowBetween>
                                        <Trans>Date:</Trans>
                                        <div>
                                            <input
                                                className="lockLiquidityDate mt-2"
                                                type="date"
                                                onChange={handleChange}
                                                min={minDate}
                                            />
                                        </div>
                                        {/* min={minDate.toString("YYYY-MM-DD")} */}

                                    </RowBetween>
                                    <RowBetween>
                                        {timeStampNumberOfDays ?
                                            <Trans>
                                                You are locking for {timeStampNumberOfDays}
                                            </Trans> : ""}
                                    </RowBetween>
                                </div>

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
                                            isValid && parsedAmounts[Field.CURRENCY_A] && parsedAmounts[Field.CURRENCY_B] && timeStamp ? (
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
                                        {is2FAVerified ? (
                                            <>
                                                <div style={{ padding: "0.5rem 1rem" }}>
                                                    <p className="tokenValidation">{errors}</p>
                                                </div>
                                                <RowBetween>
                                                    <ButtonConfirmed
                                                        onClick={() => {
                                                            if (Number(formattedAmounts[Field.LIQUIDITY_PERCENT]) === 100) {
                                                                setError("Value should be less than 99%");
                                                            }
                                                            else {
                                                                onAttemptToApprove()
                                                            }
                                                        }}
                                                        confirmed={
                                                            approval === ApprovalState.APPROVED ||
                                                            signatureData !== null
                                                        }
                                                        disabled={
                                                            approval !== ApprovalState.NOT_APPROVED ||
                                                            signatureData !== null ||
                                                            approvePending
                                                        }
                                                        mr="0.5rem"
                                                        fontWeight={500}
                                                        fontSize={16}>
                                                        {approval === ApprovalState.PENDING || approvePending ? (
                                                            <Dots>
                                                                <Trans>Approving</Trans>
                                                            </Dots>
                                                        ) : approval === ApprovalState.APPROVED ||
                                                            signatureData !== null ? (
                                                            <Trans>Approved</Trans>
                                                        ) : (
                                                            <Trans>Approve</Trans>
                                                        )}
                                                    </ButtonConfirmed>
                                                    <ButtonError
                                                        onClick={() => {
                                                            if (!pairContract || !pair || !provider || !deadline || !timeStamp) {
                                                                setError("All the fields are mandatory. Date");

                                                                // throw new Error("missing dependencies");
                                                            }
                                                            else {
                                                                //  console.log("- - - -formattedAmounts[Field.CURRENCY_B]", Number(formattedAmounts[Field.CURRENCY_B]) * (99 / 100) < Number(formattedAmounts[Field.CURRENCY_B]));
                                                                // console.log("- - - -Number(formattedAmounts[Field.CURRENCY_B]) * (99 / 100)", Number(formattedAmounts[Field.CURRENCY_A]) * (99 / 100) < Number(formattedAmounts[Field.CURRENCY_A]));
                                                                //  console.log("- - - -Number(formattedAmounts[Field.LIQUIDITY]) * (99 / 100)", Number(formattedAmounts[Field.LIQUIDITY]) * (99 / 100) < Number(formattedAmounts[Field.LIQUIDITY]));

                                                                if (Number(formattedAmounts[Field.LIQUIDITY_PERCENT]) === 100) {
                                                                    setError("Value should be less than 99%");

                                                                    // throw new Error("Value should be less than 99%");
                                                                }
                                                                else {
                                                                    setShowConfirm(true);
                                                                }
                                                            }
                                                        }}
                                                        disabled={
                                                            !isValid ||
                                                            (signatureData === null &&
                                                                approval !== ApprovalState.APPROVED) || !timeStamp
                                                        }
                                                        error={
                                                            !isValid &&
                                                            !!parsedAmounts[Field.CURRENCY_A] &&
                                                            !!parsedAmounts[Field.CURRENCY_B]
                                                        }>
                                                        <Text fontSize={16} fontWeight={500}>
                                                            {error || <Trans>Lock</Trans>}
                                                        </Text>
                                                    </ButtonError>

                                                </RowBetween>
                                            </>
                                        ) : null}

                                    </div>
                                )}
                            </div>
                        </AutoColumn>
                    </Wrapper>
                </AppBody >
            </div>
        </>
    );
}
