import styled from "styled-components/macro";
import { Trans } from "@lingui/macro";

const AccordionText = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;

const AccordianButton = styled.button`
  color: ${({ theme }) => theme.deprecated_text1} !important;
  background: ${({ theme }) => theme.deprecated_bg0} !important;
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

  &::after {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    margin-left: auto;
    content: "";
    background-image: url(
      data:image/svg + xml,
      %3csvgxmlns="http://www.w3.org/2000/svg"viewBox="0 0 16 16"fill="%23212529"%3e%3cpathfill-rule="evenodd"d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/%3e%3c/svg%3e
    );
    background-repeat: no-repeat;
    background-size: 1.25rem;
  }
`;

export default function Faq() {
  return (
    <div className="row mt-3">
      <div className="col-md-6">
        {/* <div className="faq-accordian"> */}
        <div className="accordion" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne">
                  <Trans>Where do I get my referral link?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse"
              aria-labelledby="headingOne"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Connect a wallet and find your referral link in the Referral section.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo">
                  <Trans>How do I invite a referral friend?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseTwo"
              className="accordion-collapse collapse"
              aria-labelledby="headingTwo"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Invite your friends to register via your referral link.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree">
                  <Trans>Are there separate balances for referral rewards from friends Swaps, Farms, Launchpools?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseThree"
              className="accordion-collapse collapse"
              aria-labelledby="headingThree"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Yes, there are three separate balances for the referral rewards.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFour">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFour"
                aria-expanded="false"
                aria-controls="collapseFour">
                  <Trans>How do I generate a new referral link?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseFour"
              className="accordion-collapse collapse"
              aria-labelledby="headingFour"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Find `My Referral Link` block and click on the `plus` button near the link field. Choose the profit share for your friends and click generate a referral link.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFive">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFive"
                aria-expanded="false"
                aria-controls="collapseFive">
                  <Trans>How does profit sharing work?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseFive"
              className="accordion-collapse collapse"
              aria-labelledby="headingFive"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Profit sharing allows you to share a portion of referral rewards with your invited friends. The percentage can be: 0%, 10% 25%, 50%</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSix">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseSix"
                aria-expanded="false"
                aria-controls="collapseSix">
                  <Trans>Where are all my generated referral links?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseSix"
              className="accordion-collapse collapse"
              aria-labelledby="headingSix"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>View all of your generated links on the `Referral Links` section of the Referral page.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSeven">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseSeven"
                aria-expanded="false"
                aria-controls="collapseSeven">
                  <Trans>In what crypto currency the referral commission is accounted to my referral balance?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseSeven"
              className="accordion-collapse collapse"
              aria-labelledby="headingSeven"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>The referral rewards are accounted in BSW tokens only.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingEight">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseEight"
                aria-expanded="false"
                aria-controls="collapseEight">
                  <Trans>Are there fees for referral rewards withdrawal from referral balances?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseEight"
              className="accordion-collapse collapse"
              aria-labelledby="headingEight"
              data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Once you withdraw from your referral balances, a BSC network fee of approximately 0.5 BSW will be charged.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}
      </div>
      <div className="col-md-6">
        <div className="accordion" id="accordionExampleTwo">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingNine">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseNine"
                aria-expanded="true"
                aria-controls="collapseNine">
                  <Trans>How much crypto can I earn via the Swap Referral Program?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseNine"
              className="accordion-collapse collapse"
              aria-labelledby="headingNine"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>You can earn from 10% to 20% in BSW right after your friends have made a swap. The percentage depends on the amount of staked BSW tokens in BSW Holder Pool</Trans>:
                  <br />
                  0 BSW Staked = 10% Reff Bonus
                  <br />
                  200 BSW Staked = 12% Reff Bonus
                  <br />
                  1 000 BSW Staked = 14% Reff Bonus
                  <br />
                  3 000 BSW Staked = 16% Reff Bonus
                  <br />
                  7 000 BSW Staked = 18% Reff Bonus
                  <br />
                  10 000 BSW Staked = 20% Reff Bonus
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTen">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTen"
                aria-expanded="false"
                aria-controls="collapseTen">
                  <Trans>What percentage of Swap referral rewards will I earn if I have 0 BSW staked in BSW Holder Pool?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseTen"
              className="accordion-collapse collapse"
              aria-labelledby="headingTen"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>If you have 0 BSW staked in the BSW Holder pool, you will be getting 10% by default. To earn more in the Swap Referral Program on Panaswap, you need to stake BSW in the Holder Pool.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingEleven">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseEleven"
                aria-expanded="false"
                aria-controls="collapseEleven">
                  <Trans>Is the Swap referral program active for all swap pairs?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseEleven"
              className="accordion-collapse collapse"
              aria-labelledby="headingEleven"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>No. Referral Program consider only whitelisted pairs, including but not limited to</Trans>
                  :ETH - BTCB, BUSD - USDT, BTCB -
                  USDT, ETH - USDT, USDC - USDT, BNB - BSW, ETH - BNB, BNB -
                  USDT, BNB - BUSD, BNB - BTCB, USDT - BSW, LINK - BNB, ADA -
                  BNB, DOGE - BNB, CAKE - BNB, UST - BUSD, DOT - BNB, DAI -
                  USDT, PANA - BNB, FIL - USDT, USDT - LTC, BUSD - VAI, SOL -
                  BNB, BUSD - TUSD, BFG - BSW, XVS - BNB, AVAX - BNB. <Trans>Find the complete list of whitelisted pairs in Panaswap Docs</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwelve">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwelve"
                aria-expanded="false"
                aria-controls="collapseTwelve">
                  <Trans>How much can I earn from my friends Farms & Launchpools?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseTwelve"
              className="accordion-collapse collapse"
              aria-labelledby="headingTwelve"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>You can expect a 5% return from your friends earnings in BSW.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThirteen">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThirteen"
                aria-expanded="false"
                aria-controls="collapseThirteen">
                  <Trans>Is Referral Program Active for all Launchpools?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseThirteen"
              className="accordion-collapse collapse"
              aria-labelledby="headingThirteen"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>No. Referral Program is active only for Stake BSW - Earn BSW Launchpool without auto-compound.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFourteen">
              <AccordianButton
                className="accordion-button  collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFourteen"
                aria-expanded="false"
                aria-controls="collapseFourteen">
                  <Trans>When will I get my referral reward from Farms & Launchpools?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseFourteen"
              className="accordion-collapse collapse"
              aria-labelledby="headingFourteen"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>You will get your referral reward the moment your friend makes Harvest.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFifteen">
              <AccordianButton
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFifteen"
                aria-expanded="false"
                aria-controls="collapseFifteen">
                  <Trans>Can I profit from the Referral Program without any investments from my side?</Trans>
              </AccordianButton>
            </h2>
            <div
              id="collapseFifteen"
              className="accordion-collapse collapse"
              aria-labelledby="headingFifteen"
              data-bs-parent="#accordionExampleTwo">
              <div className="accordion-body">
                <AccordionText>
                  <Trans>Yes, you can earn 10% from the Swap Referral Program and 5% from Farms & Launchpools without any required investments from your side.</Trans>
                </AccordionText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
