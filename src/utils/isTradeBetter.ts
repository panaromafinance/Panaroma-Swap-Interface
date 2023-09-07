import { Currency, Percent, TradeType } from '@panaromafinance/panaromaswap_sdkcore'
import { Trade as V1Trade } from '@panaromafinance/panaromaswap_v1sdk'

import { ONE_HUNDRED_PERCENT, ZERO_PERCENT } from '../constants/misc'

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
// only used by v1 hooks
export function isTradeBetter(
  tradeA: V1Trade<Currency, Currency, TradeType> | undefined | null,
  tradeB: V1Trade<Currency, Currency, TradeType> | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency)
  ) {
    throw new Error('Comparing incomparable trades')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  } else {
    return tradeA.executionPrice.asFraction
      .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
      .lessThan(tradeB.executionPrice)
  }
}
