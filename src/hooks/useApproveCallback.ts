import { Trade } from "@panaromafinance/panaromaswap_routersdk";
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType
} from "@panaromafinance/panaromaswap_sdkcore";
import { Trade as V1Trade } from "@panaromafinance/panaromaswap_v1sdk";
import { Trade as V2edgeTrade } from "@panaromafinance/panaromaswap_v2edgesdk";
import useSwapApproval, {
  useSwapApprovalOptimizedTrade
} from "lib/hooks/swap/useSwapApproval";
import { ApprovalState, useApproval } from "lib/hooks/useApproval";
import { useCallback } from "react";

import {
  useHasPendingApproval,
  useTransactionAdder
} from "../state/transactions/hooks";
import { TransactionType } from "../state/transactions/types";
import { useAppDispatch } from "state/hooks";
import { addPopup } from "state/application/reducer";

export { ApprovalState } from "lib/hooks/useApproval";

function useGetAndTrackApproval(
  getApproval: ReturnType<typeof useApproval>[1]
) {
  const addTransaction = useTransactionAdder();
  const dispatch = useAppDispatch();

  return useCallback(() => {
    return getApproval().then((pending) => {
      if (pending) {
        const { response, tokenAddress, spenderAddress: spender } = pending;
        addTransaction(response, {
          type: TransactionType.APPROVAL,
          tokenAddress,
          spender
        });
      }
    }).catch(err => {
      dispatch(
        addPopup({
          content: { rejectAction: err.code ? err.code : "Failed" },
          key: `reject-action`
        })
      )
    });;
  }, [addTransaction, getApproval]);
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  // console.log("969696 amountToApprove", amountToApprove);
  
  const [approval, getApproval] = useApproval(
    amountToApprove,
    spender,
    useHasPendingApproval
  );
  return [approval, useGetAndTrackApproval(getApproval)];
}

export function useApprovalOptimizedTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent
) {
  return useSwapApprovalOptimizedTrade(
    trade,
    allowedSlippage,
    useHasPendingApproval
  );
}

export function useApproveCallbackFromTrade(
  trade:
    | V1Trade<Currency, Currency, TradeType>
    | V2edgeTrade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined,
  allowedSlippage: Percent
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useSwapApproval(
    trade,
    allowedSlippage,
    useHasPendingApproval
  );
  return [approval, useGetAndTrackApproval(getApproval)];
}
