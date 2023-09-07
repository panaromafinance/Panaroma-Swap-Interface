import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import ReferralTable from "pages/ReferralTable";
import Web3 from "web3";
import userDetailsABA from "../../abis/userDetailsABA.json"

export default function ReferralLevel() {
    const { address } = useParams<{ address?: string }>();
    const [referralURL] = useState(process.env['REACT_APP_REFERRAL_BASE_URL']);
    const [referralListData, setReferralListData] = useState([]);
    const contractAddress = process.env['REACT_APP_REF_FACTORY_ADDRESS'];


    const web3 = new Web3(
        new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
    );

    const userABA = userDetailsABA as any;
    useEffect(() => {
        getReferralList();
    }, [address])
    // getReferralList();

    async function getReferralList() {
        axios
            .get(referralURL + "checkUserData/" + address)
            .then(async function (response) {
               // console.log("&&&&&&&& response", response);
                if (response.data.status) {
                    const referralDataList = response.data.message.partners;
                    const referralList = [] as any;
                    for (let index = 0; index < referralDataList.length; index++) {
                        const referral = referralDataList[index];
                        const contract = new web3.eth.Contract(userABA, contractAddress);

                        const userResponse = await contract.methods.getUserInfo(referral).call();

                        if (userResponse) {

                            referralList.push({ "address": referral, "totalAmount": 0 })
                          //  console.log("00000 referralListData", referralListData);

                        }
                    }

                    setReferralListData(referralList);

                   // console.log("0000 referraladdress", referralDataList)
                }
            });
    }

    return <div>
        {/* Hello! {referralListData.length} */}
        <ReferralTable referralDataList={referralListData} /></div>
}