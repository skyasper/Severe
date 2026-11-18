import { formatUnits, isAddress, parseUnits } from 'viem';

export const EXPLORER_BASE_URL = 'https://testnet.arcscan.app';

export interface NormalizedProof {
  id: string;
  issuer: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  periodStart: number;
  periodEnd: number;
  issuedAt: number;
  note: string;
  revoked: boolean;
}

export interface PlatformStats {
  totalProofs: number;
  activeProofs: number;
  revokedProofs: number;
}

export interface IssueProofFormInput {
  recipient: string;
  tokenAddress: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  note: string;
  attested: boolean;
}

export interface IssueProofValidationErrors {
  recipient?: string;
  tokenAddress?: string;
  amount?: string;
  periodStart?: string;
  periodEnd?: string;
  note?: string;
  attested?: string;
}

export interface AbiFunctionLike {
  type?: string;
  name?: string;
  inputs?: ReadonlyArray<{ name?: string; type: string }>;
  outputs?: ReadonlyArray<{ name?: string; type: string }>;
}

export function isValidAddress(value: string): boolean {
  return isAddress(value.trim());
}

export function isValidProofId(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^\d+$/.test(trimmed)) {
    return true;
  }
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return true;
  }
  return false;
}

export function parseProofIdArg(value: string): bigint | `0x${string}` | null {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return BigInt(trimmed);
  }
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return trimmed as `0x${string}`;
  }
  return null;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 4) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(
  rawAmount: bigint,
  decimals: number,
  symbol?: string
): string {
  const formatted = formatUnits(rawAmount, decimals);
  const [intPart, fracPart] = formatted.split('.');
  const withCommas = Number(intPart).toLocaleString('en-US');
  const trimmedFrac = fracPart ? fracPart.replace(/0+$/, '').slice(0, 4) : '';
  const numeric = trimmedFrac ? `${withCommas}.${trimmedFrac}` : withCommas;
  return symbol ? `${numeric} ${symbol}` : numeric;
}

export function parseTokenAmount(
  humanAmount: string,
  decimals: number
): bigint | null {
  const cleaned = humanAmount.trim().replace(/,/g, '');
  if (!cleaned || !/^\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  const parts = cleaned.split('.');
  if (parts[1] && parts[1].length > decimals) {
    return null;
  }
  try {
    const parsed = parseUnits(cleaned, decimals);
    return parsed > 0n ? parsed : null;
  } catch {
    return null;
  }
}

export function dateInputToUnixStart(dateStr: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 0;
  return Math.floor(Date.parse(`${dateStr}T00:00:00Z`) / 1000);
}

export function dateInputToUnixEnd(dateStr: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 0;
  return Math.floor(Date.parse(`${dateStr}T23:59:59Z`) / 1000);
}

export function formatDateUtc(timestampSec: number): string {
  if (!timestampSec || timestampSec <= 0) return '—';
  const d = new Date(timestampSec * 1000);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatDateTimeUtc(timestampSec: number): string {
  if (!timestampSec || timestampSec <= 0) return '—';
  const d = new Date(timestampSec * 1000);
  return (
    d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC'
  );
}

export function validateIssueProofForm(
  input: IssueProofFormInput,
  decimals: number
): IssueProofValidationErrors {
  const errors: IssueProofValidationErrors = {};

  if (!isValidAddress(input.recipient)) {
    errors.recipient = 'Enter a valid 0x wallet address for the recipient.';
  }

  if (!isValidAddress(input.tokenAddress)) {
    errors.tokenAddress = 'Select a valid token contract address.';
  }

  const parsedAmount = parseTokenAmount(input.amount, decimals);
  if (parsedAmount === null) {
    errors.amount = `Enter a positive amount with at most ${decimals} decimal places.`;
  }

  const startSec = dateInputToUnixStart(input.periodStart);
  const endSec = dateInputToUnixEnd(input.periodEnd);

  if (!startSec) {
    errors.periodStart = 'Select a period start date.';
  }
  if (!endSec) {
    errors.periodEnd = 'Select a period end date.';
  }
  if (startSec && endSec && endSec < startSec) {
    errors.periodEnd = 'Period end date must be on or after the start date.';
  }

  if (input.note.length > 240) {
    errors.note = 'Optional note must be 240 characters or fewer.';
  }

  if (!input.attested) {
    errors.attested = 'Confirm issuer attestation before signing.';
  }

  return errors;
}

function toBigIntSafe(val: unknown): bigint {
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number' && Number.isFinite(val)) return BigInt(Math.trunc(val));
  if (typeof val === 'string' && /^\d+$/.test(val)) return BigInt(val);
  return 0n;
}

function toNumberSafe(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'bigint') return Number(val);
  if (typeof val === 'string' && /^\d+$/.test(val)) return Number(val);
  return 0;
}

function isZeroAddress(addr: string): boolean {
  return /^0x0{40}$/i.test(addr);
}

/**
 * Normalizes tuple/object/array return structures from various proof ABI layouts
 * into a single deterministic NormalizedProof shape.
 */
export function normalizeProofRecord(
  raw: unknown,
  idFallback?: string
): NormalizedProof | null {
  if (!raw) return null;

  // Handle verifyProof returning [valid, proofTuple] or { valid, proof }
  if (Array.isArray(raw) && raw.length === 2 && typeof raw[0] === 'boolean') {
    const inner = normalizeProofRecord(raw[1], idFallback);
    if (!inner) return null;
    if (!raw[0] && !inner.revoked) {
      return { ...inner, revoked: true };
    }
    return inner;
  }

  if (typeof raw === 'object' && raw !== null && 'proof' in raw && !('recipient' in raw)) {
    const obj = raw as { valid?: boolean; proof?: unknown };
    const inner = normalizeProofRecord(obj.proof, idFallback);
    if (!inner) return null;
    if (obj.valid === false && !inner.revoked) {
      return { ...inner, revoked: true };
    }
    return inner;
  }

  // Handle named struct object
  if (typeof raw === 'object' && !Array.isArray(raw) && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const recipient = String(obj.recipient ?? obj.owner ?? obj.wallet ?? '');
    const issuer = String(obj.issuer ?? obj.signer ?? '');
    const token = String(obj.token ?? obj.asset ?? '');

    if (!recipient || isZeroAddress(recipient) || !isAddress(recipient)) {
      return null;
    }

    const idVal = obj.id ?? obj.proofId ?? idFallback ?? '0';
    return {
      id: String(idVal),
      issuer: isAddress(issuer) ? issuer : '0x0000000000000000000000000000000000000000',
      recipient,
      token: isAddress(token) ? token : '0x0000000000000000000000000000000000000000',
      totalAmount: toBigIntSafe(obj.totalAmount ?? obj.amount),
      periodStart: toNumberSafe(obj.periodStart ?? obj.startTime ?? obj.start),
      periodEnd: toNumberSafe(obj.periodEnd ?? obj.endTime ?? obj.end),
      issuedAt: toNumberSafe(obj.issuedAt ?? obj.timestamp ?? obj.createdAt),
      note: String(obj.note ?? obj.memo ?? ''),
      revoked: Boolean(obj.revoked ?? obj.isRevoked ?? false),
    };
  }

  // Handle positional tuple array
  if (Array.isArray(raw)) {
    // 10-field canonical tuple: [id, issuer, recipient, token, totalAmount, periodStart, periodEnd, issuedAt, note, revoked]
    if (raw.length >= 10) {
      const recipient = String(raw[2] ?? '');
      if (!recipient || isZeroAddress(recipient) || !isAddress(recipient)) {
        return null;
      }
      return {
        id: String(raw[0] ?? idFallback ?? '0'),
        issuer: String(raw[1]),
        recipient,
        token: String(raw[3]),
        totalAmount: toBigIntSafe(raw[4]),
        periodStart: toNumberSafe(raw[5]),
        periodEnd: toNumberSafe(raw[6]),
        issuedAt: toNumberSafe(raw[7]),
        note: String(raw[8] ?? ''),
        revoked: Boolean(raw[9]),
      };
    }

    // 9-field tuple without explicit id: [issuer, recipient, token, totalAmount, periodStart, periodEnd, issuedAt, note, revoked]
    if (raw.length === 9) {
      const recipient = String(raw[1] ?? '');
      if (!recipient || isZeroAddress(recipient) || !isAddress(recipient)) {
        return null;
      }
      return {
        id: String(idFallback ?? '0'),
        issuer: String(raw[0]),
        recipient,
        token: String(raw[2]),
        totalAmount: toBigIntSafe(raw[3]),
        periodStart: toNumberSafe(raw[4]),
        periodEnd: toNumberSafe(raw[5]),
        issuedAt: toNumberSafe(raw[6]),
        note: String(raw[7] ?? ''),
        revoked: Boolean(raw[8]),
      };
    }
  }

  return null;
}

export function resolveAbiFunction(
  abi: readonly AbiFunctionLike[],
  candidates: readonly string[]
): AbiFunctionLike | undefined {
  for (const name of candidates) {
    const found = abi.find(
      (item) => item.type === 'function' && item.name === name
    );
    if (found) return found;
  }
  return undefined;
}

export function getArcscanTxUrl(txHash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${txHash}`;
}

export function getArcscanAddressUrl(address: string): string {
  return `${EXPLORER_BASE_URL}/address/${address}`;
}
