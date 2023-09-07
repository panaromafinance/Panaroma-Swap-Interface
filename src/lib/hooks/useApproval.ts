// import { MaxUint256 } from "@ethersproject/constants";
import { TransactionResponse } from "@ethersproject/providers";
import { Currency, CurrencyAmount, Token } from "@panaromafinance/panaromaswap_sdkcore";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";
import { useTokenContract } from "hooks/useContract";
import { useTokenAllowance } from "hooks/useTokenAllowance";
import { useCallback, useMemo } from "react";
import { calculateGasMargin } from "utils/calculateGasMargin";

export enum ApprovalState {
  UNKNOWN = "UNKNOWN",
  NOT_APPROVED = "NOT_APPROVED",
  PENDING = "PENDING",
  APPROVED = "APPROVED"
}

export function useApprovalStateForSpender(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): ApprovalState {
  const { account } = useWeb3React();
  const token = amountToApprove?.currency?.isToken
    ? amountToApprove.currency
    : undefined;

  const currentAllowance = useTokenAllowance(
    token,
    account ?? undefined,
    spender
  );
  const pendingApproval = useIsPendingApproval(token, spender);

  return useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, pendingApproval, spender]);
}

export function useApproval(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
    ApprovalState,
    () => Promise<
      | {
        response: TransactionResponse;
        tokenAddress: string;
        spenderAddress: string;
      }
      | undefined
    >
  ] {
  const { chainId } = useWeb3React();
  const token = amountToApprove?.currency?.isToken
    ? amountToApprove.currency
    : undefined;

  // console.log("969696 spender", spender);

  // check the current approval status
  const approvalState = useApprovalStateForSpender(
    amountToApprove,
    spender,
    useIsPendingApproval
  );

  const tokenContract = useTokenContract(token?.address);
  const MaxUint256 = BigNumber.from(100000000000)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || "Token"} approval failed:`, error);
      return;
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure("approve was called unnecessarily");
    } else if (!chainId) {
      return logFailure("no chainId");
    } else if (!token) {
      return logFailure("no token");
    } else if (!tokenContract) {
      return logFailure("tokenContract is null");
    } else if (!amountToApprove) {
      return logFailure("missing amount to approve");
    } else if (!spender) {
      return logFailure("no spender");
    }

    let useExact = false;
    // console.log("++++++ amountToApprove 2", amountToApprove);

    const amountToApproveWithModifiedPercentValue = Number(amountToApprove.quotient) + Number(amountToApprove.quotient) * (1 / 1000);

    // console.log("++++++ amountToApprove.quotient MaxUint256", MaxUint256);


    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, MaxUint256)
      .catch(() => {
        // console.log("++++++ amountToApprove.quotient error", amountToApprove.quotient.toString(), temp.toString());
        // general fallback for tokens which restrict approval amounts
        useExact = true;
        return tokenContract.estimateGas.approve(
          spender,
          // amountToApprove.quotient.toString()
          amountToApproveWithModifiedPercentValue.toString()
        );
      });


    return tokenContract
      // .approve(
      //   spender,
      //   useExact ? amountToApprove.quotient.toString() : MaxUint256,
      //   {
      //     gasLimit: calculateGasMargin(estimatedGas)
      //   }
      // )
      .approve(
        spender,
        useExact ? amountToApproveWithModifiedPercentValue.toString() : MaxUint256,
        {
          gasLimit: calculateGasMargin(estimatedGas)
        }
      )
      .then((response) => ({
        response,
        tokenAddress: token.address,
        spenderAddress: spender
      }))
      .catch((error: Error) => {
        logFailure(error);
        throw error;
      });
  }, [approvalState, token, tokenContract, spender, chainId]);

  return [approvalState, approve];
}
