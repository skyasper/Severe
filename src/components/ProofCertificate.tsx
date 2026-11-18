import { useState } from 'react';
import { Check, Copy, ExternalLink, Printer } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useTokenMetadata } from '../hooks/useTokenMetadata';
import {
  formatDateTimeUtc,
  formatDateUtc,
  formatTokenAmount,
  getArcscanAddressUrl,
  type NormalizedProof,
} from '../lib/proofUtils';
import { CONTRACT_ADDRESS } from '../config/network';

interface ProofCertificateProps {
  proof: NormalizedProof;
  showActions?: boolean;
}

export function ProofCertificate({
  proof,
  showActions = true,
}: ProofCertificateProps) {
  const [copied, setCopied] = useState(false);
  const { data: tokenMeta, isLoading: tokenLoading } = useTokenMetadata(proof.token);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify/${proof.id}`
      : `/verify/${proof.id}`;

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }

  const formattedAmount = tokenMeta
    ? formatTokenAmount(proof.totalAmount, tokenMeta.decimals, tokenMeta.symbol)
    : tokenLoading
      ? 'Reading token decimals...'
      : `${proof.totalAmount.toString()} base units`;

  return (
    <article className="print-certificate bg-white border border-[#0A0A0A]">
      {/* Certificate Header */}
      <div className="px-6 py-5 border-b border-[#0A0A0A] flex flex-wrap items-center justify-between gap-4 bg-[#F9F9F9]">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            ON-CHAIN INCOME CERTIFICATE
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#0A0A0A] mt-1">
            Proof #{proof.id}
          </h2>
        </div>
        <StatusBadge status={proof.revoked ? 'revoked' : 'valid'} />
      </div>

      {/* Primary Amount Banner */}
      <div className="px-6 py-6 border-b border-[#E8E8E8] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C] mb-1">
            ATTESTED TOTAL INCOME
          </p>
          <p className="font-mono text-2xl md:text-3xl font-semibold text-[#0A0A0A] tabular-nums">
            {formattedAmount}
          </p>
          {tokenMeta && (
            <p className="font-mono text-xs text-[#5C5C5C] mt-1 tabular-nums">
              {tokenMeta.name} ({tokenMeta.decimals} decimals) · {proof.token}
            </p>
          )}
        </div>

        <div className="md:text-right">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C] mb-1">
            COVERED PERIOD
          </p>
          <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
            {formatDateUtc(proof.periodStart)} — {formatDateUtc(proof.periodEnd)}
          </p>
          <p className="font-mono text-xs text-[#5C5C5C] mt-1 tabular-nums">
            Issued {formatDateTimeUtc(proof.issuedAt)}
          </p>
        </div>
      </div>

      {/* Forensic Ledger Grid */}
      <dl className="divide-y divide-[#E8E8E8]">
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-2">
          <dt className="md:col-span-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            RECIPIENT WALLET
          </dt>
          <dd className="md:col-span-8 font-mono text-[13px] text-[#0A0A0A] break-all flex items-center justify-between gap-2">
            <span>{proof.recipient}</span>
            <a
              href={getArcscanAddressUrl(proof.recipient)}
              target="_blank"
              rel="noreferrer"
              className="no-print text-[#8B1E2D] hover:underline shrink-0 inline-flex items-center gap-1 text-xs"
            >
              <span>Arcscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </dd>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-2">
          <dt className="md:col-span-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            ISSUER SIGNER
          </dt>
          <dd className="md:col-span-8 font-mono text-[13px] text-[#0A0A0A] break-all flex items-center justify-between gap-2">
            <span>{proof.issuer}</span>
            <a
              href={getArcscanAddressUrl(proof.issuer)}
              target="_blank"
              rel="noreferrer"
              className="no-print text-[#8B1E2D] hover:underline shrink-0 inline-flex items-center gap-1 text-xs"
            >
              <span>Arcscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </dd>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-2">
          <dt className="md:col-span-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            ISSUER NOTE
          </dt>
          <dd className="md:col-span-8 text-sm text-[#0A0A0A]">
            {proof.note ? proof.note : 'No optional note attached to this proof.'}
          </dd>
        </div>

        {CONTRACT_ADDRESS && (
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-2">
            <dt className="md:col-span-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
              REGISTRY CONTRACT
            </dt>
            <dd className="md:col-span-8 font-mono text-[13px] text-[#5C5C5C] break-all">
              {CONTRACT_ADDRESS}
            </dd>
          </div>
        )}
      </dl>

      {/* Privacy Boundary Notice */}
      <div className="px-6 py-4 border-t border-[#E8E8E8] bg-[#F9F9F9] text-xs text-[#5C5C5C] leading-relaxed">
        <span className="font-mono uppercase tracking-[0.06em] text-[#0A0A0A] font-semibold mr-2">
          SCOPE
        </span>
        This certificate attests solely to the income figure and period signed
        above. It never exposes wallet balances, counterparties, or unrelated
        transaction history.
      </div>

      {/* Actions */}
      {showActions && (
        <div className="no-print px-6 py-4 border-t border-[#E8E8E8] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-4 py-2 bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Copy Verification Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#6B0119] text-white border border-[#8B1E2D] font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
        </div>
      )}
    </article>
  );
}

/**
 * Pure structural layout illustration for the Home page.
 * Contains zero invented names, amounts, or IDs.
 */
export function ProofCertificateIllustration() {
  return (
    <div
      className="bg-white border border-[#0A0A0A]"
      aria-label="Certificate layout illustration"
    >
      <div className="px-5 sm:px-6 py-4 border-b border-[#0A0A0A] bg-[#F9F9F9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C] whitespace-nowrap">
            CERTIFICATE STRUCTURE
          </p>
          <p className="font-serif text-xl font-medium text-[#0A0A0A] mt-0.5">
            [Proof ID]
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <StatusBadge status="illustration" label="LAYOUT ILLUSTRATION" />
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5 border-b border-[#E8E8E8] grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            TOTAL AMOUNT
          </p>
          <p className="font-mono text-base font-semibold text-[#0A0A0A] mt-1 whitespace-nowrap">
            [Amount] [Token]
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            INCOME PERIOD
          </p>
          <p className="font-mono text-xs text-[#0A0A0A] mt-1.5">
            [Period Start] — [Period End]
          </p>
        </div>
      </div>

      <dl className="divide-y divide-[#E8E8E8]">
        <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            RECIPIENT WALLET
          </dt>
          <dd className="font-mono text-xs text-[#0A0A0A]">[0x... Recipient Address]</dd>
        </div>
        <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            ISSUER SIGNER
          </dt>
          <dd className="font-mono text-xs text-[#0A0A0A]">[0x... Issuer Address]</dd>
        </div>
        <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            OPTIONAL NOTE
          </dt>
          <dd className="font-mono text-xs text-[#5C5C5C]">[Issuer Memo Field]</dd>
        </div>
        <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            VERIFICATION STATE
          </dt>
          <dd className="font-mono text-xs text-[#8B1E2D] font-semibold">
            [Valid / Revoked On-Chain]
          </dd>
        </div>
      </dl>

      <div className="px-6 py-3.5 border-t border-[#E8E8E8] bg-[#F9F9F9]">
        <p className="font-mono text-[11px] text-[#5C5C5C]">
          Structural illustration only. Real values load directly from Arc.
        </p>
      </div>
    </div>
  );
}
