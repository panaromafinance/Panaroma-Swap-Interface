// import Bunny from '../../assets/images/bunny.webp'
import { useWeb3React } from "@web3-react/core";
// import React, { useEffect } from "react";
import { BsCurrencyBitcoin } from "react-icons/bs";
// import ReactPlayer from 'react-player/youtube'
import styled from "styled-components/macro";
import { getChainInfo } from "constants/chainInfo";
import { SupportedChainId } from "constants/chains";
import { client } from '../../apollo/client'
import {
  GLOBAL_DATA
} from '../../apollo/queries'
import { useGlobalData, useGlobalTransactions } from '../../contexts/GlobalData'
// import { useAllTokenData } from '../../contexts/TokenData'
// import { TOKEN_BLACKLIST } from "../../constants";
// import { useEffect, useMemo } from "react";

const CardBody = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.deprecated_bg0};
  border-radius: 15px;
  margin-bottom: 30px;
  padding: 20px;
  box-shadow: ;
`;

const Desc = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.deprecated_text1};

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

const AccordionText = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;

const RateCurrency = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;

const AccordianButton = styled.button`
  color: ${({ theme }) => theme.deprecated_text1};
  background: ${({ theme }) => theme.deprecated_bg0};
  box-shadow: inset 0 -1px 0 rgb(0 0 0 / 13%);
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  text-align: left;
  border: 0;
  border-radius: 10px;
  overflow-anchor: none;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
    border-radius 0.15s ease;
`;

const Logo = styled.img`
  height: 100%;
  width: 100%;
  margin-right: 8px;
`;

function shouldShowAlert(
  chainId: number | undefined
): chainId is SupportedChainId {
  return Boolean(
    chainId
  );
}

interface globalData {
  id: string,
  pairCount: number,
  totalLiquidityETH: string,
  totalLiquidityUSD: string,
  totalVolumeETH: string,
  totalVolumeUSD: string,
  txCount: string,
  untrackedVolumeUSD: string
}

let data: globalData = {
  id: '',
  pairCount: 0,
  totalLiquidityETH: '',
  totalLiquidityUSD: '',
  totalVolumeETH: '',
  totalVolumeUSD: '',
  txCount: '',
  untrackedVolumeUSD: ''
};

export default function Home() {
//  console.log("@@@@ home called");

  // useEffect(() => {
  //   // getData();
  // });

  const { chainId } = useWeb3React();
  // const  chainId =  1;
  const { oneDayVolumeUSD, oneDayTxns, pairCount, txnChange } = useGlobalData()
  const transactions = useGlobalTransactions()
  // const allTokens = useAllTokenData()

  // console.log("$$$$$ allTokens", allTokens);

  // useEffect(() => {
  //   // setMaxPage(1) // edit this to do modular
  //   // setPage(1)
  // }, [allTokens])

  // const formattedTokens = useMemo(() => {
  //   console.log("11111 tokens", allTokens);
  //   // console.log("11111 tokens", Object.keys);
  //   return (
  //     allTokens &&
  //     Object.keys(allTokens)
  //       .filter((key) => {
  //         // console.log("55555 key", key);
  //         return !TOKEN_BLACKLIST.includes(key)
  //       })
  //       .map((key) => allTokens[key])
  //   )
  // }, [allTokens])

  // console.log("$$$$$ formattedTokens", formattedTokens);





  getData()


  if (!shouldShowAlert(chainId)) {
    return null;
  }

  async function getData() {
   // console.log("@@@@ data graphql query");

    const result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first',
    })
    // console.log("@@@@11111 result", result);
    data = result.data.panaromaswapFactories[0]


  //  console.log("@@@@ oneDayTxns", oneDayTxns);
  //  console.log("@@@@ oneDayTxns pairCount", pairCount);
 //   console.log("@@@@ oneDayTxns pairCount", transactions);


  }

  const url = getChainInfo(chainId).logoUrl;
  return (
    <>
      <div>
        <div className="row mb-12">
          <div className="col-12 col-md-6 col-lg-6 d-flex align-items-center">
            <div>
              <div className="mainTitle">
                Explore Possibilities with Panaroma Swap
              </div>
              <Desc className="mb-0 mt-3">
                Swap and earn crypto on the leading decentralized crypto trading
                protocol with security and transparency.
              </Desc>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-6 d-flex justify-content-center align-items-center">
            {/* <img src={Bunny} width="400px" height="400px" alt="Logo" /> */}
            {chainId == 0x1 ? (
              <h1 className=""><Logo src={url} /></h1>
            ) : chainId == 0x89 ? (
              <h1 className=""><Logo src={url} />POLY</h1>
            ) : chainId == 0xa ? (
              <h1 className=""><Logo src={url} />OPT</h1>
            ) : null}
          </div>
        </div>

        <h2 className="rmHeading">Stats</h2>

        <div className="row">
          <div className="col-12 col-md-6 col-lg-3">
            <CardBody>
              <div className="rmTitle">
                <h5 className="mb-0">24H TRANSACTION</h5>
                {/* <p className="text-success mb-0">133%</p> */}
              </div>
              <RateCurrency className="rmInfo">
                {/* <h3 className="mb-0">$18,235.0</h3> */}
                <h3 className="mb-0">{oneDayTxns || 0}</h3>
              </RateCurrency>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <CardBody>
              <div className="rmTitle">
                <h5 className="mb-0">24H TRADING VOLUME</h5>
                <p className="text-danger mb-0">133%</p>
              </div>
              <RateCurrency className="rmInfo">
                <h3 className="mb-0">$18,235.0</h3>
                <p className="mb-0">USD</p>
              </RateCurrency>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <CardBody>
              <div className="rmTitle">
                <h5 className="mb-0">24H POOL FEE EARNED</h5>
                <p className="text-success mb-0">133%</p>
              </div>
              <RateCurrency className="rmInfo">
                <h3 className="mb-0">$18,235.0</h3>
                <p className="mb-0">USD</p>
              </RateCurrency>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <CardBody>
              <div className="rmTitle">
                <h5 className="mb-0">TOTAL TRADING PAIRS</h5>
                {/* <p className="text-danger mb-0">133%</p> */}
              </div>
              <RateCurrency className="rmInfo">
                <h3 className="mb-0">{pairCount || 0}</h3>
              </RateCurrency>
            </CardBody>
          </div>
        </div>

        <h2 className="rmHeading mt-5">24H Most Volume</h2>

        <div className="row">
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody className="rmCard">
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      <p className="mb-0">Bitcoin (24H)</p>
                    </div>
                    <h3 className="mt-3">USD 1254.36</h3>
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody>
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      <p className="mb-0">Bitcoin (24H)</p>
                    </div>
                    <h3 className="mt-3">USD 1254.36</h3>
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody>
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      <p className="mb-0">Bitcoin (24H)</p>
                    </div>
                    <h3 className="mt-3">USD 1254.36</h3>
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
        </div>

        <h2 className="rmHeading mt-5">Top Gainers</h2>

        <div className="row">
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody className="rmCard">
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      {/* <p className="mb-0">{formattedTokens ? formattedTokens[0]?.name : ''} (24H)</p> */}
                    </div>
                    {/* <h3 className="mt-3">USD {formattedTokens ? formattedTokens[0]?.priceUSD : ''}</h3> */}
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody>
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      {/* <p className="mb-0">{formattedTokens ? formattedTokens[1]?.name : ''} (24H)</p> */}
                    </div>
                    {/* <h3 className="mt-3">USD {formattedTokens ? formattedTokens[1]?.priceUSD : ''}</h3> */}
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody>
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      {/* <p className="mb-0">{formattedTokens ? formattedTokens[2]?.name : ''} (24H)</p> */}
                    </div>
                    {/* <h3 className="mt-3">USD {formattedTokens ? formattedTokens[2]?.priceUSD : ''}</h3> */}
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
        </div>

        <h2 className="rmHeading mt-5">Top Losers</h2>

        <div className="row">
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody className="rmCard">
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      <p className="mb-0">Bitcoin (24H)</p>
                    </div>
                    <h3 className="mt-3">USD 1254.36</h3>
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody>
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      <p className="mb-0">Bitcoin (24H)</p>
                    </div>
                    <h3 className="mt-3">USD 1254.36</h3>
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <CardBody>
              <div className="row">
                <div className="col-6">
                  <RateCurrency>
                    <div className="d-flex align-items-center">
                      <BsCurrencyBitcoin className="headerIcon me-2" />{" "}
                      <p className="mb-0">Bitcoin (24H)</p>
                    </div>
                    <h3 className="mt-3">USD 1254.36</h3>
                  </RateCurrency>
                </div>
                <div className="col-6"></div>
              </div>
            </CardBody>
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-md-8">
            {/* <div className="rmAccordian"> */}
            <RateCurrency>
              <h5>FAQ</h5>
            </RateCurrency>

            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <AccordianButton
                    className=""
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne">
                    Accordion Item #1
                  </AccordianButton>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <AccordionText>
                      It is shown by default, until the collapse plugin adds the
                      appropriate classNamees that we use to style each element.
                      These classNamees control the overall appearance, as well
                      as the showing and hiding via CSS transitions. You can
                      modify any of this with custom CSS or overriding our
                      default variables. Its also worth noting that just about
                      any HTML can go within the, though the transition does
                      limit overflow.
                    </AccordionText>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <AccordianButton
                    className="collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo">
                    Accordion Item #2
                  </AccordianButton>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <AccordionText>
                      It is shown by default, until the collapse plugin adds the
                      appropriate classNamees that we use to style each element.
                      These classNamees control the overall appearance, as well
                      as the showing and hiding via CSS transitions. You can
                      modify any of this with custom CSS or overriding our
                      default variables. Its also worth noting that just about
                      any HTML can go within the, though the transition does
                      limit overflow.
                    </AccordionText>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <AccordianButton
                    className="collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree">
                    Accordion Item #3
                  </AccordianButton>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <AccordionText>
                      It is shown by default, until the collapse plugin adds the
                      appropriate classNamees that we use to style each element.
                      These classNamees control the overall appearance, as well
                      as the showing and hiding via CSS transitions. You can
                      modify any of this with custom CSS or overriding our
                      default variables. Its also worth noting that just about
                      any HTML can go within the, though the transition does
                      limit overflow.
                    </AccordionText>
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
          <div className="col-12 col-md-4">
            <CardBody>
              <div className="videoModal">
                {/* <ReactPlayer width="100%" height="100%" url="https://www.youtube.com/watch?v=ysz5S6PUM-U" /> */}
              </div>
            </CardBody>
          </div>
        </div>
      </div>
    </>
  );
}
