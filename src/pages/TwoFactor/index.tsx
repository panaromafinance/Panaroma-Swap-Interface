import { useWeb3React } from "@web3-react/core";
import axios from "axios";
// import Faq from "components/Faq";
import { useEffect, useState } from "react";
// import { RouteComponentProps } from "react-router-dom";
import styled from "styled-components/macro";

import EarnCrypto from "../../assets/images/EarnCrypto.png";
import getReferralLink from "../../assets/images/getReferralLink.png";
import InviteFriends from "../../assets/images/InviteFriends.png";
import { TYPE } from "../../theme";
import { useNavigate } from "react-router-dom";
import { MdOutlineDownload } from "react-icons/md";
// import { stat } from "fs";
import CopyHelper from "components/AccountDetails/Copy";
import { FaRegCopy } from "react-icons/fa";

const TextTheme = styled.div`
  color: ${({ theme }) => theme.deprecated_text1};
`;
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


export default function TwoFactor({ history }) {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(0);
  const [qrtoken, setQrtoken] = useState("");
  const [secretkey, setSecretkey] = useState("");
  const [checkauth, setCheckAuth] = useState(true);
  const [enableDisable, setEnableDisable] = useState(false);
  // const [baseurl] = useState("http://localhost:3005/");
  const [baseurl] = useState(process.env['REACT_APP_GAUTH_BASE_URL']);
  const { chainId, account } = useWeb3React();
  const [showStepTwoFA, setShowStepTwoFA] = useState(false);
  const [showreferral, setShowReferral] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [show2FASetupButton, setShow2FASetupButton] = useState(false);
  // const [showLogout, setShowLogout] = useState(false)

  // const [show, toggleShow] = useState(false);

  useEffect(() => {
    // function checklogin() {
    //   if (account == null) {
    //     setShowReferral(false)
    //     setShowLogout(true)
    //   } else {
    //     setShowReferral(true)
    //     setShowLogout(false)
    //   }
    // }
    // console.log(showreferral, account, 'account')
    // checklogin()
    //console.log("1111 status", status);

    function checklogin() {
      if (account == null) {
        setShowReferral(false);
        setShowLogout(true);
      } else {
        setShowReferral(true);
        setShowLogout(false);
      }
    }
    //console.log(showreferral, account, "account");
    checklogin();
    // console.log(chainId, "hello chainid");
    //  console.log(account, "meta account");
    if (account) {
      checkAuth();
    }
  });

  async function checkAuth() {
    const payload = { metaMaskPrivateKey: account };
    await
      axios
        .get(baseurl + "checkauthenticator/" + account)
        .then(function (response) {
          setStatus(response.data.status);
          if (response.data.status === 1) {
            setCheckAuth(false);
            setEnableDisable(true);
          } else if (response.data.status === 0) {
            setCheckAuth(true);
            setEnableDisable(false);
            setShowStepTwoFA(true);
          }
          // else if (response.data.status === 2) {
          //   setShowStepTwoFA(true);
          //   setCurrent(3);
          // }
        });
    // console.log(token);
  }

  async function hellometa() {
    //console.log(account, "select address");
    const payload = { metaMaskPrivateKey: account };
    //console.log(payload, "payload");
    axios
      .post(baseurl + "regAuth", {
        method: "POST",
        metaMaskPrivateKey: account,
        headers: {
          // 'Authorization': `bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(async (resp) => {
        //console.log("&&&& resp", resp);

        if (!resp.data.token) {
          setShowStepTwoFA(false);
        } else {
          setShowStepTwoFA(true);
        }
        setQrtoken(resp.data.token);
        setSecretkey(resp.data.secretkey)
      });
    // console.log("&&&& qrtoken", qrtoken);
  }

  const next = () => {
    setError('')
    let valid = true;
    //console.log("&&&&& current", current);

    setShow2FASetupButton(current > 1 ? true : false);

    if (current >= 5) {
      valid = false;
    } else if (current === 3) {
      valid = false;
      const payload = { token, metaMaskPrivateKey: account };
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
          //   console.log(response);
          if (response.data) {
            setCurrent(current + 1);
            setShow2FASetupButton(true);

            navigate("/account")
          } else {
            setError("Invalid token. Please enter valid token.");
          }
        });
      //console.log(token);
    }
    else if (current === 0) {
      hellometa();
    }
    if (valid) {
      setCurrent(current + 1);
      setShow2FASetupButton(true);

    }
  };

  const prev = () => {
    let valid = true;
    if (current <= 0) {
      valid = false;
    }
    if (valid) {
      setCurrent(current - 1);
    }
  };

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
          //console.log("5555 response qrtoken", response.data);

          setCurrent(current + 1);
        } else {
          setError("Invalid token. Please validate the token");
        }
      });
  };

  async function deleteUser() {
    // console.log(account, "select address");
    const payload = { metaMaskPrivateKey: account };
    //  console.log(payload, "payload");
    // axios
    //   .delete(baseurl + "deleteUser/" + account, {
    //     metaMaskPrivateKey: account,
    //     headers: {
    //       // Authorization: `bearer ${token}`,
    //       "Content-Type": "application/json"
    //     }
    //   })
    //   .then(async (resp) => {
    //     console.log(resp);
    //   });
  }

  return (
    <>
      <div style={{ width: "100%" }}>
        {status === 0 || status === null ? (
          <div className="text-center">
            {/* <button className="nextBtn" onClick={hellometa} disabled={show2FASetupButton}>
              Go for Two Factor Authentication
            </button> */}
            {showStepTwoFA ? (
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
                      <TextTheme className="step-name">Download App</TextTheme>
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
                      <TextTheme className="step-name">Scan QR Code</TextTheme>
                    </div>
                    <div
                      className={
                        "stepper-item" +
                        (current >= 3
                          ? " completed"
                          : current === 2
                            ? " active"
                            : "")
                      }>
                      <div className="step-counter">3</div>
                      <TextTheme className="step-name">Backup Key</TextTheme>
                    </div>
                    <div
                      className={
                        "stepper-item" +
                        (current >= 4
                          ? " completed"
                          : current === 3
                            ? " active"
                            : "")
                      }>
                      <div className="step-counter">4</div>
                      <TextTheme className="step-name">
                        Google Authenticator
                      </TextTheme>
                    </div>
                    <div
                      className={
                        "stepper-item" +
                        (current >= 5
                          ? " completed"
                          : current === 4
                            ? " completed"
                            : "")
                      }>
                      <div className="step-counter">5</div>
                      <TextTheme className="step-name">Complete</TextTheme>
                    </div>
                  </div>
                </div>

                {/*Step 1 Download App */}
                {current === 0 ? (
                  <div className="step-container">
                    <TextTheme className="step-title">
                      Download and install the Authenticator app
                    </TextTheme>
                    <div className="authenticatorSelection">
                      Google Authenticator
                    </div>
                    <div className="appStore">
                      <div className="playStore">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none">
                          <path
                            d="M13.559 11.087l-9.477-9.49h.092c.812 0 1.512.294 2.637.902l9.938 5.382-3.19 3.206zM12.637 12.008L2.902 21.72c-.24-.387-.405-1.014-.405-1.916V4.194c0-.903.165-1.53.405-1.917l9.735 9.731zM13.559 12.912l3.19 3.207L6.81 21.5c-1.125.608-1.826.904-2.637.904h-.092l9.477-9.492zM17.944 8.526l-3.466 3.483 3.466 3.465 2.102-1.143C20.82 13.907 22 13.133 22 12.009c0-1.143-1.18-1.917-1.954-2.34l-2.102-1.143z"
                            fill="currentColor"></path>
                        </svg>
                        <div className="download-from">Download from</div>
                        <TextTheme className="appStoreName">
                          Google Play
                        </TextTheme>
                      </div>

                      <div className="setupInstruction">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#929aa5">
                          <path
                            d="M5 3v18h14V7l-4-4H5zm3 6.5h8V12H8V9.5zm0 5h8V17H8v-2.5z"
                            fill="currentColor"></path>
                        </svg>
                        <a
                          href="www.google.com"
                          target="_blank"
                          className="setupAuth">
                          How to set up Google Authenticator
                        </a>
                      </div>
                    </div>

                    <button className="primaryBtn" onClick={next}>
                      Next
                    </button>
                  </div>
                ) : current === 1 ? (
                  <div className="step-container">
                    <TextTheme className="step-title">
                      Scan this QR code in the Authenticator app
                    </TextTheme>
                    <div className="qr-main">
                      <div className="qrCode">
                        <img
                          src={baseurl + "goauthenticator/" + qrtoken}
                          height="96"
                          width="96"
                          alt="QRToken"
                        />
                      </div>
                      {/* <div className="qrId">LSPRJM4WRBEQMXNY</div> */}
                      <div className="stepInstruction">
                        If you are unable to scan the QR code, please enter this
                        code manually into the app.
                      </div>
                    </div>

                    <div className="prevNext">
                      <button className="prevBtn" onClick={prev}>
                        Previous
                      </button>
                      <button className="nextBtn" onClick={next}>
                        Next
                      </button>
                    </div>
                  </div>
                ) : current === 2 ? (
                  <div className="step-container">
                    <TextTheme className="step-title">
                      Save this Backup Key in a secure location
                    </TextTheme>

                    <div className="qr-main">
                      {/* <div className="qrCode">
                        <img
                          src={baseurl + "goauthenticator/" + qrtoken}
                          height="96"
                          width="96"
                          alt="QRToken"
                        />
                      </div> */}
                      <div className="qrId d-md-flex d-sm-block gap-3 justify-content-center">
                        {secretkey ? secretkey.split('?')[1].substring(7) : ''}
                        <div className="d-flex justify-content-center">

                          {/* <button className="btn btn-primary me-sm-3" onClick={() => {

                              navigator.clipboard.writeText(secretkey ? secretkey.split('?')[1].substring(7) : ''); toggleShow(true)

                            }}>

                              <MdOutlineContentCopy size={20} />

                            </button> */}
                          <CopyHelper className="align-items-center" toCopy={secretkey ? secretkey.split('?')[1].substring(7) : ''} iconPosition="top">
                            <FaRegCopy className="account-icon text-light p-2" style={{ backgroundColor: "#0d6efd", fontSize: '2.5rem' }} />
                          </CopyHelper>
                          <button className="btn btn-primary" onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([secretkey ? secretkey.split('?')[1].substring(7) : ''],
                              { type: 'text/plain;charset=utf-8' });
                            element.href = URL.createObjectURL(file);
                            element.download = "2FA_Panaroma_SecretKey.txt";
                            document.body.appendChild(element);
                            element.click();
                          }} style={{ padding: '0.4rem 0.5rem 0' }}>
                            <MdOutlineDownload size={23} />
                          </button>
                        </div>
                      </div>
                      <div className="stepInstruction">
                        This Key will allow you to recover your Authenticator
                        should you lose your phone. Otherwise, resetting Google
                        Authenticator will take at least 7 days.
                      </div>
                    </div>

                    <div className="prevNext">
                      <button className="prevBtn" onClick={prev}>
                        Previous
                      </button>
                      <button className="nextBtn" onClick={next}>
                        Next
                      </button>
                    </div>
                  </div>
                ) : current === 3 ? (
                  <div className="step-container">
                    <TextTheme className="step-title">
                      Enable Authenticator by verifying your account
                    </TextTheme>

                    <div className="inbutContainer">
                      <label className="custom-lable">Authenticator Code</label>
                      <div className="custom-search twofa">
                        <input
                          onChange={(e) => { e.target.value = e.target.value.slice(0, 6); setToken(e.target.value) }}
                          type="number"
                          className="px-5 py-3 rounded border-0"
                          placeholder=""
                        />
                      </div>
                      <div className="validation">
                        Enter the 6-digit code from Google Authenticator
                      </div>
                      <p className="text-danger">{error}</p>
                    </div>

                    {/* <a className="securityUnavailable" href="#">
                  Security verification unavailable?
                </a> */}

                    <div className="prevNext">
                      <button className="prevBtn" onClick={prev}>
                        Previous
                      </button>
                      <button className="nextBtn" onClick={next}>
                        Next
                      </button>
                    </div>
                  </div>
                ) : current === 4 ? (
                  <div className="completed">The 2FA is completed</div>
                ) : null}
              </div>
            ) : <div>Please wait. Loading..</div>}
          </div>
        ) : status === 1 || status === 2 || status === 0 ? (
          <div className="">
            {/* <h3>Enable or Disable your Two factor authentication</h3>
            <button onClick={(e) => edauth()} className="ed-btn">
              {status === 1 ? "Disable" : "Enable"}
            </button> */}

            <div className="row mt-3">
              <div className="col-md-12">
                <div className="mainTitle">
                  Secure Your Account Access using Google Authenticator
                </div>
                <Desc className="mb-0 mt-3">
                  Securing your account access using Google Authenticator will require 2FA for all activities on the platform.
                </Desc>
              </div>
            </div>

            {showreferral ? (
              <div className="mt-5">
                <CardBody>
                  <TYPE.mediumHeader>
                    Google Authenticator
                  </TYPE.mediumHeader>

                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      Your account is {status !== 1 ? "Disable" : "Enable"} for 2FA with Google Authenticator, If you wish to {status === 1 ? "Disable" : "Enable"}, click on {status === 1 ? "Disable" : "Enable"} button.
                    </h6>

                    <button onClick={(e) => edauth()} className="btn mt-3 mt-md-0 px-4 btn-primary">
                      {status === 1 ? "Disable" : "Enable"}
                    </button>
                    {/* <button
                      type="button"
                      onClick={deleteUser}
                      className="btn mt-3 mt-md-0 px-4 btn-danger">
                      Delete 2FA
                    </button> */}
                    {/* <button
                      type="button"
                      className="btn mt-3 mt-md-0 px-4 btn-primary">
                      Enable
                    </button> */}
                  </div>
                </CardBody>
              </div>
            ) : null}

            {/* <ReferralTitle className="mt-5">FAQ</ReferralTitle>

            <Faq /> */}
          </div>
        ) : (

          <div>
            <div className="">
              <div className="row">
                <div className="col-md-6">
                  <div className="mainTitle">
                    Invite your friends. Earn cryptocurrency together
                  </div>
                  <Desc className="mb-0 mt-3">
                    Earn up to 20% from friends’ swap commission on Panaswap and
                    5% from their earnings on Farms & Launchpools
                  </Desc>
                </div>
              </div>

              <div>
                <ReferralTitle className="mt-5">
                  How to invite friends
                </ReferralTitle>

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
                      Gain 5% from your friends earnings on Farms! Your rewards
                      will be displayed on the referral balance at the moment
                      your invited friends withdraw their earned BSW tokens.
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
                        Connect a wallet and Invite your friends to register via
                        your referral link
                      </InviteDesc>
                    </CardBody>

                    <TYPE.largeHeader className="mt-4">
                      Launchpools Referral Rewards
                    </TYPE.largeHeader>
                    <InviteDesc className="mt-2">
                      Get 5% of from friends’ profit obtained in Launchpools!
                      The reward is only valid for the pool in which BSW is
                      staked in return for more BSW.
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
                        Receive referral rewards in BSW tokens from your
                        friends’ earnings & swaps
                      </InviteDesc>
                    </CardBody>

                    <TYPE.largeHeader className="mt-4">
                      Swaps Referral Rewards
                    </TYPE.largeHeader>
                    <InviteDesc className="mt-2">
                      Get up to 20% from friends’ swap commission each time your
                      friend makes a swap! Receive your reward immediately after
                      the swap is made. Swaps referral program will be active
                      for certain pairs only.
                    </InviteDesc>
                  </div>
                </div>
              </div>

              {/* <ReferralTitle className="mt-5">FAQ</ReferralTitle>

              <Faq /> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
