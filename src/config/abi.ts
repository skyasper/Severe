import type { Abi, Address } from 'viem';
import { ARC_EXPLORER_URL } from './network';

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const satisfies Abi;

export const SEVERE_CANONICAL_ABI = [
  {
    type: 'function',
    name: 'issueProof',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'periodStart', type: 'uint64' },
      { name: 'periodEnd', type: 'uint64' },
      { name: 'note', type: 'string' },
    ],
    outputs: [{ name: 'proofId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'revokeProof',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'proofId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'verifyProof',
    stateMutability: 'view',
    inputs: [{ name: 'proofId', type: 'uint256' }],
    outputs: [
      { name: 'valid', type: 'bool' },
      {
        name: 'proof',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'issuer', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'totalAmount', type: 'uint256' },
          { name: 'periodStart', type: 'uint64' },
          { name: 'periodEnd', type: 'uint64' },
          { name: 'issuedAt', type: 'uint64' },
          { name: 'note', type: 'string' },
          { name: 'revoked', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getProof',
    stateMutability: 'view',
    inputs: [{ name: 'proofId', type: 'uint256' }],
    outputs: [
      {
        name: 'proof',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'issuer', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'totalAmount', type: 'uint256' },
          { name: 'periodStart', type: 'uint64' },
          { name: 'periodEnd', type: 'uint64' },
          { name: 'issuedAt', type: 'uint64' },
          { name: 'note', type: 'string' },
          { name: 'revoked', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getProofsByRecipient',
    stateMutability: 'view',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getProofsByIssuer',
    stateMutability: 'view',
    inputs: [{ name: 'issuer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getStats',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'totalProofs', type: 'uint256' },
      { name: 'activeProofs', type: 'uint256' },
      { name: 'revokedProofs', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ProofIssued',
    inputs: [
      { name: 'proofId', type: 'uint256', indexed: true },
      { name: 'issuer', type: 'address', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'totalAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ProofRevoked',
    inputs: [
      { name: 'proofId', type: 'uint256', indexed: true },
      { name: 'issuer', type: 'address', indexed: true },
    ],
  },
] as const satisfies Abi;

const abiCache = new Map<string, Abi>();

export interface ResolvedAbiResult {
  abi: Abi;
  source: 'explorer' | 'canonical';
}

/**
 * Fetches the verified ABI from the deployed contract on Arcscan and treats it
 * as the source of truth when available, falling back to the canonical ABI
 * when no verified ABI is published yet.
 */
export async function fetchDeployedContractAbi(
  address: Address
): Promise<ResolvedAbiResult> {
  const key = address.toLowerCase();
  const cached = abiCache.get(key);
  if (cached) {
    return { abi: cached, source: 'explorer' };
  }

  try {
    const v2Resp = await fetch(
      `${ARC_EXPLORER_URL}/api/v2/smart-contracts/${address}`,
      { headers: { Accept: 'application/json' } }
    );
    if (v2Resp.ok) {
      const data = (await v2Resp.json()) as { abi?: unknown };
      if (Array.isArray(data?.abi) && data.abi.length > 0) {
        const fetchedAbi = data.abi as Abi;
        abiCache.set(key, fetchedAbi);
        return { abi: fetchedAbi, source: 'explorer' };
      }
    }
  } catch {
    // Fall through to legacy endpoint or canonical ABI
  }

  try {
    const legacyResp = await fetch(
      `${ARC_EXPLORER_URL}/api?module=contract&action=getabi&address=${address}`,
      { headers: { Accept: 'application/json' } }
    );
    if (legacyResp.ok) {
      const data = (await legacyResp.json()) as { status?: string; result?: string };
      if (data?.status === '1' && typeof data.result === 'string') {
        const parsed = JSON.parse(data.result) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const fetchedAbi = parsed as Abi;
          abiCache.set(key, fetchedAbi);
          return { abi: fetchedAbi, source: 'explorer' };
        }
      }
    }
  } catch {
    // Ignore network failures and use canonical ABI
  }

  return { abi: SEVERE_CANONICAL_ABI, source: 'canonical' };
}
