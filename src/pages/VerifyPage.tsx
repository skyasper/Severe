import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProofCertificate } from '../components/ProofCertificate';
import { useVerifyProof } from '../hooks/useSevereContract';
import { CONTRACT_ADDRESS } from '../config/network';
import { isValidProofId } from '../lib/proofUtils';

export function VerifyPage() {
  const { proofId: paramProofId } = useParams<{ proofId?: string }>();
  const navigate = useNavigate();

  const [inputId, setInputId] = useState(paramProofId ?? '');
  const [submittedId, setSubmittedId] = useState(paramProofId ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (paramProofId !== undefined) {
      setInputId(paramProofId);
      setSubmittedId(paramProofId);
      setValidationError(
        paramProofId && !isValidProofId(paramProofId)
          ? 'Enter a numeric proof ID or 32-byte 0x hash.'
          : null
      );
    }
  }, [paramProofId]);

  const { data, isLoading, isError, error } = useVerifyProof(
    validationError ? '' : submittedId
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputId.trim();
    if (!isValidProofId(trimmed)) {
      setValidationError('Enter a numeric proof ID or 32-byte 0x hash.');
      setSubmittedId('');
      return;
    }
    setValidationError(null);
    setSubmittedId(trimmed);
    navigate(`/verify/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-12 py-12">
      <div className="no-print border-b border-[#0A0A0A] pb-6 mb-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
          PUBLIC VERIFICATION LEDGER
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-[-0.015em] mb-3">
          Verify an income proof
        </h1>
        <p className="text-sm text-[#5C5C5C] max-w-2xl leading-relaxed">
          No wallet connection is required. Enter a proof ID to read the signed
          attestation directly from Arc without inspecting the recipient&apos;s
          other wallet activity.
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="no-print bg-white border border-[#0A0A0A] p-6 mb-8"
      >
        <label
          htmlFor="verify-proof-id"
          className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-2"
        >
          PROOF IDENTIFIER
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="verify-proof-id"
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Enter proof ID (e.g. 1 or 0x...)"
            className="flex-1 px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-sm text-[#0A0A0A] outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#8B1E2D] hover:bg-[#6B0119] text-white border border-[#8B1E2D] font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify Proof</span>
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-[#8B1E2D] font-mono mt-2">
            {validationError}
          </p>
        )}
      </form>

      {/* Verification Output States */}
      {!submittedId && !validationError && (
        <div className="border border-[#E8E8E8] bg-white p-10 text-center">
          <p className="font-mono text-xs text-[#5C5C5C] uppercase tracking-[0.08em]">
            Enter a Proof ID above to query the on-chain registry
          </p>
        </div>
      )}

      {submittedId && !validationError && isLoading && (
        <div className="border border-[#E8E8E8] bg-white p-10 text-center font-mono text-xs text-[#5C5C5C]">
          Querying Proof #{submittedId} on Arc...
        </div>
      )}

      {submittedId && !validationError && !isLoading && isError && (
        <div className="border border-[#8B1E2D] bg-white p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            VERIFICATION READ ERROR
          </p>
          <p className="text-sm text-[#5C5C5C]">
            {error instanceof Error
              ? error.message
              : 'Unable to query the contract on Arc.'}
          </p>
        </div>
      )}

      {submittedId && !validationError && !isLoading && !isError && data && !data.configured && (
        <div className="border border-[#8B1E2D] bg-white p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            REGISTRY CONTRACT NOT CONFIGURED
          </p>
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            Cannot verify Proof #{submittedId} because VITE_CONTRACT_ADDRESS is
            not set yet. Once a deployed contract address is configured, this
            page reads verification records directly from Arc.
          </p>
        </div>
      )}

      {submittedId && !validationError && !isLoading && !isError && data?.configured && !data.proof && (
        <div className="border border-[#0A0A0A] bg-white p-10 text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            NOT FOUND
          </p>
          <h2 className="font-serif text-2xl font-medium text-[#0A0A0A] mb-2">
            No proof exists for ID #{submittedId}
          </h2>
          <p className="text-sm text-[#5C5C5C]">
            Checked registry contract {CONTRACT_ADDRESS} on Arc.
          </p>
        </div>
      )}

      {submittedId && !validationError && !isLoading && data?.proof && (
        <ProofCertificate proof={data.proof} />
      )}
    </div>
  );
}
