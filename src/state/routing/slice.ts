import { BaseProvider, JsonRpcProvider } from "@ethersproject/providers";
import {
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Protocol } from "@panaromafinance/panaromaswap_routersdk";
import { ChainId } from "@panaromafinance/panaromaswap_smartorderrouter";
import { RPC_URLS } from "constants/networks";
import {
  getClientSideQuote,
  toSupportedChainId
} from "lib/hooks/routing/clientSideSmartOrderRouter";
import ms from "ms.macro";
import qs from "qs";

import { GetQuoteResult } from "./types";

import store, { AppState } from "state";

const routerProviders = new Map<ChainId, BaseProvider>();
function getRouterProvider(chainId: ChainId): BaseProvider {
  const provider = routerProviders.get(chainId);
  if (provider) return provider;

  const rpc = (store.getState() as AppState).user.rpcUrl;
  const rpcUrl = rpc ? rpc : RPC_URLS;

  const supportedChainId = toSupportedChainId(chainId);
  if (supportedChainId) {
    const provider = new JsonRpcProvider(rpcUrl[supportedChainId]);
    routerProviders.set(chainId, provider);
    return provider;
  }

  throw new Error(`Router does not support this chain (chainId: ${chainId}).`);
}

const protocols: Protocol[] = [Protocol.V1];

const DEFAULT_QUERY_PARAMS = {
  protocols: protocols.map((p) => p.toLowerCase()).join(",")
  // example other params
  // forceCrossProtocol: 'true',
  // minSplits: '5',
};

export const routingApi = createApi({
  reducerPath: "routingApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://api.panaromaswap.org/v1/',
    baseUrl: "https://"
  }),
  endpoints: (build) => ({
    getQuote: build.query<
      GetQuoteResult,
      {
        tokenInAddress: string;
        tokenInChainId: ChainId;
        tokenInDecimals: number;
        tokenInSymbol?: string;
        tokenOutAddress: string;
        tokenOutChainId: ChainId;
        tokenOutDecimals: number;
        tokenOutSymbol?: string;
        amount: string;
        useClientSideRouter: boolean; // included in key to invalidate on change
        type: "exactIn" | "exactOut";
      }
    >({
      async queryFn(args, _api, _extraOptions, fetch) {
        const {
          tokenInAddress,
          tokenInChainId,
          tokenOutAddress,
          tokenOutChainId,
          amount,
          useClientSideRouter,
          type
        } = args;

        let result;

        try {
          if (1) {
            const chainId = args.tokenInChainId;
            const params = { chainId, provider: getRouterProvider(chainId) };
            result = await getClientSideQuote(args, params, { protocols });
          } else {
            const query = qs.stringify({
              ...DEFAULT_QUERY_PARAMS,
              tokenInAddress,
              tokenInChainId,
              tokenOutAddress,
              tokenOutChainId,
              amount,
              type
            });
            result = await fetch(`quote?${query}`);
          }
          // console.log("router api passed....",result.data)

          return { data: result.data as GetQuoteResult };
        } catch (e) {
          // TODO: fall back to client-side quoter when auto router fails.
          // deprecate 'legacy' v1/v2edge routers first.

          return { error: e as FetchBaseQueryError };
          // return { data: undefined };
        }
      },
      keepUnusedDataFor: ms`10s`,
      extraOptions: {
        maxRetries: 0
      }
    })
  })
});

export const { useGetQuoteQuery } = routingApi;
