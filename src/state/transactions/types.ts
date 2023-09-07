import { TradeType } from "@panaromafinance/panaromaswap_sdkcore";

import { VoteOption } from "../governance/types";

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}

/**
 * Be careful adding to this enum, always assign a unique value (typescript will not prevent duplicate values).
 * These values is persisted in state and if you change the value it will cause errors
 */
export enum TransactionType {
  APPROVAL = 0,
  SWAP,
  DEPOSIT_LIQUIDITY_STAKING,
  WITHDRAW_LIQUIDITY_STAKING,
  CLAIM,
  VOTE,
  DELEGATE,
  WRAP,
  CREATE_V2edge_POOL,
  ADD_LIQUIDITY_V2edge_POOL,
  ADD_LIQUIDITY_V1_POOL,
  MIGRATE_LIQUIDITY_V2edge,
  COLLECT_FEES,
  REMOVE_LIQUIDITY_V2edge,
  SUBMIT_PROPOSAL,
  QUEUE,
  EXECUTE,
  MINT,
  BURN,
  LOCK_LIQUIDITY,
  REFERRAL,
  CLEAR
}

export interface BaseTransactionInfo {
  type: TransactionType;
}

export interface VoteTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.VOTE;
  governorAddress: string;
  proposalId: number;
  decision: VoteOption;
  reason: string;
}

export interface QueueTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.QUEUE;
  governorAddress: string;
  proposalId: number;
}

export interface ExecuteTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.EXECUTE;
  governorAddress: string;
  proposalId: number;
}

export interface DelegateTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.DELEGATE;
  delegatee: string;
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL;
  tokenAddress: string;
  spender: string;
}

export interface ClearAllowanceInfo extends BaseTransactionInfo {
  type: TransactionType.CLEAR;
}

interface BaseSwapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.SWAP;
  tradeType: TradeType;
  inputCurrencyId: string;
  outputCurrencyId: string;
}

export interface ExactInputSwapTransactionInfo extends BaseSwapTransactionInfo {
  tradeType: TradeType.EXACT_INPUT;
  inputCurrencyAmountRaw: string;
  expectedOutputCurrencyAmountRaw: string;
  minimumOutputCurrencyAmountRaw: string;
}
export interface ExactOutputSwapTransactionInfo
  extends BaseSwapTransactionInfo {
  tradeType: TradeType.EXACT_OUTPUT;
  outputCurrencyAmountRaw: string;
  expectedInputCurrencyAmountRaw: string;
  maximumInputCurrencyAmountRaw: string;
}

export interface DepositLiquidityStakingTransactionInfo {
  type: TransactionType.DEPOSIT_LIQUIDITY_STAKING;
  token0Address: string;
  token1Address: string;
}

export interface WithdrawLiquidityStakingTransactionInfo {
  type: TransactionType.WITHDRAW_LIQUIDITY_STAKING;
  token0Address: string;
  token1Address: string;
}

export interface LockLiquidityTransactionInfo {
  type: TransactionType.LOCK_LIQUIDITY;
  token0Address: string;
  token1Address: string;
}

export interface ReferralInfo {
  type: TransactionType.REFERRAL;
}

export interface WrapTransactionInfo {
  type: TransactionType.WRAP;
  unwrapped: boolean;
  currencyAmountRaw: string;
  chainId?: number;
}

export interface ClaimTransactionInfo {
  type: TransactionType.CLAIM;
  recipient: string;
  panaAmountRaw?: string;
}

export interface CreateV2edgePoolTransactionInfo {
  type: TransactionType.CREATE_V2edge_POOL;
  baseCurrencyId: string;
  quoteCurrencyId: string;
}

export interface AddLiquidityV2edgePoolTransactionInfo {
  type: TransactionType.ADD_LIQUIDITY_V2edge_POOL;
  createPool: boolean;
  baseCurrencyId: string;
  quoteCurrencyId: string;
  feeAmount: number;
  expectedAmountBaseRaw: string;
  expectedAmountQuoteRaw: string;
}

export interface AddLiquidityV1PoolTransactionInfo {
  type: TransactionType.ADD_LIQUIDITY_V1_POOL;
  baseCurrencyId: string;
  quoteCurrencyId: string;
  expectedAmountBaseRaw: string;
  expectedAmountQuoteRaw: string;
}

export interface MigrateV1LiquidityToV2edgeTransactionInfo {
  type: TransactionType.MIGRATE_LIQUIDITY_V2edge;
  baseCurrencyId: string;
  quoteCurrencyId: string;
  isFork: boolean;
}

export interface CollectFeesTransactionInfo {
  type: TransactionType.COLLECT_FEES;
  currencyId0: string;
  currencyId1: string;
}

export interface RemoveLiquidityV2edgeTransactionInfo {
  type: TransactionType.REMOVE_LIQUIDITY_V2edge;
  baseCurrencyId: string;
  quoteCurrencyId: string;
  expectedAmountBaseRaw: string;
  expectedAmountQuoteRaw: string;
}

export interface SubmitProposalTransactionInfo {
  type: TransactionType.SUBMIT_PROPOSAL;
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | ExactOutputSwapTransactionInfo
  | ExactInputSwapTransactionInfo
  | ClaimTransactionInfo
  | VoteTransactionInfo
  | QueueTransactionInfo
  | ExecuteTransactionInfo
  | DelegateTransactionInfo
  | DepositLiquidityStakingTransactionInfo
  | WithdrawLiquidityStakingTransactionInfo
  | WrapTransactionInfo
  | CreateV2edgePoolTransactionInfo
  | AddLiquidityV2edgePoolTransactionInfo
  | AddLiquidityV1PoolTransactionInfo
  | MigrateV1LiquidityToV2edgeTransactionInfo
  | CollectFeesTransactionInfo
  | RemoveLiquidityV2edgeTransactionInfo
  | LockLiquidityTransactionInfo
  | ReferralInfo
  | SubmitProposalTransactionInfo
  | ClearAllowanceInfo; 

export interface TransactionDetails {
  hash: string;
  receipt?: SerializableTransactionReceipt;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
  info: TransactionInfo;
}