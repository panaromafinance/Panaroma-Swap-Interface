import { CurrencyAmount, Token } from "@panaromafinance/panaromaswap_sdkcore";

import { PermitInfo, PermitType, useERC20Permit } from "./useERC20Permit";
import useTransactionDeadline from "./useTransactionDeadline";

const REMOVE_V1_LIQUIDITY_PERMIT_INFO: PermitInfo = {
  version: "1",
  name: "Panaromaswap V1",
  type: PermitType.AMOUNT
};

export function useV1LiquidityTokenPermit(
  liquidityAmount: CurrencyAmount<Token> | null | undefined,
  spender: string | null | undefined
) {
  const transactionDeadline = useTransactionDeadline();
  return useERC20Permit(
    liquidityAmount,
    spender,
    transactionDeadline,
    REMOVE_V1_LIQUIDITY_PERMIT_INFO
  );
}
