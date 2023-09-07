// import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import Logo from "../../assets/svg/panaromaWebsite.png";
import { ExternalLink, ThemedText } from "../../theme";
// import Menu from '../Menu'
import Row from "../Row";
import Web3Status from "../Web3Status";
import ClaimModal from "../claim/ClaimModal";
import { CardNoise } from "../earn/styled";
import { Dots } from "../swap/styleds";
import HolidayOrnament from "./HolidayOrnament";
import NetworkSelector from "./NetworkSelector";
import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import { getChainInfoOrDefault } from "constants/chainInfo";
import { darken } from "polished";
import {
  // Info, 
  Moon,
  Sun,
  //  ExternalLink as LinkIcon 
} from "react-feather";
// Put Globe
// import { BsQuestionCircleFill } from "react-icons/bs";
import useToggle from "hooks/useToggle";
import {
  FaDiscord,
  FaPiggyBank,
  FaUserAlt,
  FaYoutube,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  IoCloseSharp,
  // IoStatsChartSharp 
} from "react-icons/io5";
import {
  MdHome,
  MdSwapHoriz,
} from "react-icons/md";
// import { SiReadthedocs } from "react-icons/si";
import { NavLink, useLocation } from "react-router-dom";
import { Text } from "rebass";
import {
  useShowClaimPopup,
  useToggleSelfClaimModal
} from "state/application/hooks";
import { useUserHasAvailableClaim } from "state/claim/hooks";
import { useNativeCurrencyBalances } from "state/connection/hooks";
import { useUserHasSubmittedClaim } from "state/transactions/hooks";
import { useDarkModeManager } from "state/user/hooks";
import styled from "styled-components/macro";
import { useCallback, useState } from "react";

const HeaderFrame = styled.div`
  display: block;
  grid-template-columns: 120px 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 21;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  /* Background slide effect on scroll. */
  // background-image: ${({ theme }) =>
    `linear-gradient(to bottom, transparent 50%, ${theme.deprecated_bg0} 50% )}}`};
  background-size: 100% 200%;
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;
  height: 100vh;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 48px 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding:  1rem;
    grid-template-columns: 36px 1fr;
  `};

  @media only screen and (max-width: 768px) {
    display: grid;
  }
`;

const CopyRight = styled.div`
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 0.8rem
`;

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`;

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.5em;
  }

  /* addresses safaris lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`;

const HeaderLinks = styled(Row)`
  margin-top: 10px;
  justify-self: center;
  // background-color: ${({ theme }) => theme.deprecated_bg0};
  width: fit-content;
  padding: 2px;
  border-radius: 16px;
  display: block;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.deprecated_bg0};
    border: 1px solid ${({ theme }) => theme.deprecated_bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `};
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

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`;

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`;

const PanaromaIcon = styled.div`
  transition: transform 0.3s ease;
  // :hover {
  //   transform: rotate(-5deg);
  // }

  position: relative;
`;

// can't be customized under react-router-dom v6
// so we have to persist to the default one, i.e., .active
const activeclassName = "active";

const StyledNavLink = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 1rem;
  font-weight: 500;
  padding: 6px 0px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  &.${activeclassName} {
    border-radius: 14px;
    font-weight: 600;
    // justify-content: center;
    color: ${({ theme }) => theme.deprecated_text1};
    // background-color: ${({ theme }) => theme.deprecated_bg1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.deprecated_text1)};
  }
`;

const StyledExternalLink = styled(ExternalLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 1rem;
  width: fit-content;
  padding: 6px 0px;
  font-weight: 500;

  &.${activeclassName} {
    border-radius: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.deprecated_text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.deprecated_text1)};
    text-decoration: none;
  }
`;

const ToggleMenuItem = styled.button`
  background-color: transparent;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 6px 0px;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.deprecated_text2};
  :hover {
    color: ${({ theme }) => theme.deprecated_text1};
    cursor: pointer;
    text-decoration: none;
  }
`;

const AccordianButton = styled.button`
  color: ${({ theme }) => theme.deprecated_text1};
  background: ${({ theme }) => theme.deprecated_bg0};
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 0;
  font-size: 1rem;
  text-align: left;
  border: 0;
  border-radius: 10px;
  overflow-anchor: none;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
  border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
  border-radius 0.15s ease;
`;

const AccordionItem = styled.div`
    margin-bottom: 0;
    border: none !important;
    background-color: transparent !important;
`;

const AccordionText = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;

const SidebarBack = styled.div`
  background: ${({ theme }) => theme.deprecated_bg0} !important;
`;

const StyledVersion = styled.div`
  color: ${({ theme }) => theme.deprecated_text2};
  transition: 250ms ease color;
  font-size: 0.8rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
  ${({ theme }) => theme.mediaWidth.upToLarge`
    left: 0;
  `}
`;

export default function Header() {
  const { account, chainId } = useWeb3React();

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[
    account ?? ""
  ];
  // const [darkMode] = useDarkModeManager()
  // const { deprecated_white, deprecated_black } = useTheme()

  const toggleClaimModal = useToggleSelfClaimModal();

  const availableClaim: boolean = useUserHasAvailableClaim(account);

  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined);

  const showClaimPopup = useShowClaimPopup();

  const { pathname } = useLocation();

  const [darkMode, toggleDarkMode] = useDarkModeManager();

  const [discord, toggle] = useToggle(false);

  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  const {
    infoLink,
    nativeCurrency: { symbol: nativeCurrencySymbol }
  } = getChainInfoOrDefault(chainId);

  // work around https://github.com/remix-run/react-router/issues/8161
  // as we can't pass function `({isActive}) => ''` to className with styled-components
  const isPoolActive =
    pathname.startsWith("/pool") ||
    pathname.startsWith("/add") ||
    pathname.startsWith("/remove") ||
    pathname.startsWith("/increase") ||
    pathname.startsWith("/find");

  return (
    <div>
      <div className="resMob d-md-block d-lg-none">
        <SidebarBack className="navbar fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              <img src={Logo} width="150px" height="40px" alt="Logo" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar">
              <GiHamburgerMenu color={"#2577fa"} />
            </button>
            <SidebarBack
              className="offcanvas offcanvas-end"
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel">
              <div className="offcanvas-header">
                <div data-bs-dismiss="offcanvas" aria-label="Close">
                  <IoCloseSharp size={20} color={"#2577fa"} />
                </div>
              </div>
              <div className="offcanvas-body">
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                  <li className="nav-item" data-bs-dismiss="offcanvas">
                    {/* <StyledNavLink to={"/home"}>
                      <div className="d-flex align-items-center">
                        <MdHome className="headerIcon me-2" />
                        <Trans>Home</Trans>
                      </div>
                    </StyledNavLink> */}
                    <StyledExternalLink
                      href={"https://panaroma.finance/"}>
                      <div className="d-flex align-items-center">
                        <MdHome className="headerIcon me-2" />
                        <Trans>Home</Trans>
                      </div>
                    </StyledExternalLink>
                  </li>
                  {/* <li className="nav-item" data-bs-dismiss="offcanvas">
                    <StyledNavLink id={`bridge-nav-link`} to={"/bridge"}>
                      <div className="d-flex align-items-center">
                        <MdSwapHoriz className="headerIcon me-2" />
                        <Trans>Bridge</Trans>
                      </div>
                    </StyledNavLink>
                  </li> */}
                  <li className="nav-item" data-bs-dismiss="offcanvas">
                    <StyledNavLink id={`swap-nav-link`} to={"/swap"}>
                      <div className="d-flex align-items-center">
                        <MdSwapHoriz className="headerIcon me-2" />
                        <Trans>Swap</Trans>
                      </div>
                    </StyledNavLink>
                  </li>
                  <li className="nav-item" data-bs-dismiss="offcanvas">
                    <StyledNavLink id={`poolV1-nav-link`} to={"/pool/v1"}>
                      <div className="d-flex align-items-center">
                        <FaPiggyBank className="headerIcon me-2" />
                        <Trans>Pool</Trans>
                      </div>
                    </StyledNavLink>
                  </li>
                  <li className="nav-item" data-bs-dismiss="offcanvas">
                    <StyledNavLink id={`swap-nav-link`} to={"/referral"}>
                      <div className="d-flex align-items-center">
                        <MdSwapHoriz className="headerIcon me-2" />
                        <Trans>Referral</Trans>
                      </div>
                    </StyledNavLink>
                  </li>
                  {/* <li className="nav-item">
                    <StyledNavLink id={`referral-nav-link`} to={"/refers/ref/refID"}>
                      <div className="d-flex align-items-center">
                        <MdSwapHoriz className="headerIcon me-2" />
                        <Trans>Referralls</Trans>
                      </div>
                    </StyledNavLink>
                  </li> */}
                  <li className="nav-item">
                    {/* <StyledExternalLink id={`charts-nav-link`} href={infoLink}>
                      <div className="d-flex align-items-center">
                        <IoStatsChartSharp className="headerIcon me-2" />
                        <Trans>Markets</Trans>
                        <LinkIcon height={12}/>
                      </div>
                    </StyledExternalLink> */}
                  </li>
                  <li className="nav-item" data-bs-dismiss="offcanvas">
                    <StyledNavLink to={"/account"}>
                      <div className="d-flex align-items-center">
                        <FaUserAlt className="headerIcon me-2" />
                        <Trans>Account</Trans>
                      </div>
                    </StyledNavLink>
                  </li>
                  {/* <li className="nav-item">
                    <StyledExternalLink
                      href={"https://panaroma.finance/about-us/"}>
                      <div className="d-flex align-items-center">
                        <Info className="headerIcon me-2" />
                        <Trans>About</Trans>
                      </div>
                    </StyledExternalLink>
                  </li> */}
                  {/* <li className="nav-item">
                    <StyledExternalLink href={"#twoFactor"}>
                      <div className="d-flex align-items-center">
                        <MdVerifiedUser className="headerIcon me-2" />
                        <Trans>2FA</Trans>
                      </div>
                    </StyledExternalLink>
                  </li> */}
                  <li className="nav-item" data-bs-dismiss="offcanvas">
                    <ToggleMenuItem onClick={() => toggleDarkMode()}>
                      {darkMode ? (
                        <Sun className="headerIcon me-2" />
                      ) : (
                        <Moon className="headerIcon me-2" />
                      )}
                      <div>
                        {darkMode ? (
                          <Trans>Light Theme</Trans>
                        ) : (
                          <Trans>Dark Theme</Trans>
                        )}
                      </div>
                    </ToggleMenuItem>
                  </li>
                  {/* <li className="nav-item">
                    <StyledExternalLink href={"help"}>
                      <div className="d-flex align-items-center">
                        <BsQuestionCircleFill className="headerIcon me-2" />
                        <Trans>Help Center</Trans>
                      </div>
                    </StyledExternalLink>
                  </li>
                  <li className="nav-item">
                    <StyledNavLink to={"/swap"}>
                      <div className="d-flex align-items-center">
                        <GiCoffeeCup className="headerIcon me-2" />
                        <Trans>Request Features</Trans>
                      </div>
                    </StyledNavLink>
                  </li>
                  <li className="nav-item">
                    <div className="d-flex align-items-center">
                      <div className="accordion" id="accordionDiscord">
                        <AccordionItem>
                          <h2 className="accordion-header" id="headingDiscord">
                            <AccordianButton onClick={() => toggle()}
                              className=""
                              type="button"
                              data-bs-target="#collapseDiscord"
                              aria-controls="collapseDiscord">
                              <FaDiscord className="headerIcon me-2" />Discord
                            </AccordianButton>
                          </h2>
                          <div
                            id="collapseDiscord"
                            className={`accordion-collapse collapse ${discord ? "show" : ""}`}
                            aria-labelledby="headingDiscord"
                            data-bs-parent="#accordionDiscord">
                            <div className="accordion-body" style={{padding: "0", visibility: "visible", opacity: "1"}}>
                              <AccordionText>
                                <StyledExternalLink href={"https://discord.gg/ssJdka6U"}>
                                  <div className="d-flex align-items-center" style={{fontSize: "15px", paddingLeft: "14px"}}>
                                    <Trans>Join Our Community</Trans>
                                    <LinkIcon height={12}/>
                                  </div>
                                </StyledExternalLink>
                              </AccordionText>
                            </div>
                          </div>
                        </AccordionItem>
                      </div>
                    </div>
                  </li> */}
                  {/* <li className="nav-item">
                    <StyledNavLink to={'/swap'}>
                      <div className="d-flex align-items-center">
                        <Globe className="headerIcon me-2" />
                        <Trans>Language</Trans>
                      </div>
                    </StyledNavLink>
                  </li> */}
                  {/* <li className="nav-item">
                    <StyledNavLink to={"/swap"}>
                      <div className="d-flex align-items-center">
                        <FaDiscord className="headerIcon me-2" />
                        <Trans>Theme</Trans>
                      </div>
                    </StyledNavLink>
                  </li> */}
                  {/* <li className="nav-item">
                    <StyledExternalLink href={"docs"}>
                      <div className="d-flex align-items-center">
                        <SiReadthedocs className="headerIcon me-2" />
                        <Trans>Docs</Trans>
                      </div>
                    </StyledExternalLink>
                  </li>
                  <li className="nav-item">
                    <StyledExternalLink href={"docs"}>
                      <div className="d-flex align-items-center">
                        <MdPrivacyTip className="headerIcon me-2" />
                        <Trans>Legal & Privacy</Trans>
                      </div>
                    </StyledExternalLink>
                  </li> */}
                  {/* <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Dropdown
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                      </li>
                    </ul>
                  </li> */}
                </ul>
              </div>
            </SidebarBack>
          </div>
        </SidebarBack>
      </div>
      <div className="d-none d-lg-block">
        <HeaderFrame>
          <ClaimModal />
          <Title href=".">
            <PanaromaIcon>
              {/* <Logo fill={darkMode ? deprecated_white : deprecated_black} width="24px" height="100%" title="logo" /> */}
              <img src={Logo} width="150px" height="40px" alt="Logo" />
              <HolidayOrnament />
            </PanaromaIcon>
          </Title>
          <HeaderLinks>
            {/* <StyledNavLink to={"/home"}>
              <div className="d-flex align-items-center">
                <MdHome className="headerIcon me-2" />
                <Trans>Home</Trans>
              </div>
            </StyledNavLink> */}
            <StyledExternalLink
              href={"https://panaroma.finance/"}>
              <div className="d-flex align-items-center">
                <MdHome className="headerIcon me-2" />
                <Trans>Home</Trans>
              </div>
            </StyledExternalLink>
            <StyledNavLink id={`swap-nav-link`} to={"/swap"}>
              <div className="d-flex align-items-center">
                <MdSwapHoriz className="headerIcon me-2" />
                <Trans>Swap</Trans>
              </div>
            </StyledNavLink>
            {/* <StyledNavLink id={`bridge-nav-link`} to={"/bridge"}>
              <div className="d-flex align-items-center">
                <MdSwapHoriz className="headerIcon me-2" />
                <Trans>Bridge</Trans>
              </div>
            </StyledNavLink> */}
            <StyledNavLink id={`poolV1-nav-link`} to={"/pool/v1"}>
              <div className="d-flex align-items-center">
                <FaPiggyBank className="headerIcon me-2" />
                <Trans>Pool</Trans>
              </div>
            </StyledNavLink>
            <StyledNavLink id={`referral-nav-link`} to={"/referral"}>
              <div className="d-flex align-items-center">
                <MdSwapHoriz className="headerIcon me-2" />
                <Trans>Referral</Trans>
              </div>
            </StyledNavLink>
            {/* <StyledNavLink id={`referral-nav-link`} to={`/refers/ref/${account}`}>
              <div className="d-flex align-items-center">
                <MdSwapHoriz className="headerIcon me-2" />
                <Trans>Referralls</Trans>
              </div>
            </StyledNavLink> */}
            {/* <StyledExternalLink id={`charts-nav-link`} href={infoLink}>
              <div className="d-flex align-items-center">
                <IoStatsChartSharp className="headerIcon me-2" />
                <Trans>Markets</Trans>
                <LinkIcon height={12}/>
              </div>
            </StyledExternalLink> */}
            <StyledNavLink to={"/account"}>
              <div className="d-flex align-items-center">
                <FaUserAlt className="headerIcon me-2" />
                <Trans>Account</Trans>
              </div>
            </StyledNavLink>

            {/* <StyledNavLink to={"/twoFactor"}>
              <div className="d-flex align-items-center">
                <MdVerifiedUser className="headerIcon me-2" />
                <Trans>2FA</Trans>
              </div>
            </StyledNavLink> */}
            <ToggleMenuItem onClick={() => toggleDarkMode()}>
              {darkMode ? (
                <Sun className="headerIcon me-2" />
              ) : (
                <Moon className="headerIcon me-2" />
              )}
              <div>
                {darkMode ? (
                  <Trans>Light Theme</Trans>
                ) : (
                  <Trans>Dark Theme</Trans>
                )}
              </div>
            </ToggleMenuItem>
            {/* <StyledExternalLink href={"https://panaroma.finance/about-us/"}>
              <div className="d-flex align-items-center">
                <Info className="headerIcon me-2" />
                <Trans>About</Trans>
              </div>
            </StyledExternalLink> */}
            {/* <StyledExternalLink href={"help"}>
              <div className="d-flex align-items-center">
                <BsQuestionCircleFill className="headerIcon me-2" />
                <Trans>Help Center</Trans>
              </div>
            </StyledExternalLink>
            <div className="d-flex align-items-center">
              <div className="accordion" id="accordionDiscord">
                <AccordionItem>
                  <h2 className="accordion-header" id="headingDiscord">
                    <AccordianButton onMouseEnter={show} onMouseLeave={close}
                      className=""
                      type="button"
                      data-bs-target="#collapseDiscord"
                      aria-controls="collapseDiscord">
                      <FaDiscord className="headerIcon me-2" />Discord
                    </AccordianButton>
                  </h2>
                  <div
                    id="collapseDiscord"
                    className={`accordion-collapse collapse ${open ? "show" : ""}`}
                    aria-labelledby="headingDiscord"
                    data-bs-parent="#accordionDiscord" onMouseEnter={show} onMouseLeave={close}>
                    <div className="accordion-body" style={{padding: "0", visibility: "visible", opacity: "1"}}>
                      <AccordionText>
                        <StyledExternalLink href={"https://discord.gg/ssJdka6U"}>
                          <div className="d-flex align-items-center" style={{fontSize: "15px", paddingLeft: "14px"}}>
                            <Trans>Join Our Community</Trans>
                            <LinkIcon height={12}/>
                          </div>
                        </StyledExternalLink>
                      </AccordionText>
                    </div>
                  </div>
                </AccordionItem>
              </div> */}
            {/* <ExternalLink href={"https://discord.gg/ssJdka6U"} opacity={0.6} size={18}/> */}
            {/* </div> */}
            {/* <StyledNavLink to={'/swap'}>
              <div className="d-flex align-items-center">
                <Globe className="headerIcon me-2" />
                <Trans>Language</Trans>
              </div>
            </StyledNavLink> */}
            {/* <StyledExternalLink href={"docs"}>
              <div className="d-flex align-items-center">
                <SiReadthedocs className="headerIcon me-2" />
                <Trans>Docs</Trans>
              </div>
            </StyledExternalLink>
            <StyledExternalLink href={"docs"}>
              <div className="d-flex align-items-center">
                <MdPrivacyTip className="headerIcon me-2" />
                <Trans>Legal & Privacy</Trans>
              </div>
            </StyledExternalLink> */}
            <div className="socialMedia">
              <div className="d-flex align-items-center justify-content-between">
                <StyledExternalLink href={"https://www.youtube.com/channel/UCRb_W7k6D8fobWy8327TcEw"}>
                  <FaYoutube className="headerIcon me-2" />
                </StyledExternalLink>

                <StyledExternalLink href={"https://www.instagram.com/panaromafinance/"}>
                  <FaInstagram className="headerIcon me-2" />
                </StyledExternalLink>

                <StyledExternalLink href={"https://twitter.com/panaromafinance"}>
                  <FaTwitter className="headerIcon me-2" />
                </StyledExternalLink>

                <StyledExternalLink href={"https://www.facebook.com/panaromafinance"}>
                  <FaFacebookF className="headerIcon me-2" />
                </StyledExternalLink>
                <StyledExternalLink href={"https://discord.gg/xewNWscW"}>
                  <FaDiscord className="headerIcon me-2" />
                </StyledExternalLink>
              </div>
              <StyledVersion>
                <Trans>App Version</Trans>: 1.0.3
              </StyledVersion>
              <CopyRight>&copy; 2023 Panaroma Swap</CopyRight>
            </div>
          </HeaderLinks>

          <HeaderControls>
            <HeaderElement className="d-none">
              <NetworkSelector />
            </HeaderElement>
            <HeaderElement className="d-none">
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
                      {userEthBalance?.toSignificant(3)} {nativeCurrencySymbol}
                    </Trans>
                  </BalanceText>
                ) : null}
                <Web3Status />
              </AccountElement>
            </HeaderElement>
            {/* <HeaderElement>
              <Menu />
            </HeaderElement> */}
          </HeaderControls>
        </HeaderFrame>
      </div>
    </div>
  );
}