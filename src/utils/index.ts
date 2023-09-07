import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { Token } from "@panaromafinance/panaromaswap_sdkcore";
import { FeeAmount } from "@panaromafinance/panaromaswap_v2edgesdk";
import { ChainTokenMap } from "lib/hooks/useTokenList/utils";
import dayjs from 'dayjs'
import toFormat from 'toformat'
import _Decimal from 'decimal.js-light'
import { BigNumber } from 'bignumber.js'
import utc from 'dayjs/plugin/utc'
import { timeframeOptions } from '../constants'

const Decimal = toFormat(_Decimal)
BigNumber.set({ EXPONENTIAL_AT: 50 })
dayjs.extend(utc)

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
      break
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
      break
    default:
      utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
      break
  }
  return utcStartTime
}


// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

// account is not optional
function getSigner(provider: JsonRpcProvider, account: string): JsonRpcSigner {
  return provider.getSigner(account).connectUnchecked();
}

// account is optional
function getProviderOrSigner(
  provider: JsonRpcProvider,
  account?: string
): JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(provider, account) : provider;
}

// account is optional
export function getContract(
  address: string,
  ABI: any,
  provider: JsonRpcProvider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(provider, account) as any
  );
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function isTokenOnList(
  chainTokenMap: ChainTokenMap,
  token?: Token
): boolean {
  return Boolean(
    token?.isToken && chainTokenMap[token.chainId]?.[token.address]
  );
}

export function formattedFeeAmount(feeAmount: FeeAmount): number {
  return feeAmount / 10000;
}


