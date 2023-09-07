import "./Style/Style.css";
// import './Style/bootstrap.css'
import "./Style/reactBootstrap.css";

import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import { initializeAnalytics } from "components/AmplitudeAnalytics";
import { PageName } from "components/AmplitudeAnalytics/constants";
import { Trace } from "components/AmplitudeAnalytics/Trace";
import Loader from "components/Loader";
import TopLevelModals from "components/TopLevelModals";
import { getChainInfoOrDefault } from "constants/chainInfo";
import { useFeatureFlagsIsLoaded } from "featureFlag";
import ApeModeQueryParamReader from "hooks/useApeModeQueryParamReader";
import { lazy, Suspense } from "react";
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Text } from "rebass";
import {
  useShowClaimPopup,
  useToggleSelfClaimModal
} from "state/application/hooks";
import { useUserHasAvailableClaim } from "state/claim/hooks";
import { useNativeCurrencyBalances } from "state/connection/hooks";
import { useUserHasSubmittedClaim } from "state/transactions/hooks";
import styled from "styled-components/macro";

import { useAnalyticsReporter } from "../components/analytics";
import { CardNoise } from "../components/earn/styled";
import ErrorBoundary from "../components/ErrorBoundary";
import Header from "../components/Header";
import NetworkSelector from "../components/Header/NetworkSelector";
import Polling from "../components/Header/Polling";
import Menu from "../components/Menu";
import Popups from "../components/Popups";
import { Dots } from "../components/swap/styleds";
import Web3Status from "../components/Web3Status";
import { ThemedText } from "../theme";
import DarkModeQueryParamReader from "../theme/DarkModeQueryParamReader";
import Account from "./Account";
import AddLiquidity from "./AddLiquidity";
import { RedirectDuplicateTokenIds } from "./AddLiquidity/redirects";
import { RedirectDuplicateTokenIdsV1 } from "./AddLiquidityV1/redirects";
import Earn from "./Earn";
import Manage from "./Earn/Manage";
import Home from "./Home";
import MigrateV1 from "./MigrateV1";
import MigrateV1Pair from "./MigrateV1/MigrateV1Pair";
import Pool from "./Pool";
import { PositionPage } from "./Pool/PositionPage";
import PoolV1 from "./Pool/v1";
import PoolFinder from "./PoolFinder";
import Referral from "./Referral";
import ReferralEnrollment from "./ReferralEnrollment";
// import Refers from "./Refers";
import RemoveLiquidity from "./RemoveLiquidity";
import RemoveLiquidityV2edge from "./RemoveLiquidity/V2edge";
import Swap from "./Swap";
import {
  OpenClaimAddressModalAndRedirectToSwap,
  RedirectPathToSwapOnly,
  RedirectToSwap
} from "./Swap/redirects";
import TwoFactor from "./TwoFactor";
import LockLiquidity from "./LockLiquidity";
import ReferralLevel from "./ReferralLevel";
import WithdrawLiquidity from "./WithdrawLiquidity";
import WithDrawPoolV1 from "./Withdraw/v1";

// lazy load vote related pages
const Vote = lazy(() => import("./Vote"));

const AppWrapper = styled.div`
  display: flex;
`;

const BodyWrapper = styled.div`
  width: 100%;
  padding: 0px 100px 0px 100px;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 4rem 8px 16px 8px;
  `};

  @media screen and (max-width: 768px) {
    padding: 0px 20px 0px 20px;
  }
`;

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: space-between;
  top: 0;
  z-index: 2;
  position: sticky;
  height: 100vh;
`;

const Marginer = styled.div`
  margin-top: 5rem;
`;

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.5em;
  }

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`;

const PANAWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`;

const NetWallet = styled.div`
  padding: 20px;
  width: 100%;
  display: flex;
  margin-top: 20px;
  border-radius: 20px;
  margin-bottom: 60px;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  @media (max-width: 768px) {
    margin-top: 80px;
    margin-bottom: 10px;
  }
`;

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) =>
    !active ? theme.deprecated_bg0 : theme.deprecated_bg0};
  border-radius: 16px;
  white-space: nowrap;
  width: 100%;
  height: 40px;

  :focus {
    border: 1px solid blue;
  }
`;

const PANAAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.deprecated_bg3};
  background: radial-gradient(
      174.47% 188.91% at 1.84% 0%,
      #ff007a 0%,
      #2172e5 100%
    ),
    #edeef2;
`;

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`;

function getCurrentPageFromLocation(
  locationPathname: string
): PageName | undefined {
  switch (locationPathname) {
    case "/swap":
      return PageName.SWAP_PAGE;
    case "/vote":
      return PageName.VOTE_PAGE;
    case "/pool":
      return PageName.POOL_PAGE;
    default:
      return undefined;
  }
}

export default function App() {
  const { account, chainId } = useWeb3React();
  // const globalData = useGlobalData()

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[
    account ?? ""
  ];

  const availableClaim: boolean = useUserHasAvailableClaim(account);

  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined);

  const showClaimPopup = useShowClaimPopup();

  const toggleClaimModal = useToggleSelfClaimModal();

  const isLoaded = useFeatureFlagsIsLoaded();

  const {
    infoLink,
    nativeCurrency: { symbol: nativeCurrencySymbol }
  } = getChainInfoOrDefault(chainId);

  const { pathname } = useLocation();
  const currentPage = getCurrentPageFromLocation(pathname);

  useAnalyticsReporter();
  initializeAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    window.localStorage.clear()
  }, [])

  // const [loading, setLoading] = useState(true)
  // const preloader = document.getElementById('preloader')
  // if (preloader) {
  //   setTimeout(() => {
  //     preloader.style.display = 'none'
  //     setLoading(false)
  //   }, 2000)
  // }
  return (
    // !loading && (
    <ErrorBoundary>
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
      <AppWrapper>
        <Trace page={currentPage}>
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <NetWallet>
              <NetworkSelector />

              <HeaderElement>
                {availableClaim && !showClaimPopup && (
                  <PANAWrapper onClick={toggleClaimModal}>
                    <PANAAmount
                      active={!!account && !availableClaim}
                      style={{ pointerEvents: "auto" }}>
                      <ThemedText.DeprecatedWhite padding="0 2px">
                        {claimTxn && !claimTxn?.receipt ? (
                          <Dots>
                            <Trans>Claiming PANA</Trans>
                          </Dots>
                        ) : (
                          <Trans>Claim PANA</Trans>
                        )}
                      </ThemedText.DeprecatedWhite>
                    </PANAAmount>
                    <CardNoise />
                  </PANAWrapper>
                )}
                <AccountElement active={!!account}>
                  {account && userEthBalance ? (
                    <BalanceText
                      style={{ flexShrink: 0, userSelect: "none" }}
                      pl="0.75rem"
                      pr=".4rem"
                      fontWeight={500}>
                      <Trans>
                        {userEthBalance?.toSignificant(3)}{" "}
                        {nativeCurrencySymbol}
                      </Trans>
                    </BalanceText>
                  ) : null}
                  <Web3Status />
                </AccountElement>
                <HeaderElement className="ms-3">
                  <Menu />
                </HeaderElement>
              </HeaderElement>
            </NetWallet>
            <Popups />
            <Polling />
            <TopLevelModals />
            <Suspense fallback={<Loader />}>
              {isLoaded ? (
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="vote/*" element={<Vote />} />
                  <Route
                    path="create-proposal"
                    element={<Navigate to="/vote/create-proposal" replace />}
                  />
                  <Route
                    path="claim"
                    element={<OpenClaimAddressModalAndRedirectToSwap />}
                  />
                  <Route path="PANA" element={<Earn />} />
                  <Route
                    path="PANA/:currencyIdA/:currencyIdB"
                    element={<Manage />}
                  />
                  <Route path="send" element={<RedirectPathToSwapOnly />} />
                  <Route
                    path="swap/:outputCurrency"
                    element={<RedirectToSwap />}
                  />
                  <Route path="swap" element={<Swap />} />
                  <Route path="pool/v1/find" element={<PoolFinder />} />
                  <Route path="pool/v1" element={<PoolV1 />} />
                  <Route path="pool" element={<Pool />} />
                  <Route path="pool/:tokenId" element={<PositionPage />} />
                  <Route
                    path="add/v1"
                    element={<RedirectDuplicateTokenIdsV1 />}>
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                  </Route>
                  <Route path="add" element={<RedirectDuplicateTokenIds />}>
                    {/* this is workaround since react-router-dom v6 doesn't support optional parameters any more */}
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
                  </Route>
                  <Route path="increase" element={<AddLiquidity />}>
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount/:tokenId" />
                  </Route>
                  <Route
                    path="remove/v1/:currencyIdA/:currencyIdB"
                    element={<RemoveLiquidity />}
                  />
                  <Route
                    path="lock/v1/:currencyIdA/:currencyIdB"
                    element={<LockLiquidity />}
                  />
                  <Route
                    path="withdrawpoolv1/:currencyIdA/:currencyIdB/:lpToken/:currency0/:currency1"
                    element={<WithDrawPoolV1 />}
                  />
                  <Route
                    path="withdraw/v1/:currencyIdA/:currencyIdB/:lpToken/:lockIndex/:lockId/:amountHolding0/:lockContract/:currency0/:currency1"
                    element={<WithdrawLiquidity />}
                  />
                  <Route
                    path="remove/:tokenId"
                    element={<RemoveLiquidityV2edge />}
                  />
                  <Route path="migrate/v1" element={<MigrateV1 />} />
                  <Route
                    path="migrate/v1/:address"
                    element={<MigrateV1Pair />}
                  />
                  <Route path="/twoFactor" element={<TwoFactor history={undefined} />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="referral" element={<Referral />} />
                  <Route path="referrallevel/:address" element={<ReferralLevel />} />
                  {/* <Route path="refers/ref=:id" element={<Refers />} /> */}
                  <Route
                    path="refers/ref/:refID"
                    element={<ReferralEnrollment />}
                  />
                  <Route path="*" element={<RedirectPathToSwapOnly />} />
                </Routes>
              ) : (
                <Loader />
              )}
            </Suspense>
            <Marginer />
          </BodyWrapper>
        </Trace>
      </AppWrapper>
    </ErrorBoundary>
    // )
  );
}
