import { Trans } from "@lingui/macro";
import { Pair } from "@panaromafinance/panaromaswap_v1sdk";
import { useWeb3React } from "@web3-react/core";
import { PageName } from "components/AmplitudeAnalytics/constants";
import { Trace } from "components/AmplitudeAnalytics/Trace";
import { UNSUPPORTED_V1POOL_CHAIN_IDS } from "constants/chains";
import JSBI from "jsbi";
import { useContext, useMemo } from "react";
// import { ChevronsRight } from "react-feather";
import { Link } from "react-router-dom";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components/macro";

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
import FullPositionCard from "../../components/PositionCard";
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
  &:hover {
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

export default function Pool() {
  const theme = useContext(ThemeContext);
  const { account, chainId, provider } = useWeb3React();
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
  //console.log("14145 liquidityTokensWithBalances", liquidityTokensWithBalances);


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

  
  //  console.log("141414 stakingPair", stakingPairs);


  return (
    <Trace page={PageName.POOL_PAGE} shouldLogImpression>
      <>
        <PageWrapper>
          {/* <VoteCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <ThemedText.DeprecatedWhite fontWeight={600}>
                    <Trans>Liquidity provider rewards</Trans>
                  </ThemedText.DeprecatedWhite>
                </RowBetween>
                <RowBetween>
                  <ThemedText.DeprecatedWhite fontSize={14}>
                    <Trans>
                      Liquidity providers earn a 0.3% fee on all trades
                      proportional to their share of the pool. Fees are added to
                      the pool, accrue in real time and can be claimed by
                      withdrawing your liquidity.
                    </Trans>
                  </ThemedText.DeprecatedWhite>
                </RowBetween>
                <ExternalLink
                  style={{
                    color: theme.deprecated_white,
                    textDecoration: "underline"
                  }}
                  target="_blank"
                  href="https://docs.panaromaswap.org/protocol/V1/concepts/core-concepts/pools">
                  <ThemedText.DeprecatedWhite fontSize={14}>
                    <Trans>Read more about providing liquidity</Trans>
                  </ThemedText.DeprecatedWhite>
                </ExternalLink>
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </VoteCard> */}

          {/* {unsupportedV1Network ? (
            <AutoColumn gap="lg" justify="center">
              <AutoColumn gap="md" style={{ width: "100%" }}>
                <Layer2Prompt>
                  <ThemedText.DeprecatedBody
                    color={theme.deprecated_text3}
                    textAlign="center">
                    <Trans>
                      V1 Pool is not available on Layer 2. Switch to Layer 1
                      Ethereum.
                    </Trans>
                  </ThemedText.DeprecatedBody>
                </Layer2Prompt>
              </AutoColumn>
            </AutoColumn>
          ) : ( */}
          <AutoColumn gap="lg" justify="center">
            <AutoColumn gap="md" style={{ width: "100%" }}>
              <TitleRow style={{ marginTop: "1rem" }} padding={"0"}>
                <HideSmall>
                  <ThemedText.DeprecatedMediumHeader
                    style={{
                      marginTop: "0.5rem",
                      justifySelf: "flex-start"
                    }}>
                    <Trans>Your V1 liquidity</Trans>
                  </ThemedText.DeprecatedMediumHeader>
                </HideSmall>
                <ButtonRow>
                  {/* <ResponsiveButtonSecondary
                      as={Link}
                      padding="6px 8px"
                      to="/add/v1/ETH">
                      <Trans>Create a pair</Trans>
                    </ResponsiveButtonSecondary> */}
                  <ResponsiveButtonPrimary
                    id="find-pool-button"
                    as={Link}
                    to="/pool/v1/find"
                    padding="6px 8px">
                    <Text fontWeight={500} fontSize={16}>
                      <Trans>Import Pool</Trans>
                    </Text>
                  </ResponsiveButtonPrimary>
                  <ResponsiveButtonPrimary
                    id="join-pool-button"
                    as={Link}
                    to="/add/v1"
                    padding="6px 8px">
                    <Text fontWeight={500} fontSize={16}>
                      <Trans>New Pool</Trans>
                    </Text>
                  </ResponsiveButtonPrimary>
                </ButtonRow>
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
                  {v1PairsWithoutStakedAmount.map((v1Pair) => (
                    <FullPositionCard
                      key={v1Pair.liquidityToken.address}
                      pair={v1Pair}
                    />
                  ))}
                  {stakingPairs.map(
                    (stakingPair, i) =>
                      stakingPair[1] && ( // skip pairs that arent loaded
                        <FullPositionCard
                          key={
                            stakingInfosWithBalance[i].stakingRewardAddress
                          }
                          pair={stakingPair[1]}
                          stakedBalance={
                            stakingInfosWithBalance[i].stakedAmount
                          }
                        />
                      )
                  )}
                  {/* <RowFixed justify="center" style={{ width: "100%" }}>
                    <ButtonOutlined
                      as={Link}
                      to="/migrate/v1"
                      id="import-pool-link"
                      style={{
                        padding: "8px 16px",
                        margin: "0 4px",
                        borderRadius: "12px",
                        width: "fit-content",
                        fontSize: "14px"
                      }}>
                      <ChevronsRight
                        size={16}
                        style={{ marginRight: "8px" }}
                      />
                      <Trans>Migrate Liquidity to V2edge</Trans>
                    </ButtonOutlined>
                  </RowFixed> */}
                </>
              ) : (
                <div className="row mt-5 justify-content-center">
                  <EmptyProposals className="col-md-8" style={{ height: "fit-content" }}>
                    <ThemedText.DeprecatedBody
                      color={theme.deprecated_text3}
                      textAlign="center">
                      <Trans>No liquidity found.</Trans>
                    </ThemedText.DeprecatedBody>
                  </EmptyProposals>
                  <AddLiquidityV1 />
                </div>
              )}
            </AutoColumn>
          </AutoColumn>
          {/* )} */}
        </PageWrapper>
        <SwitchLocaleLink />
      </>
    </Trace>
  );
}
