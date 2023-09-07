import { Contract } from "@ethersproject/contracts";
import QuoterV2Json from "@panaromafinance/panaromaswap_swaproutercontracts/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import IPanaromaswapV1PairJson from "@panaromafinance/panaromaswap_v1core/build/IPanaromaswapV1Pair.json";
import IPanaromaswapV1Router02Json from "@panaromafinance/panaromaswap_v1periphery/build/IPanaromaswapV1Router02.json";
import QuoterJson from "@panaromafinance/panaromaswap_v2edgeperiphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import TickLensJson from "@panaromafinance/panaromaswap_v2edgeperiphery/artifacts/contracts/lens/TickLens.sol/TickLens.json";
import PanaromaswapInterfaceMulticallJson from "@panaromafinance/panaromaswap_v2edgeperiphery/artifacts/contracts/lens/PanaromaswapInterfaceMulticall.sol/PanaromaswapInterfaceMulticall.json";
import NonfungiblePositionManagerJson from "@panaromafinance/panaromaswap_v2edgeperiphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import V2edgeMigratorJson from "@panaromafinance/panaromaswap_v2edgeperiphery/artifacts/contracts/V2edgeMigrator.sol/V2edgeMigrator.json";
import { useWeb3React } from "@web3-react/core";
import ARGENT_WALLET_DETECTOR_ABI from "abis/argent-wallet-detector.json";
import EIP_2612 from "abis/eip_2612.json";
import ENS_PUBLIC_RESOLVER_ABI from "abis/ens-public-resolver.json";
import ENS_ABI from "abis/ens-registrar.json";
import ERC20_ABI from "abis/erc20.json";
import ERC20_BYTES32_ABI from "abis/erc20_bytes32.json";
import ERC721_ABI from "abis/erc721.json";
import ERC1155_ABI from "abis/erc1155.json";
import {
  ArgentWalletDetector,
  EnsPublicResolver,
  EnsRegistrar,
  Erc20,
  Erc721,
  Erc1155,
  Weth
} from "abis/types";
import WETH_ABI from "abis/weth.json";
import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  ENS_REGISTRAR_ADDRESSES,
  MULTICALL_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  TICK_LENS_ADDRESSES,
  V1_ROUTER_ADDRESS,
  V2edge_MIGRATOR_ADDRESSES
} from "constants/addresses";
import { WRAPPED_NATIVE_CURRENCY } from "constants/tokens";
import { useMemo } from "react";
import {
  NonfungiblePositionManager,
  Quoter,
  QuoterV2,
  TickLens,
  PanaromaswapInterfaceMulticall
} from "types/v2edge";
import { V2edgeMigrator } from "types/v2edge/V2edgeMigrator";

import { getContract } from "../utils";

const { abi: IPanaromaswapV1PairABI } = IPanaromaswapV1PairJson;
const { abi: IPanaromaswapV1Router02ABI } = IPanaromaswapV1Router02Json;
const { abi: QuoterABI } = QuoterJson;
const { abi: QuoterV2ABI } = QuoterV2Json;
const { abi: TickLensABI } = TickLensJson;
const { abi: MulticallABI } = PanaromaswapInterfaceMulticallJson;
const { abi: NFTPositionManagerABI } = NonfungiblePositionManagerJson;
const { abi: V1MigratorABI } = V2edgeMigratorJson;

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useWeb3React();

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];
    if (!address) return null;
    try {
      if (address === "0x0000000000000000000000000000000000000000")
        return null;

      return getContract(
        address,
        ABI,
        provider,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [
    addressOrAddressMap,
    ABI,
    provider,
    chainId,
    withSignerIfPossible,
    account
  ]) as T;
}

export function useV1MigratorContract() {
  return useContract<V2edgeMigrator>(V2edge_MIGRATOR_ADDRESSES, V1MigratorABI, true);
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useWeb3React();
  return useContract<Weth>(
    chainId ? WRAPPED_NATIVE_CURRENCY[chainId]?.address : undefined,
    WETH_ABI,
    withSignerIfPossible
  );
}

export function useERC721Contract(nftAddress?: string) {
  return useContract<Erc721>(nftAddress, ERC721_ABI, false);
}

export function useERC1155Contract(nftAddress?: string) {
  return useContract<Erc1155>(nftAddress, ERC1155_ABI, false);
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(
    ARGENT_WALLET_DETECTOR_ADDRESS,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  );
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(
    ENS_REGISTRAR_ADDRESSES,
    ENS_ABI,
    withSignerIfPossible
  );
}

export function useENSResolverContract(
  address: string | undefined,
  withSignerIfPossible?: boolean
) {
  return useContract<EnsPublicResolver>(
    address,
    ENS_PUBLIC_RESOLVER_ABI,
    withSignerIfPossible
  );
}

export function useBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false);
}

export function usePairContract(
  pairAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(pairAddress, IPanaromaswapV1PairABI, withSignerIfPossible);
}

export function useV1RouterContract(): Contract | null {
  return useContract(V1_ROUTER_ADDRESS, IPanaromaswapV1Router02ABI, true);
}

export function useInterfaceMulticall() {
  return useContract<PanaromaswapInterfaceMulticall>(
    MULTICALL_ADDRESS,
    MulticallABI,
    false
  ) as PanaromaswapInterfaceMulticall;
}

export function useV2edgeNFTPositionManagerContract(
  withSignerIfPossible?: boolean
): NonfungiblePositionManager | null {
  return useContract<NonfungiblePositionManager>(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    NFTPositionManagerABI,
    withSignerIfPossible
  );
}

export function useQuoter(useQuoterV2: boolean) {
  return useContract<Quoter | QuoterV2>(
    QUOTER_ADDRESSES,
    useQuoterV2 ? QuoterV2ABI : QuoterABI
  );
}

export function useTickLens(): TickLens | null {
  const { chainId } = useWeb3React();
  const address = chainId ? TICK_LENS_ADDRESSES[chainId] : undefined;
  return useContract(address, TickLensABI) as TickLens | null;
}
