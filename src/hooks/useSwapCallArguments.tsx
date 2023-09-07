import { BigNumber } from "@ethersproject/bignumber";
import { SwapRouter, Trade } from "@panaromafinance/panaromaswap_routersdk";
import { Currency, Percent, TradeType } from "@panaromafinance/panaromaswap_sdkcore";
import { Router as V1SwapRouter, SwapParameters, Trade as V1Trade } from "@panaromafinance/panaromaswap_v1sdk";
import {
  FeeOptions,
  SwapRouter as V2edgeSwapRouter,
  Trade as V2edgeTrade
} from "@panaromafinance/panaromaswap_v2edgesdk";
import { useWeb3React } from "@web3-react/core";
import { SWAP_ROUTER_ADDRESSES, V2edge_ROUTER_ADDRESS } from "constants/addresses";
import { useMemo } from "react";
import approveAmountCalldata from "utils/approveAmountCalldata";

import { useArgentWalletContract } from "./useArgentWalletContract";
import { useV1RouterContract } from "./useContract";
import useENS from "./useENS";
import { SignatureData } from "./useERC20Permit";

export type AnyTrade =
  | V1Trade<Currency, Currency, TradeType>
  | V2edgeTrade<Currency, Currency, TradeType>
  | Trade<Currency, Currency, TradeType>;

interface SwapCall {
  address: string;
  calldata: string;
  value: string;
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName the ENS name or address of the recipient of the swap output
 * @param signatureData the signature data of the permit of the input token amount, if available
 */
export function useSwapCallArguments(
  trade: AnyTrade | undefined,
  allowedSlippage: Percent,
  recipientAddressOrName: string | null | undefined,
  signatureData: SignatureData | null | undefined,
  deadline: BigNumber | undefined,
  feeOptions: FeeOptions | undefined
): SwapCall[] {
  const { account, chainId, provider } = useWeb3React();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient =
    recipientAddressOrName === null ? account : recipientAddress;
  const routerContract = useV1RouterContract();
  const argentWalletContract = useArgentWalletContract();

  return useMemo(() => {
    if (!trade || !recipient || !provider || !account || !chainId || !deadline)
      return [];

    if (trade instanceof V1Trade) {
      if (!routerContract) return [];
      const swapMethods: SwapParameters[] = [];
      // console.log("323232 trade", trade);

      swapMethods.push(
        V1SwapRouter.swapCallParameters(trade, {
          feeOnTransfer: false,
          allowedSlippage,
          recipient,
          deadline: deadline.toNumber()
        })
      );

      if (trade.tradeType === TradeType.EXACT_INPUT) {
        swapMethods.push(
          V1SwapRouter.swapCallParameters(trade, {
            feeOnTransfer: true,
            allowedSlippage,
            recipient,
            deadline: deadline.toNumber()
          })
        );
      }
      return swapMethods.map(({ methodName, args, value }) => {
        // console.log("323232 args", args, methodName);
        // if (methodName === "swapExactTokensForETHSupportingFeeOnTransferTokens" ||
        //   methodName === "swapExactTokensForTokensSupportingFeeOnTransferTokens") {
        //   args[1] = "0"
        // }

        // if (methodName === "swapExactETHForTokensSupportingFeeOnTransferTokens") {
        //   args[0] = "0"
        // }


        if (argentWalletContract && trade.inputAmount.currency.isToken) {
          return {
            address: argentWalletContract.address,
            calldata: argentWalletContract.interface.encodeFunctionData(
              "wc_multiCall",
              [
                [
                  approveAmountCalldata(
                    trade.maximumAmountIn(allowedSlippage),
                    routerContract.address
                  ),
                  {
                    to: routerContract.address,
                    value,
                    data: routerContract.interface.encodeFunctionData(
                      methodName,
                      args
                    )
                  }
                ]
              ]
            ),
            value: "0x0"
          };
        } else {
          return {
            address: routerContract.address,
            calldata: routerContract.interface.encodeFunctionData(
              methodName,
              args
            ),
            value
          };
        }
      });
    } else {
      // swap options shared by v2edge and v1+v2edge swap routers
      const sharedSwapOptions = {
        fee: feeOptions,
        recipient,
        slippageTolerance: allowedSlippage,
        ...(signatureData
          ? {
            inputTokenPermit:
              "allowed" in signatureData
                ? {
                  expiry: signatureData.deadline,
                  nonce: signatureData.nonce,
                  s: signatureData.s,
                  r: signatureData.r,
                  v: signatureData.v as any
                }
                : {
                  deadline: signatureData.deadline,
                  amount: signatureData.amount,
                  s: signatureData.s,
                  r: signatureData.r,
                  v: signatureData.v as any
                }
          }
          : {})
      };

      const swapRouterAddress = chainId
        ? trade instanceof V2edgeTrade
          ? V2edge_ROUTER_ADDRESS[chainId]
          : SWAP_ROUTER_ADDRESSES[chainId]
        : undefined;
      if (!swapRouterAddress) return [];

      const { value, calldata } =
        trade instanceof V2edgeTrade
          ? V2edgeSwapRouter.swapCallParameters(trade, {
            ...sharedSwapOptions,
            deadline: deadline.toString()
          })
          : SwapRouter.swapCallParameters(trade, {
            ...sharedSwapOptions,
            deadlineOrPreviousBlockhash: deadline.toString()
          });

      if (argentWalletContract && trade.inputAmount.currency.isToken) {
        return [
          {
            address: argentWalletContract.address,
            calldata: argentWalletContract.interface.encodeFunctionData(
              "wc_multiCall",
              [
                [
                  approveAmountCalldata(
                    trade.maximumAmountIn(allowedSlippage),
                    swapRouterAddress
                  ),
                  {
                    to: swapRouterAddress,
                    value,
                    data: calldata
                  }
                ]
              ]
            ),
            value: "0x0"
          }
        ];
      }
      return [
        {
          address: swapRouterAddress,
          calldata,
          value
        }
      ];
    }
  }, [
    account,
    allowedSlippage,
    argentWalletContract,
    chainId,
    deadline,
    feeOptions,
    provider,
    recipient,
    routerContract,
    signatureData,
    trade
  ]);
}
