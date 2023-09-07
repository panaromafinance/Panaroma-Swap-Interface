import { Pool, Position } from "@panaromafinance/panaromaswap_v2edgesdk";
import { usePool } from "hooks/usePools";
import { PositionDetails } from "types/position";

import { useCurrency } from "./Tokens";

export function useDerivedPositionInfo(
  positionDetails: PositionDetails | undefined
): {
  position: Position | undefined;
  pool: Pool | undefined;
} {
  const currency0 = useCurrency(positionDetails?.token0);
  const currency1 = useCurrency(positionDetails?.token1);
  // console.log(currency0, currency1);

  // construct pool data
  const [, pool] = usePool(
    currency0 ?? undefined,
    currency1 ?? undefined,
    positionDetails?.fee
  );

  let position;
  if (pool && positionDetails) {
    position = new Position({
      pool,
      liquidity: positionDetails.liquidity.toString(),
      tickLower: positionDetails.tickLower,
      tickUpper: positionDetails.tickUpper
    });
  }
  // console.log(positionDetails);

  return {
    position,
    pool: pool ?? undefined
  };
}
