// import { BIG_INT_ZERO } from "../../constants/misc";
import { useColor } from "../../hooks/useColor";
// import { useTotalSupply } from "../../hooks/useTotalSupply";
import { useTokenBalance } from "../../state/connection/hooks";
// import { ExternalLink } from "../../theme";
// import { currencyId } from "../../utils/currencyId";
// import { unwrappedToken } from "../../utils/unwrappedToken";
import { ButtonEmpty, ButtonPrimary } from "../../components/Button";
import { LightCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
// import CurrencyLogo from "../../components/CurrencyLogo";
// import DoubleCurrencyLogo from "../../components/DoubleLogo";
import Row, { RowBetween, RowFixed } from "../../components/Row";
// import { CardNoise } from "../earn/styled";
// import { Dots } from "../../components/swap/styleds";
import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
// import JSBI from "jsbi";
import moment from "moment";
import { CurrencyAmount, Token } from "@panaromafinance/panaromaswap_sdkcore";
import { Pair } from "@panaromafinance/panaromaswap_v1sdk";
import { transparentize } from "polished";
import { useState, useEffect } from "react";
// import Datepicker from 'react-datepicker'
// import 'react-datepicker/dist/react-datepicker.css'
import { ChevronDown, ChevronUp } from "react-feather";
// import { Link } from "react-router-dom";
import { Text } from "rebass";
import styled from "styled-components/macro";
import Web3 from "web3";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DoubleCurrencyLogo from "components/DoubleLogo";
import { Link } from "react-router-dom";
import { SupportedChainId } from "constants/chains";
import { RPC_URLS } from "constants/networks";
import { useAppSelector } from "state/hooks";
// import { currencyId } from "utils/currencyId";
import { useCurrency } from "hooks/Tokens";
import { FaCalendarCheck, FaCalendarMinus } from "react-icons/fa";

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`;

const RowCenter = styled(Row)`
  justify-content: center;
`
const StyledPositionCard = styled(LightCard) <{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
        `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(
            0.8,
            bgColor
        )} 0%, ${theme.deprecated_bg3} 100%) `};
  position: relative;
  overflow: hidden;
`;

interface PositionCardProps {
    pair: Pair;
    showUnwrapped?: boolean;
    border?: string;
    stakedBalance?: CurrencyAmount<Token>; // optional balance to indicate that liquidity is deposited in mining pool
}

export default function WithdrawFullPositionCard({
    pair,
    border,
    withDrawDetails,
    currency0,
    currency1,
    currencyIdA,
    currencyIdB
}: any) {
    const { account, chainId } = useWeb3React();

    const navigate = useNavigate();

    const [currencyA, currencyB] = [
        useCurrency(currencyIdA) ?? undefined,
        useCurrency(currencyIdB) ?? undefined
    ];

    // const currency0 = unwrappedToken(pair.token0);
    // const currency1 = unwrappedToken(pair.token1);

    const [showMore, setShowMore] = useState(false);
    const [lockedTokens, setLockedTokens] = useState("");
    const [lockBtn, setLockBtn] = useState(true);
    const [lockedCurrency0, setLockedCurrency0] = useState("");
    const [lockedCurrency1, setLockedCurrency1] = useState("");
    const [lockedPoolShare, setLockedPoolShare] = useState("");


    const userDefaultPoolBalance = useTokenBalance(
        account ?? undefined,
        pair.liquidityToken
    );

    // console.log("bbbbb pair", pair);

    // console.log("++++++ withDrawDetails", withDrawDetails);



    // if staked balance balance provided, add to standard liquidity amount
    const userPoolBalance = withDrawDetails?.amountHolding0
        ? withDrawDetails?.amountHolding0
        : 0;


    const backgroundColor = useColor(pair?.token0);
    const [lockTokensAmount, setlockTokensAmount] = useState("");
    const [timeStamp, setTimeStamp] = useState("");
    const [showApprove, setShowApprove] = useState(true);
    const [showLock, setShowLock] = useState(false);

    const factoryAddresses = process.env['REACT_APP_LOCK_ROUTER_FACTORY_ADDRESS'] ? process.env['REACT_APP_LOCK_ROUTER_FACTORY_ADDRESS'] : "";
    ///0x641a99de3ab9204b464c0924f698231b401fdb16

    // const [startDate, setStartDate] = useState(new Date())
    const [token, setToken] = useState("");
    const [disbtn, setDisbtn] = useState(false);
    const [errors, setError] = useState("");
    const [baseGAuthURL] = useState(process.env['REACT_APP_GAUTH_BASE_URL']);
    const [is2FAVerified, setIs2FAVerified] = useState(false)
    const [verifyModalClass, setVerifyModalClass] = useState("modal fade");
    const [lockModalClass, setLockModalClass] = useState("modal fade");
    const [isLoading, setIsLoading] = useState(false)

    const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
    const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;


    const checkAuth = () => {
        // console.log(account, "&&&&& select address");
        const payload = { metaMaskPrivateKey: account };
        //  console.log(payload, "payload");
        axios
            .get(baseGAuthURL + "checkauthenticator/" + account)
            .then(function (response) {
                //      console.log("&&&&&&&& response", response);
                if (response.data.status === 1) {
                    setDisbtn(true);
                    // setLockBtn(true);
                } else if (response.data.status === 2) {
                    setDisbtn(false);

                } else if (response.data.status === 0) {
                    setDisbtn(false);
                    setIs2FAVerified(true);
                    // setShowAuth(false);
                    // setDirectSwap(true);
                }
            });
    };


    const verify = () => {
        // console.log("1111 verify", verify);

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
                //   console.log("&&&& response", response);
                if (response.data) {
                    setDisbtn(false);
                    setLockBtn(false);
                    setError("");
                    setIs2FAVerified(true);
                    setVerifyModalClass("modal fade hide")
                    // $('#exampleModal').openModal();
                } else {
                    setLockBtn(true);
                    setIs2FAVerified(false);
                    setError("Invalid Code. Please enter the correct code from authenticator");
                }
            });
        //console.log(token);
    };

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        // console.log(
        //     event.target.value,
        //     "hello date changes",
        //     moment(event.target.value).unix()
        // );
        // const convertTimeStamp = moment(event.target.value).unix()
        setTimeStamp(moment(event.target.value).unix().toString());
    }

    let web3 = new Web3(
        new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
    );

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
            // console.log("11111 RPC_URLS['1']", RPC_URLS["1"]);
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

    useEffect(() => {
        if (userPoolBalance !== undefined) {
            //   console.log('&&&& user pool balance ', userPoolBalance.toSignificant(4))

            //   if (parseFloat(userPoolBalance.toSignificant(4)) > 0) {
            //     setLockBtn(false);
            //   } else {
            //     setLockBtn(true);
            //   }
            checkAuth();
        }

    }, [token]);

    async function withDrawFunction() {
        // const web3 = new Web3(
        //     new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
        // );
        const _lptoken = withDrawDetails.lpToken;
        const _index = withDrawDetails.index;
        const _lockID = withDrawDetails.index;
        const _amount = withDrawDetails.amountHolding0
        const _lockContract = withDrawDetails.lockContract;

        // console.log("+-* _lptoken", _lptoken, _index, _lockID, _amount, _lockContract);


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
            [_lptoken, _index,
                _lockID, _amount]
        );

        // console.log(td, "withdraw..");

        const txns = {
            from: account,
            to: _lockContract,
            data: td
        };

        const txHashh = await window.ethereum?.request({
            method: "eth_sendTransaction",
            params: [txns]
        });

        if (txHashh)
            navigate("/pool/v1")
    }
    // console.log("9898 pair", pair);

    return (
        <StyledPositionCard border={border} bgColor={backgroundColor}>
            {/* <CardNoise /> */}
            <AutoColumn gap="12px">
                {/* {currency0} {currencyIdA} {currencyIdB}  {currency1} */}
                <div onClick={() => setShowMore(!showMore)} className="d-flex">
                    <Row style={{ marginLeft: "8px" }}>
                        <DoubleCurrencyLogo
                            currency0={currencyA}
                            currency1={currencyB}
                            size={20}
                        />
                        {/* <DoubleCurrencyLogo
                            currency0={currency0}
                            currency1={currency1}
                            size={20}
                        />
                        <Text fontWeight={500} fontSize={20}>
                            {!currency0 || !currency1 ? (
                                <Dots>
                                    <Trans>Loading</Trans>
                                </Dots>
                            ) : (
                                `${currency0.symbol}/${currency1.symbol}`
                            )}
                        </Text> */}
                        <Text className={withDrawDetails.lockType}>
                            {currency0}/{currency1} - Lock# {Number(withDrawDetails.lockIndexUI)}
                        </Text>
                        {/* <Row>	 */}
                        {new Date(withDrawDetails.to * 1000) <= new Date() ? <FaCalendarCheck style={{ color: "green" }} /> :
                            <FaCalendarMinus style={{ color: "red" }} />}

                        {/* </Row> */}
                    </Row>
                    <RowFixed gap="8px" style={{ marginRight: "4px" }}>
                        <ButtonEmpty
                            padding="6px 8px"
                            $borderRadius="12px"
                            width="100%"
                        // onClick={() => setShowMore(!showMore)}
                        >
                            {showMore ? (
                                <>
                                    <Trans>Manage</Trans>
                                    <ChevronUp
                                        size="20"
                                        style={{
                                            marginLeft: "8px",
                                            height: "20px",
                                            minWidth: "20px"
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Trans>Manage</Trans>
                                    <ChevronDown
                                        size="20"
                                        style={{
                                            marginLeft: "8px",
                                            height: "20px",
                                            minWidth: "20px"
                                        }}
                                    />
                                </>
                            )}
                        </ButtonEmpty>
                    </RowFixed>
                </div>
                {showMore && (
                    <AutoColumn gap="8px">
                        <div className="d-sm-flex justify-content-between d-block">
                            <Text fontSize={16} fontWeight={500}>
                                <Trans>Your total amount Locked:</Trans>
                            </Text>
                            <Text fontSize={16} fontWeight={500}>
                                {withDrawDetails.amountHolding0 ? Number(Number(withDrawDetails.amountHolding0) / 10 ** 18).toFixed(18) : 0}
                            </Text>
                        </div>


                        <div className="d-sm-flex justify-content-between d-block">
                            <Text fontSize={16} fontWeight={500}>
                                <Trans>Lock Created:</Trans>
                            </Text>
                            <Text fontSize={16} fontWeight={500}>
                                {new Date(withDrawDetails.timeStamp * 1000).toLocaleString([], {
                                    timeZone: "utc",
                                    hour12: false,
                                })}
                            </Text>
                        </div>

                        <div className="d-sm-flex justify-content-between d-block">
                            <Text fontSize={16} fontWeight={500}>
                                <Trans>Lock Released:</Trans>
                            </Text>
                            <Text fontSize={16} fontWeight={500}>
                                {new Date(withDrawDetails.to * 1000).toLocaleString([], {
                                    timeZone: "utc",
                                    hour12: false,
                                })}
                            </Text>
                        </div>
                        {/* Locked Pool Tokens */}
                        {new Date(withDrawDetails.to * 1000) <= new Date() ? (
                            <RowCenter marginTop="10px">
                                <ButtonPrimary
                                    padding="8px"
                                    $borderRadius="8px"
                                    as={Link}
                                    width="35%"
                                    to={`/withdraw/v1/${currencyIdA}/${currencyIdB}/${withDrawDetails.lpToken}/${withDrawDetails.index}/${withDrawDetails.lockIndex}/${withDrawDetails.amountHolding0}/${withDrawDetails.lockContract}/${currency0}/${currency1}`}>
                                    <Trans>Withdraw</Trans>
                                </ButtonPrimary>
                            </RowCenter>
                        ) : <RowCenter marginTop="10px">
                            <ButtonPrimary
                                padding="8px"
                                $borderRadius="8px"
                                disabled={true}
                                width="35%">
                                <Trans>Withdraw</Trans>
                            </ButtonPrimary>
                        </RowCenter>}


                    </AutoColumn>
                )}
            </AutoColumn>
        </StyledPositionCard>
    );
}
