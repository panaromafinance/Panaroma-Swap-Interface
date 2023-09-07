import EarnCrypto from "../../assets/images/EarnCrypto.png";
import InviteFriends from "../../assets/images/InviteFriends.png";
import getReferralLink from "../../assets/images/getReferralLink.png";
import { ExternalLink, TYPE } from "../../theme";
import { Trans } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
// import Faq from "components/Faq";
//import copy from 'copy-to-clipboard'
import { useEffect, useState, useCallback, useMemo } from "react";
// import Button from 'react-bootstrap/Button'
// import { MdOutlineContentCopy } from "react-icons/md";
import styled from "styled-components/macro";
// import { getChainInfo } from "constants/chainInfo";
import { SupportedChainId } from "constants/chains";
import Web3 from "web3";
// import { shortenAddress } from "utils";
import { getExplorerLink, ExplorerDataType } from "utils/getExplorerLink";
import ReferralTable from "pages/ReferralTable";
import tokenLockContractBalanceABA from "../../abis/tokenLockContractBalanceABA.json";
import { RPC_URLS } from "constants/networks";
import axios from "axios";
import { CustomLightSpinner } from "../../theme";
import Circle from "../../assets/images/blue-loader.svg";
import Toast from "react-bootstrap/Toast";
import { addPopup } from "state/application/reducer";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { useTransactionAdder } from "../../state/transactions/hooks";
import { TransactionType } from "../../state/transactions/types";
import CopyHelper from "components/AccountDetails/Copy";
import { FaRegCopy } from "react-icons/fa";
import TransactionConfirmationModal, {
  ConfirmationModalContent
} from "../../components/TransactionConfirmationModal";
import {
  ButtonPrimary
} from "../../components/Button";
import { Text } from "rebass";
import { useTransaction } from "../../state/transactions/hooks";
import { useCurrency } from "hooks/Tokens";
import tryParseCurrencyAmount from "lib/utils/tryParseCurrencyAmount";
import { useBestTrade } from "hooks/useBestTrade";
import { Dots } from "components/swap/styleds";
// import { TradeState } from "state/routing/types";
// import { InterfaceTrade, TradeState } from "state/routing/types";
// import { client } from '../../apollo/client'
// import {
//   GLOBAL_DATA
// } from '../../apollo/queries'
// import { useGlobalData } from '../../contexts/GlobalData'
// import { AbiItem } from 'web3-utils'

const Desc = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

const ToastDiv = styled.div`
  z-index: 1;
  position: absolute;
  right: 10px;
  top: 7rem;
`;

const ReferralTitle = styled.div`
  font-size: 35px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 20px;
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

  // @media only screen and (max-width: 768px) {
  //   font-size: 14px;
  // }
`;

const AccordionText = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;

const ReferralInput = styled.input`
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.deprecated_text1};
  line-height: 1.5;
  background-color: transparent;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  appearance: none;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  ::placeholder {
    color: ${({ theme }) => theme.deprecated_text1};
  }
`;

const AddressLink = styled(ExternalLink) <{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.deprecated_text3};
  margin-left: -0.5rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: ${({ theme }) => theme.deprecated_text2};
  }
`;

const referralClipBoard = styled.div``;

// const referralList = [{ "address": "0x63410A5593D5474ae569ef5d732046757ECdd11a", "totalAmount": 0, "level1Amount": 0, "level2Amount": 0, "level3Amount": 0 }, { "address": "0x63410A5593D5474ae569ef5d732046757ECdd11b", "totalAmount": 0, "level1Amount": 0, "level2Amount": 0, "level3Amount": 0 }, { "address": "0x63410A5593D5474ae569ef5d732046757ECdd11a", "totalAmount": 0, "level1Amount": 0, "level2Amount": 0, "level3Amount": 0 }]
// let referralList = [] as any;


function shouldShowAlert(
  chainId: number | undefined
): chainId is SupportedChainId {
  return Boolean(
    chainId
  );
}

function isWeb3Connected(
  account: string | undefined
) {
  return Boolean(
    account
  );
}

export default function Referral() {
  const { account, chainId, provider } = useWeb3React();
  const dispatch = useAppDispatch();
  const [showreferral, setShowReferral] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [copyText, setCopyText] = useState('')
  const [polygonAddress, setPolygonAddress] = useState('')
  const [ethReferralAddress, setETHReferralAddress] = useState('')
  const [optimismReferralAddress, SetOptimismReferralAddress] = useState('')
  const [arbitrumReferralAddress, setArbitrumReferralAddress] = useState('')
  const [isAddressGeneratedArbitrum, setIsAddressGeneratedArbitrum] = useState(false)
  const [isAddressGeneratedPolygon, setIsAddressGeneratedPolygon] = useState(false)
  const [isAddressGeneratedOptimism, setIsAddressGeneratedOptimism] = useState(false)
  const [isAddressGeneratedMainnet, setIsAddressGeneratedMainnet] = useState(false)
  const contractAddress = process.env['REACT_APP_REF_FACTORY_ADDRESS'];
  const deployerAddress = process.env['REACT_APP_DEPLOYER_REF_ADDRESS'];

  const [totalEarnedBalance, setTotalEarnedBalance] = useState(0);
  const [totalEarnedBalanceInEtherem, setTotalEarnedBalanceInEtherem] = useState(0);
  const [totalEarnedBalanceInPolygon, setTotalEarnedBalanceInPolygon] = useState(0);
  const [totalEarnedBalanceInOptimism, setTotalEarnedBalanceInOptimism] = useState(0);
  const [totalEarnedBalanceInArbitrum, setTotalEarnedBalanceInArbitrum] = useState(0);
  const [referralURL] = useState(process.env['REACT_APP_REFERRAL_BASE_URL']);
  const [referralListData, setReferralListData] = useState([]);

  const [ethloading, setEthLoading] = useState(false)
  const [polyloading, setPolyLoading] = useState(false)
  const [arbloading, setArbLoading] = useState(false)
  const [optimismloading, setOptimismLoading] = useState(false)

  const [show, toggleShow] = useState(false);
  const [referralId, setReferralId] = useState('');
  const [txStart, setTxStart] = useState<boolean>(false);
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // const [showDetailed, setShowDetailed] = useState<boolean>(true);
  const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm
  // txn values
  const [txHash, setTxHash] = useState<string>("");
  const addTransaction = useTransactionAdder();
  const tx = useTransaction(txHash ?? undefined);

  const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
  const rpcurl = rpcurlQuickNode ? rpcurlQuickNode : RPC_URLS;

  // const { oneDayVolumeUSD, oneDayTxns, pairCount } = useGlobalData()
  let web3 = new Web3(
    new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
  );

  // console.log("2323 chainId", chainId);
  const [val, setVal] = useState<any>();

  const inputCurrency = useCurrency("0x4e5E55bAeEf3bc747D22123cE4ADE3661c916a3e")
  const outputCurrency = useCurrency("0xc2132D05D31c914a87C6611C10748AEb04B58e8F")
  
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount("1", inputCurrency ?? undefined),
    [inputCurrency]
  );


  const trade = useBestTrade(0, parsedAmount, outputCurrency ?? undefined);

  useEffect(() => {
    if(trade.trade !== undefined){
      setVal(trade)
    }

  },[trade])
  
  
  const trade1 = useMemo(() => {
    if(trade.trade) {
      return trade
    } else if(val){
      return val;
    } 
    return trade
    
  },[trade]);
  

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    if (!txStart) updateLoader(referralId, false);
    setTxHash("");
  }, [txHash, referralId, txStart]);


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

  // console.log("363636 process.env['REACT_APP_IsDev']", process.env.REACT_APP_IsDev);

  const listofNetworkForReferralMainnet = [SupportedChainId.MAINNET, SupportedChainId.POLYGON, SupportedChainId.OPTIMISM, SupportedChainId.ARBITRUM_ONE];
  const listofNetworkForReferralTestNet = [SupportedChainId.POLYGON_MUMBAI, SupportedChainId.GOERLI, SupportedChainId.OPTIMISTIC_GOERLI, SupportedChainId.ARBITRUM_GOERLI]
  const listofNetworkForReferral = process.env.REACT_APP_IsDev === "true" ? listofNetworkForReferralTestNet : listofNetworkForReferralMainnet;


  let count = 0;
  useEffect(() => {
    // console.log("***** useeffect");
    if(account && count === 0) {
      isAddressGeneratedFunc();
      count++;
    }
    getReferralList();

    // getTokenBalance();
  }, [account]);

  if (!shouldShowAlert(chainId)) {
    return null;
  }

  // console.log("@@@@@ chainId in main", chainId)

  // const isConnected = isWeb3Connected(account);

  // const networkLabel = getChainInfo(chainId).label;


  // const [showCopy, setShowCopy] = useState(false);


  // const contractAddress = "0x2c0948EC0ABb380e74DA5c9bC78514C576F5c162";
  // console.log("###### contractAddress", contractAddress, process.env['REACT_APP_REF_FACTORY_ADDRESS']);


  const handleCopyText = (e: any) => {
    // console.log("1111 handleCopyText", e);

    setCopyText(e.target.value)
  }

  const copyToClipboard = () => {
    toggleShow(true)
    // copy(copyText)
    navigator.clipboard.writeText(`${process.env['REACT_APP_BASE_URL']}#/refers/ref/` + account)

    // alert(`You have copied "${copyText}"`)
  }

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


  // get and set the web3 contract link to fetch referral address and balance

  async function isAddressGeneratedFunc() {
    for (let index = 0; index < listofNetworkForReferral.length; index++) {
      updateRPCURLS(listofNetworkForReferral[index]);
      const contract = new web3.eth.Contract(jsonInt, contractAddress);

      const response = await contract.methods.getUserInfo(account).call();

      if (response._pair == 0x0000000000000000000000000000000000000000) {
        updateAddressOfChainEmpty(listofNetworkForReferral[index])
        updateLoader(listofNetworkForReferral[index], false)
      }
      else {

        setShowReferral(true);

        const abiPANA = tokenLockContractBalanceABA as any;

        const tokenPANA = process.env['REACT_APP_JAMM_ADDRESS'];

        // Define the ERC-20 token contract
        const contract = new web3.eth.Contract(abiPANA, tokenPANA)

        // Execute balanceOf() to retrieve the token balance
        const result = await contract.methods.balanceOf(response._pair).call();

        // Convert the value from Wei to Ether
        const _balance = web3.utils.fromWei(result);

        setTotalEarnedBalance(parseFloat(_balance) * 10 ** 8);

        //get netoworkwise balance
        updateBalanceOnNetwork(listofNetworkForReferral[index], response._pair);

        updateAddressOfChain(listofNetworkForReferral[index])


        updateLoader(listofNetworkForReferral[index], false)
      }
    }
  }

  async function updateBalanceOnNetwork(selectedNetworkChainId, pair) {
    // console.log("2323 56 chainId", selectedNetworkChainId, chainId);
    const abiPANA = tokenLockContractBalanceABA as any;

    const tokenPANA = process.env['REACT_APP_JAMM_ADDRESS'];

    // Define the ERC-20 token contract
    const contract = new web3.eth.Contract(abiPANA, tokenPANA)

    // Execute balanceOf() to retrieve the token balance
    const result = await contract.methods.balanceOf(pair).call();

    // Convert the value from Wei to Ether
    const _balance = web3.utils.fromWei(result);

    switch (selectedNetworkChainId) {
      case SupportedChainId.ARBITRUM_ONE:
        setTotalEarnedBalanceInArbitrum(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.ARBITRUM_GOERLI:
        setTotalEarnedBalanceInArbitrum(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.GOERLI:
        setTotalEarnedBalanceInEtherem(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.MAINNET:
        // console.log("11111 RPC_URLS['1']", RPC_URLS["1"]);
        setTotalEarnedBalanceInEtherem(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.OPTIMISM:
        setTotalEarnedBalanceInOptimism(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.OPTIMISTIC_GOERLI:
        setTotalEarnedBalanceInOptimism(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.POLYGON:
        setTotalEarnedBalanceInPolygon(parseFloat(_balance) * 10 ** 8);
        break;
      case SupportedChainId.POLYGON_MUMBAI:
        setTotalEarnedBalanceInOptimism(parseFloat(_balance) * 10 ** 8);
        break;
      default:
        // setTotalEarnedBalanceInPolygon(parseFloat(_balance) * 10 ** 8);
        break;
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

  async function getBalanceOf(pairAddress) {
    const abiPANA = tokenLockContractBalanceABA as any;

    const tokenPANA = process.env['REACT_APP_JAMM_ADDRESS'];

    // Define the ERC-20 token contract
    const contract = new web3.eth.Contract(abiPANA, tokenPANA)

    // Execute balanceOf() to retrieve the token balance
    const result = await contract.methods.balanceOf(pairAddress).call();

    // Convert the value from Wei to Ether
    const _balance = web3.utils.fromWei(result);
    // console.log("00000 balanceOfPair _balance", _balance);

    return parseFloat(_balance) * 10 ** 8;
  }


  async function getReferralList() {
    axios
      .get(referralURL + "checkUserData/" + account)
      .then(function (response) {
        // console.log("&&&&&&&& response", response);
        if (response.data.status) {
          const referralDataList = response.data.message;
          getFormattedReference(referralDataList);
        }
      });
  }

  async function getFormattedReference(referralDataList) {
    const referralList = [] as any;

    // console.log("1111 referralDataList", referralDataList);

    updateRPCURLS(chainId);

    for (let index = 0; index < referralDataList.partners.length; index++) {
      const referral = referralDataList.partners[index];
      const contract = new web3.eth.Contract(jsonInt, contractAddress);

      const userResponse = await contract.methods.getUserInfo(referral.userid).call();

      if (userResponse) {
        const balanceOfPair = getBalanceOf(userResponse._pair);

        // console.log("00000 balanceOfPair referral", referral);

        referralList.push({ "address": referral, "totalAmount": 0, "createdOn": referralDataList.created })
        setReferralListData(referralList)
        // console.log("00000 referralListData", referralListData);
      }
    }
  }

  async function getReferralLevelByParent(referralAddress: any) {
    axios
      .get(referralURL + "checkUserData/" + referralAddress)
      .then(function (response) {
        // console.log("&&&&&&&& response", response);
        if (response.data.status) {
          const referralDataList = response.data.message.partners;

          return referralDataList.length > 0 ? referralDataList : []
        }
      });
  }

  async function getData() {

    if (account == null) {
      setShowReferral(false);
      setShowLogout(true);
    } else {
      setShowReferral(true);
      setShowLogout(false);
    }

  }

  async function checkRegistration(generateReferralchainId) {
    if (account) {
      updateRPCURLS(generateReferralchainId);
      updateLoader(generateReferralchainId, true);

      setAttemptingTxn(true);

      const contract = new web3.eth.Contract(jsonInt, contractAddress);
      try {
        const response = await contract.methods.getUserInfo(account).call();

        // setPolyReferralAddress(response._pair)
        if (response._pair == 0x0000000000000000000000000000000000000000) {
          // console.log("I am not getting excuted");
          // const contractTwo = "0xc94648E6A491f114C2EBfCDEb453D004440cEC6e";
          // [TODO: As per audit report we can't register the address[0], so we will be registering with the deployer address]

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
            [deployerAddress!]
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

                // setPolygonAddress(res._pair);

                setAttemptingTxn(false);
                addTransaction(txHashh, {
                  type: TransactionType.REFERRAL
                });

                setTxHash(txHashh);

                provider?.getTransactionReceipt(txHashh).then((receipt) => {
                  if (receipt && receipt.status === 1) {
                    updateAddressOfChain(generateReferralchainId)
                    updateDatabase();
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

                setTotalEarnedBalance(0);

              }, 30000);

            } else {
              setTxStart(false)
              setAttemptingTxn(false);
              updateLoader(generateReferralchainId, false)
            }
          } catch (error) {
            setTxStart(false)
            setAttemptingTxn(false)
            dispatch(
              addPopup({
                content: { rejectAction: error.message ? error.message : "Failed" },
                key: `reject-action`
              })
            )
            updateLoader(generateReferralchainId, false)
          }

        } else {
          // setShowProgress(false);
          // setUserReferralExist(true);
          // console.log("HEy I am done");
          // setPolygonAddress(response._pair);

          const abiPANA = tokenLockContractBalanceABA as any;

          const tokenPANA = process.env['REACT_APP_JAMM_ADDRESS'];

          // Define the ERC-20 token contract
          const contract = new web3.eth.Contract(abiPANA, tokenPANA)


          // Execute balanceOf() to retrieve the token balance
          const result = await contract.methods.balanceOf(response._pair).call();

          // Convert the value from Wei to Ether
          if (result) {
            const _balance = web3.utils.fromWei(result, "ether");
            setTotalEarnedBalance(parseFloat(_balance) * 10 ** 8);

            updateAddressOfChain(generateReferralchainId)
            updateLoader(generateReferralchainId, false)
          } else {
            updateLoader(generateReferralchainId, false)
          }
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
        // console.log(error);

      }

      // if (response._pair == 0x0000000000000000000000000000000000000000) {
      //   // setShowProgress(true);

      // } else {
      //   // setHideProgress(true);

      //   // if (current === 0 && (chainId === 1 || chainId === 134))
      //   //   nextStepTwo();
      // }
    }
    ///response shows pair and parent
    ///pair is user's already created wallet if is address(0) then user does not
    ///have a wallet and has to create it.
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

  async function updateLoader(generateReferralchainId, text) {
    setReferralId(generateReferralchainId)
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
      // setPolyLoading(text)
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

  async function updateAddressOfChain(generateReferralchainId) {
    const contract = new web3.eth.Contract(jsonInt, contractAddress);
    const response = await contract.methods.getUserInfo(account).call();

    // console.log("1414147 response", generateReferralchainId, response);

    if (response._pair != '0x0000000000000000000000000000000000000000') {
      switch (generateReferralchainId) {
        case SupportedChainId.ARBITRUM_ONE:
        case SupportedChainId.ARBITRUM_GOERLI:

          setArbitrumReferralAddress(response._pair);
          setIsAddressGeneratedArbitrum(true);
          break;
        case SupportedChainId.GOERLI:
        case SupportedChainId.MAINNET:

          setETHReferralAddress(response._pair);
          setIsAddressGeneratedMainnet(true);
          break;
        case SupportedChainId.OPTIMISM:
        case SupportedChainId.OPTIMISTIC_GOERLI:
          setIsAddressGeneratedOptimism(true);
          SetOptimismReferralAddress(response._pair)
          break;
        case SupportedChainId.POLYGON:
        case SupportedChainId.POLYGON_MUMBAI:
          setIsAddressGeneratedPolygon(true);
          setPolygonAddress(response._pair)
          break;

        default:
          // setIsAddressGeneratedPolygon(true);
          // setPolygonAddress(response._pair)
          break;
      }
    }
  }

  async function updateAddressOfChainEmpty(generateReferralchainId) {
    const contract = new web3.eth.Contract(jsonInt, contractAddress);
    const response = await contract.methods.getUserInfo(account).call();


    switch (generateReferralchainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:

        setArbitrumReferralAddress("");
        setIsAddressGeneratedArbitrum(false);
        break;
      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:

        setETHReferralAddress("");
        setIsAddressGeneratedMainnet(false);
        break;
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        setIsAddressGeneratedOptimism(false);
        SetOptimismReferralAddress("")
        break;
      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        setIsAddressGeneratedPolygon(false);
        setPolygonAddress("")
        break;

      default:
        // setIsAddressGeneratedPolygon(false);
        // setPolygonAddress("")
        break;
    }
  }

  async function withdraw(withdrawAddressParam: string) {
    // let refWalletABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ValueReceived", "type": "event" }, { "inputs": [], "name": "checkReferral", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "createdAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "creator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_parent", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "address", "name": "referer", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenContract", "type": "address" }], "name": "withdrawTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]
    let withdrawAddress = withdrawAddressParam;

    switch (chainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_GOERLI:
        withdrawAddress = arbitrumReferralAddress;
        break;

      case SupportedChainId.GOERLI:
      case SupportedChainId.MAINNET:
        withdrawAddress = ethReferralAddress;
        break;

      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_GOERLI:
        withdrawAddress = optimismReferralAddress;
        break;

      case SupportedChainId.POLYGON:
      case SupportedChainId.POLYGON_MUMBAI:
        withdrawAddress = polygonAddress;
        break;

      default:
        withdrawAddress = withdrawAddressParam;
        break;
    }
    
    const _JAMM = process.env['REACT_APP_JAMM_ADDRESS'] || ""; //_pairAddress

    const Tdata = web3.eth.abi.encodeFunctionCall(
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
      [_JAMM]
    );
    ///_pairAddress at [""]   
    const params = {
      from: window.ethereum?.selectedAddress,
      to: withdrawAddress, //_pairAddress
      data: Tdata,
    };
    try {
      const d_resp = await window.ethereum?.request({
        method: "eth_sendTransaction",
        params: [params],
      });
    } catch (error) {
      dispatch(
        addPopup({
          content: { rejectAction: error.message ? error.message : "Failed" },
          key: `reject-action`
        })
      )
    }

    isAddressGeneratedFunc();
  }


  return (
    <div className="">
      <ToastDiv>
        <Toast show={show} onClose={() => toggleShow(false)} autohide={true} delay={1000} className="bg-success">
          <Toast.Body>
            <strong className="mr-auto">Copied!</strong>
          </Toast.Body>
        </Toast>
      </ToastDiv>
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
      <div className="row">
        <div className="col-md-12">
          <div className="mainTitle">
            <Trans>Invite your friends. Earn cryptocurrency together</Trans>
          </div>
          <Desc className="mb-0 mt-3">
            <Trans>Earn up to 20% from friends swap commission on Panaswap and 5% from
              their earnings on Farms & Launchpools</Trans>
          </Desc>
        </div>
      </div>

      {account && (isAddressGeneratedArbitrum || isAddressGeneratedMainnet || isAddressGeneratedOptimism || isAddressGeneratedPolygon) ? (
        <div className="mt-5">
          <CardBody>
            <TYPE.mediumHeader><Trans>My Referral Link</Trans></TYPE.mediumHeader>

            <div className="mt-3 d-flex">
              <ReferralInput
                disabled
                className="me-3"
                type="email"
                id="exampleFormControlInput1"
                placeholder={`${process.env['REACT_APP_BASE_URL']}#/refers/ref/${account}`}
                value={`${process.env['REACT_APP_BASE_URL']}#/refers/ref/${account}`}
              // onChange={handleCopyText}
              />
              {/* <Button type="button" onClick={copyToClipboard} className="btn btn-primary"></Button> */}
              {/* <button className="btn btn-primary" onClick={copyToClipboard}>
                <MdOutlineContentCopy size={20} />
              </button> */}
              <CopyHelper className="align-items-center" toCopy={`${process.env['REACT_APP_BASE_URL']}#/refers/ref/${account}`} iconPosition="top" style={{ padding: "0" }}>
                <FaRegCopy className="account-icon text-light p-2" style={{ backgroundColor: "#0d6efd", fontSize: '2rem' }} />
                {/* <span className={`account-text mt-1`}>Copy</span> */}
              </CopyHelper>
            </div>
          </CardBody>
        </div>
      ) : null}
      {account ? (
        <div className="mt-5">
          <CardBody>
            <TYPE.mediumHeader><Trans>Referral link network status</Trans></TYPE.mediumHeader>

            <div className="row mt-3 justify-content-between">
              <div className="col-12 col-md-2 d-flex align-items-center flex-column">
                <InviteDesc className="mb-1">Ethereum</InviteDesc>
                {ethReferralAddress ? (<div>
                  <AddressLink className="ms-0"
                    hasENS={!!ethReferralAddress}
                    isENS={true}
                    href={getExplorerLink(
                      process.env.REACT_APP_IsDev === "true" ? SupportedChainId.GOERLI : SupportedChainId.MAINNET,
                      ethReferralAddress,
                      ExplorerDataType.ADDRESS
                    )}>
                    <h6 className="text-success">  <Trans>Success</Trans></h6>
                  </AddressLink>
                  {/* <h5 className="text-success">  {ethReferralAddress ? shortenAddress(ethReferralAddress) : ""}
                  </h5>
                  <button className="btn btn-primary" onClick={() => {
                    navigator.clipboard.writeText(ethReferralAddress)
                  }}>
                    <MdOutlineContentCopy size={20} />
                  </button> */}
                </div>) : (
                  <div>
                    {
                      ethloading ?
                        <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                        <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.GOERLI : SupportedChainId.MAINNET) }}>
                          <Trans>Generate</Trans>
                        </button>
                    }
                  </div>)}
              </div>
              <div className="col-12 col-md-2 d-flex align-items-center flex-column">
                <InviteDesc className="mb-1">Polygon</InviteDesc>
                {polygonAddress ? (
                  <div>
                    {/* <h5 className="text-success">  {polygonAddress ? shortenAddress(polygonAddress) : ""}</h5> */}
                    <AddressLink className="ms-0"
                      hasENS={!!polygonAddress}
                      isENS={true}
                      href={getExplorerLink(
                        process.env.REACT_APP_IsDev === "true" ? SupportedChainId.POLYGON_MUMBAI : SupportedChainId.POLYGON,
                        polygonAddress,
                        ExplorerDataType.ADDRESS
                      )}>
                      {/* <LinkIcon size={16} />
                      <span style={{ marginLeft: "4px" }}>
                        <Trans>View on Explorer</Trans>
                      </span> */}
                      <h6 className="text-success">  <Trans>Success</Trans></h6>
                    </AddressLink>

                    {/* <button className="btn btn-primary" onClick={() => {
                      navigator.clipboard.writeText(polygonAddress)
                    }}>
                      <MdOutlineContentCopy size={20} />
                    </button> */}
                  </div>) : (
                  <div>
                    {
                      polyloading ?
                        <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                        <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.POLYGON_MUMBAI : SupportedChainId.POLYGON) }}>
                          <Trans>Generate</Trans>
                        </button>
                    }
                  </div>)}

              </div>
              {/* <div className="col-12 col-md-2">
                <InviteDesc className="mb-1">Binance Smart Chain</InviteDesc>
                <a className="txdn" href={copyText}>
                  <h5 className="text-danger">Generate</h5>
                </a>
              </div> */}
              <div className="col-12 col-md-2 d-flex align-items-center flex-column">
                <InviteDesc className="mb-1">Optimism</InviteDesc>
                {optimismReferralAddress ? (<div>
                  <AddressLink className="ms-0"
                    hasENS={!!optimismReferralAddress}
                    isENS={true}
                    href={getExplorerLink(
                      process.env.REACT_APP_IsDev === "true" ? SupportedChainId.OPTIMISTIC_GOERLI : SupportedChainId.OPTIMISM,
                      optimismReferralAddress,
                      ExplorerDataType.ADDRESS
                    )}>
                    <h6 className="text-success">  <Trans>Success</Trans></h6>
                  </AddressLink>
                </div>) : (
                  <div>
                    {
                      optimismloading ?
                        <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                        <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.OPTIMISTIC_GOERLI : SupportedChainId.OPTIMISM) }}>
                          <Trans>Generate</Trans>
                        </button>
                    }
                  </div>)}
              </div>
              <div className="col-12 col-md-2 d-flex align-items-center flex-column">
                <InviteDesc className="mb-1">Arbitrum</InviteDesc>
                {arbitrumReferralAddress ? (<div>
                  <AddressLink className="ms-0"
                    hasENS={!!arbitrumReferralAddress}
                    isENS={true}
                    href={getExplorerLink(
                      process.env.REACT_APP_IsDev === "true" ? SupportedChainId.ARBITRUM_GOERLI : SupportedChainId.ARBITRUM_ONE,
                      arbitrumReferralAddress,
                      ExplorerDataType.ADDRESS
                    )}>
                    <h6 className="text-success">  <Trans>Success</Trans></h6>
                  </AddressLink>
                </div>) : (
                  <div>
                    {
                      arbloading ?
                        <CustomLightSpinner src={Circle} alt="loader" size={"30px"} /> :
                        <button className="btn btn-primary" onClick={() => { viewOrGenerateReferralID(process.env.REACT_APP_IsDev === "true" ? SupportedChainId.ARBITRUM_GOERLI : SupportedChainId.ARBITRUM_ONE) }}>
                          <Trans>Generate</Trans>
                        </button>
                    }
                  </div>)}
              </div>

              {/* <div className="col-12 col-md-2">
                <InviteDesc className="mb-1">Celo</InviteDesc>
                <a className="txdn" href="">
                  <h5 className="text-danger">Generate</h5>
                </a>
              </div> */}
            </div>
          </CardBody>
        </div>
      ) : null}

      {showreferral ? (
        <div className="mt-5">
          <CardBody>
            <TYPE.mediumHeader><Trans>Earnings</Trans></TYPE.mediumHeader>
            {/* on {networkLabel} */}
            <div className="row mt-3">
              <div className="col-12 col-md-3">
                <InviteDesc><Trans>Active Friends / Total Friends</Trans></InviteDesc>
                <TYPE.largeHeader fontSize={30}>0 / 0</TYPE.largeHeader>
              </div>
              <div className="col-12 col-md-3">
                <InviteDesc><Trans>Total earned</Trans></InviteDesc>
                <TYPE.largeHeader fontSize={30}>{totalEarnedBalance.toFixed(4)} PANA</TYPE.largeHeader>
                <InviteDesc>{"~ ("}{totalEarnedBalance.toFixed(8)}{") PANA"}</InviteDesc>

                {/* <Type.small>{totalEarnedBalance.toFixed(8)}</Type.small> */}
              </div>
                <div className="col-12 col-md-3">
                  <InviteDesc><Trans>Total earned in USD</Trans></InviteDesc>
                  {
                    trade1.trade?.executionPrice.toSignificant(4) ? (
                      <TYPE.largeHeader fontSize={30}>{"$ "}{(parseFloat(totalEarnedBalance.toFixed(4))*parseFloat(trade1.trade?.executionPrice.toFixed(4))).toFixed(6)}</TYPE.largeHeader>
                    ): (
                      <Text fontSize={20}><Dots>Fetching $ price</Dots></Text>
                    )
                  }
                </div>
              {/* <div className="col-12 col-md-3">
                <InviteDesc>Total Swap friends</InviteDesc>
                <TYPE.largeHeader fontSize={30}>0</TYPE.largeHeader>
              </div>
              <div className="col-12 col-md-3">
                <InviteDesc>Total Swap earned</InviteDesc>
                <TYPE.largeHeader fontSize={30}>0.0000 PANA</TYPE.largeHeader>
              </div> */}
              {
                totalEarnedBalance > 0 ? (
                  <div className="col-12 col-md-3 d-flex justify-content-center align-items-center text-center">
                    <button className="btn btn-primary" type="submit" onClick={() => { withdraw(polygonAddress) }}>
                      Withdraw
                    </button>
                  </div>
                ) : null
              }
            </div>

            <div className="row mt-3 justify-content-between">
              <div className="col-12 col-md-2 mt-1">
                <InviteDesc className="mb-1">Ethereum</InviteDesc>
                <TYPE.largeHeader fontSize={30}>{totalEarnedBalanceInEtherem.toFixed(4)} PANA</TYPE.largeHeader>
              </div>
              <div className="col-12 col-md-2 mt-1">
                <InviteDesc className="mb-1">Polygon</InviteDesc>
                <TYPE.largeHeader fontSize={30}>{totalEarnedBalanceInPolygon.toFixed(4)} PANA</TYPE.largeHeader>
              </div>

              <div className="col-12 col-md-2 mt-1">
                <InviteDesc className="mb-1">Arbitrum</InviteDesc>
                <TYPE.largeHeader fontSize={30}>{totalEarnedBalanceInArbitrum.toFixed(4)} PANA</TYPE.largeHeader>
              </div>
              <div className="col-12 col-md-2 mt-1">
                <InviteDesc className="mb-1">Optimism</InviteDesc>
                <TYPE.largeHeader fontSize={30}>{totalEarnedBalanceInOptimism.toFixed(4)} PANA</TYPE.largeHeader>
              </div>
            </div>
          </CardBody>
        </div>
      ) : null}

      {showreferral ? (
        <div className="mt-5">
          <div className="d-flex justify-content-between">
            <div>
              <TYPE.mediumHeader><Trans>Referral List</Trans></TYPE.mediumHeader>
              <InviteDesc><Trans>All your referral friends in one place</Trans></InviteDesc>
            </div>
            {/* <div className="d-flex align-items-center">
              <div className="d-flex">
                <ReferralInput
                  className="me-3"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button className="btn btn-primary" type="submit">
                  <MdOutlineSearch fontSize={20} />
                </button>
              </div>
            </div> */}

          </div>

          <div className="row">
            <div className="col-md-6 mb-3 w-100 text-center mt-3">
              <ReferralTable referralDataList={referralListData} />
            </div>
          </div>

          {/* <CardBody className="w-100 p-5 text-center mt-3">
            <TYPE.mediumHeader>No Data</TYPE.mediumHeader>
          </CardBody> */}
        </div>
      ) : null}

      {showLogout ? (
        <div>
          <ReferralTitle className="mt-5">How to invite friends</ReferralTitle>

          <div className="row mt-3">
            <div className="col-md-4">
              <CardBody>
                <TYPE.largeHeader fontSize={30} className="text-center">
                  1
                </TYPE.largeHeader>

                <img src={getReferralLink} className="img-fluid w-100" />

                <TYPE.main className="text-center" fontSize={20}>
                  Get a referral link
                </TYPE.main>

                <InviteDesc className="text-center">
                  Connect a wallet and generate your referral link in the
                  Referral section.
                </InviteDesc>
              </CardBody>

              <TYPE.largeHeader className="mt-4">
                Farms Referral Rewards
              </TYPE.largeHeader>
              <InviteDesc className="mt-2">
                Gain 5% from your friends earnings on Farms! Your rewards will
                be displayed on the referral balance at the moment your invited
                friends withdraw their earned BSW tokens.
              </InviteDesc>
            </div>

            <div className="mt-md-0 mt-4 col-md-4">
              <CardBody>
                <TYPE.largeHeader fontSize={30} className="text-center">
                  2
                </TYPE.largeHeader>

                <img src={InviteFriends} className="img-fluid w-100" />

                <TYPE.main className="text-center" fontSize={20}>
                  Invite friends
                </TYPE.main>

                <InviteDesc className="text-center">
                  Connect a wallet and Invite your friends to register via your
                  referral link
                </InviteDesc>
              </CardBody>

              <TYPE.largeHeader className="mt-4">
                Launchpools Referral Rewards
              </TYPE.largeHeader>
              <InviteDesc className="mt-2">
                Get 5% of from friends’ profit obtained in Launchpools! The
                reward is only valid for the pool in which BSW is staked in
                return for more BSW.
              </InviteDesc>
            </div>

            <div className="col-md-4">
              <CardBody>
                <TYPE.largeHeader fontSize={30} className="text-center">
                  3
                </TYPE.largeHeader>

                <img src={EarnCrypto} className="img-fluid w-100" />

                <TYPE.main className="text-center" fontSize={20}>
                  Earn crypto
                </TYPE.main>

                <InviteDesc className="text-center">
                  Receive referral rewards in BSW tokens from your friends’
                  earnings & swaps
                </InviteDesc>
              </CardBody>

              <TYPE.largeHeader className="mt-4">
                Swaps Referral Rewards
              </TYPE.largeHeader>
              <InviteDesc className="mt-2">
                Get up to 20% from friends’ swap commission each time your
                friend makes a swap! Receive your reward immediately after the
                swap is made. Swaps referral program will be active for certain
                pairs only.
              </InviteDesc>
            </div>
          </div>
        </div>
      ) : null}

      {/* <ReferralTitle className="mt-5">FAQ</ReferralTitle>

      <Faq /> */}
    </div>
  );
}