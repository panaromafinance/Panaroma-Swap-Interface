import { Trans } from "@lingui/macro";
import { Fraction, TradeType } from "@panaromafinance/panaromaswap_sdkcore";
import JSBI from "jsbi";

import { nativeOnChain } from "../../constants/tokens";
import { useCurrency, useToken } from "../../hooks/Tokens";
import useENSName from "../../hooks/useENSName";
import { VoteOption } from "../../state/governance/types";
import {
  AddLiquidityV1PoolTransactionInfo,
  AddLiquidityV2edgePoolTransactionInfo,
  ApproveTransactionInfo,
  ClaimTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV2edgePoolTransactionInfo,
  DelegateTransactionInfo,
  DepositLiquidityStakingTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  ExecuteTransactionInfo,
  MigrateV1LiquidityToV2edgeTransactionInfo,
  QueueTransactionInfo,
  RemoveLiquidityV2edgeTransactionInfo,
  SubmitProposalTransactionInfo,
  TransactionInfo,
  TransactionType,
  VoteTransactionInfo,
  WithdrawLiquidityStakingTransactionInfo,
  WrapTransactionInfo,
  LockLiquidityTransactionInfo
} from "../../state/transactions/types";

function formatAmount(
  amountRaw: string,
  decimals: number,
  sigFigs: number
): string {
  return new Fraction(
    amountRaw,
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
  ).toSignificant(sigFigs);
}

function FormattedCurrencyAmount({
  rawAmount,
  symbol,
  decimals,
  sigFigs
}: {
  rawAmount: string;
  symbol: string;
  decimals: number;
  sigFigs: number;
}) {
  return (
    <>
      {formatAmount(rawAmount, decimals, sigFigs)} {symbol}
    </>
  );
}

function FormattedCurrencyAmountManaged({
  rawAmount,
  currencyId,
  sigFigs = 6
}: {
  rawAmount: string;
  currencyId: string;
  sigFigs: number;
}) {
  const currency = useCurrency(currencyId);
  return currency ? (
    <FormattedCurrencyAmount
      rawAmount={rawAmount}
      decimals={currency.decimals}
      sigFigs={sigFigs}
      symbol={currency.symbol ?? "???"}
    />
  ) : null;
}

function ClaimSummary({
  info: { recipient, panaAmountRaw }
}: {
  info: ClaimTransactionInfo;
}) {
  const { ENSName } = useENSName();
  return typeof panaAmountRaw === "string" ? (
    <Trans>
      Claim{" "}
      <FormattedCurrencyAmount
        rawAmount={panaAmountRaw}
        symbol={"PANA"}
        decimals={18}
        sigFigs={4}
      />{" "}
      for {ENSName ?? recipient}
    </Trans>
  ) : (
    <Trans>Claim PANA reward for {ENSName ?? recipient}</Trans>
  );
}

function SubmitProposalTransactionSummary(_: {
  info: SubmitProposalTransactionInfo;
}) {
  return <Trans>Submit new proposal</Trans>;
}

function ApprovalSummary({ info }: { info: ApproveTransactionInfo }) {
  const token = useToken(info.tokenAddress);

  return <Trans>Approve {token?.symbol}</Trans>;
}

function ClearAllowance() {
  return <Trans>Cleared Allowance</Trans>;
}

function VoteSummary({ info }: { info: VoteTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`;
  if (info.reason && info.reason.trim().length > 0) {
    switch (info.decision) {
      case VoteOption.For:
        return <Trans>Vote for proposal {proposalKey}</Trans>;
      case VoteOption.Abstain:
        return <Trans>Vote to abstain on proposal {proposalKey}</Trans>;
      case VoteOption.Against:
        return <Trans>Vote against proposal {proposalKey}</Trans>;
    }
  } else {
    switch (info.decision) {
      case VoteOption.For:
        return (
          <Trans>
            Vote for proposal {proposalKey} with reason &quot;{info.reason}
            &quot;
          </Trans>
        );
      case VoteOption.Abstain:
        return (
          <Trans>
            Vote to abstain on proposal {proposalKey} with reason &quot;
            {info.reason}&quot;
          </Trans>
        );
      case VoteOption.Against:
        return (
          <Trans>
            Vote against proposal {proposalKey} with reason &quot;{info.reason}
            &quot;
          </Trans>
        );
    }
  }
}

function QueueSummary({ info }: { info: QueueTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`;
  return <Trans>Queue proposal {proposalKey}.</Trans>;
}

function ExecuteSummary({ info }: { info: ExecuteTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`;
  return <Trans>Execute proposal {proposalKey}.</Trans>;
}

function DelegateSummary({
  info: { delegatee }
}: {
  info: DelegateTransactionInfo;
}) {
  const { ENSName } = useENSName(delegatee);
  return <Trans>Delegate voting power to {ENSName ?? delegatee}</Trans>;
}

function WrapSummary({
  info: { chainId, currencyAmountRaw, unwrapped }
}: {
  info: WrapTransactionInfo;
}) {
  const native = chainId ? nativeOnChain(chainId) : undefined;

  if (unwrapped) {
    return (
      <Trans>
        Unwrap{" "}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.wrapped?.symbol ?? "WETH"}
          decimals={18}
          sigFigs={6}
        />{" "}
        to {native?.symbol ?? "ETH"}
      </Trans>
    );
  } else {
    return (
      <Trans>
        Wrap{" "}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.symbol ?? "ETH"}
          decimals={18}
          sigFigs={6}
        />{" "}
        to {native?.wrapped?.symbol ?? "WETH"}
      </Trans>
    );
  }
}

function DepositLiquidityStakingSummary(_: {
  info: DepositLiquidityStakingTransactionInfo;
}) {
  // not worth rendering the tokens since you can should no longer deposit liquidity in the staking contracts
  // todo: deprecate and delete the code paths that allow this, show user more information
  return <Trans>Deposit liquidity</Trans>;
}

function WithdrawLiquidityStakingSummary(_: {
  info: WithdrawLiquidityStakingTransactionInfo;
}) {
  return <Trans>Withdraw deposited liquidity</Trans>;
}

function LockLiquidityStakingSummary(_: {
  info: LockLiquidityTransactionInfo;
}) {
  return <Trans>Locked liquidity</Trans>;
}

function ReferralSummary(success: any) {
  return success.success ? <Trans>Referral registration is succesful.</Trans> : <Trans>Referral registration failed.</Trans>;
}

function MigrateLiquidityToV2edgeSummary({
  info: { baseCurrencyId, quoteCurrencyId }
}: {
  info: MigrateV1LiquidityToV2edgeTransactionInfo;
}) {
  const baseCurrency = useCurrency(baseCurrencyId);
  const quoteCurrency = useCurrency(quoteCurrencyId);

  return (
    <Trans>
      Migrate {baseCurrency?.symbol}/{quoteCurrency?.symbol} liquidity to V2edge
    </Trans>
  );
}

function CreateV2edgePoolSummary({
  info: { quoteCurrencyId, baseCurrencyId }
}: {
  info: CreateV2edgePoolTransactionInfo;
}) {
  const baseCurrency = useCurrency(baseCurrencyId);
  const quoteCurrency = useCurrency(quoteCurrencyId);

  return (
    <Trans>
      Create {baseCurrency?.symbol}/{quoteCurrency?.symbol} V2edge pool
    </Trans>
  );
}

function CollectFeesSummary({
  info: { currencyId0, currencyId1 }
}: {
  info: CollectFeesTransactionInfo;
}) {
  const currency0 = useCurrency(currencyId0);
  const currency1 = useCurrency(currencyId1);

  return (
    <Trans>
      Collect {currency0?.symbol}/{currency1?.symbol} fees
    </Trans>
  );
}

function RemoveLiquidityV2edgeSummary({
  info: {
    baseCurrencyId,
    quoteCurrencyId,
    expectedAmountBaseRaw,
    expectedAmountQuoteRaw
  }
}: {
  info: RemoveLiquidityV2edgeTransactionInfo;
}) {
  return (
    <Trans>
      Remove{" "}
      <FormattedCurrencyAmountManaged
        rawAmount={expectedAmountBaseRaw}
        currencyId={baseCurrencyId}
        sigFigs={3}
      />{" "}
      and{" "}
      <FormattedCurrencyAmountManaged
        rawAmount={expectedAmountQuoteRaw}
        currencyId={quoteCurrencyId}
        sigFigs={3}
      />
    </Trans>
  );
}

function AddLiquidityV2edgePoolSummary({
  info: { createPool, quoteCurrencyId, baseCurrencyId }
}: {
  info: AddLiquidityV2edgePoolTransactionInfo;
}) {
  const baseCurrency = useCurrency(baseCurrencyId);
  const quoteCurrency = useCurrency(quoteCurrencyId);

  return createPool ? (
    <Trans>
      Create pool and add {baseCurrency?.symbol}/{quoteCurrency?.symbol} V2edge
      liquidity
    </Trans>
  ) : (
    <Trans>
      Add {baseCurrency?.symbol}/{quoteCurrency?.symbol} V2edge liquidity
    </Trans>
  );
}

function AddLiquidityV1PoolSummary({
  info: {
    quoteCurrencyId,
    expectedAmountBaseRaw,
    expectedAmountQuoteRaw,
    baseCurrencyId
  }
}: {
  info: AddLiquidityV1PoolTransactionInfo;
}) {
  return (
    <Trans>
      Add{" "}
      <FormattedCurrencyAmountManaged
        rawAmount={expectedAmountBaseRaw}
        currencyId={baseCurrencyId}
        sigFigs={3}
      />{" "}
      and{" "}
      <FormattedCurrencyAmountManaged
        rawAmount={expectedAmountQuoteRaw}
        currencyId={quoteCurrencyId}
        sigFigs={3}
      />{" "}
      to Panaromaswap V1
    </Trans>
  );
}

function SwapSummary({
  info
}: {
  info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo;
}) {
  if (info.tradeType === TradeType.EXACT_INPUT) {
    return (
      <Trans>
        Swap exactly{" "}
        <FormattedCurrencyAmountManaged
          rawAmount={info.inputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{" "}
        for{" "}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedOutputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </Trans>
    );
  } else {
    return (
      <Trans>
        Swap{" "}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedInputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{" "}
        for exactly{" "}
        <FormattedCurrencyAmountManaged
          rawAmount={info.outputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </Trans>
    );
  }
}

export function TransactionSummary({ info, success }: { info: TransactionInfo, success: boolean }) {
  switch (info.type) {
    case TransactionType.ADD_LIQUIDITY_V2edge_POOL:
      return <AddLiquidityV2edgePoolSummary info={info} />;

    case TransactionType.ADD_LIQUIDITY_V1_POOL:
      return <AddLiquidityV1PoolSummary info={info} />;

    case TransactionType.CLAIM:
      return <ClaimSummary info={info} />;

    case TransactionType.DEPOSIT_LIQUIDITY_STAKING:
      return <DepositLiquidityStakingSummary info={info} />;

    case TransactionType.WITHDRAW_LIQUIDITY_STAKING:
      return <WithdrawLiquidityStakingSummary info={info} />;

    case TransactionType.LOCK_LIQUIDITY:
      return <LockLiquidityStakingSummary info={info} />;

    case TransactionType.REFERRAL:
      return <ReferralSummary success={success}/>;

    case TransactionType.SWAP:
      return <SwapSummary info={info} />;

    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} />;

    case TransactionType.CLEAR:
      return <ClearAllowance/>;

    case TransactionType.VOTE:
      return <VoteSummary info={info} />;

    case TransactionType.DELEGATE:
      return <DelegateSummary info={info} />;

    case TransactionType.WRAP:
      return <WrapSummary info={info} />;

    case TransactionType.CREATE_V2edge_POOL:
      return <CreateV2edgePoolSummary info={info} />;

    case TransactionType.MIGRATE_LIQUIDITY_V2edge:
      return <MigrateLiquidityToV2edgeSummary info={info} />;

    case TransactionType.COLLECT_FEES:
      return <CollectFeesSummary info={info} />;

    case TransactionType.REMOVE_LIQUIDITY_V2edge:
      return <RemoveLiquidityV2edgeSummary info={info} />;

    case TransactionType.QUEUE:
      return <QueueSummary info={info} />;

    case TransactionType.EXECUTE:
      return <ExecuteSummary info={info} />;

    case TransactionType.SUBMIT_PROPOSAL:
      return <SubmitProposalTransactionSummary info={info} />;
  }
}