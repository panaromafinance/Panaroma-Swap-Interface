import checkLastIntegrityFactoryABI from "../abis/checkLastIntegrityFactory.json";
import checkLastIntegrityStorageABI from "../abis/checkLastIntegrityStorage.json";
import Web3 from "web3";
import moment from "moment";
import axios from "axios";
import { SupportedChainId } from "constants/chains";
import { RpcUrl } from "constants/networks";


export default async function IntegrityCheck(
    account: string | null | undefined,
    chainId: number | null | undefined,
    baseurl: string | null | undefined,
    rpcurl: RpcUrl | string[]
) {

    const checkIntegrityResponse = await checkLastIntegrity(account, chainId, rpcurl);

    if (checkIntegrityResponse) {
        // console.log("969696 tryActivation", checkIntegrityResponse.UpdatedTime, parseInt((new Date().valueOf() / 1000).toString()),
        //     new Date(checkIntegrityResponse.UpdatedTime * 1000), new Date().toLocaleString());

        const timeDifferenceInDays = await getTimeDifference(checkIntegrityResponse.UpdatedTime)

        if (timeDifferenceInDays >= 6) {
            const updateAPIRouteValue = await updateAddressRouteFunc(chainId);
            // console.log("010101 ", baseurl + updateAPIRouteValue);

            await axios.post(baseurl + updateAPIRouteValue, {
                method: "POST",
                address: account,
                headers: {
                    // 'Authorization': `bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(function async(response) {
                // console.log("010101 response", response);

                if (response.data) {
                    // needs to check
                    if (response.data.status && response.data.message.risk.toLowerCase() !== "severe")
                        return true
                    else
                        return false
                } else {
                    return null;
                }
            });
        }
        
        return true;
    } else {
        return false
    }
}
// const web3Polygon = new Web3(new Web3.providers.HttpProvider("https://dry-alien-aura.matic.quiknode.pro/912ad5bf5047ab28554965b3ae46ce0d4f976cca/"))

let web3 = new Web3(
    new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
);

async function checkLastIntegrity(
    account: string | null | undefined,
    chainId: number | null | undefined,
    rpcurl: string[] | RpcUrl
) {

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
            break;
    }

    const contractFact = new web3.eth.Contract(checkLastIntegrityFactoryABI as any, process.env.REACT_APP_VALIDATION_CONTRACT);
    const responsefact = await contractFact.methods.getUserInfo(account).call();

    const contractStorage = new web3.eth.Contract(checkLastIntegrityStorageABI as any, responsefact);
    const responseStorage = await contractStorage.methods.checkAnalysis(account).call();

    return responseStorage;
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

async function updateAddressRouteFunc(chainId: number | null | undefined) {
    switch (chainId) {
        case SupportedChainId.ARBITRUM_ONE:
        case SupportedChainId.ARBITRUM_GOERLI:
            return "updateValidationArbitrum";

        case SupportedChainId.GOERLI:
        case SupportedChainId.MAINNET:
            return "updateValidationETH";

        case SupportedChainId.OPTIMISM:
        case SupportedChainId.OPTIMISTIC_GOERLI:
            return "updateValidationOptimism";

        case SupportedChainId.POLYGON:
        case SupportedChainId.POLYGON_MUMBAI:
            return "updateValidationPolygon";

        default:
            return "updateValidationPolygon";
    }
}

// async function updateValidation(
//     baseurl: string | null | undefined,
//     account: string | null | undefined,
//     chainId: number | null | undefined
// ): Promise<any> {
//     const updateAPIRouteValue = await updateAddressRouteFunc(chainId);
//     console.log("010101 ", baseurl + updateAPIRouteValue);

//     await axios.post(baseurl + updateAPIRouteValue, {
//         method: "POST",
//         address: account,
//         headers: {
//             // 'Authorization': `bearer ${token}`,
//             "Content-Type": "application/json"
//         }
//     }).then(function async(response) {
//         console.log("010101 response", response);

//         if (response.data) {
//             // needs to check
//             return response.data;
//         } else {
//             return null;
//         }
//     });
// }
