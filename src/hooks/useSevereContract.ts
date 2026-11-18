import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  decodeEventLog,
  type Abi,
  type Address,
  type Hash,
} from 'viem';
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { fetchDeployedContractAbi, SEVERE_CANONICAL_ABI } from '../config/abi';
import { ARC_CHAIN_ID, CONTRACT_ADDRESS } from '../config/network';
import {
  normalizeProofRecord,
  parseProofIdArg,
  resolveAbiFunction,
  type AbiFunctionLike,
  type NormalizedProof,
  type PlatformStats,
} from '../lib/proofUtils';

export type TxLifecyclePhase =
  | 'idle'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'error';

export function useContractAbi() {
  return useQuery({
    queryKey: ['severe-abi', ARC_CHAIN_ID, CONTRACT_ADDRESS?.toLowerCase()],
    enabled: Boolean(CONTRACT_ADDRESS),
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!CONTRACT_ADDRESS) {
        return { abi: SEVERE_CANONICAL_ABI as Abi, source: 'canonical' as const };
      }
      return fetchDeployedContractAbi(CONTRACT_ADDRESS);
    },
  });
}

export function usePlatformStats() {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { data: abiData } = useContractAbi();
  const abi = abiData?.abi ?? (SEVERE_CANONICAL_ABI as Abi);

  return useQuery<{ configured: boolean; stats: PlatformStats | null }>({
    queryKey: ['severe-stats', ARC_CHAIN_ID, CONTRACT_ADDRESS?.toLowerCase()],
    enabled: Boolean(publicClient),
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient) {
        return { configured: false, stats: null };
      }

      const fn = resolveAbiFunction(abi as readonly AbiFunctionLike[], [
        'getStats',
        'getPlatformStats',
        'platformStats',
        'stats',
        'totalProofs',
      ]);

      if (!fn?.name) {
        return { configured: true, stats: null };
      }

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: fn.name,
      });

      if (Array.isArray(result)) {
        return {
          configured: true,
          stats: {
            totalProofs: Number(result[0] ?? 0n),
            activeProofs: Number(result[1] ?? 0n),
            revokedProofs: Number(result[2] ?? 0n),
          },
        };
      }

      if (typeof result === 'object' && result !== null) {
        const obj = result as Record<string, unknown>;
        const total = Number(obj.totalProofs ?? obj.total ?? 0);
        const active = Number(obj.activeProofs ?? obj.active ?? 0);
        const revoked = Number(obj.revokedProofs ?? obj.revoked ?? 0);
        return {
          configured: true,
          stats: {
            totalProofs: total,
            activeProofs: active,
            revokedProofs: revoked,
          },
        };
      }

      if (typeof result === 'bigint' || typeof result === 'number') {
        const total = Number(result);
        return {
          configured: true,
          stats: {
            totalProofs: total,
            activeProofs: total,
            revokedProofs: 0,
          },
        };
      }

      return { configured: true, stats: null };
    },
  });
}

async function readSingleProof(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  abi: Abi,
  proofIdRaw: string
): Promise<NormalizedProof | null> {
  if (!CONTRACT_ADDRESS) return null;
  const arg = parseProofIdArg(proofIdRaw);
  if (arg === null) return null;

  const verifyFn = resolveAbiFunction(abi as readonly AbiFunctionLike[], [
    'verifyProof',
    'getProof',
    'proofs',
  ]);
  if (!verifyFn?.name) return null;

  try {
    const res = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: verifyFn.name,
      args: [arg],
    });
    return normalizeProofRecord(res, proofIdRaw);
  } catch {
    return null;
  }
}

export function useVerifyProof(proofIdInput: string) {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { data: abiData } = useContractAbi();
  const abi = abiData?.abi ?? (SEVERE_CANONICAL_ABI as Abi);
  const trimmed = proofIdInput.trim();
  const parsedArg = parseProofIdArg(trimmed);

  return useQuery<{
    configured: boolean;
    proof: NormalizedProof | null;
  }>({
    queryKey: [
      'severe-verify-proof',
      ARC_CHAIN_ID,
      CONTRACT_ADDRESS?.toLowerCase(),
      trimmed,
    ],
    enabled: Boolean(publicClient && trimmed && parsedArg !== null),
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient) {
        return { configured: false, proof: null };
      }
      const proof = await readSingleProof(publicClient, abi, trimmed);
      return { configured: true, proof };
    },
  });
}

async function fetchProofListForAddress(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  abi: Abi,
  fnCandidates: readonly string[],
  targetAddress: Address
): Promise<NormalizedProof[]> {
  if (!CONTRACT_ADDRESS) return [];
  const listFn = resolveAbiFunction(
    abi as readonly AbiFunctionLike[],
    fnCandidates
  );
  if (!listFn?.name) return [];

  const rawList = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: listFn.name,
    args: [targetAddress],
  });

  if (!Array.isArray(rawList) || rawList.length === 0) {
    return [];
  }

  // If contract returns full proof structs directly
  if (typeof rawList[0] === 'object' && rawList[0] !== null) {
    return rawList
      .map((item) => normalizeProofRecord(item))
      .filter((item): item is NormalizedProof => item !== null)
      .sort((a, b) => b.issuedAt - a.issuedAt);
  }

  // Otherwise contract returned an array of proof IDs
  const ids = rawList.map((id) => String(id));
  const resolved = await Promise.all(
    ids.map((id) => readSingleProof(publicClient, abi, id))
  );
  return resolved
    .filter((item): item is NormalizedProof => item !== null)
    .sort((a, b) => b.issuedAt - a.issuedAt);
}

export function useProofsByRecipient() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { data: abiData } = useContractAbi();
  const abi = abiData?.abi ?? (SEVERE_CANONICAL_ABI as Abi);

  return useQuery<{ configured: boolean; proofs: NormalizedProof[] }>({
    queryKey: [
      'severe-recipient-proofs',
      ARC_CHAIN_ID,
      CONTRACT_ADDRESS?.toLowerCase(),
      address?.toLowerCase(),
    ],
    enabled: Boolean(isConnected && address && publicClient),
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient || !address) {
        return { configured: Boolean(CONTRACT_ADDRESS), proofs: [] };
      }
      const proofs = await fetchProofListForAddress(
        publicClient,
        abi,
        ['getProofsByRecipient', 'proofsByRecipient', 'getRecipientProofs'],
        address
      );
      return { configured: true, proofs };
    },
  });
}

export function useProofsByIssuer() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { data: abiData } = useContractAbi();
  const abi = abiData?.abi ?? (SEVERE_CANONICAL_ABI as Abi);

  return useQuery<{ configured: boolean; proofs: NormalizedProof[] }>({
    queryKey: [
      'severe-issuer-proofs',
      ARC_CHAIN_ID,
      CONTRACT_ADDRESS?.toLowerCase(),
      address?.toLowerCase(),
    ],
    enabled: Boolean(isConnected && address && publicClient),
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient || !address) {
        return { configured: Boolean(CONTRACT_ADDRESS), proofs: [] };
      }
      const proofs = await fetchProofListForAddress(
        publicClient,
        abi,
        ['getProofsByIssuer', 'proofsByIssuer', 'getIssuerProofs'],
        address
      );
      return { configured: true, proofs };
    },
  });
}

export interface IssueProofTxParams {
  recipient: Address;
  token: Address;
  totalAmount: bigint;
  periodStart: number;
  periodEnd: number;
  note: string;
}

export function useIssueProofTx() {
  const queryClient = useQueryClient();
  const { data: abiData } = useContractAbi();
  const abi = abiData?.abi ?? (SEVERE_CANONICAL_ABI as Abi);
  const { writeContractAsync, data: txHash, reset: resetWrite } = useWriteContract();
  const [phase, setPhase] = useState<TxLifecyclePhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issuedProofId, setIssuedProofId] = useState<string | null>(null);
  const [submittedHash, setSubmittedHash] = useState<Hash | undefined>(undefined);

  const receiptQuery = useWaitForTransactionReceipt({
    chainId: ARC_CHAIN_ID,
    hash: submittedHash,
    query: {
      enabled: Boolean(submittedHash),
    },
  });

  useEffect(() => {
    if (receiptQuery.isSuccess && receiptQuery.data) {
      let decodedId: string | null = null;
      for (const log of receiptQuery.data.logs) {
        try {
          const decoded = decodeEventLog({
            abi,
            data: log.data,
            topics: log.topics,
          });
          if (
            decoded.eventName === 'ProofIssued' &&
            decoded.args &&
            typeof decoded.args === 'object' &&
            'proofId' in decoded.args
          ) {
            decodedId = String((decoded.args as { proofId: unknown }).proofId);
            break;
          }
        } catch {
          // Ignore non-matching logs
        }
      }
      setIssuedProofId(decodedId);
      setPhase('confirmed');
      void queryClient.invalidateQueries({ queryKey: ['severe-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['severe-recipient-proofs'] });
      void queryClient.invalidateQueries({ queryKey: ['severe-issuer-proofs'] });
    } else if (receiptQuery.isError && receiptQuery.error) {
      setPhase('error');
      setErrorMessage(receiptQuery.error.message);
    }
  }, [
    receiptQuery.isSuccess,
    receiptQuery.isError,
    receiptQuery.data,
    receiptQuery.error,
    abi,
    queryClient,
  ]);

  async function submitIssueProof(params: IssueProofTxParams) {
    if (!CONTRACT_ADDRESS) {
      setPhase('error');
      setErrorMessage(
        'Contract address is not configured. Set VITE_CONTRACT_ADDRESS to submit transactions on Arc.'
      );
      return;
    }

    const issueFn = resolveAbiFunction(abi as readonly AbiFunctionLike[], [
      'issueProof',
      'createProof',
      'recordProof',
    ]);
    const functionName = issueFn?.name ?? 'issueProof';

    setErrorMessage(null);
    setIssuedProofId(null);
    setSubmittedHash(undefined);
    setPhase('pending');

    try {
      const hash = await writeContractAsync({
        chainId: ARC_CHAIN_ID,
        address: CONTRACT_ADDRESS,
        abi,
        functionName,
        args: [
          params.recipient,
          params.token,
          params.totalAmount,
          BigInt(params.periodStart),
          BigInt(params.periodEnd),
          params.note,
        ],
      });
      setSubmittedHash(hash);
      setPhase('confirming');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Transaction signature rejected or failed.';
      setPhase('error');
      setErrorMessage(msg);
    }
  }

  function reset() {
    resetWrite();
    setPhase('idle');
    setErrorMessage(null);
    setIssuedProofId(null);
    setSubmittedHash(undefined);
  }

  return {
    phase,
    txHash: submittedHash ?? txHash,
    issuedProofId,
    errorMessage,
    submitIssueProof,
    reset,
  };
}

export function useRevokeProofTx() {
  const queryClient = useQueryClient();
  const { data: abiData } = useContractAbi();
  const abi = abiData?.abi ?? (SEVERE_CANONICAL_ABI as Abi);
  const { writeContractAsync, reset: resetWrite } = useWriteContract();
  const [phase, setPhase] = useState<TxLifecyclePhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedHash, setSubmittedHash] = useState<Hash | undefined>(undefined);
  const [targetProofId, setTargetProofId] = useState<string | null>(null);

  const receiptQuery = useWaitForTransactionReceipt({
    chainId: ARC_CHAIN_ID,
    hash: submittedHash,
    query: {
      enabled: Boolean(submittedHash),
    },
  });

  useEffect(() => {
    if (receiptQuery.isSuccess) {
      setPhase('confirmed');
      void queryClient.invalidateQueries({ queryKey: ['severe-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['severe-issuer-proofs'] });
      void queryClient.invalidateQueries({ queryKey: ['severe-recipient-proofs'] });
      void queryClient.invalidateQueries({ queryKey: ['severe-verify-proof'] });
    } else if (receiptQuery.isError && receiptQuery.error) {
      setPhase('error');
      setErrorMessage(receiptQuery.error.message);
    }
  }, [receiptQuery.isSuccess, receiptQuery.isError, receiptQuery.error, queryClient]);

  async function submitRevokeProof(proofId: string) {
    if (!CONTRACT_ADDRESS) {
      setPhase('error');
      setErrorMessage(
        'Contract address is not configured. Set VITE_CONTRACT_ADDRESS to revoke proofs on Arc.'
      );
      return;
    }

    const arg = parseProofIdArg(proofId);
    if (arg === null) {
      setPhase('error');
      setErrorMessage('Invalid proof identifier.');
      return;
    }

    const revokeFn = resolveAbiFunction(abi as readonly AbiFunctionLike[], [
      'revokeProof',
      'revoke',
    ]);
    const functionName = revokeFn?.name ?? 'revokeProof';

    setTargetProofId(proofId);
    setErrorMessage(null);
    setSubmittedHash(undefined);
    setPhase('pending');

    try {
      const hash = await writeContractAsync({
        chainId: ARC_CHAIN_ID,
        address: CONTRACT_ADDRESS,
        abi,
        functionName,
        args: [arg],
      });
      setSubmittedHash(hash);
      setPhase('confirming');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Transaction signature rejected or failed.';
      setPhase('error');
      setErrorMessage(msg);
    }
  }

  function reset() {
    resetWrite();
    setPhase('idle');
    setErrorMessage(null);
    setSubmittedHash(undefined);
    setTargetProofId(null);
  }

  return {
    phase,
    txHash: submittedHash,
    targetProofId,
    errorMessage,
    submitRevokeProof,
    reset,
  };
}
