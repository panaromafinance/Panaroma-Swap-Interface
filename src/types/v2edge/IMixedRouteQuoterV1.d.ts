/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface IMixedRouteQuoterV2Interface extends ethers.utils.Interface {
  functions: {
    "quoteExactInput(bytes,uint256)": FunctionFragment;
    "quoteExactInputSingleV1((address,address,uint256))": FunctionFragment;
    "quoteExactInputSingleV2edge((address,address,uint256,uint24,uint160))": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "quoteExactInput",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactInputSingleV1",
    values: [{ tokenIn: string; tokenOut: string; amountIn: BigNumberish }]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactInputSingleV2edge",
    values: [
      {
        tokenIn: string;
        tokenOut: string;
        amountIn: BigNumberish;
        fee: BigNumberish;
        sqrtPriceLimitX96: BigNumberish;
      }
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "quoteExactInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactInputSingleV1",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactInputSingleV2edge",
    data: BytesLike
  ): Result;

  events: {};
}

export class IMixedRouteQuoterV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IMixedRouteQuoterV2Interface;

  functions: {
    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    quoteExactInputSingleV1(
      params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    quoteExactInputSingleV2edge(
      params: {
        tokenIn: string;
        tokenOut: string;
        amountIn: BigNumberish;
        fee: BigNumberish;
        sqrtPriceLimitX96: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  quoteExactInput(
    path: BytesLike,
    amountIn: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  quoteExactInputSingleV1(
    params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  quoteExactInputSingleV2edge(
    params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: BigNumberish;
      fee: BigNumberish;
      sqrtPriceLimitX96: BigNumberish;
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber[], number[], BigNumber] & {
        amountOut: BigNumber;
        v2edgeSqrtPriceX96AfterList: BigNumber[];
        v2edgeInitializedTicksCrossedList: number[];
        v2edgeSwapGasEstimate: BigNumber;
      }
    >;

    quoteExactInputSingleV1(
      params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    quoteExactInputSingleV2edge(
      params: {
        tokenIn: string;
        tokenOut: string;
        amountIn: BigNumberish;
        fee: BigNumberish;
        sqrtPriceLimitX96: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, number, BigNumber] & {
        amountOut: BigNumber;
        sqrtPriceX96After: BigNumber;
        initializedTicksCrossed: number;
        gasEstimate: BigNumber;
      }
    >;
  };

  filters: {};

  estimateGas: {
    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    quoteExactInputSingleV1(
      params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    quoteExactInputSingleV2edge(
      params: {
        tokenIn: string;
        tokenOut: string;
        amountIn: BigNumberish;
        fee: BigNumberish;
        sqrtPriceLimitX96: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    quoteExactInputSingleV1(
      params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    quoteExactInputSingleV2edge(
      params: {
        tokenIn: string;
        tokenOut: string;
        amountIn: BigNumberish;
        fee: BigNumberish;
        sqrtPriceLimitX96: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
