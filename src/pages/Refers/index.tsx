import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { Button } from 'rebass'
import styled from "styled-components/macro";
import Web3 from "web3";

const RefBody = styled.div`
  position: relative;
  max-width: 480px;
  width: 100%;
  background: ${({ theme }) => theme.deprecated_bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  margin-top: 1rem;
  padding: 1rem;
  margin: auto;
`;

const Desc = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

export default function Refers() {
  const { account } = useWeb3React();
  const web3 = new Web3();
  const refID = useParams();
  const navigate = useNavigate();
  const refIDAdd = refID.id;

  useEffect(() => {
    //console.log(refIDAdd, "dskvhbsdkvbjsdk");
    // checkexistance()
    creacteRefWallet();
  }, []);

  // const checkexistance = async () => {
  //   const jsonInt = [
  //     {
  //       inputs: [],
  //       stateMutability: 'nonpayable',
  //       type: 'constructor',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: refIDAdd,
  //           type: 'address',
  //         },
  //       ],
  //       name: 'createRefAddress',
  //       outputs: [
  //         {
  //           internalType: 'address',
  //           name: '_pair',
  //           type: 'address',
  //         },
  //       ],
  //       stateMutability: 'nonpayable',
  //       type: 'function',
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: 'address',
  //           name: 'user',
  //           type: 'address',
  //         },
  //       ],
  //       name: 'getUserInfo',
  //       outputs: [
  //         {
  //           internalType: 'address',
  //           name: '_pair',
  //           type: 'address',
  //         },
  //         {
  //           internalType: 'address',
  //           name: '_parent',
  //           type: 'address',
  //         },
  //       ],
  //       stateMutability: 'view',
  //       type: 'function',
  //     },
  //   ]
  //   const contractAddress = '0x2c0948EC0ABb380e74DA5c9bC78514C576F5c162'
  //   const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com/'))
  //   const contract = new web3.eth.Contract(jsonInt, contractAddress)
  //   const response = await contract.methods.getUserInfo(account).call()
  //   console.log(response, 'dsvdwvvsdvdsa')
  //   ///response shows pair and parent
  //   ///pair is user's already created wallet if it is address(0) then user does not
  //   ///have a wallet and has to create it.
  // }

  const creacteRefWallet = async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
    );
    const contract = "0x2c0948EC0ABb380e74DA5c9bC78514C576F5c162";
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
      [refIDAdd!]
    );

    const txns = await web3.eth.call({
      to: contract,
      data: td
    });

    const txHashh = await window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [txns]
    });

    //console.log(txHashh, "hello world");
  };

  async function checkReferral() {
  //  console.log(web3.utils.isAddress(refID.id!));
   // console.log(refID.id!.substring(2));
    const sliceAdd = refID.id;
    const checkAccValid = web3.utils.isAddress(refID.id!);
  //  console.log(checkAccValid);
    if (refID.id !== account) {
      if (checkAccValid === false) {
       // console.log("The address is not valid");
        // window.location.reload()
      } else if (checkAccValid === true) {
       // console.log("The address is valid");
        const transactionParameters = {
          from: account,
          to: "0x6536c5d7a02b70bfe52477eede20af281c395689",
          value: "10000000000",
          data: "0xbce5b7bf000000000000000000000000" + sliceAdd!.substring(2)
        };

        const txHashh = await window.ethereum?.request({
          method: "eth_sendTransaction",
          params: [transactionParameters]
        });
       // console.log(txHashh);
        if (txHashh !== null) {
          navigate("/referral");
        }
      }
    } else {
      console.log("the referral id is invalid");
    }
  }

  return (
    <div>
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="mainTitle">Get Started With Panaroma Swap</div>
          <h6 className="mt-2">
            You have been invited by:{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://mumbai.polygonscan.com/address/` + refID.id}
              className="">
              https://mumbai.polygonscan.com/address/{refID.id}
            </a>
          </h6>
          <Desc className="mb-0 mt-4">
            You can start earning 0.10% commission on trades of your friends and
            family by referring them on Panaroma Swap. Start earning your
            passive income today.
          </Desc>

          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={checkReferral}>
            Connect Your Wallet
          </button>
        </div>
      </div>
      {/* <Button className="nextBtn" onClick={checkReferral}>
        Check Referral
      </Button>
      <RefBody>{refID.id}</RefBody> */}
    </div>
  );
}
