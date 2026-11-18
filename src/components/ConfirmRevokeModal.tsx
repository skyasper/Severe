import { StatusBadge } from './StatusBadge';
import type { TxLifecyclePhase } from '../hooks/useSevereContract';
import { getArcscanTxUrl, shortenAddress } from '../lib/proofUtils';

interface ConfirmRevokeModalProps {
  proofId: string | null;
  recipient: string;
  phase: TxLifecyclePhase;
  txHash?: string;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmRevokeModal({
  proofId,
  recipient,
  phase,
  txHash,
  errorMessage,
  onConfirm,
  onClose,
}: ConfirmRevokeModalProps) {
  if (!proofId) return null;

  const isBusy = phase === 'pending' || phase === 'confirming';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A0A0A]/30 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-modal-title"
    >
      <div className="bg-white border border-[#0A0A0A] w-full max-w-lg">
        <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D]">
            REVOCATION DOCKET
          </span>
          {phase !== 'idle' && (
            <StatusBadge
              status={phase === 'confirmed' ? 'revoked' : phase === 'error' ? 'revoked' : phase}
              label={
                phase === 'pending'
                  ? 'AWAITING SIGNATURE'
                  : phase === 'confirming'
                    ? 'CONFIRMING'
                    : phase === 'confirmed'
                      ? 'REVOKED'
                      : 'ERROR'
              }
            />
          )}
        </div>

        <div className="p-6 space-y-4">
          <h2
            id="revoke-modal-title"
            className="font-serif text-2xl font-medium text-[#0A0A0A]"
          >
            Revoke Proof #{proofId}
          </h2>
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            Revoking marks this income certificate permanently invalid on Arc. Any
            verifier checking Proof #{proofId} for{' '}
            <span className="font-mono text-[#0A0A0A]">
              {shortenAddress(recipient)}
            </span>{' '}
            will see a revoked status.
          </p>

          {txHash && (
            <div className="border border-[#E8E8E8] bg-[#F9F9F9] p-3 font-mono text-xs">
              <div className="text-[#5C5C5C] uppercase text-[10px] tracking-[0.08em] mb-1">
                Transaction Hash
              </div>
              <a
                href={getArcscanTxUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="text-[#8B1E2D] underline break-all"
              >
                {txHash}
              </a>
            </div>
          )}

          {errorMessage && (
            <div className="border border-[#8B1E2D] bg-[#F9F9F9] p-3 text-xs text-[#8B1E2D] font-mono break-words">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E8E8E8] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="px-4 py-2 bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer disabled:opacity-50"
          >
            {phase === 'confirmed' ? 'Close' : 'Cancel'}
          </button>
          {phase !== 'confirmed' && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isBusy}
              className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#6B0119] text-white border border-[#8B1E2D] font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer disabled:opacity-60"
            >
              {phase === 'pending'
                ? 'Sign in Wallet...'
                : phase === 'confirming'
                  ? 'Confirming...'
                  : 'Confirm Revocation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
