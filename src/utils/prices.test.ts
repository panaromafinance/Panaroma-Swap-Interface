import { Trade } from '@panaromafinance/panaromaswap_routersdk'
import { CurrencyAmount, Percent, Token, TradeType } from '@panaromafinance/panaromaswap_sdkcore'
import { Pair, Route as V1Route } from '@panaromafinance/panaromaswap_v1sdk'
import { FeeAmount, Pool, Route as V2edgeRoute } from '@panaromafinance/panaromaswap_v2edgesdk'
import JSBI from 'jsbi'

import { computeRealizedLPFeeAmount, warningSeverity } from './prices'

const token1 = new Token(1, '0x0000000000000000000000000000000000000001', 18)
const token2 = new Token(1, '0x0000000000000000000000000000000000000002', 18)
const token3 = new Token(1, '0x0000000000000000000000000000000000000003', 18)

const pair12 = new Pair(
  CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(10000)),
  CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(20000))
)
const pair23 = new Pair(
  CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(20000)),
  CurrencyAmount.fromRawAmount(token3, JSBI.BigInt(30000))
)

const pool12 = new Pool(token1, token2, FeeAmount.HIGH, '2437312313659959819381354528', '10272714736694327408', -69633)
const pool13 = new Pool(
  token1,
  token3,
  FeeAmount.MEDIUM,
  '2437312313659959819381354528',
  '10272714736694327408',
  -69633
)

const currencyAmount = (token: Token, amount: number) => CurrencyAmount.fromRawAmount(token, JSBI.BigInt(amount))

describe('prices', () => {
  describe('#computeRealizedLPFeeAmount', () => {
    it('returns undefined for undefined', () => {
      expect(computeRealizedLPFeeAmount(undefined)).toEqual(undefined)
    })

    it('correct realized lp fee for single hop on v1', () => {
      // v1
      expect(
        computeRealizedLPFeeAmount(
          new Trade({
            v1Routes: [
              {
                routev1: new V1Route([pair12], token1, token2),
                inputAmount: currencyAmount(token1, 1000),
                outputAmount: currencyAmount(token2, 1000),
              },
            ],
            v2edgeRoutes: [],
            tradeType: TradeType.EXACT_INPUT,
          })
        )
      ).toEqual(currencyAmount(token1, 3)) // 3% realized fee
    })

    it('correct realized lp fee for single hop on v2edge', () => {
      // v2edge
      expect(
        computeRealizedLPFeeAmount(
          new Trade({
            v2edgeRoutes: [
              {
                routev2edge: new V2edgeRoute([pool12], token1, token2),
                inputAmount: currencyAmount(token1, 1000),
                outputAmount: currencyAmount(token2, 1000),
              },
            ],
            v1Routes: [],
            tradeType: TradeType.EXACT_INPUT,
          })
        )
      ).toEqual(currencyAmount(token1, 10)) // 3% realized fee
    })

    it('correct realized lp fee for double hop', () => {
      expect(
        computeRealizedLPFeeAmount(
          new Trade({
            v1Routes: [
              {
                routev1: new V1Route([pair12, pair23], token1, token3),
                inputAmount: currencyAmount(token1, 1000),
                outputAmount: currencyAmount(token3, 1000),
              },
            ],
            v2edgeRoutes: [],
            tradeType: TradeType.EXACT_INPUT,
          })
        )
      ).toEqual(currencyAmount(token1, 5))
    })

    it('correct realized lp fee for multi route v1+v2edge', () => {
      expect(
        computeRealizedLPFeeAmount(
          new Trade({
            v1Routes: [
              {
                routev1: new V1Route([pair12, pair23], token1, token3),
                inputAmount: currencyAmount(token1, 1000),
                outputAmount: currencyAmount(token3, 1000),
              },
            ],
            v2edgeRoutes: [
              {
                routev2edge: new V2edgeRoute([pool13], token1, token3),
                inputAmount: currencyAmount(token1, 1000),
                outputAmount: currencyAmount(token3, 1000),
              },
            ],
            tradeType: TradeType.EXACT_INPUT,
          })
        )
      ).toEqual(currencyAmount(token1, 8))
    })
  })

  describe('#warningSeverity', () => {
    it('max for undefined', () => {
      expect(warningSeverity(undefined)).toEqual(4)
    })
    it('correct for 0', () => {
      expect(warningSeverity(new Percent(0))).toEqual(0)
    })
    it('correct for 0.5', () => {
      expect(warningSeverity(new Percent(5, 1000))).toEqual(0)
    })
    it('correct for 5', () => {
      expect(warningSeverity(new Percent(5, 100))).toEqual(2)
    })
    it('correct for 50', () => {
      expect(warningSeverity(new Percent(5, 10))).toEqual(4)
    })
  })
})
