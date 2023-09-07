import { Price, Token } from "@panaromafinance/panaromaswap_sdkcore";
import { tickToPrice } from "@panaromafinance/panaromaswap_v2edgesdk";

export function getTickToPrice(
  baseToken?: Token,
  quoteToken?: Token,
  tick?: number
): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== "number") {
    return undefined;
  }
  return tickToPrice(baseToken, quoteToken, tick);
}
