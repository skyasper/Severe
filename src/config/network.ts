import { defineChain, isAddress, type Address } from 'viem';

export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL = 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL = 'https://testnet.arcscan.app';

export const arcChain = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: ARC_EXPLORER_URL,
    },
  },
});

export interface KnownTokenConfig {
  id: 'USDC' | 'EURC';
  fallbackSymbol: string;
  address: Address;
}

export const KNOWN_TOKENS: readonly KnownTokenConfig[] = [
  {
    id: 'USDC',
    fallbackSymbol: 'USDC',
    address: '0x3600000000000000000000000000000000000000',
  },
  {
    id: 'EURC',
    fallbackSymbol: 'EURC',
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  },
] as const;

const rawContractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS ?? '').trim();
const rawWalletConnectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '').trim();
const rawAdminWallet = (import.meta.env.VITE_ADMIN_WALLET ?? '').trim();

export const CONTRACT_ADDRESS: Address | null =
  rawContractAddress && isAddress(rawContractAddress)
    ? (rawContractAddress as Address)
    : null;

export const WALLETCONNECT_PROJECT_ID: string =
  rawWalletConnectId && !rawWalletConnectId.startsWith('[') ? rawWalletConnectId : '';

export const ADMIN_WALLET: Address | null =
  rawAdminWallet && isAddress(rawAdminWallet) ? (rawAdminWallet as Address) : null;
