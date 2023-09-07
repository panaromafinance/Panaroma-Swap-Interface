import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import { sendAnalyticsEvent, user } from "components/AmplitudeAnalytics";
import {
  CUSTOM_USER_PROPERTIES,
  EventName,
  WALLET_CONNECTION_RESULT
} from "components/AmplitudeAnalytics/constants";
import { sendEvent } from "components/analytics";
import { AutoColumn } from "components/Column";
import { AutoRow } from "components/Row";
import { ConnectionType } from "connection";
import {
  getConnection,
  getConnectionName,
  getIsCoinbaseWallet,
  getIsInjected,
  getIsMetaMask
} from "connection/utils";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "react-feather";
import { updateConnectionError } from "state/connection/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { updateSelectedWallet } from "state/user/reducer";
import { useConnectedWallets } from "state/wallets/hooks";
import styled from "styled-components/macro";
import { isMobile } from "utils/userAgent";

import { ReactComponent as Close } from "../../assets/images/x.svg";
import {
  useModalIsOpen,
  useToggleWalletModal
} from "../../state/application/hooks";
import {  addPopup, ApplicationModal } from "../../state/application/reducer";
import { ExternalLink, ThemedText } from "../../theme";
import AccountDetails from "../AccountDetails";
import { LightCard } from "../Card";
import Modal from "../Modal";
import {
  CoinbaseWalletOption,
  OpenCoinbaseWalletOption
} from "./CoinbaseWalletOption";
import { FortmaticOption } from "./FortmaticOption";
import {
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption
} from "./InjectedOption";
import PendingView from "./PendingView";
import { WalletConnectOption } from "./WalletConnectOption";
import axios from "axios";
import { Checkbox } from "components/SearchModal/styleds";
import { SupportedChainId } from "constants/chains";
import Web3 from "web3";	
import checkLastIntegrityFactoryABI from "../../abis/checkLastIntegrityFactory.json";	
import checkLastIntegrityStorageABI from "../../abis/checkLastIntegrityStorage.json";
import moment from "moment";

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.deprecated_text4};
  }
`;

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) =>
    props.color === "blue"
      ? ({ theme }) => theme.deprecated_primary1
      : "inherit"};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.deprecated_bg0};
  padding: 0 1rem 1rem 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
`;

const UpperSection = styled.div`
  position: relative;
  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }
  h5:last-child {
    margin-bottom: 0px;
  }
  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`;

const HoverText = styled.div`
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text1};
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`;

const OptionCardClickable = styled.div`
  margin-top: 0;
  background-color: ${({ theme }) => theme.deprecated_bg0};
  border: 1px solid ${({ theme }) => theme.deprecated_text5};
  padding: 1rem;
  border-radius: 20px;
  &:hover {
    border: 1px solid ${({ theme }) => theme.deprecated_bg3};
  }
`;

const Box = styled(Checkbox)`
  &:hover {
    cursor: pointer;
  }
`;

const WALLET_VIEWS = {
  OPTIONS: "options",
  ACCOUNT: "account",
  PENDING: "pending"
};

const sendAnalyticsEventAndUserInfo = (
  account: string,
  walletType: string,
  chainId: number | undefined,
  isReconnect: boolean
) => {
  const currentDate = new Date().toISOString();
  sendAnalyticsEvent(EventName.WALLET_CONNECT_TXN_COMPLETED, {
    result: WALLET_CONNECTION_RESULT.SUCCEEDED,
    wallet_address: account,
    wallet_type: walletType,
    is_reconnect: isReconnect
  });
  user.set(CUSTOM_USER_PROPERTIES.WALLET_ADDRESS, account);
  user.set(CUSTOM_USER_PROPERTIES.WALLET_TYPE, walletType);
  if (chainId)
    user.postInsert(CUSTOM_USER_PROPERTIES.WALLET_CHAIN_IDS, chainId);
  user.postInsert(
    CUSTOM_USER_PROPERTIES.ALL_WALLET_ADDRESSES_CONNECTED,
    account
  );
  user.setOnce(CUSTOM_USER_PROPERTIES.USER_FIRST_SEEN_DATE, currentDate);
  user.set(CUSTOM_USER_PROPERTIES.USER_LAST_SEEN_DATE, currentDate);
};

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName
}: {
  pendingTransactions: string[]; // hashes of pending
  confirmedTransactions: string[]; // hashes of confirmed
  ENSName?: string;
}) {
  const dispatch = useAppDispatch();
  const { connector, account, chainId, isActive } = useWeb3React();
  const [connectedWallets, updateConnectedWallets] = useConnectedWallets();
  

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [lastActiveWalletAddress, setLastActiveWalletAddress] = useState<
    string | undefined
  >(account);

  const [pendingConnector, setPendingConnector] = useState<
    Connector | undefined
  >();
  const pendingError = useAppSelector((state) =>
    pendingConnector
      ? state.connection.errorByConnectionType[
          getConnection(pendingConnector).type
        ]
      : undefined
  );

  // user must accept
  const [accepted, setAccepted] = useState(false);

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET);
  const toggleWalletModal = useToggleWalletModal();
  const token = "test";
  const [baseurl] = useState(process.env['REACT_APP_AUTH_BASE_URL']);
  // const [baseurl] = useState("https://valid.panaroma.finance/");

  const openOptions = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS);
  }, [setWalletView]);

  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS);
    }
  }, [walletModalOpen, setWalletView, account]);

  useEffect(() => {
    if (pendingConnector && walletView !== WALLET_VIEWS.PENDING) {
      updateConnectionError({
        connectionType: getConnection(pendingConnector).type,
        error: undefined
      });
      setPendingConnector(undefined);
    }
  }, [pendingConnector, walletView]);

  // When new wallet is successfully set by the user, trigger logging of Amplitude analytics event.
  useEffect(() => {
    if (account && account !== lastActiveWalletAddress) {
      const walletType = getConnectionName(
        getConnection(connector).type,
        getIsMetaMask()
      );

      if (
        connectedWallets.filter(
          (wallet) =>
            wallet.account === account && wallet.walletType === walletType
        ).length > 0
      ) {
        sendAnalyticsEventAndUserInfo(account, walletType, chainId, true);
      } else {
        sendAnalyticsEventAndUserInfo(account, walletType, chainId, false);
        updateConnectedWallets({ account, walletType });
      }
    }
    setLastActiveWalletAddress(account);
  }, [
    connectedWallets,
    updateConnectedWallets,
    lastActiveWalletAddress,
    account,
    connector,
    chainId
  ]);

  const tryActivationUserWallet = useCallback(
    async (connector: Connector) => {
      const connectionType = getConnection(connector).type;

      // log selected wallet
      sendEvent({
        category: "Wallet",
        action: "Change Wallet",
        label: connectionType
      });

      try {

        // Fortmatic opens it's own modal on activation to log in. This modal has a tabIndex
        // collision into the WalletModal, so we special case by closing the modal.
        if (connectionType === ConnectionType.FORTMATIC) {
          toggleWalletModal();
        }

        setPendingConnector(connector);
        setWalletView(WALLET_VIEWS.PENDING);
        dispatch(updateConnectionError({ connectionType, error: undefined }));

        await connector.activate();

        dispatch(updateSelectedWallet({ wallet: connectionType }));

        // registerAddress();

        if (account) {	
          const checkIntegrityResponse = await checkLastIntegrity();	
          if (checkIntegrityResponse) {	
            console.log("969696 tryActivation", checkIntegrityResponse.UpdatedTime, parseInt((new Date().valueOf() / 1000).toString()),	
              new Date(checkIntegrityResponse.UpdatedTime * 1000), new Date().toLocaleString());	
            const timeDifferenceInDays = await getTimeDifference(checkIntegrityResponse.UpdatedTime)	
            if (timeDifferenceInDays >= 6) {	
              const updateResponse = await updateValidation();	
              if (updateResponse) {	
                console.log("969696 tr updateResponse", updateResponse);	
                if (updateResponse.status && updateResponse.message.risk.toLowerCase() !== "severe") {	
                  if (connectionType === ConnectionType.FORTMATIC) {	
                    toggleWalletModal();	
                  }	
                  setPendingConnector(connector);	
                  setWalletView(WALLET_VIEWS.PENDING);	
                  dispatch(updateConnectionError({ connectionType, error: undefined }));	
                  await connector.activate();	
                  dispatch(updateSelectedWallet({ wallet: connectionType }));	
                  return;	
                }	
                else {	
                  //stop connecting wallet and stop user to perform any action	
                  return;	
                }	
              }	
            }	
            console.log("969696 tr 01010101 timeDifference", timeDifferenceInDays);	
            if (connectionType === ConnectionType.FORTMATIC) {	
              toggleWalletModal();	
            }	
            setPendingConnector(connector);	
            setWalletView(WALLET_VIEWS.PENDING);	
            dispatch(updateConnectionError({ connectionType, error: undefined }));	
            await connector.activate();	
            dispatch(updateSelectedWallet({ wallet: connectionType }));	
          }	
        }
        
      } catch (error) {
        console.debug(`web3-react connection error: ${error}`);
        dispatch(
          updateConnectionError({ connectionType, error: error.message })
        );

        sendAnalyticsEvent(EventName.WALLET_CONNECT_TXN_COMPLETED, {
          result: WALLET_CONNECTION_RESULT.FAILED,
          wallet_type: getConnectionName(connectionType, getIsMetaMask())
        });
      }
    },
    [dispatch, toggleWalletModal]
  );

  const tryActivation = (connector: Connector) => {
    const chain = window.ethereum?.networkVersion 

    if(chain && chain !== SupportedChainId.POLYGON.toString()) {
      toggleWalletModal()
      dispatch(
        addPopup({
          content: { failedSwitchNetwork: chain },
          key: `failed-network-switch`
        })
      );
    } else {
      tryActivationUserWallet(connector)
    }

  }

  async function getTimeDifference(lastUpdatedTime: any) {	
    const startDate = new Date().toUTCString()	
    const endDate = new Date(lastUpdatedTime * 1000).toUTCString();	
    const m1 = moment(moment(endDate), 'DD-MM-YYYY HH:mm');	
    const m2 = moment(moment(startDate), 'DD-MM-YYYY HH:mm');	
    const m3 = m2.diff(m1, 'minutes');	
    const m4 = m2.diff(m1, 'h');	
    const numdays = Math.floor(m3 / 1440);	
    const numhours = Math.floor((m3 % 1440) / 60);	
    const numminutes = Math.floor((m3 % 1440) % 60);	
    // return numdays + " day(s) " + numhours + "h " + numminutes + "m";	
    console.log("969696 tr numdays day h numminutes m", startDate, endDate, numdays + " day(s) " + numhours + "h " + numminutes + "m");	
    if (numdays < 0) {	
      return -0;	
    }	
    else {	
      // return numdays + " day(s) " + numhours + "h " + numminutes + "m";	
      return numdays;	
    }	
  }	

  const web3Polygon = new Web3(new Web3.providers.HttpProvider("https://light-warmhearted-shape.matic-testnet.discover.quiknode.pro/2c2c5a4057e54f6bf01753d67128b6d8a50556c5/"))	
  
  async function checkLastIntegrity() {	

    const contractFact = new web3Polygon.eth.Contract(checkLastIntegrityFactoryABI as any, process.env.REACT_APP_VALIDATION_CONTRACT);	
    const responsefact = await contractFact.methods.getUserInfo(account).call();	
	
    const contractStorage = new web3Polygon.eth.Contract(checkLastIntegrityStorageABI as any, responsefact);	
    const responseStorage = await contractStorage.methods.checkAnalysis(account).call();	
    return responseStorage;	
  }


  function getOptions() {
    const isInjected = getIsInjected();
    const isMetaMask = getIsMetaMask();
    const isCoinbaseWallet = getIsCoinbaseWallet();

    const isCoinbaseWalletBrowser = isMobile && isCoinbaseWallet;
    const isMetaMaskBrowser = isMobile && isMetaMask;
    const isInjectedMobileBrowser = false

      // console.log(isInjectedMobileBrowser, isCoinbaseWalletBrowser, isMetaMaskBrowser,"isMetaMaskBrowserisMetaMaskBrowser");
      

    let injectedOption;
    if (!isInjected) {
      if (!isMobile) {
        injectedOption = <InstallMetaMaskOption disabled={!accepted}/>;
      }
    } else if (!isCoinbaseWallet) {
      if (isMetaMask) {
        injectedOption = <MetaMaskOption tryActivation={tryActivation} disabled={!accepted}/>;
      } else {
        injectedOption = <InjectedOption tryActivation={tryActivation} disabled={!accepted}/>;
      }
    }

    let coinbaseWalletOption;
    if (isMobile && !isInjectedMobileBrowser) {
      coinbaseWalletOption = <OpenCoinbaseWalletOption disabled={!accepted}/>;
    } else if (!isMobile || isCoinbaseWalletBrowser) {
      coinbaseWalletOption = (
        <CoinbaseWalletOption tryActivation={tryActivation} disabled={!accepted}/>
      );
    }

    const walletConnectionOption =
      (!isInjectedMobileBrowser && (
        <WalletConnectOption tryActivation={tryActivation} disabled={!accepted}/>
      )) ??
      null;

    const fortmaticOption =
      (!isInjectedMobileBrowser && (
        <FortmaticOption tryActivation={tryActivation} disabled={!accepted}/>
      )) ??
      null;

    return (
      <>
        {injectedOption}
        {coinbaseWalletOption}
        {walletConnectionOption}
        {fortmaticOption}
      </>
    );
  }

  function getModalContent() {
    if (walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={openOptions}
        />
      );
    }

    let headerRow;
    if (walletView === WALLET_VIEWS.PENDING) {
      headerRow = null;
    } else if (walletView === WALLET_VIEWS.ACCOUNT || !!account) {
      headerRow = (
        <HeaderRow color="blue">
          <HoverText
            onClick={() =>
              setWalletView(
                account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS
              )
            }>
            <ArrowLeft />
          </HoverText>
        </HeaderRow>
      );
    } else {
      headerRow = (
        <HeaderRow>
          <HoverText>
            <Trans>Connect a wallet</Trans>
          </HoverText>
        </HeaderRow>
      );
    }

    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {headerRow}
        <ContentWrapper>
          <AutoColumn>
            <OptionCardClickable>
              <div className="d-flex align-items-center gap-2" style={{fontSize: '13px'}}>
                <Box
                  name="confirmed"
                  type="checkbox"
                  checked={accepted}
                  onChange={() => setAccepted(!accepted)}
                />
                <span onClick={() => setAccepted(!accepted)}>
                  <Trans>Accept Panaroma Swap</Trans>
                  <ExternalLink href="https://panaroma.finance/terms-of-use/">{' '}
                    <Trans>Terms of Use</Trans>
                  </ExternalLink>{' '}<Trans>and</Trans>{' '}
                  <ExternalLink href="https://panaroma.finance/privacy-policy/">
                    <Trans>Privacy Policy</Trans>
                  </ExternalLink>.{' '}
                  <br/>
                  <span style={{fontSize: '11px'}}><Trans> Last updated</Trans></span>: 7 July 2023
                </span>
              </div>
            </OptionCardClickable>
          </AutoColumn>
        </ContentWrapper>
        <ContentWrapper>
          <AutoColumn gap="16px">
            {walletView === WALLET_VIEWS.PENDING && pendingConnector && (
              <PendingView
                openOptions={openOptions}
                connector={pendingConnector}
                error={!!pendingError}
                tryActivation={tryActivation}
              />
            )}
            {walletView !== WALLET_VIEWS.PENDING && (
              <OptionGrid data-testid="option-grid">{getOptions()}</OptionGrid>
            )}
            {!pendingError && (
              <LightCard>
                <AutoRow style={{ flexWrap: "nowrap" }}>
                  <ThemedText.DeprecatedBody fontSize={12}>
                    <Trans>
                      By connecting a wallet, you agree to Panaroma Swap & Panaroma Finance’{" "}
                      <ExternalLink
                        style={{ textDecoration: "underline" }}
                        href="https://panaroma.finance/terms-of-use/">
                        Terms of Service
                      </ExternalLink>{" "}
                      and acknowledge that you have read and understand the
                      Panaroma Swap{" "}
                      <ExternalLink
                        style={{ textDecoration: "underline" }}
                        href="https://panaroma.finance/privacy-policy/">
                        Protocol Disclaimer
                      </ExternalLink>
                      .
                    </Trans>
                  </ThemedText.DeprecatedBody>
                </AutoRow>
              </LightCard>
            )}
          </AutoColumn>
        </ContentWrapper>
      </UpperSection>
    );
  }

  async function registerAddress() {
    axios
    .post(baseurl + "registerAddress", {
      method: "POST",
      address: account,
      token,
      headers: {
        // 'Authorization': `bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    .then(function (response) {
      if (response.data) {
        // needs to check
         
      } else {
        
      }
    });
  }

  async function updateValidation(): Promise<any> {	
    const updateAPIRouteValue = await updateAddressRouteFunc();	
    console.log("010101 ", baseurl + updateAPIRouteValue);	
    axios	
      .post(baseurl + updateAPIRouteValue, {	
        method: "POST",	
        address: account,	
        headers: {	
          // 'Authorization': `bearer ${token}`,	
          "Content-Type": "application/json"	
        }	
      })	
      .then(function async(response) {	
        console.log("010101 response", response);	
        if (response.data) {	
          // needs to check	
          return response.data;	
        } else {	
          return null;	
        }	
      });	
  }	
  async function updateAddressRouteFunc() {	
    switch (chainId) {	
      case SupportedChainId.ARBITRUM_ONE:	
      case SupportedChainId.ARBITRUM_GOERLI:	
        return "updateValidationArbitrum";	
        // setValidAPIRoute("isValidAddressArbitrum");	
        // setRegisterAPIRoute("registerAddressArbitrum");	
        break;	
      case SupportedChainId.GOERLI:	
      case SupportedChainId.MAINNET:	
        return "updateValidationETH";	
        // setValidAPIRoute("isValidAddressETH");	
        // setRegisterAPIRoute("registerAddressETH");	
        break;	
      case SupportedChainId.OPTIMISM:	
      case SupportedChainId.OPTIMISTIC_GOERLI:	
        return "updateValidationOptimism";	
        // setValidAPIRoute("isValidAddressOptimism");	
        // setRegisterAPIRoute("registerAddressOptimism");	
        break;	
      case SupportedChainId.POLYGON:	
      case SupportedChainId.POLYGON_MUMBAI:	
        return "updateValidationPolygon";	
        // setValidAPIRoute("isValidAddressPolygon");	
        // setRegisterAPIRoute("registerAddressPolygon");	
        break;	
      default:	
        return "updateValidationPolygon";	
        // setValidAPIRoute("isValidAddressPolygon");	
        // setRegisterAPIRoute("registerAddressPolygon");	
        break;	
    }
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={toggleWalletModal}
      minHeight={false}
      maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  );
}