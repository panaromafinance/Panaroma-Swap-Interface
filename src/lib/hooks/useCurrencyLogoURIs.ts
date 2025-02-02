import { Currency } from "@panaromafinance/panaromaswap_sdkcore";
import { SupportedChainId } from "constants/chains";
import useHttpLocations from "hooks/useHttpLocations";
import { useMemo } from "react";
import { WrappedTokenInfo } from "state/lists/wrappedTokenInfo";

import EthereumLogo from "../../assets/images/ethereum-logo.png";
import CeloLogo from "../../assets/svg/celo_logo.svg";
import MaticLogo from "../../assets/svg/polygon-matic-logo.svg";
// import { isCelo, nativeOnChain } from "../../constants/tokens";

type Network = "ethereum" | "arbitrum" | "optimism";

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return "ethereum";
    case SupportedChainId.ARBITRUM_ONE:
      return "arbitrum";
    case SupportedChainId.OPTIMISM:
      return "optimism";
    default:
      return "ethereum";
  }
}

function getNativeLogoURI(
  chainId: SupportedChainId = SupportedChainId.MAINNET
): string {
  switch (chainId) {
    case SupportedChainId.POLYGON:
    case SupportedChainId.POLYGON_MUMBAI:
      return MaticLogo;
    case SupportedChainId.CELO:
    case SupportedChainId.CELO_ALFAJORES:
      return CeloLogo;
    default:
      return EthereumLogo;
  }
}

function getTokenLogoURI(
  address: string,
  chainId: SupportedChainId = SupportedChainId.MAINNET
): string | void {
  const networkName = chainIdToNetworkName(chainId);
  const networksWithUrls = [
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.MAINNET,
    SupportedChainId.OPTIMISM,
    SupportedChainId.OPTIMISM,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
    SupportedChainId.GOERLI,
    SupportedChainId.OPTIMISTIC_GOERLI,
    SupportedChainId.ARBITRUM_GOERLI,
  ];
  if (networksWithUrls.includes(chainId)) {
    if (address === process.env['REACT_APP_JAMM_ADDRESS'])
      return `https://polygonscan.com/token/images/panaromafin_32.png`
    else
      return `https://raw.githubusercontent.com/panaromafinance/tokens-list/main/assets/${address}/logo.png`;
    // return `https://raw.githubusercontent.com/Panaromaswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`;
  }

  // Celo logo logo is hosted elsewhere.
  // if (isCelo(chainId)) {
  //   if (address === nativeOnChain(chainId).wrapped.address) {
  //     return "https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png";
  //   }
  // }
}

export default function useCurrencyLogoURIs(
  currency?: Currency | null
): string[] {
  const locations = useHttpLocations(
    currency instanceof WrappedTokenInfo ? currency.logoURI : undefined
  );
  return useMemo(() => {
    const logoURIs = [...locations];
    if (currency) {
      if (currency.isNative) {
        logoURIs.push(getNativeLogoURI(currency.chainId));
      } else if (currency.isToken) {
        const logoURI = getTokenLogoURI(currency.address, currency.chainId);
        if (logoURI) {
          logoURIs.push(logoURI);
        }
        else if (currency.address === process.env['REACT_APP_JAMM_ADDRESS']) {
          logoURIs.push('https://polygonscan.com/token/images/panaromafin_32.png')
        }
      }
    }
    return logoURIs;
  }, [currency, locations]);
}
