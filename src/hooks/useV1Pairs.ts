import { Interface } from "@ethersproject/abi";
import { Currency, CurrencyAmount } from "@panaromafinance/panaromaswap_sdkcore";
import { abi as IPanaromaswapV1PairABI } from "@panaromafinance/panaromaswap_v1core/build/IPanaromaswapV1Pair.json";
import { computePairAddress, Pair } from "@panaromafinance/panaromaswap_v1sdk";
import { useMultipleContractSingleData } from "lib/hooks/multicall";
import { useMemo } from "react";
// import { keccak256 } from '@ethersproject/solidity'
// import { pack } from '@ethersproject/solidity'
// import { getCreate2Address } from '@ethersproject/address'
// import { defaultAbiCoder } from '@ethersproject/abi'

import { V1_FACTORY_ADDRESSES } from "../constants/addresses";

const PAIR_INTERFACE = new Interface(IPanaromaswapV1PairABI);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export function useV1Pairs(
  currencies: [Currency | undefined, Currency | undefined][]
): [PairState, Pair | null][] {
  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        currencyA?.wrapped,
        currencyB?.wrapped
      ]),
    [currencies]
  );

  // return address.getCreate2Address(FACTORY_ADDRESS, solidity.keccak256(['bytes'], [abi.defaultAbiCoder.encode(['address', 'address'], [token0.address, token1.address])]), INIT_CODE_HASH);
  // console.log(tokens)
  // const _pairAddresses = useMemo(
  //   () =>
  //     tokens.map(([tokenA, tokenB]) => {
  //       // console.log(V1_FACTORY_ADDRESSES[tokenA.chainId], tokenA, tokenB)

  //       // var _ref2 = [tokenA, tokenB],
  //       //     token0 = _ref2[0],
  //       //     token1 = _ref2[1]; // does safety checks
  //       return getCreate2Address('0xBBeC80B1e12b3b3e21E79B04659F1ebe00712633', keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address'], ["0xd060d9e18795C9F1A3E13255c1fc5600ecf4fa35", "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"])]), '0x1af868364d27dd336f434354c7df44061a1221d2226b05e377fc491ef4a0c689');
  //     }),
  //   [tokens]
  // )
  // console.log(_pairAddresses)

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        // console.log(V1_FACTORY_ADDRESSES[tokenA.chainId], tokenA, tokenB)
        return tokenA &&
          tokenB &&
          tokenA.chainId === tokenB.chainId &&
          !tokenA.equals(tokenB) &&
          V1_FACTORY_ADDRESSES[tokenA.chainId]
          ?
          computePairAddress({
            factoryAddress: V1_FACTORY_ADDRESSES[tokenA.chainId],
            tokenA,
            tokenB
          })
          : undefined;
        //  return ['0x7CB563d432797ec531B910e69b1156B2A1493115']
      }),
    [tokens]
  );
  //  const pairAddresses = ['0xB40867c2F09b13779AFFE0974195C6C15651CD73']
  // console.log(pairAddresses);

  if (pairAddresses !== undefined) {
    if (pairAddresses.length > 0) {
      // localStorage.setItem("Pairadrress", pairAddresses);
    } else {
      const temp = localStorage.getItem("Pairadrress");
      // pairAddresses = temp
    }
  }

  const results = useMultipleContractSingleData(
    pairAddresses,
    PAIR_INTERFACE,
    "getReserves"
  );


  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result;
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB))
        return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(
          CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
          CurrencyAmount.fromRawAmount(token1, reserve1.toString())
        )
      ];
    });
  }, [results, tokens]);
}

export function useV1Pair(
  tokenA?: Currency,
  tokenB?: Currency
): [PairState, Pair | null] {
  const inputs: [[Currency | undefined, Currency | undefined]] = useMemo(
    () => [[tokenA, tokenB]],
    [tokenA, tokenB]
  );
  return useV1Pairs(inputs)[0];
}
