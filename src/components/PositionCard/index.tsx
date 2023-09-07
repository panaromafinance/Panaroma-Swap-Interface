import { BIG_INT_ZERO } from "../../constants/misc";
import { useColor } from "../../hooks/useColor";
import { useTotalSupply } from "../../hooks/useTotalSupply";
import { useTokenBalance, useTokenBalances } from "../../state/connection/hooks";
// import { ThemedText } from "../../theme";
import { currencyId } from "../../utils/currencyId";
import { unwrappedToken } from "../../utils/unwrappedToken";
import { ButtonEmpty, ButtonPrimary } from "../Button";
import { GreyCard, LightCard } from "../Card";
import { AutoColumn } from "../Column";
import CurrencyLogo from "../CurrencyLogo";
import DoubleCurrencyLogo from "../DoubleLogo";
import { AutoRow, RowBetween, RowFixed } from "../Row";
// import { CardNoise } from "../earn/styled";
import { Dots } from "../swap/styleds";
import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import JSBI from "jsbi";
import moment from "moment";
import { CurrencyAmount, Percent, Token } from "@panaromafinance/panaromaswap_sdkcore";
import { Pair } from "@panaromafinance/panaromaswap_v1sdk";
import { transparentize } from "polished";
import { useState, useEffect } from "react";
// import Datepicker from 'react-datepicker'
// import 'react-datepicker/dist/react-datepicker.css'
import { ChevronDown, ChevronUp } from "react-feather";
import { Link } from "react-router-dom";
import { Text } from "rebass";
import styled from "styled-components/macro";
import Web3 from "web3";
import axios from "axios";
import { SupportedChainId } from "constants/chains";
import { RPC_URLS } from "constants/networks";
import { useAppSelector } from "state/hooks";
import { useDerivedBurnInfo } from "state/burn/hooks";
import { useWindowSize } from "hooks/useWindowSize";

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`;

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

export function MinimalPositionCard({
  pair,
  showUnwrapped = false,
  border
}: PositionCardProps) {
  const { account } = useWeb3React();

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0);
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance &&
      !!totalPoolTokens &&
      JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
      !!totalPoolTokens &&
      !!userPoolBalance &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
        pair.getLiquidityValue(
          pair.token0,
          totalPoolTokens,
          userPoolBalance,
          false
        ),
        pair.getLiquidityValue(
          pair.token1,
          totalPoolTokens,
          userPoolBalance,
          false
        )
      ]
      : [undefined, undefined];




  return (
    <>
      {userPoolBalance &&
        JSBI.greaterThan(userPoolBalance.quotient, JSBI.BigInt(0)) ? (
        <GreyCard border={border}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={500} fontSize={16}>
                  <Trans>Your position</Trans>
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  margin={true}
                  size={20}
                />
                <Text fontWeight={500} fontSize={20}>
                  {currency0.symbol}/{currency1.symbol}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={500} fontSize={20}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px">
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Your pool share:</Trans>
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  {poolTokenPercentage
                    ? poolTokenPercentage.toFixed(6) + "%"
                    : "-"}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  {currency0.symbol}:
                </Text>
                {token0Deposited ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={"6px"}>
                      {token0Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  "-"
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  {currency1.symbol}:
                </Text>
                {token1Deposited ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={"6px"}>
                      {token1Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  "-"
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      ) : (null
        // <LightCard>
        //   <ThemedText.DeprecatedSubHeader style={{ textAlign: "center" }}>
        //     <span role="img" aria-label="wizard-icon">
        //       ⭐️
        //     </span>{" "}
        //     <Trans>
        //       By adding liquidity you&apos;ll earn 0.3% of all trades on this
        //       pair proportional to your share of the pool. Fees are added to the
        //       pool, accrue in real time and can be claimed by withdrawing your
        //       liquidity.
        //     </Trans>{" "}
        //   </ThemedText.DeprecatedSubHeader>
        // </LightCard>
      )}
    </>
  );
}

export default function FullPositionCard({
  pair,
  border,
  stakedBalance
}: PositionCardProps) {
  const { account, chainId } = useWeb3React();

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);
  const [lockedTokens, setLockedTokens] = useState<number | string>(0);
  const [lockBtn, setLockBtn] = useState(true);
  const [lockedCurrency0, setLockedCurrency0] = useState("");
  const [lockedCurrency1, setLockedCurrency1] = useState("");
  const [lockedPoolShare, setLockedPoolShare] = useState("");


  const userDefaultPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  // console.log("bbbbb pair", pair);

  const { width } = useWindowSize()


  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance
    ? userDefaultPoolBalance?.add(stakedBalance)
    : userDefaultPoolBalance;

  const poolTokenPercentage =
    !!userPoolBalance &&
      !!totalPoolTokens &&
      JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
      !!totalPoolTokens &&
      !!userPoolBalance &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
        pair.getLiquidityValue(
          pair.token0,
          totalPoolTokens,
          userPoolBalance,
          false
        ),
        pair.getLiquidityValue(
          pair.token1,
          totalPoolTokens,
          userPoolBalance,
          false
        )
      ]
      : [undefined, undefined];

  const { parsedAmounts, error } = useDerivedBurnInfo(
    currency0 ?? undefined,
    currency1 ?? undefined
  );
  const temp = parsedAmounts[0.00025]?.toSignificant(6);
  const [tokenA, tokenB] = [currency0?.wrapped, currency1?.wrapped];
  // const [, pair] = useV1Pair(currencyA, currencyB);	
  // balances	
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [
    pair?.liquidityToken
  ]);
  const userLiquidity: undefined | CurrencyAmount<Token> =
    relevantTokenBalances?.[pair?.liquidityToken?.address ?? ""];
  const totalSupply = useTotalSupply(pair?.liquidityToken);


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
  const listOfPoolsForLock = ["SWAP", "PANAICO", "EXTICO"];

  const checkAuth = () => {
    // console.log(account, "&&&&& select address");
    const payload = { metaMaskPrivateKey: account };
    //console.log(payload, "payload");
    axios
      .get(baseGAuthURL + "checkauthenticator/" + account)
      .then(function (response) {
        // console.log("&&&&&&&& response", response);
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
    //console.log("1111 verify", verify);

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
        // console.log("&&&& response", response);
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
    // console.log(token);
  };

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // console.log(
    //   event.target.value,
    //   "hello date changes",
    //   moment(event.target.value).unix()
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
      //  console.log('&&&& user pool balance ', userPoolBalance.toSignificant(4))

      if (parseFloat(userPoolBalance.toSignificant(4)) > 0) {
        setLockBtn(false);
      } else {
        setLockBtn(true);
      }
      checklockedFactoryTokens();
      checkAuth();
    }

  }, [token]);

  useEffect(() => {
    if (userPoolBalance && totalPoolTokens) {
      checklockedFactoryTokens();
    }
  }, [showMore])

  const approveLiquidityFunction = async () => {
    // console.log("approveLiquidityFunction i am callled");
    setIsLoading(true);
    const _lptoken = pair.liquidityToken.address;
    //console.log("1111 _lptoken", _lptoken);

    const _amount = parseFloat(lockTokensAmount) * 10 ** 18;
    // console.log(
    //   _amount,
    //   "_amount",
    //   timeStamp,
    //   "timeStamp",
    //   factoryAddresses,
    //   "factoryAddresses"
    // );
    // const web3 = new Web3(
    //   new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
    // );
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
    const d_resp = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [params]
    });

    //console.log(d_resp, "d_resp");

    if (d_resp == null) {
      console.log("in valid response");
    } else {
      setTimeout(async function () {
        setShowApprove(false);
        setShowLock(true);
        setIsLoading(false);

      }, 15000);
    }
  };

  const lockLiquidityFunction = async () => {
    setIsLoading(true);

    //console.log("lockLiquidityFunction i am callled");
    const _lptoken = pair.liquidityToken.address
    //console.log("1111 _lptoken", _lptoken);

    const _amount = parseFloat(lockTokensAmount) * 10 ** 18;
    // console.log("!!!!!",
    //   _lptoken,
    //   "_lptoken",
    //   _amount,
    //   "_amount",
    //   account,
    //   "account",
    //   timeStamp,
    //   "timeStamp"
    // );
    // const web3 = new Web3(
    //   new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
    // );
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
      [_lptoken.toString(), _amount.toString(), timeStamp.toString()]
    );

    // console.log(td, "createLocking i am called");

    const txns = {
      from: account,
      to: contract,
      data: td
    };

    // console.log(txns, "txns i am called");

    const txHashh = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txns]
    });

    //console.log(txHashh, "txHashh i am called");

    setTimeout(async function () {
      checklockedFactoryTokens();
      setLockModalClass("modal fade hide");
      setIsLoading(false);
    }, 15000);
  };

  async function checklockedFactoryTokens() {
    const jsonInt = [
      {
        inputs: [
          {
            internalType: "address",
            name: "_panaromaswapFactory",
            type: "address"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "lpToken",
            type: "address"
          },
          {
            indexed: false,
            internalType: "address",
            name: "user",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "lockDate",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "unlockDate",
            type: "uint256"
          }
        ],
        name: "onDeposit",
        type: "event"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_lpToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "_unlock_date",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "_withdrawer",
            type: "address"
          }
        ],
        name: "addLocking",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        name: "allLockPairs",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          },
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        name: "getLockPair",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_lpToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "_unlock_date",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "_withdrawer",
            type: "address"
          }
        ],
        name: "lockLPToken",
        outputs: [
          {
            internalType: "address",
            name: "_pair",
            type: "address"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "panaromaswapFactory",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ] as any;

    let userLockedBalance = 0;
    let pooledCurrency0 = 0;
    let pooledCurrency1 = 0
    let pooledLockShare = 0;

    listOfPoolsForLock.map(async x => {

      const contractAddress = x == listOfPoolsForLock[0] ? process.env['REACT_APP_LOCK_FACTORY_ADDRESS'] :
        x == listOfPoolsForLock[1] ? process.env['REACT_APP_LOCK_FACTORY_ADDRESS_PANAICO'] :
          process.env['REACT_APP_LOCK_FACTORY_ADDRESS_EXTICO'];

      if (contractAddress != "0x0000000000000000000000000000000000000000") {


        const contract = new web3.eth.Contract(jsonInt, contractAddress);

        const response = await contract.methods
          .getLockPair(account, pair.liquidityToken.address)
          .call();

        const lockedFundAddress = response;

        if (lockedFundAddress == 0x0000000000000000000000000000000000000000) {
          localStorage.setItem("lockedFactoryTokens", lockedFundAddress);
          setLockedTokens(0);
          const tokenContract = pair.liquidityToken.address;
          const tokenHolder = localStorage.getItem("lockedFactoryTokens");

        } else {

          localStorage.setItem("lockedFactoryTokens", lockedFundAddress);
          const balanceOfABI = [
            {
              constant: true,
              inputs: [
                {
                  name: "_owner",
                  type: "address"
                }
              ],
              name: "balanceOf",
              outputs: [
                {
                  name: "balance",
                  type: "uint256"
                }
              ],
              payable: false,
              stateMutability: "view",
              type: "function"
            }
          ] as any;
          const tokenContract = pair.liquidityToken.address;
          const tokenHolder = lockedFundAddress;
          // console.log(tokenContract, "tokenContract", tokenHolder, "tokenHolder");	
          const contract = new web3.eth.Contract(
            balanceOfABI,
            tokenContract.toString()
          );

          const result = await contract.methods
            .balanceOf(tokenHolder.toString())
            .call();

          const userLockedBalanceResult = web3.utils.fromWei(result);
          userLockedBalance = userLockedBalance + Number(userLockedBalanceResult);

          setLockedTokens(userLockedBalance.toFixed(18));

          pooledCurrency0 = pooledCurrency0 + (Number(userLockedBalance ? userLockedBalance : 0) * (Number(token0Deposited ? token0Deposited?.toSignificant(pair.token0.decimals) : 0) / Number(userPoolBalance ? userPoolBalance?.toSignificant(pair.token0.decimals) : 0)));
          pooledCurrency1 = pooledCurrency1 + (Number(userLockedBalance ? userLockedBalance : 0) * (Number(token1Deposited ? token1Deposited?.toSignificant(pair.token1.decimals) : 0) / Number(userPoolBalance ? userPoolBalance?.toSignificant(pair.token1.decimals) : 0)));
          pooledLockShare = pooledLockShare + (Number(userLockedBalance ? userLockedBalance : 0) * (Number(poolTokenPercentage ? poolTokenPercentage?.toSignificant(6) : 0) / Number(userPoolBalance ? userPoolBalance?.toSignificant(6) : 0)));

          setLockedCurrency0(Number(pooledCurrency0).toFixed(pair.token0.decimals));
          setLockedCurrency1(Number(pooledCurrency1).toFixed(pair.token1.decimals));
          setLockedPoolShare(Number(pooledLockShare).toFixed(2));
        }
      }
    })
  }
  // console.log("+++++ currency0", currency0);

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      {/* <CardNoise /> */}
      <AutoColumn gap="12px">
        <FixedHeightRow onClick={() => setShowMore(!showMore)}>
          <AutoRow gap="8px" style={{ marginLeft: "8px" }}>
            <DoubleCurrencyLogo
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
            </Text>
          </AutoRow>
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
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <div className="d-sm-flex justify-content-between d-block">
              <Text fontSize={16} fontWeight={500}>
                <Trans>Your total pool tokens:</Trans>
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}
              </Text>
            </div>

            {stakedBalance && (
              <div className="d-sm-flex justify-content-between d-block">
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pool tokens in rewards pool:</Trans>
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  {stakedBalance.toSignificant(4)}
                </Text>
              </div>
            )}
            <div className="d-sm-flex justify-content-between d-block">
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pooled {currency0.symbol}:</Trans>
                </Text>
              </RowFixed>

              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={"6px"}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo
                    size="20px"
                    style={{ marginLeft: "8px" }}
                    currency={currency0}
                  />
                </RowFixed>
              ) : (
                "-"
              )}
            </div>

            <div className="d-sm-flex justify-content-between d-block">
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pooled {currency1.symbol}:</Trans>
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={"6px"}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo
                    size="20px"
                    style={{ marginLeft: "8px" }}
                    currency={currency1}
                  />
                </RowFixed>
              ) : (
                "-"
              )}
            </div>
            <div className="d-sm-flex justify-content-between d-block">
              <Text fontSize={16} fontWeight={500}>
                <Trans>Your pool share:</Trans>
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {poolTokenPercentage ? (
                  <Trans>
                    {poolTokenPercentage.toFixed(2) === "0.00"
                      ? "<0.01"
                      : poolTokenPercentage.toFixed(2)}{" "}
                    %
                  </Trans>
                ) : (
                  "-"
                )}
              </Text>
            </div>
            {/* Locked Pool Tokens */}
            <hr />

            <div className="d-sm-flex justify-content-between d-block">
              <Text fontSize={16} fontWeight={500}>
                <Trans>Your total pool locked tokens:</Trans>
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {lockedTokens}
              </Text>
            </div>

            <div className="d-sm-flex justify-content-between d-block">
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pooled {currency0.symbol}:</Trans>
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={"6px"}>
                    {/* {token0Deposited?.toSignificant(6)} */}
                    ~{lockedCurrency0}

                  </Text>
                  <CurrencyLogo
                    size="20px"
                    style={{ marginLeft: "8px" }}
                    currency={currency0}
                  />
                </RowFixed>
              ) : (
                "-"
              )}
            </div>

            <div className="d-sm-flex justify-content-between d-block">
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  <Trans>Pooled {currency1.symbol}:</Trans>
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={"6px"}>
                    {/* {token1Deposited?.toSignificant(6)} */}
                    ~{lockedCurrency1}
                  </Text>
                  <CurrencyLogo
                    size="20px"
                    style={{ marginLeft: "8px" }}
                    currency={currency1}
                  />
                </RowFixed>
              ) : (
                "-"
              )}
            </div>
            <div className="d-sm-flex justify-content-between d-block">
              <Text fontSize={16} fontWeight={500}>
                <Trans>Your pool share:</Trans>
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {lockedPoolShare ? (
                  <Trans>
                    ~{lockedPoolShare === "0.00"
                      ? "<0.01"
                      : lockedPoolShare}{" "}
                    %
                  </Trans>
                ) : (
                  "-"
                )}
              </Text>
            </div>

            {/* <ButtonSecondary padding="8px" $borderRadius="8px">
              <ExternalLink
                style={{ width: "100%", textAlign: "center" }}
                href={`${process.env['REACT_APP_ANALYATICS_URL']}account/${account}`}>
                <Trans>
                  View accrued fees and analytics
                  <span style={{ fontSize: "11px" }}>↗</span>
                </Trans>
              </ExternalLink>
            </ButtonSecondary> */}
            <div
              className={lockModalClass}
              id="exampleModal"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true">

              <div className="modal-dialog">

                <div className="modal-content">

                  <div className="modal-header">
                    <h1
                      className="modal-title text-dark fs-5"
                      id="exampleModalLabel">
                      <Trans>Lock Tokens</Trans>
                    </h1>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <input
                      type="text"
                      className="custom-search-input"
                      placeholder="Amount"
                      onChange={(e) => setlockTokensAmount(e.target.value)}
                    />
                    <input
                      className="lockLiquidityDate mt-2"
                      type="date"
                      onChange={handleChange}
                    />
                    {/* <Datepicker selected={startDate} onChange={(date) => setStartDate(date)} /> */}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal">
                      Close
                    </button>
                    {showApprove ? (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={approveLiquidityFunction}
                        className="btn btn-primary">
                        Approve
                      </button>
                    ) : null}
                    {showLock ? (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={lockLiquidityFunction}
                        className="btn btn-primary">
                        Lock
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={verifyModalClass}
              id="verifyModal"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1
                      className="modal-title text-dark fs-5"
                      id="exampleModalLabel">
                      <Trans>2FA Verification</Trans>
                    </h1>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <input
                      type="text"
                      onChange={(e) => setToken(e.target.value)}
                      className="custom-search-input"
                      placeholder="2FA Code from autheticator"
                    />
                    {/* <Datepicker selected={startDate} onChange={(date) => setStartDate(date)} /> */}
                  </div>
                  <p className="tokenValidation">{errors}</p>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal">
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={verify}
                      className="btn btn-primary">
                      Verify
                    </button>

                  </div>
                </div>
              </div>
            </div>
            {userDefaultPoolBalance &&
              JSBI.greaterThan(
                userDefaultPoolBalance.quotient,
                BIG_INT_ZERO
              ) && (
                <RowBetween marginTop="10px" className="d-sm-flex d-block">
                  {/* <ButtonPrimary
                  padding="8px"
                  $borderRadius="8px"
                  as={Link}
                  to={`/migrate/v1/${pair.liquidityToken.address}`}
                  width="32%"
                >
                  <Trans>Migrate</Trans>
                </ButtonPrimary> */}
                  {/* {disbtn ? (<div>
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
                      <ButtonPrimary
                        padding="8px"
                        $borderRadius="8px"

                        // as={Link}
                        // to={`/migrate/v1/${pair.liquidityToken.address}`}
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#verifyModal"

                        width="32%">
                        <Trans>Verify</Trans>
                      </ButtonPrimary>
                       <button onClick={verify} className="ed-btn">
                        Verify
                      </button> 
                    </div>
                    <p className="tokenValidation">{errors}</p>
                  </div>) : null} */}
                  {/* {is2FAVerified} */}
                  {/* <ButtonPrimary
                    padding="8px"
                    $borderRadius="8px"
                    disabled={lockBtn}
                    // as={Link}
                    // to={`/migrate/v1/${pair.liquidityToken.address}`}
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target={is2FAVerified ? "#exampleModal" : "#verifyModal"}
                    altDisabledStyle={lockBtn}
                    width="32%">
                    <Trans>Lock</Trans>
                  </ButtonPrimary> */}
                  <ButtonPrimary
                    padding="8px"
                    $borderRadius="8px"
                    as={Link}
                    width={width && width < 575 ? "50%" : "23%"}
                    style={{ margin: "0.4rem auto" }}
                    to={`/lock/v1/${currencyId(currency0)}/${currencyId(
                      currency1
                    )}`}>
                    <Trans>Lock</Trans>
                  </ButtonPrimary>
                  <ButtonPrimary
                    padding="8px"
                    $borderRadius="8px"
                    as={Link}
                    width={width && width < 575 ? "50%" : "23%"}
                    style={{ margin: "0.4rem auto" }}
                    to={`/withdrawpoolv1/${currencyId(currency0)}/${currencyId(
                      currency1
                    )}/${pair.liquidityToken.address}/${currency0.symbol}/${currency1.symbol}`}>
                    <Trans>Unlock</Trans>
                  </ButtonPrimary>
                  <ButtonPrimary
                    padding="8px"
                    $borderRadius="8px"
                    as={Link}
                    to={`/add/v1/${currencyId(currency0)}/${currencyId(
                      currency1
                    )}`}
                    width={width && width < 575 ? "50%" : "23%"}
                    style={{ margin: "0.4rem auto" }}>
                    <Trans>Add</Trans>
                  </ButtonPrimary>
                  <ButtonPrimary
                    padding="8px"
                    $borderRadius="8px"
                    as={Link}
                    width={width && width < 575 ? "50%" : "23%"}
                    style={{ margin: "0.4rem auto" }}
                    to={`/remove/v1/${currencyId(currency0)}/${currencyId(
                      currency1
                    )}`}>
                    <Trans>Remove</Trans>
                  </ButtonPrimary>
                </RowBetween>
              )}
            {stakedBalance &&
              JSBI.greaterThan(stakedBalance.quotient, BIG_INT_ZERO) && (
                <ButtonPrimary
                  padding="8px"
                  $borderRadius="8px"
                  as={Link}
                  to={`/pana/${currencyId(currency0)}/${currencyId(currency1)}`}
                  width="100%">
                  <Trans>Manage Liquidity in Rewards Pool</Trans>
                </ButtonPrimary>
              )}
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
  );
}
