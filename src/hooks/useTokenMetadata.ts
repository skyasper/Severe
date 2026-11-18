import { useQuery } from '@tanstack/react-query';
import { isAddress, type Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { ERC20_ABI } from '../config/abi';
import { ARC_CHAIN_ID, KNOWN_TOKENS } from '../config/network';

export interface TokenMetadata {
  address: Address;
  decimals: number;
  symbol: string;
  name: string;
}

export function useTokenMetadata(tokenAddress?: string | null) {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const normalizedAddress =
    tokenAddress && isAddress(tokenAddress) ? (tokenAddress as Address) : null;

  return useQuery<TokenMetadata | null>({
    queryKey: ['erc20-metadata', ARC_CHAIN_ID, normalizedAddress?.toLowerCase()],
    enabled: Boolean(publicClient && normalizedAddress),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!publicClient || !normalizedAddress) return null;

      const [decimalsRaw, symbolRaw, nameRaw] = await Promise.all([
        publicClient.readContract({
          address: normalizedAddress,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          address: normalizedAddress,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
        publicClient
          .readContract({
            address: normalizedAddress,
            abi: ERC20_ABI,
            functionName: 'name',
          })
          .catch(() => ''),
      ]);

      return {
        address: normalizedAddress,
        decimals: Number(decimalsRaw),
        symbol: String(symbolRaw),
        name: nameRaw ? String(nameRaw) : String(symbolRaw),
      };
    },
  });
}

export function useKnownTokensMetadata() {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });

  return useQuery<Record<string, TokenMetadata>>({
    queryKey: ['known-tokens-metadata', ARC_CHAIN_ID],
    enabled: Boolean(publicClient),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!publicClient) return {};

      const entries = await Promise.all(
        KNOWN_TOKENS.map(async (token) => {
          const [decimalsRaw, symbolRaw, nameRaw] = await Promise.all([
            publicClient.readContract({
              address: token.address,
              abi: ERC20_ABI,
              functionName: 'decimals',
            }),
            publicClient.readContract({
              address: token.address,
              abi: ERC20_ABI,
              functionName: 'symbol',
            }),
            publicClient
              .readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'name',
              })
              .catch(() => token.fallbackSymbol),
          ]);

          const meta: TokenMetadata = {
            address: token.address,
            decimals: Number(decimalsRaw),
            symbol: String(symbolRaw),
            name: String(nameRaw || symbolRaw),
          };
          return [token.address.toLowerCase(), meta] as const;
        })
      );

      return Object.fromEntries(entries);
    },
  });
}
