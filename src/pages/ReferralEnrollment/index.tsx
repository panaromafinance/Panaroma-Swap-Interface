import styled from "styled-components/macro";
import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import Web3Status from "components/Web3Status";
import { Trans } from "@lingui/macro";
import { getChainInfoOrDefault } from "constants/chainInfo";
// import NetworkSelector from 'components/Header/NetworkSelector'
import { useNativeCurrencyBalances } from "state/connection/hooks";
import Button from "react-bootstrap/Button";
import { Text } from "rebass";
// import { MdOutlineContentCopy } from "react-icons/md";
import { SupportedChainId } from "constants/chains";
import { RPC_URLS } from "constants/networks";
import axios from "axios";

import { CustomLightSpinner } from "../../theme";
import Circle from "../../assets/images/blue-loader.svg";

import { addPopup } from "state/application/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";

import TransactionConfirmationModal, {
  ConfirmationModalContent
} from "../../components/TransactionConfirmationModal";
import {
  ButtonPrimary
} from "../../components/Button";
import { useTransaction } from "../../state/transactions/hooks";
import { useTransactionAdder } from "../../state/transactions/hooks";
import { TransactionType } from "../../state/transactions/types";

const Desc = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

const ReferralTitle = styled.div`
  font-size: 35px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 20px;
  }
`;
const TextTheme = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;
const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) =>
    !active ? theme.deprecated_bg0 : theme.deprecated_bg0};
  border-radius: 16px;
  white-space: nowrap;
  width: 20%;
  height: 40px;
  margin: auto;

  :focus {
    border: 1px solid blue;
  }
`;

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`;

export default function ReferralEnrollment() {
  const refID = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { account, chainId, provider } = useWeb3React();
  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[
    account ?? ""
  ];

  let refIDAdd = refID.refID;
  const [current, setCurrent] = useState(0);
  const [disNextBtn, setDisNextBtn] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [hideProgress, setHideProgress] = useState(false);
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [isSameUserAsReferral, setIsSameUserAsReferral] = useState(false);
  const [userReferralExist, setUserReferralExist] = useState(false);

  // ETH CHAINID
  const [ethPending, setEthPending] = useState(false)
  const [ethSuccess, setEthSuccess] = useState(false)
  const [ethtryAgain, setEthTryAgain] = useState(false)
  const [etheremReferralAddress, setEtheremReferralAddress] = useState("")
  const [ethremAddressBalance, setEthremAddressBalance] = useState("")

  // POLY CHAINID
  const [polyPending, setPolyPending] = useState(true)
  const [polySuccess, setPolySuccess] = useState(false)
  const [polytryAgain, setPolyTryAgain] = useState(false)
  const [polyReferralAddress, setPolyReferralAddress] = useState("")
  const [polyAddressBalance, setPolyAddressBalance] = useState("")

  // // OPTIMISM CHAINID
  const [optimismPending, setOptimismPending] = useState(false)
  const [optimismSuccess, setOptimismSuccess] = useState(false)
  const [optimismReferralAddress, setOptimismReferralAddress] = useState("")

  // // ARBITRUM CHAINID
  const [arbitrumPending, setArbitrumPending] = useState(false)
  const [arbitrumSuccess, setArbitrumSuccess] = useState(false)
  const [arbitrumReferralAddress, setArbitrumReferralAddress] = useState("")

  // // CELO CHAINID
  // const [celoPending, setCeloPending] = useState(false)
  // const [celoSuccess, setCeloSuccess] = useState(false)
  // const [celotryAgain, setCeloTryAgain] = useState(false)

  //loader
  const [ethloading, setEthLoading] = useState(false)
  const [polyloading, setPolyLoading] = useState(false)
  const [arbloading, setArbLoading] = useState(false)
  const [optimismloading, setOptimismLoading] = useState(false)

  const [referralId, setReferralId] = useState('');

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // const [showDetailed, setShowDetailed] = useState<boolean>(true);
  const [txStart, setTxStart] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>("");
  const addTransaction = useTransactionAdder();
  const tx = useTransaction(txHash ?? undefined);

  const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
  const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

  const {
    infoLink,
    nativeCurrency: { symbol: nativeCurrencySymbol },
    explorer
  } = getChainInfoOrDefault(chainId);

  // get and set the web3 contract link to fetch referral address and balance
  let web3 = new Web3(
    new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
  );

  useEffect(() => {
    // console.log("11111111111111", chainId, explorer);

    // if (account != null) {
    //   //check here if any contract referral not generated. show try again and wait the user to complete

    //   if (chainId == 0x1) {
    //     setDisNextBtn(false);
    //     setCorrectNetwork(true);
    //   } else {
    //     setCorrectNetwork(true);
    //   }
    // }

    if (refID === undefined) {
      setShowProgress(true);
      setCurrent(0);

      return;
    }
    if (refIDAdd === account) {
      setDisNextBtn(true)
      setUserReferralExist(true);
    }

  }, [account]);


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
  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    if (!txStart) updateLoader(referralId, false);
    setTxHash("");
  }, [txHash, referralId, txStart]);

  function modalHeader() {
    return (
      <div className="py-4">
        <span><Trans>You are going to generate referral pair.</Trans></span>
        <div className="py-2" style={{ color: '#80879f' }}>
          <Trans>Earn up to 20% from friends swap commission on Panaswap and 5% from their earnings on Farms & Launchpools</Trans>
        </div>
      </div>
    );
  }

  function modalBottom() {
    return (
      <>
        <ButtonPrimary
          onClick={() => checkRegistration(referralId)}>
          <Text fontWeight={500} fontSize={20}>
            <Trans>Confirm</Trans>
          </Text>
        </ButtonPrimary>
      </>
    );
  }

  const pendingText = (
    <Trans>
      Referral registration is in progress.
    </Trans>
  );

  // const contractAddress = "0xc94648E6A491f114C2EBfCDEb453D004440cEC6e";
  const contractAddress = process.env['REACT_APP_REF_FACTORY_ADDRESS'];
  const [referralURL] = useState(process.env['REACT_APP_REFERRAL_BASE_URL']);


  // const listofNetworkForReferral = [SupportedChainId.MAINNET, SupportedChainId.POLYGON, SupportedChainId.OPTIMISM, SupportedChainId.ARBITRUM_ONE]
  // const listofNetworkForReferral = [SupportedChainId.POLYGON_MUMBAI, SupportedChainId.GOERLI, SupportedChainId.OPTIMISTIC_GOERLI, SupportedChainId.ARBITRUM_GOERLI]
  const listofNetworkForReferralMainnet = [SupportedChainId.MAINNET, SupportedChainId.POLYGON, SupportedChainId.OPTIMISM, SupportedChainId.ARBITRUM_ONE];
  const listofNetworkForReferralTestNet = [SupportedChainId.POLYGON_MUMBAI, SupportedChainId.GOERLI, SupportedChainId.OPTIMISTIC_GOERLI, SupportedChainId.ARBITRUM_GOERLI]
  const listofNetworkForReferral = process.env.REACT_APP_IsDev === "true" ? listofNetworkForReferralTestNet : listofNetworkForReferralMainnet;

  async function checkRegistration(generateReferralchainId) {
    if (refIDAdd === "undefined" && account != null)
      refIDAdd = account;

    const jsonInt = [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_parent",
            type: "address"
          }
        ],
        name: "createRefAddress",
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
        inputs: [
          {
            internalType: "address",
            name: "user",
            type: "address"
          }
        ],
        name: "getUserInfo",
        outputs: [
          {
            internalType: "address",
            name: "_pair",
            type: "address"
          },
          {
            internalType: "address",
            name: "_parent",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      }
    ] as any;
    // console.log("222 11111 web3", web3);
    updateRPCURLS(generateReferralchainId);

    setAttemptingTxn(true);

    const contract = new web3.eth.Contract(jsonInt, contractAddress);

    // console.log("111111 response 22222 refIDAdd", refIDAdd);

    try {
      const response = await contract.methods.getUserInfo(account).call();
      // updateAddressOfChain(response._pair)

      const deployerAddress = process.env['REACT_APP_DEPLOYER_REF_ADDRESS'];

      if (response._pair == 0x0000000000000000000000000000000000000000) {
        setShowProgress(true);

        const td = web3.eth.abi.encodeFunctionCall(
          {
            name: "createRefAddress",
            type: "function",
            inputs: [
              {
                type: "address",
                name: "_parent"
              }
            ]
          },
          [refIDAdd ? refIDAdd : deployerAddress!]
        );

        const txns = {
          from: account,
          to: contractAddress,
          data: td
        };

        try {
          const txHashh = await window.ethereum?.request({
            method: "eth_sendTransaction",
            params: [txns]
          });
          setTxStart(true)

          if (txHashh) {
            setTimeout(async () => {
              const res = await contract.methods.getUserInfo(account).call();

              const storeTxhash = txHashh;

              setAttemptingTxn(false);

              addTransaction(txHashh, {
                type: TransactionType.REFERRAL
              });

              setTxHash(txHashh);
              // setPolygonAddress(res._pair);

              provider?.getTransactionReceipt(txHashh).then((receipt) => {
                if (receipt && receipt.status === 1) {
                  updateAddressOfChain(generateReferralchainId)
                  updateDatabase()
                }
                setTxStart(false)
              }).catch(error => {
                dispatch(
                  addPopup({
                    content: { rejectAction: error.message ? error.message : "Failed" },
                    key: `reject-action`
                  })
                )
              })

              // updateAddressOfChain(generateReferralchainId)
              updateLoader(generateReferralchainId, false)
              // setTotalEarnedBalance(0);
            }, 30000);
          } else {
            setTxStart(false);
            setAttemptingTxn(false);
            updateLoader(generateReferralchainId, false)
          }

        } catch (error) {
          setTxStart(false);
          setAttemptingTxn(false);
          updateLoader(generateReferralchainId, false)
          dispatch(
            addPopup({
              content: { rejectAction: error.message ? error.message : "Failed" },
              key: `reject-action`
            })
          )
        }

        const response = await contract.methods.getUserInfo(account).call();

      } else {
        // setHideProgress(true);

        // [TODO: 80001 for testing]
        setAttemptingTxn(false);
        updateLoader(generateReferralchainId, false)
        if (current === 0 && (chainId === 1 || chainId === 134 || chainId === 80001))
          nextStepTwo();
      }

    } catch (error) {
      setAttemptingTxn(false);
      updateLoader(generateReferralchainId, false)
      dispatch(
        addPopup({
          content: { rejectAction: error.message ? error.message : "Failed" },
          key: `reject-action`
        })
      )
    }

    ///response shows pair and parent
    ///pair is user's already created wallet if is address(0) then user does not
    ///have a wallet and has to create it.
  }

  const jsonInt = [{ "inputs": [{ "internalType": "address", "name": "_parent", "type": "address" }], "name": "createRefAddress", "outputs": [{ "internalType": "address", "name": "_pair", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserInfo", "outputs": [{ "internalType": "address", "name": "_pair", "type": "address" }, { "internalType": "address", "name": "_parent", "type": "address" }], "stateMutability": "view", "type": "function" }] as any;

  async function nextStepTwo() {
    setCurrent(current + 1);


    if (refIDAdd === "undefined" && account != null)
      refIDAdd = account;

    for (let index = 0; index < listofNetworkForReferral.length; index++) {
      updateRPCURLS(listofNetworkForReferral[index]);

      updateLoader(listofNetworkForReferral[index], true)
      const contract = new web3.eth.Contract(jsonInt, contractAddress);

      try {
        const response = await contract.methods.getUserInfo(account).call();

        if (response._pair == 0x0000000000000000000000000000000000000000) {
          updateAddressOfChainEmpty(listofNetworkForReferral[index])
          updateLoader(listofNetworkForReferral[index], false)

        }
        else {
          const contract = new web3.eth.Contract(jsonInt, contractAddress);

          const response = await contract.methods.getUserInfo(account).call();

          updateAddressOfChain(listofNetworkForReferral[index])
          updateLoader(listofNetworkForReferral[index], false)
          // getBalance(response._pair);
        }

      } catch (error) {
        updateLoader(listofNetworkForReferral[index], false)
        dispatch(
          addPopup({
            content: { rejectAction: error.message ? error.message : "Failed" },
            key: `reject-action`
          })
        )
      }
    }
  }

  async function updateRPCURLS(selectedNetworkChainId) {
    // console.log("2323 56 chainId", selectedNetworkChainId, chainId);

    switch (selectedNetworkChainId) {
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
  }

  async function viewOrGenerateReferralID(generateReferralchainId) {
    // const listOfNetworks = [SupportedChainId.MAINNET, SupportedChainId.POLYGON, SupportedChainId.POLYGON_MUMBAI, SupportedChainId.ARBITRUM_ONE, SupportedChainId.OPTIMISM]

    updateLoader(generateReferralchainId, true)

    switch (generateReferralchainId) {
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
    setShowConfirm(true)
    setReferralId(generateReferralchainId)
    // checkRegistration(generateReferralchainId);

  }

  async function updateDatabase() {
    axios
      .post(referralURL + "reffLink", {
        method: "POST",
        userId: account,
        chainId,
        // token,
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(function (response) {
        // console.log("&&&& response", response);
        if (response.data) {
          // setDisbtn(false);
          // setLockBtn(false);
          // setError("");
          // setIs2FAVerified(true);
          // setVerifyModalClass("modal fade hide")
          // $('#exampleModal').openModal();
        } else {
          // setLockBtn(true);
          // setIs2FAVerified(false);
          // setError("Invalid Code. Please enter the correct code from authenticator");
        }
      });
  }

  const next = () => {
    setCurrent(current + 1)
  }

  // const prev = () => {
  //   setCurrent(current - 1)
  // }

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

  async function updateLoader(generateReferralchainId, text) {
    setReferralId(generateReferralchainId);

    switch (generateReferralchainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:

        setArbLoading(text)
        break;
      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:

        setEthLoading(text)
        break;
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        setOptimismLoading(text)
        break;
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        setPolyLoading(text)
        break;

      default:
        setPolyLoading(text)
        break;
    }
  }

  async function updateAddressOfChain(generateReferralchainId) {
    const contract = new web3.eth.Contract(jsonInt, contractAddress);
    const response = await contract.methods.getUserInfo(account).call();


    switch (generateReferralchainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:
        setArbitrumSuccess(true);
        setArbitrumPending(false);

        setArbitrumReferralAddress(response._pair);
        // setIsAddressGenerated(true);
        break;
      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:
        setEthSuccess(true);
        setEthPending(false);

        setEtheremReferralAddress(response._pair);
        // setIsAddressGenerated(true);
        break;
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        // setIsAddressGenerated(true);
        setOptimismReferralAddress(response._pair)
        setOptimismSuccess(true);
        setOptimismPending(false);

        break;
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        // setIsAddressGenerated(true);
        setPolyReferralAddress(response._pair)
        setPolySuccess(true);
        setPolyPending(false);
        break;

      default:
        setPolyReferralAddress(response._pair)
        setPolySuccess(true);
        setPolyPending(false);
        break;
    }
  }

  async function updateAddressOfChainEmpty(generateReferralchainId) {
    const contract = new web3.eth.Contract(jsonInt, contractAddress);
    const response = await contract.methods.getUserInfo(account).call();


    switch (generateReferralchainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:

        setArbitrumReferralAddress("");
        // setIsAddressGenerated(false);
        break;
      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:

        setEtheremReferralAddress("");
        // setIsAddressGenerated(false);
        break;
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        // setIsAddressGenerated(false);
        setOptimismReferralAddress("")
        break;
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        // setIsAddressGenerated(false);
        setPolyReferralAddress("")
        break;

      default:
        setPolyReferralAddress("")
        break;
    }
  }


  async function withdraw(withdrawAddress: string) {
    // let refWalletABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ValueReceived", "type": "event" }, { "inputs": [], "name": "checkReferral", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "createdAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "creator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_parent", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "withdrawTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]
    const _pair = withdrawAddress; //_pairAddress

    const pairContract = new web3.eth.Contract(refWalletABI, _pair); const Tdata = web3.eth.abi.encodeFunctionCall(
      {
        name: "withdrawTokens",
        type: "function",
        inputs: [
          {
            type: "address",
            name: "_tokenContract",
          },
        ],
      },
      [_pair]
    );
    ///_pairAddress at [""]   
    const params = {
      from: window.ethereum?.selectedAddress,
      to: polyReferralAddress, //_pairAddress
      data: Tdata,
    };
    const d_resp = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [params],
    });

    // console.log("1111 d_resp", d_resp);
  }

  // async function getBalance(pairAddress: string) {
  //   // let refWalletABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ValueReceived", "type": "event" }, { "inputs": [], "name": "checkReferral", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "createdAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "creator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_parent", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "withdrawTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]
  //   const _pair = pairAddress; //_pairAddress

  //   console.log("11111 inside balance", chainId);

  //   const contract = new web3.eth.Contract(jsonInt, contractAddress);

  //   const response = await contract.methods.getUserInfo(account).call();



  //   const pairContract = new web3.eth.Contract(refWalletABI, _pair);
  //   const Tdata = web3.eth.abi.encodeFunctionCall(
  //     {
  //       name: "withdrawTokens",
  //       type: "function",
  //       inputs: [
  //         {
  //           type: "address",
  //           name: "_tokenContract",
  //         },
  //       ],
  //     },
  //     [_pair]
  //   );

  //   const balance = await pairContract.methods.getBalance(account).call()

  //   switch (chainId) {
  //     case SupportedChainId.ARBITRUM_ONE:
  //     case SupportedChainId.ARBITRUM_GOERLI:
  //     case SupportedChainId.OPTIMISM:
  //     case SupportedChainId.OPTIMISTIC_GOERLI:
  //     case SupportedChainId.POLYGON:
  //     case SupportedChainId.POLYGON_MUMBAI:
  //     case SupportedChainId.CELO:
  //     case SupportedChainId.CELO_ALFAJORES:
  //       setPolySuccess(true);
  //       setPolyPending(false)
  //       setPolyReferralAddress(response._pair)

  //       setPolyAddressBalance(parseFloat((balance / 100000000).toFixed(2)).toString())

  //       break;
  //     case SupportedChainId.GOERLI:
  //     case SupportedChainId.MAINNET:
  //       console.log("11111 bal etherem",);
  //       setEthSuccess(true);
  //       setEtheremReferralAddress(response._pair)

  //       setEthremAddressBalance(parseFloat((balance / 100000000).toFixed(2)).toString())

  //       break;
  //     default:
  //       setPolyAddressBalance(parseFloat((balance / 100000000).toFixed(2)).toString())
  //   }
  // }

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash ? txHash : ""}
        content={() => (
          <ConfirmationModalContent
            title="Referral"
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
            bottomContent={modalBottom}
          />
        )}
        pendingText={pendingText}
      />
      <div style={{ width: "100%" }}>
        <div className="">
          <div className="row">
            <div className="col-md-12">
              <div className="mainTitle">Welcome to Panaroma Swap</div>
              <Desc className="mb-0 mt-3">
                Follow the steps below to register under your referral. Once you
                register you can also earn up to 20% from friends’ swap
                commission by referring them on Panaroma Swap
              </Desc>
            </div>
          </div>

          {showProgress ? (
            <div className="mt-5">
              <ReferralTitle className="my-5 text-center">
                Please Complete the Process
              </ReferralTitle>
              <div className="twoFactor-main">
                <div className="d-none d-md-block">
                  <div className="stepper-wrapper">
                    <div
                      className={
                        "stepper-item" +
                        (current >= 1
                          ? " completed"
                          : current === 0
                            ? " active"
                            : "")
                      }>
                      <div className="step-counter">1</div>
                      <TextTheme className="step-name">
                        Connect Wallet
                      </TextTheme>
                    </div>
                    <div
                      className={
                        "stepper-item" +
                        (current >= 2
                          ? " completed"
                          : current === 1
                            ? " active"
                            : "")
                      }>
                      <div className="step-counter">2</div>
                      <TextTheme className="step-name">
                        Sign Referral Smart Contract
                      </TextTheme>
                    </div>
                    <div
                      className={
                        "stepper-item" +
                        (current >= 3
                          ? " completed"
                          : current === 2
                            ? " completed"
                            : "")
                      }>
                      <div className="step-counter">3</div>
                      <TextTheme className="step-name">Completed</TextTheme>
                    </div>
                  </div>
                </div>
              </div>

              {current === 0 ? (
                <div className="text-center mt-5">
                  <h3 className="mb-4">{account && userEthBalance ? "Wallet Connected" : "Please Connect Your Wallet"}</h3>
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

                  {correctNetwork ? (
                    <h4 className="mt-2 text-danger">
                      You are connected to the wrong network, please switch it
                      to the ethereum network
                    </h4>
                  ) : null}

                  {isSameUserAsReferral ? (
                    <h4 className="mt-2 text-danger">
                      Referral cannot be the same user
                    </h4>
                  ) : null}


                  {/* <NetworkSelector /> */}
                  {account && userEthBalance ? (
                    <div className="text-center">
                      <Button
                        className="nextBtnTwo mt-3"
                        disabled={disNextBtn}
                        onClick={nextStepTwo}>
                        Next
                      </Button>
                    </div>) : null}
                </div>
              ) : current === 1 ? (
                <div className="text-center mt-5">
                  <h6>
                    Please sign all the transaction on MetaMask to successfully
                    register under your referral and create your own referral
                    contracts. Do not close the windows and make sure to sign
                    all the transactions recieved in your wallet application.
                    Below you can see the status for all your transactions.
                  </h6>

                  <div className="mt-5">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">ChainId</th>
                          <th scope="col">Status</th>

                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Ethereum</td>
                          <td>
                            {ethSuccess ?
                              (<span className="text-success">Success
                              </span>
                              ) : (<span className="text-danger">Pending
                                {" "}
                                {/* <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(polyReferralAddress)}>
                                  Try Again!
                                </button> */}
                                {
                                  ethloading ?
                                    <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                                    <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.GOERLI : SupportedChainId.MAINNET) }}>
                                      Register
                                    </button>
                                }
                              </span>

                              )
                            }

                          </td>
                        </tr>
                        <tr>
                          <td>Polygon</td>
                          <td>
                            {/* {polyPending ?
                              (<span className="text-danger">Pending {" "}
                                 </span>) : ""
                            } */}
                            {polySuccess ?
                              (<span className="text-success">Success
                              </span>
                              ) : (<span className="text-danger">Pending
                                {" "}
                                {/* <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(polyReferralAddress)}>
                                  Try Again!
                                </button> */}
                                {
                                  polyloading ?
                                    <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                                    <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.POLYGON_MUMBAI : SupportedChainId.POLYGON) }}>
                                      Register
                                    </button>
                                }
                              </span>
                              )
                            }

                          </td>
                        </tr>
                        <tr>
                          <td>Optimism</td>
                          <td>
                            {/* <span className="text-danger">Pending</span> /{" "}
                            <span className="text-success">Success</span> /{" "}
                            <Button className="text-white" variant="warning">
                              Try again
                            </Button> */}
                            {optimismSuccess ?
                              (<span className="text-success">Success
                              </span>
                              ) : (<span className="text-danger">Pending
                                {" "}
                                {/* <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(polyReferralAddress)}>
                                  Try Again!
                                </button> */}
                                {
                                  optimismloading ?
                                    <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                                    <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.OPTIMISTIC_GOERLI : SupportedChainId.OPTIMISM) }}>
                                      Register
                                    </button>
                                }
                              </span>
                              )
                            }
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Arbitrum</td>
                          <td>
                            {/* <span className="text-danger">Pending</span> /{" "}
                            <span className="text-success">Success</span> /{" "}
                            <Button className="text-white" variant="warning">
                              Try again
                            </Button> */}
                            {arbitrumSuccess ?
                              (<span className="text-success">Success
                              </span>
                              ) : (<span className="text-danger">Pending
                                {" "}
                                {/* <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(polyReferralAddress)}>
                                  Try Again!
                                </button> */}
                                {
                                  arbloading ?
                                    <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                                    <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.ARBITRUM_GOERLI : SupportedChainId.ARBITRUM_ONE) }}>
                                      Register
                                    </button>
                                }
                              </span>
                              )
                            }
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      

                      </tbody>
                    </table>
                  </div>
                </div>
              ) : current === 2 ? (
                <div className="text-center mt-5">
                  <h1 className="text-primary">
                    Congratulation, you have registered as referral with
                    Panaroma Swap.
                  </h1>
                  <h5>To view referral balance: <button className="btn btn-primary" onClick={() => navigate("/referral")}>Click Here</button></h5>
                </div>
              ) : null}
            </div>
          ) : null}

          {hideProgress ? (
            <div className="mt-5">
              <h3 className="text-danger text-center">
                The referral is not a valid user, please check and try again.
              </h3>
            </div>
          ) : null}

          {userReferralExist ? (
            <div className="mt-5">
              <h3 className="text-danger text-center">
                You have already registered with our referral program. You can
                cannot change the referral but if you wish to change your
                referral you will need to register with a new account.
              </h3>
            </div>
          ) : null}

          {/* <button className="prevBtn" onClick={prev}>
            Previous
          </button>
          <button className="nextBtn" onClick={next}>
            Next
          </button> */}
          {
            ethSuccess && polySuccess && arbitrumSuccess && optimismSuccess && current === 1 ?
              <button className="nextBtn" onClick={next}>
                Next
              </button> : null

          }
        </div>
      </div>
    </>
  );
}