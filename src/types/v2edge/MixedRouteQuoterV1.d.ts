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

interface MixedRouteQuoterV2Interface extends ethers.utils.Interface {
  functions: {
    "WETH9()": FunctionFragment;
    "factory()": FunctionFragment;
    "factoryV1()": FunctionFragment;
    "panaromaswapV2edgeSwapCallback(int256,int256,bytes)": FunctionFragment;
    "quoteExactInput(bytes,uint256)": FunctionFragment;
    "quoteExactInputSingleV1((address,address,uint256))": FunctionFragment;
    "quoteExactInputSingleV2edge((address,address,uint256,uint24,uint160))": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "WETH9", values?: undefined): string;
  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(functionFragment: "factoryV1", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "panaromaswapV2edgeSwapCallback",
    values: [BigNumberish, BigNumberish, BytesLike]
  ): string;
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

  decodeFunctionResult(functionFragment: "WETH9", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "factoryV1", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "panaromaswapV2edgeSwapCallback",
    data: BytesLike
  ): Result;
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

export class MixedRouteQuoterV2 extends BaseContract {
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

  interface: MixedRouteQuoterV2Interface;

  functions: {
    WETH9(overrides?: CallOverrides): Promise<[string]>;

    factory(overrides?: CallOverrides): Promise<[string]>;

    factoryV1(overrides?: CallOverrides): Promise<[string]>;

    panaromaswapV2edgeSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      path: BytesLike,
      overrides?: CallOverrides
    ): Promise<[void]>;

    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    quoteExactInputSingleV1(
      params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amountOut: BigNumber }>;

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

  WETH9(overrides?: CallOverrides): Promise<string>;

  factory(overrides?: CallOverrides): Promise<string>;

  factoryV1(overrides?: CallOverrides): Promise<string>;

  panaromaswapV2edgeSwapCallback(
    amount0Delta: BigNumberish,
    amount1Delta: BigNumberish,
    path: BytesLike,
    overrides?: CallOverrides
  ): Promise<void>;

  quoteExactInput(
    path: BytesLike,
    amountIn: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

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
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    WETH9(overrides?: CallOverrides): Promise<string>;

    factory(overrides?: CallOverrides): Promise<string>;

    factoryV1(overrides?: CallOverrides): Promise<string>;

    panaromaswapV2edgeSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      path: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

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
    WETH9(overrides?: CallOverrides): Promise<BigNumber>;

    factory(overrides?: CallOverrides): Promise<BigNumber>;

    factoryV1(overrides?: CallOverrides): Promise<BigNumber>;

    panaromaswapV2edgeSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      path: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

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
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    WETH9(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    factoryV1(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    panaromaswapV2edgeSwapCallback(
      amount0Delta: BigNumberish,
      amount1Delta: BigNumberish,
      path: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    quoteExactInput(
      path: BytesLike,
      amountIn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    quoteExactInputSingleV1(
      params: { tokenIn: string; tokenOut: string; amountIn: BigNumberish },
      overrides?: CallOverrides
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
