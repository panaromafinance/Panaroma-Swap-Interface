import { Trade } from "@panaromafinance/panaromaswap_routersdk";
import { Currency, TradeType } from "@panaromafinance/panaromaswap_sdkcore";

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V1 trades or a pair of V2edge trades
 */
export function tradeMeaningfullyDiffers(
  ...args: [
    Trade<Currency, Currency, TradeType>,
    Trade<Currency, Currency, TradeType>
  ]
): boolean {
  const [tradeA, tradeB] = args;
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}
