import { BigNumber } from "@ethersproject/bignumber";
import { Currency, CurrencyAmount } from "@panaromafinance/panaromaswap_sdkcore";
import { Pool } from "@panaromafinance/panaromaswap_v2edgesdk";
import { useSingleCallResult } from "lib/hooks/multicall";
import useBlockNumber from "lib/hooks/useBlockNumber";
import { useEffect, useState } from "react";
import { unwrappedToken } from "utils/unwrappedToken";

import { useV2edgeNFTPositionManagerContract } from "./useContract";

const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1);

// compute current + counterfactual fees for a v2edge position
export function useV2edgePositionFees(
  pool?: Pool,
  tokenId?: BigNumber,
  asWETH = false
):
  | [CurrencyAmount<Currency>, CurrencyAmount<Currency>]
  | [undefined, undefined] {
  const positionManager = useV2edgeNFTPositionManagerContract(false);
  const owner: string | undefined = useSingleCallResult(
    tokenId ? positionManager : null,
    "ownerOf",
    [tokenId]
  ).result?.[0];

  const tokenIdHexString = tokenId?.toHexString();
  const latestBlockNumber = useBlockNumber();

  // we can't use multicall for this because we need to simulate the call from a specific address
  // latestBlockNumber is included to ensure data stays up-to-date every block
  const [amounts, setAmounts] = useState<[BigNumber, BigNumber] | undefined>();
  useEffect(() => {
    if (positionManager && tokenIdHexString && owner) {
      positionManager.callStatic
        .collect(
          {
            tokenId: tokenIdHexString,
            recipient: owner, // some tokens might fail if transferred to address(0)
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128
          },
          { from: owner } // need to simulate the call as the owner
        )
        .then((results) => {
          setAmounts([results.amount0, results.amount1]);
        });
    }
  }, [positionManager, tokenIdHexString, owner, latestBlockNumber]);

  if (pool && amounts) {
    return [
      CurrencyAmount.fromRawAmount(
        asWETH ? pool.token0 : unwrappedToken(pool.token0),
        amounts[0].toString()
      ),
      CurrencyAmount.fromRawAmount(
        asWETH ? pool.token1 : unwrappedToken(pool.token1),
        amounts[1].toString()
      )
    ];
  } else {
    return [undefined, undefined];
  }
}
