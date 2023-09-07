import { nanoid } from "@reduxjs/toolkit";
import { TokenList } from "@panaromafinance/panaromaswap_v1tokenlist";
// import { MAINNET_PROVIDER } from "constants/networks";
import getTokenList from "lib/hooks/useTokenList/fetchTokenList";
import resolveENSContentHash from "lib/utils/resolveENSContentHash";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { JsonRpcProvider } from "@ethersproject/providers";
import { fetchTokenList } from "../state/lists/actions";
import { SupportedChainId } from "constants/chains";

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
if (typeof INFURA_KEY === "undefined") {
  throw new Error(
    `REACT_APP_INFURA_KEY must be a defined environment variable`
  );
}

export function useFetchListCallback(): (
  listUrl: string,
  sendDispatch?: boolean
) => Promise<TokenList> {
  const dispatch = useAppDispatch();
  const rpcurlQuickNode = useAppSelector((state) => state.user.rpcUrl)
  // const rpcurl = rpcurlQuickNode ? new JsonRpcProvider(rpcurlQuickNode[SupportedChainId.MAINNET]) : MAINNET_PROVIDER;
  const rpcurl = rpcurlQuickNode ? new JsonRpcProvider(rpcurlQuickNode[SupportedChainId.MAINNET]) : new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`);
  // note: prevent dispatch if using for list search or unsupported list

  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid();
      sendDispatch &&
        dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      return getTokenList(listUrl, (ensName: string) =>
        resolveENSContentHash(ensName, rpcurl)
      )
        .then((tokenList) => {
          sendDispatch &&
            dispatch(
              fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId })
            );
          return tokenList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          sendDispatch &&
            dispatch(
              fetchTokenList.rejected({
                url: listUrl,
                requestId,
                errorMessage: error.message
              })
            );
          throw error;
        });
    },
    [dispatch]
  );
}