import { Navigate, useParams } from "react-router-dom";

import AddLiquidityV1 from "./index";

export function RedirectDuplicateTokenIdsV1() {
  const { currencyIdA, currencyIdB } = useParams<{
    currencyIdA: string;
    currencyIdB: string;
  }>();

  if (
    currencyIdA &&
    currencyIdB &&
    currencyIdA.toLowerCase() === currencyIdB.toLowerCase()
  ) {
    return <Navigate to={`/add/v1/${currencyIdA}`} replace />;
  }

  return <AddLiquidityV1 />;
}
