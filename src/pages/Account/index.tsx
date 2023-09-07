import styled from "styled-components/macro";
import { TYPE } from "../../theme";
import { useWeb3React } from "@web3-react/core";
import { getChainInfo } from "constants/chainInfo";
import { SupportedChainId } from "constants/chains";
import { useAppSelector } from "state/hooks";
import { getConnection, getIsMetaMask, getConnectionName } from "connection/utils";
import { Trans } from "@lingui/macro";
import { shortenAddress } from "../../utils";
import { FaPowerOff, FaEdit, FaRegCopy, FaExternalLinkAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAppDispatch } from "state/hooks";
import { updateSelectedWallet } from "state/user/reducer";
import { removeConnectedWallet } from "state/wallets/reducer";
import CopyHelper from "components/AccountDetails/Copy";
import { ExternalLink } from "../../theme";
import { ExplorerDataType, getExplorerLink } from "../../utils/getExplorerLink"
import { useToggleWalletModal } from "../../state/application/hooks";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import { RPC_URLS } from "constants/networks";

const Desc = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;
const CardBody = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.deprecated_bg0};
  border-radius: 20px;
  margin-bottom: 30px;
  padding: 20px;
  box-shadow: ;
`;

const InviteDesc = styled.div`
  font-size: 16px;
  color: #8691b4;

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`;

const AddressLink = styled(ExternalLink) <{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.deprecated_text3};
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: ${({ theme }) => theme.deprecated_text2};
  }
`;

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;

function shouldShowAlert(
    chainId: number | undefined
): chainId is SupportedChainId {
    return Boolean(
        chainId
    );
}

function WalletDetail() {
    const { account, connector, chainId, ENSName } = useWeb3React();
    const [showCopy, setShowCopy] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDisconnect, setShowDisconnet] = useState(false);
    const dispatch = useAppDispatch();
    const toggleWalletModal = useToggleWalletModal();



    const error = useAppSelector(
        (state) =>
            state.connection.errorByConnectionType[getConnection(connector).type]
    );

    if (!chainId) {
        return null;
    } else if (error) {
        return (
            <TYPE.mediumHeader>
                <Trans>Error</Trans>
            </TYPE.mediumHeader>
        );
    } else if (account) {
        return (
            <>
                <TYPE.mediumHeader className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                    {shortenAddress(account)}
                    <div className="d-flex" style={{ gap: "1rem" }}>
                        <CopyHelper toCopy={account} iconPosition="top" style={{ padding: "0" }}>
                            <span style={{ position: "relative" }} onMouseEnter={() => setShowCopy(true)} onMouseLeave={() => setShowCopy(false)}>
                                <FaRegCopy className="account-icon text-light" style={{ backgroundColor: "#0d6efd" }} />
                                <span className={`account-text mt-1 ${showCopy ? "" : "d-none"}`}>Copy</span>
                            </span>
                        </CopyHelper>
                        <span style={{ position: "relative" }} onMouseEnter={() => setShowEdit(true)} onMouseLeave={() => setShowEdit(false)}
                            onClick={toggleWalletModal}>
                            <FaEdit className="account-icon text-light" style={{ backgroundColor: "rgb(211 80 38)" }} />
                            <span className={`account-text mt-1 ${showEdit ? "" : "d-none"}`}>Change</span>
                        </span>
                        <span style={{ position: "relative" }} onMouseEnter={() => setShowDisconnet(true)} onMouseLeave={() => setShowDisconnet(false)}
                            onClick={() => {
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
                            }}>
                            <FaPowerOff className="account-icon text-light" style={{ backgroundColor: "rgb(161 16 0)" }} />
                            <span className={`account-text mt-1 ${showDisconnect ? "" : "d-none"}`}>Disconnect</span>
                        </span>
                    </div>
                </TYPE.mediumHeader>
            </>
        );
    } else {
        return null;
    }
}


export default function Account() {
    const { chainId, account, ENSName } = useWeb3React();
    const [status, setStatus] = useState(0);
    const [baseurl] = useState(process.env['REACT_APP_GAUTH_BASE_URL']);

    const [showStepTwoFA, setShowStepTwoFA] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [showreferral, setShowReferral] = useState(false);
    const [checkauth, setCheckAuth] = useState(true);
    const [enableDisable, setEnableDisable] = useState(false);
    const [current, setCurrent] = useState(0);
    const [errors, setError] = useState("");
    const [token, setToken] = useState("");
    const [show2FA, setShow2FA] = useState(false);
    const [isReferralRegistered, setIsReferralRegistered] = useState(false);

    const navigate = useNavigate();

    const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
    const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;


    useEffect(() => {
        // console.log("1111 status", status);

        function checklogin() {
            if (account == null) {
                setShowReferral(false);
                setShowLogout(true);
            } else {
                setShowReferral(true);
                setShowLogout(false);
            }
        }
        // console.log(showreferral, account, "account");
        checklogin();
        // console.log(chainId, "hello chainid");
        // console.log(account, "meta account");
        if (account) {
            checkAuth();
            isAddressGeneratedFunc();
            //  getBalance();
        }
    });

    async function checkAuth() {
        const payload = { metaMaskPrivateKey: account };
        await
            axios
                .get(baseurl + "checkauthenticator/" + account)
                .then(function (response) {
                    // console.log("&&&& response.data.status", response.data.status);

                    setStatus(response.data.status);
                    if (response.data.status === 1) {
                        setCheckAuth(false);
                        setEnableDisable(true);
                    } else if (response.data.status === 0) {
                        setCheckAuth(true);
                        setEnableDisable(false);
                    }
                    else if (response.data.status === 2) {
                        setShowStepTwoFA(true);
                        setCheckAuth(false);
                        setCurrent(3);
                    }
                });
        // console.log(token);
        // console.log("&&&& checkauth", checkauth);
    }

    const edauth = () => {
        // const payload = { status: status === 1 ? 2 : 1, metaMaskPrivateKey: account }
        setStatus(status === 1 ? 2 : 1);
        axios
            .post(baseurl + "EDAuth", {
                method: "POST",
                status: status === 1 ? 2 : 1,
                metaMaskPrivateKey: account,
                headers: {
                    // 'Authorization': `bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(function (response) {
                if (response.data) {
                    setCurrent(current + 1);
                } else {
                    setError("Invalid token. Please validate the token");
                }
            });
    };

    async function deleteUser() {
        axios
            .delete(baseurl + "deleteUser/" + account)
            .then(async (resp) => {
                // console.log(resp);
                setStatus(0);
            });
    }

    const verify = () => {
        const payload = { token, metaMaskPrivateKey: account };
        setError("");

        axios
            .post(baseurl + "verify", {
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
                    setShow2FA(false);
                    setError("");
                    deleteUser();
                } else {
                    setError("Invalid token. Please validate the token");
                }
            });
        // console.log(token);
    };

    async function isAddressGeneratedFunc() {
        // console.log("111111 response 22222");

        const contract = new web3.eth.Contract(jsonInt, contractAddress);

        const response = await contract.methods.getUserInfo(account).call();

        // console.log("111111 response 22222", response);



        if (response._pair == 0x0000000000000000000000000000000000000000) {
            setIsReferralRegistered(false);
        }
        else {
            setIsReferralRegistered(true);
        }
    }

    if (!shouldShowAlert(chainId)) {
        return null;
    }

    const networkLabel = getChainInfo(chainId).label;

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
    const contractAddress = process.env['REACT_APP_REF_FACTORY_ADDRESS'];
    const jsonInt = [{ "inputs": [{ "internalType": "address", "name": "_parent", "type": "address" }], "name": "createRefAddress", "outputs": [{ "internalType": "address", "name": "_pair", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserInfo", "outputs": [{ "internalType": "address", "name": "_pair", "type": "address" }, { "internalType": "address", "name": "_parent", "type": "address" }], "stateMutability": "view", "type": "function" }] as any;


    const contract = new web3.eth.Contract(jsonInt, contractAddress);

    const refWalletABI = [{
        "inputs": [], "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ValueReceived", "type": "event"
    }, {
        "inputs": [],
        "name": "checkReferral", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [],
        "name": "createdAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
    }, {
        "inputs": [],
        "name": "creator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function"
    }, {
        "inputs":
            [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
    }, {
        "inputs":
            [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_parent", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs":
            [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function"
    }, {
        "inputs":
            [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function"
    }, {
        "inputs":
            [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs":
            [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "withdrawTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    { "stateMutability": "payable", "type": "receive" }] as any;


    async function getBalance() {
        const response = await contract.methods.getUserInfo(account).call();

        const pairContract = new web3.eth.Contract(refWalletABI, response._pair);

        const balance = await pairContract.methods.getBalance(account).call()

        // console.log("88888 balance", balance);


    }

    return (
        <>
            <div className="row mt-3">
                <div className="col-md-12">
                    <div className="mainTitle">
                        <Trans>My Account Details</Trans>
                    </div>
                    <Desc className="mb-0 mt-3">
                        <Trans>View your account information to manage and secure your account.</Trans>
                    </Desc>
                </div>
            </div>

            <div className="mt-5">
                <CardBody>
                    <TYPE.mediumHeader><Trans>Account Information</Trans></TYPE.mediumHeader>
                    {account ? (
                        <div className="row mt-3">
                            <div className="col-12 col-md-4">
                                <InviteDesc><Trans>Wallet Address</Trans></InviteDesc>
                                <WalletDetail />
                            </div>
                            <div className="col-12 col-md-4">
                                <InviteDesc>{networkLabel} <Trans>Balance</Trans></InviteDesc>
                                <TYPE.mediumHeader>0.0000 PANA</TYPE.mediumHeader>
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-center text-center">
                                {ENSName ? (
                                    <>
                                        {chainId && account && (
                                            <AddressLink
                                                hasENS={!!ENSName}
                                                isENS={true}
                                                href={getExplorerLink(
                                                    chainId,
                                                    ENSName,
                                                    ExplorerDataType.ADDRESS
                                                )}>
                                                <h5 className="text-info"><Trans>Explore</Trans> <FaExternalLinkAlt fontSize={"13px"} /></h5>
                                            </AddressLink>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {chainId && account && (
                                            <AddressLink
                                                hasENS={!!ENSName}
                                                isENS={false}
                                                href={getExplorerLink(
                                                    chainId,
                                                    account,
                                                    ExplorerDataType.ADDRESS
                                                )}>
                                                <h5 className="text-info"><Trans>Explore</Trans> <FaExternalLinkAlt fontSize={"13px"} /></h5>
                                            </AddressLink>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3">
                            <h6 className="mb-0"> <Trans>Connect wallet for account information.</Trans></h6>
                        </div>
                    )
                    }
                </CardBody>
            </div>

            <div className="mt-5">
                {checkauth ? (
                    <CardBody>
                        <TYPE.mediumHeader><Trans>Google Authenticator</Trans></TYPE.mediumHeader>
                        <div className="mt-3 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                <Trans>2FA has not been Setup. Please setup</Trans>
                            </h6>
                            <button onClick={() => navigate("/twoFactor")} className="btn mt-3 mt-md-0 px-4 btn-primary">
                                <Trans>Setup 2FA</Trans>
                            </button>
                            {/* <button className="btn mt-3 mt-md-0 px-4 btn-primary">Enable</button> */}
                        </div>
                    </CardBody>) :
                    <CardBody>
                        <TYPE.mediumHeader><Trans>Google Authenticator</Trans></TYPE.mediumHeader>
                        <div className="mt-3 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                {/* Your account is not been enabled for 2FA with Google Authenticator, enable now. */}
                                <Trans>Your account is Enable for 2FA with Google Authenticator, If you wish to Disable, click on Disable button.</Trans>
                            </h6>
                            {/* <button onClick={(e) => edauth()} className="btn mt-md-0 px-4 btn-primary">
                                {status === 1 ? "Disable" : "Enable"}
                            </button> */}
                            {show2FA ? (<div>
                                <div className="verify-token">
                                    <div className="inbutContainer">
                                        <div className="custom-search twofa">
                                            <input
                                                onChange={(e) => { e.target.value = e.target.value.slice(0, 6); setToken(e.target.value) }}
                                                type="number"
                                                className="px-5 py-3 rounded border-0"
                                                placeholder="Enter 2FA"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={verify} className="ed-btn">
                                        Verify
                                    </button>
                                </div>
                                <p className="tokenValidation">{errors}</p>
                            </div>) : null}
                            {status === 1 || status === 2 ? <button onClick={(e) => setShow2FA(true)} className="btn mt-md-0 px-4 btn-danger">
                                Delete 2FA
                            </button> : null}

                            {/* <button className="btn mt-3 mt-md-0 px-4 btn-primary">Enable</button> */}
                        </div>
                    </CardBody>}
            </div>

            <div className="mt-5">
                <CardBody>
                    <TYPE.mediumHeader><Trans>Referral</Trans></TYPE.mediumHeader>

                    {isReferralRegistered ? (<div className="mt-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><Trans>You are registered as active referral on our platform.</Trans></h6>
                    </div>) : (<div className="mt-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><Trans>You are not registered as active referral on our platform.</Trans></h6>
                        <button onClick={() => navigate("/referral")} className="btn mt-3 mt-md-0 px-4 btn-primary"><Trans>Register</Trans></button>
                    </div>)}

                </CardBody>
            </div>

            {/* {status === 1 ? (<div>
                <Modal onDismiss={Function.prototype()} isOpen={true}>
                    <Trans>
                        This address is blocked on the Panaromaswap Labs interface because it is
                        associated with one or more
                    </Trans>
                </Modal>
            </div>) : null} */}

        </>
    )
}