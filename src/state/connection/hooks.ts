import { CurrencyAmount, Token } from "@panaromafinance/panaromaswap_sdkcore";
import { useWeb3React } from "@web3-react/core";
import JSBI from "jsbi";
import {
  useTokenBalance,
  useTokenBalancesWithLoadingIndicator
} from "lib/hooks/useCurrencyBalance";
import { useMemo } from "react";

import { PANA } from "../../constants/tokens";
import { useAllTokens } from "../../hooks/Tokens";
import { useUserUnclaimedAmount } from "../claim/hooks";
import { useTotalPanaromaEarned } from "../stake/hooks";

export {
  default as useCurrencyBalance,
  useCurrencyBalances,
  useNativeCurrencyBalances,
  useTokenBalance,
  useTokenBalances,
  useTokenBalancesWithLoadingIndicator
} from "lib/hooks/useCurrencyBalance";

// mimics useAllBalances
export function useAllTokenBalances(): [
  { [tokenAddress: string]: CurrencyAmount<Token> | undefined },
  boolean
] {
  const { account } = useWeb3React();
  const allTokens = useAllTokens();
  const allTokensArray = useMemo(
    () => Object.values(allTokens ?? {}),
    [allTokens]
  );
  const [balances, balancesIsLoading] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    allTokensArray
  );
  return [balances ?? {}, balancesIsLoading];
}

// get the total owned, unclaimed, and unharvested PANA for account
export function useAggregatePanaromaBalance():
  | CurrencyAmount<Token>
  | undefined {
  const { account, chainId } = useWeb3React();

  const PANA = chainId ? PANA[chainId] : undefined;

  const uniBalance: CurrencyAmount<Token> | undefined = useTokenBalance(
    account ?? undefined,
    PANA
  );
  const uniUnclaimed: CurrencyAmount<Token> | undefined =
    useUserUnclaimedAmount(account);
  const uniUnHarvested: CurrencyAmount<Token> | undefined =
    useTotalPanaromaEarned();

  if (!PANA) return undefined;

  return CurrencyAmount.fromRawAmount(
    PANA,
    JSBI.add(
      JSBI.add(
        uniBalance?.quotient ?? JSBI.BigInt(0),
        uniUnclaimed?.quotient ?? JSBI.BigInt(0)
      ),
      uniUnHarvested?.quotient ?? JSBI.BigInt(0)
    )
  );
}
