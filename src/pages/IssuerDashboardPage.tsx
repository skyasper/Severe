import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/ConnectWalletPrompt';
import { ConfirmRevokeModal } from '../components/ConfirmRevokeModal';
import { StatusBadge } from '../components/StatusBadge';
import { TokenAmountCell } from '../components/TokenAmountCell';
import {
  usePlatformStats,
  useProofsByIssuer,
  useRevokeProofTx,
} from '../hooks/useSevereContract';
import { ADMIN_WALLET, CONTRACT_ADDRESS } from '../config/network';
import { formatDateUtc, shortenAddress, type NormalizedProof } from '../lib/proofUtils';

type IssuerFilter = 'all' | 'active' | 'revoked';

export function IssuerDashboardPage() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError, refetch } = useProofsByIssuer();
  const { data: platformStatsData } = usePlatformStats();
  const revokeTx = useRevokeProofTx();

  const [filter, setFilter] = useState<IssuerFilter>('all');
  const [revokeTarget, setRevokeTarget] = useState<NormalizedProof | null>(null);

  const proofs = data?.proofs ?? [];

  const counts = useMemo(() => {
    let revoked = 0;
    for (const p of proofs) {
      if (p.revoked) revoked += 1;
    }
    return {
      total: proofs.length,
      active: proofs.length - revoked,
      revoked,
    };
  }, [proofs]);

  const filtered = useMemo(() => {
    return proofs.filter((item) => {
      if (filter === 'active' && item.revoked) return false;
      if (filter === 'revoked' && !item.revoked) return false;
      return true;
    });
  }, [proofs, filter]);

  if (!isConnected || !address) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <ConnectWalletPrompt
          title="Connect your issuer wallet to open the dashboard"
          description="View every income proof signed by your wallet, inspect status metrics, and revoke proofs on-chain."
        />
      </div>
    );
  }

  const isAdmin =
    Boolean(ADMIN_WALLET) &&
    address.toLowerCase() === ADMIN_WALLET!.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
      <div className="border-b border-[#0A0A0A] pb-6 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            SIGNER LEDGER
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-[-0.015em]">
            Issuer dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-xs text-[#5C5C5C]">
            ISSUER: <span className="text-[#0A0A0A]">{shortenAddress(address)}</span>
          </span>
          <Link
            to="/issue"
            className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#6B0119] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] border border-[#8B1E2D] transition-colors whitespace-nowrap"
          >
            Issue New Proof
          </Link>
        </div>
      </div>

      {!CONTRACT_ADDRESS && (
        <div className="mb-8 border border-[#8B1E2D] bg-white p-4">
          <p className="font-mono text-xs text-[#8B1E2D]">
            REGISTRY CONTRACT NOT CONFIGURED — Set VITE_CONTRACT_ADDRESS to load
            issued proofs and execute revocations on Arc.
          </p>
        </div>
      )}

      {/* Issuer Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#0A0A0A] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E8E8E8] mb-8">
        <div className="p-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            TOTAL ISSUED BY YOU
          </p>
          <p className="font-mono text-3xl font-medium text-[#0A0A0A] tabular-nums mt-2">
            {isLoading ? '...' : counts.total}
          </p>
        </div>
        <div className="p-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            ACTIVE PROOFS
          </p>
          <p className="font-mono text-3xl font-medium text-[#8B1E2D] tabular-nums mt-2">
            {isLoading ? '...' : counts.active}
          </p>
        </div>
        <div className="p-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
            REVOKED PROOFS
          </p>
          <p className="font-mono text-3xl font-medium text-[#0A0A0A] tabular-nums mt-2">
            {isLoading ? '...' : counts.revoked}
          </p>
        </div>
      </div>

      {/* Admin Registry Overview (shown strictly when connected wallet === ADMIN_WALLET) */}
      {isAdmin && (
        <section className="mb-8 border border-[#0A0A0A] bg-[#F9F9F9] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-serif text-xl font-medium text-[#0A0A0A]">
              Admin registry overview
            </h2>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D]">
              ADMIN WALLET VERIFIED
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-white border border-[#E8E8E8] p-4">
              <div className="text-[#5C5C5C] text-[10px] uppercase tracking-[0.08em]">
                GLOBAL TOTAL
              </div>
              <div className="text-lg text-[#0A0A0A] tabular-nums mt-1">
                {platformStatsData?.stats?.totalProofs ?? 0}
              </div>
            </div>
            <div className="bg-white border border-[#E8E8E8] p-4">
              <div className="text-[#5C5C5C] text-[10px] uppercase tracking-[0.08em]">
                GLOBAL ACTIVE
              </div>
              <div className="text-lg text-[#8B1E2D] tabular-nums mt-1">
                {platformStatsData?.stats?.activeProofs ?? 0}
              </div>
            </div>
            <div className="bg-white border border-[#E8E8E8] p-4">
              <div className="text-[#5C5C5C] text-[10px] uppercase tracking-[0.08em]">
                GLOBAL REVOKED
              </div>
              <div className="text-lg text-[#0A0A0A] tabular-nums mt-1">
                {platformStatsData?.stats?.revokedProofs ?? 0}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex border border-[#0A0A0A] bg-white">
          {(['all', 'active', 'revoked'] as const).map((tab) => (
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

        <button
          type="button"
          onClick={() => void refetch()}
          className="px-4 py-2 bg-white border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer"
        >
          Refresh Ledger
        </button>
      </div>

      {/* Table Docket */}
      {isLoading ? (
        <div className="border border-[#E8E8E8] bg-white p-12 text-center font-mono text-xs text-[#5C5C5C]">
          Reading issued proofs from Arc...
        </div>
      ) : isError ? (
        <div className="border border-[#8B1E2D] bg-white p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            LEDGER READ ERROR
          </p>
          <p className="text-sm text-[#5C5C5C]">
            Unable to read issuer proofs from the configured registry contract.
          </p>
        </div>
      ) : proofs.length === 0 ? (
        <div className="border border-[#0A0A0A] bg-white p-10 md:p-14 text-center max-w-2xl mx-auto">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C] mb-2">
            NO ISSUED RECORDS
          </p>
          <h2 className="font-serif text-2xl font-medium text-[#0A0A0A] mb-3">
            You have not issued any proofs yet
          </h2>
          <p className="text-sm text-[#5C5C5C] mb-6 leading-relaxed">
            Proofs signed by {shortenAddress(address)} will appear in this
            management docket with live status and revocation controls.
          </p>
          <Link
            to="/issue"
            className="inline-block px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#6B0119] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em]"
          >
            Issue First Proof
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#E8E8E8] bg-white p-10 text-center text-sm text-[#5C5C5C]">
          No issued proofs match the selected status filter.
        </div>
      ) : (
        <div className="border border-[#0A0A0A] bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E8E8E8] border-b border-[#0A0A0A]">
                <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                  PROOF ID
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                  RECIPIENT
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                  AMOUNT
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                  PERIOD
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
                  STATUS
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E8]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9F9F9] transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#0A0A0A] tabular-nums">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#0A0A0A]">
                    {shortenAddress(item.recipient)}
                  </td>
                  <td className="px-4 py-3.5">
                    <TokenAmountCell
                      tokenAddress={item.token}
                      rawAmount={item.totalAmount}
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#5C5C5C] tabular-nums whitespace-nowrap">
                    {formatDateUtc(item.periodStart)} — {formatDateUtc(item.periodEnd)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={item.revoked ? 'revoked' : 'valid'} />
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                    <Link
                      to={`/verify/${item.id}`}
                      className="inline-block px-3 py-1.5 bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors"
                    >
                      Verify
                    </Link>
                    {!item.revoked && (
                      <button
                        type="button"
                        onClick={() => {
                          revokeTx.reset();
                          setRevokeTarget(item);
                        }}
                        className="inline-block px-3 py-1.5 bg-white text-[#8B1E2D] border border-dashed border-[#8B1E2D] hover:bg-[#8B1E2D] hover:text-white font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmRevokeModal
        proofId={revokeTarget?.id ?? null}
        recipient={revokeTarget?.recipient ?? ''}
        phase={revokeTx.phase}
        txHash={revokeTx.txHash}
        errorMessage={revokeTx.errorMessage}
        onConfirm={() => {
          if (revokeTarget) {
            void revokeTx.submitRevokeProof(revokeTarget.id);
          }
        }}
        onClose={() => {
          setRevokeTarget(null);
          revokeTx.reset();
        }}
      />
    </div>
  );
}
