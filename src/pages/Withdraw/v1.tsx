import { Trans } from "@lingui/macro";
import { Pair } from "@panaromafinance/panaromaswap_v1sdk";
import { useWeb3React } from "@web3-react/core";
import { PageName } from "components/AmplitudeAnalytics/constants";
import { Trace } from "components/AmplitudeAnalytics/Trace";
import { SupportedChainId, UNSUPPORTED_V1POOL_CHAIN_IDS } from "constants/chains";
import JSBI from "jsbi";
import { useContext, useEffect, useMemo, useState } from "react";
// import { ChevronsRight } from "react-feather";
import { useParams } from "react-router-dom";
import styled, { ThemeContext } from "styled-components/macro";
import { Link } from "react-router-dom";
import {
    // ButtonOutlined,
    ButtonPrimary,
    ButtonSecondary
} from "../../components/Button";
// import Card from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import {
    DataCard
} from "../../components/earn/styled";
// import FullPositionCard from "../../components/PositionCard";
import { RowBetween, RowFixed } from "../../components/Row";
import { Dots } from "../../components/swap/styleds";
import { SwitchLocaleLink } from "../../components/SwitchLocaleLink";
import { BIG_INT_ZERO } from "../../constants/misc";
import { useV1Pairs } from "../../hooks/useV1Pairs";
import { useTokenBalancesWithLoadingIndicator } from "../../state/connection/hooks";
import { useStakingInfo } from "../../state/stake/hooks";
import {
    toV1LiquidityToken,
    useTrackedTokenPairs
} from "../../state/user/hooks";
import { HideSmall, ThemedText } from "../../theme";
import AddLiquidityV1 from "../AddLiquidityV1/index";
import lockTokenABA from "../../abis/lockTokenABA.json"
import Web3 from "web3";
import lockFactoryABI from "../../abis/lockFactoryBalanceABI.json"
import WithdrawFullPositionCard from "./WithDrawPositionCard";
import { RPC_URLS } from "constants/networks";
import { Text } from "rebass";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useAppSelector } from "state/hooks";


const PageWrapper = styled(AutoColumn)`
  // max-width: 640px;
  width: 100%;
  width: 100%;
`;

const VoteCard = styled(DataCard)`
  background: radial-gradient(
    76.02% 75.41% at 1.84% 0%,
    #27ae60 0%,
    #000000 100%
  );
  overflow: hidden;
`;

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`;

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`;

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  border-radius: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
  a:hover {
    color: #ffff;
  }
`;

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`;

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.deprecated_text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Layer2Prompt = styled(EmptyProposals)`
  margin-top: 16px;
`;

export default function WithDrawPoolV1() {
    const theme = useContext(ThemeContext);
    const { account, chainId } = useWeb3React();
    const { currencyIdA, currencyIdB, lpToken, currency0, currency1 } = useParams<{
        currencyIdA: string;
        currencyIdB: string;
        lpToken: string;
        currency0: string;
        currency1: string;
    }>();

    // console.log("---- lpToken", lpToken, account);

    const lockFRactoryABI = lockFactoryABI as any;

    const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
    const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

    const unsupportedV1Network =
        chainId && UNSUPPORTED_V1POOL_CHAIN_IDS.includes(chainId);

    // fetch the user's balances of all tracked V1 LP tokens
    let trackedTokenPairs = useTrackedTokenPairs();
    if (unsupportedV1Network) trackedTokenPairs = [];
    const tokenPairsWithLiquidityTokens = useMemo(
        () =>
            trackedTokenPairs.map((tokens) => ({
                liquidityToken: toV1LiquidityToken(tokens),
                tokens
            })),
        [trackedTokenPairs]
    );
    const liquidityTokens = useMemo(
        () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
        [tokenPairsWithLiquidityTokens]
    );
    const [v1PairsBalances, fetchingV1PairBalances] =
        useTokenBalancesWithLoadingIndicator(account ?? undefined, liquidityTokens);

    // fetch the reserves for all V1 pools in which the user has a balance
    const liquidityTokensWithBalances = useMemo(
        () =>
            tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
                v1PairsBalances[liquidityToken.address]?.greaterThan("0")
            ),
        [tokenPairsWithLiquidityTokens, v1PairsBalances]
    );

    const v1Pairs = useV1Pairs(
        liquidityTokensWithBalances.map(({ tokens }) => tokens)
    );
    const v1IsLoading =
        fetchingV1PairBalances ||
        v1Pairs?.length < liquidityTokensWithBalances.length ||
        v1Pairs?.some((V1Pair) => !V1Pair);

    const allV1PairsWithLiquidity = v1Pairs
        .map(([, pair]) => pair)
        .filter((v1Pair): v1Pair is Pair => Boolean(v1Pair));

    // show liquidity even if its deposited in rewards contract
    const stakingInfo = useStakingInfo();
    const stakingInfosWithBalance = stakingInfo?.filter((pool) =>
        JSBI.greaterThan(pool.stakedAmount.quotient, BIG_INT_ZERO)
    );
    const stakingPairs = useV1Pairs(
        stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens)
    );

    const lockLiquidityDetails = useV1Pairs(
        stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens)
    );


    // remove any pairs that also are included in pairs with stake in mining pool
    const v1PairsWithoutStakedAmount = allV1PairsWithLiquidity.filter(
        (v1Pair) => {
            return (
                stakingPairs
                    ?.map((stakingPair) => stakingPair[1])
                    .filter(
                        (stakingPair) =>
                            stakingPair?.liquidityToken.address ===
                            v1Pair.liquidityToken.address
                    ).length === 0
            );
        }
    );

    const lockTockenABAJson = lockTokenABA as any;
    const [withDrawListDetails, setWithDrawListDetails] = useState([]);
    const listOfPoolsForLock = ["SWAP", "PANAICO", "EXTICO"];
    const [withdrawLoading, setWithdrawLoading] = useState(false)

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
        setWithdrawLoading(true)
        checklockedFactoryTokens();
    }, [account])

    // checklockedFactoryTokens();


    async function checklockedFactoryTokens() {
        const withDrawList = [] as any;
        let noOfLockIndex = 1;

        listOfPoolsForLock.map(async x => {
            const contractAddress = x == listOfPoolsForLock[0] ? process.env['REACT_APP_LOCK_FACTORY_ADDRESS'] :
                x == listOfPoolsForLock[1] ? process.env['REACT_APP_LOCK_FACTORY_ADDRESS_PANAICO'] :
                    process.env['REACT_APP_LOCK_FACTORY_ADDRESS_EXTICO'];

            // const contractAddress = process.env['REACT_APP_LOCK_FACTORY_ADDRESS'];
            // const web3 = new Web3(
            //     new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
            // );

            if (contractAddress != "0x0000000000000000000000000000000000000000" && account) {
                const contract1 = new web3.eth.Contract(lockFRactoryABI, contractAddress);

                const getLockPair = await contract1.methods.getLockPair(account, lpToken).call()

                if (getLockPair === "0x0000000000000000000000000000000000000000") {
                    setWithdrawLoading(false)
                }

                console.log("===== methods getLockPair", getLockPair);


                const contract = new web3.eth.Contract(lockTockenABAJson, getLockPair);
                const resp = await contract.methods.getUserNumLocksForToken(account, lpToken).call()

                console.log("===== methods resp", resp);


                for (let index = 0; index < resp; index++) {
                    const getUserLockForTokenAtIndex = await contract.methods.getUserLockForTokenAtIndex(account, lpToken, index).call()

                    withDrawList.push({
                        "timeStamp": getUserLockForTokenAtIndex[0],
                        "amountHolding0": getUserLockForTokenAtIndex[1],
                        "amountHolding1": getUserLockForTokenAtIndex[2],
                        "to": getUserLockForTokenAtIndex[3],
                        index,
                        "userId": getUserLockForTokenAtIndex[5],
                        lpToken,
                        "lockContract": getLockPair,
                        "lockType": x,
                        "lockIndex": getUserLockForTokenAtIndex[4],
                        "lockIndexUI": noOfLockIndex++
                    })
                    // "lockIndex": noOfLockIndex++
                }
            }
        });

        setWithDrawListDetails(withDrawList.sort((a: any, b: any) => a.to - b.to));

        if (withDrawListDetails.length > 0) {
            setWithdrawLoading(false)
        }
    }

    return (
        <Trace page={PageName.POOL_PAGE} shouldLogImpression>
            <>
                <PageWrapper>
                    <AutoColumn gap="lg" justify="center">
                        <AutoColumn gap="md" style={{ width: "100%" }}>
                            <TitleRow style={{ marginTop: "1rem" }} padding={"0"}>
                                <HideSmall>
                                    <ThemedText.DeprecatedMediumHeader
                                        style={{
                                            marginTop: "0.5rem",
                                            justifySelf: "flex-start"
                                        }}>
                                        <Trans>Your V1 liquidity Withdraw List</Trans>
                                    </ThemedText.DeprecatedMediumHeader>
                                </HideSmall>

                            </TitleRow>

                            {!account ? (
                                <div className="row mt-5 justify-content-center">
                                    <div className="col-md-8" style={{ height: "fit-content", padding: "40px" }}>
                                        <ThemedText.DeprecatedBody
                                            color={theme.deprecated_text3}
                                            textAlign="center">
                                            <Trans>Connect to a wallet to view your liquidity.</Trans>
                                        </ThemedText.DeprecatedBody>
                                    </div>
                                    <AddLiquidityV1 />
                                </div>
                            ) : v1IsLoading ? (
                                <EmptyProposals>
                                    <ThemedText.DeprecatedBody
                                        color={theme.deprecated_text3}
                                        textAlign="center">
                                        <Dots>
                                            <Trans>Loading</Trans>
                                        </Dots>
                                    </ThemedText.DeprecatedBody>
                                </EmptyProposals>
                            ) : allV1PairsWithLiquidity?.length > 0 ||
                                stakingPairs?.length > 0 ? (
                                <>
                                    {/* <ButtonSecondary>
                                        <RowBetween>
                                            <Trans>
                                                <ExternalLink
                                                    href={
                                                        process.env['REACT_APP_ANALYATICS_URL'] + "account/" + account
                                                    }>
                                                    Account analytics and accrued fees
                                                </ExternalLink>
                                                <span> ↗ </span>
                                            </Trans>
                                        </RowBetween>
                                    </ButtonSecondary> */}
                                    {/* {v1PairsWithoutStakedAmount.map((v1Pair) => (
                                        <WithdrawFullPositionCard
                                            key={v1Pair.liquidityToken.address}
                                            pair={v1Pair}
                                            withDrawDetails={withDrawListDetails}
                                        />
                                    ))} */}
                                    {withDrawListDetails.length == 0 && !withdrawLoading ? (
                                        <div className="d-flex align-items-center flex-column">
                                            <EmptyProposals className="col-md-12" style={{ height: "fit-content" }}>
                                                <ThemedText.DeprecatedBody
                                                    color={theme.deprecated_text3}
                                                    textAlign="center">
                                                    <Trans>No liquidity Withdraw.</Trans>
                                                </ThemedText.DeprecatedBody>
                                            </EmptyProposals>
                                            {/* <ButtonRow className="mt-3">
                                                <ResponsiveButtonPrimary
                                                    id="find-pool-button"
                                                    as={Link}
                                                    to="/pool/v1"
                                                    padding="6px 8px">
                                                    <MdKeyboardArrowLeft size={20} />

                                                    <Text fontWeight={500} fontSize={16}>
                                                        <Trans>Back</Trans>
                                                    </Text>
                                                </ResponsiveButtonPrimary>
                                            </ButtonRow> */}
                                        </div>) : null}
                                    {
                                        withdrawLoading && withDrawListDetails.length == 0 ? (
                                            <EmptyProposals>
                                                <ThemedText.DeprecatedBody
                                                    color={theme.deprecated_text3}
                                                    textAlign="center">
                                                    <Dots>
                                                        <Trans>Loading</Trans>
                                                    </Dots>
                                                </ThemedText.DeprecatedBody>
                                            </EmptyProposals>
                                        ) : null
                                    }
                                    {withDrawListDetails.map((v1Pair: any) => (
                                        <WithdrawFullPositionCard
                                            key={v1Pair.lockIndex}
                                            pair={v1Pair}
                                            withDrawDetails={v1Pair}
                                            currency0={currency0}
                                            currency1={currency1}
                                            currencyIdA={currencyIdA}
                                            currencyIdB={currencyIdB}
                                        />
                                    ))}
                                    <div className="d-flex align-items-center flex-column">
                                        <ButtonRow className="mt-3 justify-content-center">
                                            <ResponsiveButtonPrimary
                                                id="find-pool-button"
                                                as={Link}
                                                to="/pool/v1"
                                                padding="6px 8px">
                                                <MdKeyboardArrowLeft size={20} />

                                                <Text fontWeight={500} fontSize={16}>

                                                    <Trans>Back</Trans>
                                                </Text>
                                            </ResponsiveButtonPrimary>
                                        </ButtonRow>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <div className="d-flex align-items-center flex-column">
                                        <EmptyProposals className="col-md-8" style={{ height: "fit-content" }}>
                                            <ThemedText.DeprecatedBody
                                                color={theme.deprecated_text3}
                                                textAlign="center">
                                                <Trans>No liquidity Withdraw.</Trans>
                                            </ThemedText.DeprecatedBody>
                                        </EmptyProposals>
                                    </div>
                                    <div className="d-flex align-items-center flex-column">
                                        <ButtonRow className="mt-3 justify-content-center">
                                            <ResponsiveButtonPrimary
                                                id="find-pool-button"
                                                as={Link}
                                                to="/pool/v1"
                                                padding="6px 8px">
                                                <MdKeyboardArrowLeft size={20} />

                                                <Text fontWeight={500} fontSize={16}>

                                                    <Trans>Back</Trans>
                                                </Text>
                                            </ResponsiveButtonPrimary>
                                        </ButtonRow>
                                    </div>
                                </div>
                            )}
                        </AutoColumn>
                    </AutoColumn>
                    {/* )} */}
                </PageWrapper>
                <SwitchLocaleLink />
            </>
        </Trace >
    );
}