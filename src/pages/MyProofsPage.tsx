import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/ConnectWalletPrompt';
import { ProofCertificate } from '../components/ProofCertificate';
import { StatusBadge } from '../components/StatusBadge';
import { TokenAmountCell } from '../components/TokenAmountCell';
import { useProofsByRecipient } from '../hooks/useSevereContract';
import { CONTRACT_ADDRESS } from '../config/network';
import { formatDateUtc, shortenAddress } from '../lib/proofUtils';

type StatusFilter = 'all' | 'valid' | 'revoked';

export function MyProofsPage() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError, refetch } = useProofsByRecipient();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const proofs = data?.proofs ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return proofs.filter((item) => {
      if (filter === 'valid' && item.revoked) return false;
      if (filter === 'revoked' && !item.revoked) return false;
      if (query) {
        return (
          item.id.toLowerCase().includes(query) ||
          item.issuer.toLowerCase().includes(query) ||
          item.note.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [proofs, filter, search]);

  const activeProof = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.find((p) => p.id === selectedId) ?? filtered[0];
  }, [filtered, selectedId]);

  if (!isConnected || !address) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <ConnectWalletPrompt
          title="Connect your wallet to view received proofs"
          description="Only income proofs recorded for your connected wallet address are displayed here. Connect your wallet to inspect and share your certificates."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
      <div className="no-print border-b border-[#0A0A0A] pb-6 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            RECIPIENT ARCHIVE
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-[-0.015em]">
            My proofs
          </h1>
        </div>
        <div className="font-mono text-xs text-[#5C5C5C]">
          WALLET: <span className="text-[#0A0A0A]">{shortenAddress(address)}</span>
        </div>
      </div>

      {!CONTRACT_ADDRESS && (
        <div className="no-print mb-8 border border-[#8B1E2D] bg-white p-4">
          <p className="font-mono text-xs text-[#8B1E2D]">
            REGISTRY CONTRACT NOT CONFIGURED — Set VITE_CONTRACT_ADDRESS to read
            proofs for your connected wallet from Arc.
          </p>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="no-print mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex border border-[#0A0A0A] bg-white">
          {(['all', 'valid', 'revoked'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-white text-[#5C5C5C] hover:text-[#0A0A0A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by proof ID or issuer..."
            aria-label="Filter proofs"
            className="px-3.5 py-2 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-xs text-[#0A0A0A] w-full sm:w-64 outline-none"
          />
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-4 py-2 bg-white border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="border border-[#E8E8E8] bg-white p-12 text-center font-mono text-xs text-[#5C5C5C]">
          Reading recipient proofs from Arc...
        </div>
      ) : isError ? (
        <div className="border border-[#8B1E2D] bg-white p-8 space-y-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#8B1E2D]">
            CONTRACT READ FAILED
          </p>
          <p className="text-sm text-[#5C5C5C]">
            Unable to read proofs from the configured registry contract on Arc.
          </p>
        </div>
      ) : proofs.length === 0 ? (
        <div className="border border-[#0A0A0A] bg-white p-10 md:p-14 text-center max-w-2xl mx-auto">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C] mb-2">
            EMPTY LEDGER
          </p>
          <h2 className="font-serif text-2xl font-medium text-[#0A0A0A] mb-3">
            No income proofs recorded for this wallet
          </h2>
          <p className="text-sm text-[#5C5C5C] mb-6 leading-relaxed">
            When an issuer signs an income proof for {shortenAddress(address)}, it
            will appear here automatically for sharing and printing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/verify"
              className="px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#6B0119] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em]"
            >
              Verify a Proof ID
            </Link>
            <Link
              to="/issue"
              className="px-5 py-2.5 bg-white border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em]"
            >
              Issue a Proof
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#E8E8E8] bg-white p-10 text-center text-sm text-[#5C5C5C]">
          No proofs match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Proof Docket List */}
          <div className="no-print lg:col-span-5 border border-[#0A0A0A] bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E8E8E8] border-b border-[#0A0A0A]">
                  <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                    ID
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]">
                {filtered.map((item) => {
                  const isSelected = activeProof?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#F9F9F9]' : 'bg-white hover:bg-[#F9F9F9]'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className="text-left font-semibold text-[#0A0A0A] hover:text-[#8B1E2D] underline cursor-pointer"
                        >
                          #{item.id}
                        </button>
                        <div className="text-[11px] text-[#5C5C5C] mt-0.5">
                          {formatDateUtc(item.periodStart)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <TokenAmountCell
                          tokenAddress={item.token}
                          rawAmount={item.totalAmount}
                        />
                        <div className="font-mono text-[11px] text-[#5C5C5C] mt-0.5">
                          {shortenAddress(item.issuer)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.revoked ? 'revoked' : 'valid'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Certificate View */}
          <div className="lg:col-span-7">
            {activeProof && <ProofCertificate proof={activeProof} />}
          </div>
        </div>
      )}
    </div>
  );
}
