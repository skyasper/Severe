import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useSwitchChain } from 'wagmi';
import { type Address } from 'viem';
import { ConnectWalletPrompt } from '../components/ConnectWalletPrompt';
import { StatusBadge } from '../components/StatusBadge';
import { useIssueProofTx } from '../hooks/useSevereContract';
import { useKnownTokensMetadata } from '../hooks/useTokenMetadata';
import { ARC_CHAIN_ID, CONTRACT_ADDRESS, KNOWN_TOKENS } from '../config/network';
import {
  dateInputToUnixEnd,
  dateInputToUnixStart,
  getArcscanTxUrl,
  parseTokenAmount,
  shortenAddress,
  validateIssueProofForm,
  type IssueProofValidationErrors,
} from '../lib/proofUtils';

export function IssueProofPage() {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: tokensMeta, isLoading: tokensLoading } = useKnownTokensMetadata();
  const {
    phase,
    txHash,
    issuedProofId,
    errorMessage,
    submitIssueProof,
    reset,
  } = useIssueProofTx();

  const [recipient, setRecipient] = useState('');
  const [tokenAddress, setTokenAddress] = useState<string>(KNOWN_TOKENS[0].address);
  const [amount, setAmount] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [note, setNote] = useState('');
  const [attested, setAttested] = useState(false);
  const [errors, setErrors] = useState<IssueProofValidationErrors>({});

  if (!isConnected || !address) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <ConnectWalletPrompt
          title="Connect a wallet to issue a proof"
          description="Issuing an income proof records your wallet address on Arc as the permanent signer for the certificate. Connect your wallet to open the issuance ledger."
        />
      </div>
    );
  }

  const selectedTokenMeta = tokensMeta?.[tokenAddress.toLowerCase()];
  const activeDecimals = selectedTokenMeta?.decimals ?? null;
  const parsedUnits =
    activeDecimals !== null ? parseTokenAmount(amount, activeDecimals) : null;
  const isWrongChain = chainId !== ARC_CHAIN_ID;
  const isBusy = phase === 'pending' || phase === 'confirming';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (activeDecimals === null) return;

    const validation = validateIssueProofForm(
      {
        recipient,
        tokenAddress,
        amount,
        periodStart,
        periodEnd,
        note,
        attested,
      },
      activeDecimals
    );

    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    const totalAmount = parseTokenAmount(amount, activeDecimals);
    if (totalAmount === null) return;

    await submitIssueProof({
      recipient: recipient.trim() as Address,
      token: tokenAddress as Address,
      totalAmount,
      periodStart: dateInputToUnixStart(periodStart),
      periodEnd: dateInputToUnixEnd(periodEnd),
      note: note.trim(),
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
      <div className="border-b border-[#0A0A0A] pb-6 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
            ATTESTATION REGISTRY
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-[-0.015em]">
            Issue a proof
          </h1>
        </div>
        <div className="font-mono text-xs text-[#5C5C5C]">
          SIGNER: <span className="text-[#0A0A0A]">{shortenAddress(address)}</span>
        </div>
      </div>

      {!CONTRACT_ADDRESS && (
        <div className="mb-8 border border-[#8B1E2D] bg-white p-4 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-[#8B1E2D]">
            REGISTRY CONTRACT NOT CONFIGURED — Set VITE_CONTRACT_ADDRESS in your
            environment to submit on-chain issuances on Arc.
          </p>
        </div>
      )}

      {isWrongChain && (
        <div className="mb-8 border border-[#0A0A0A] bg-white p-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#0A0A0A]">
            Switch your wallet network to Arc (Chain ID {ARC_CHAIN_ID}) before
            signing.
          </p>
          <button
            type="button"
            onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}
            className="px-4 py-2 bg-[#0A0A0A] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] cursor-pointer"
          >
            Switch to Arc
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 bg-white border border-[#0A0A0A] divide-y divide-[#E8E8E8]"
        >
          <div className="p-6 space-y-5">
            <div>
              <label
                htmlFor="recipient-input"
                className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-2"
              >
                RECIPIENT WALLET ADDRESS
              </label>
              <input
                id="recipient-input"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-sm text-[#0A0A0A] outline-none"
              />
              {errors.recipient && (
                <p className="text-xs text-[#8B1E2D] mt-1.5 font-mono">
                  {errors.recipient}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="token-select"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-2"
                >
                  SETTLEMENT ASSET
                </label>
                <select
                  id="token-select"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-sm text-[#0A0A0A] outline-none"
                >
                  {KNOWN_TOKENS.map((t) => {
                    const liveMeta = tokensMeta?.[t.address.toLowerCase()];
                    const label = liveMeta
                      ? `${liveMeta.symbol} (${liveMeta.decimals} decimals)`
                      : `${t.fallbackSymbol}`;
                    return (
                      <option key={t.address} value={t.address}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                {errors.tokenAddress && (
                  <p className="text-xs text-[#8B1E2D] mt-1.5 font-mono">
                    {errors.tokenAddress}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="amount-input"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-2"
                >
                  TOTAL INCOME AMOUNT
                </label>
                <input
                  id="amount-input"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-sm text-[#0A0A0A] tabular-nums outline-none"
                />
                {errors.amount && (
                  <p className="text-xs text-[#8B1E2D] mt-1.5 font-mono">
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="period-start"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-2"
                >
                  PERIOD START DATE (UTC)
                </label>
                <input
                  id="period-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-sm text-[#0A0A0A] outline-none"
                />
                {errors.periodStart && (
                  <p className="text-xs text-[#8B1E2D] mt-1.5 font-mono">
                    {errors.periodStart}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="period-end"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-2"
                >
                  PERIOD END DATE (UTC)
                </label>
                <input
                  id="period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] font-mono text-sm text-[#0A0A0A] outline-none"
                />
                {errors.periodEnd && (
                  <p className="text-xs text-[#8B1E2D] mt-1.5 font-mono">
                    {errors.periodEnd}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="note-input"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]"
                >
                  OPTIONAL ISSUER NOTE
                </label>
                <span className="font-mono text-[11px] text-[#5C5C5C] tabular-nums">
                  {note.length}/240
                </span>
              </div>
              <textarea
                id="note-input"
                rows={3}
                maxLength={240}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional reference memo recorded with the proof"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E8E8] focus:border-[#0A0A0A] text-sm text-[#0A0A0A] outline-none resize-none"
              />
              {errors.note && (
                <p className="text-xs text-[#8B1E2D] mt-1.5 font-mono">
                  {errors.note}
                </p>
              )}
            </div>
          </div>

          {/* Square Attestation Checkbox */}
          <div className="p-6 bg-[#F9F9F9]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="w-4 h-4 mt-0.5 border border-[#0A0A0A] bg-white flex items-center justify-center shrink-0"
              >
                {attested && <span className="w-2.5 h-2.5 bg-[#8B1E2D]" />}
              </span>
              <span className="text-xs text-[#0A0A0A] leading-relaxed">
                I confirm this income attestation is accurate and understand my
                connected wallet address will be recorded publicly on Arc as the
                issuer signer.
              </span>
            </label>
            {errors.attested && (
              <p className="text-xs text-[#8B1E2D] mt-2 font-mono">
                {errors.attested}
              </p>
            )}
          </div>

          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setRecipient('');
                setAmount('');
                setPeriodStart('');
                setPeriodEnd('');
                setNote('');
                setAttested(false);
                setErrors({});
                reset();
              }}
              disabled={isBusy}
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer disabled:opacity-50"
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={isBusy || tokensLoading || activeDecimals === null || isWrongChain}
              className="px-6 py-2.5 bg-[#8B1E2D] hover:bg-[#6B0119] text-white border border-[#8B1E2D] font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer disabled:opacity-50"
            >
              {phase === 'pending'
                ? 'Awaiting Signature...'
                : phase === 'confirming'
                  ? 'Confirming on Arc...'
                  : 'Sign & Issue Proof'}
            </button>
          </div>
        </form>

        {/* Signing Docket & Live Transaction Status */}
        <aside className="lg:col-span-5 bg-white border border-[#0A0A0A] divide-y divide-[#E8E8E8]">
          <div className="px-6 py-4 bg-[#F9F9F9] flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]">
              TRANSACTION DOCKET
            </span>
            {phase !== 'idle' && (
              <StatusBadge
                status={
                  phase === 'confirmed'
                    ? 'valid'
                    : phase === 'error'
                      ? 'revoked'
                      : phase
                }
                label={
                  phase === 'pending'
                    ? 'PENDING'
                    : phase === 'confirming'
                      ? 'CONFIRMING'
                      : phase === 'confirmed'
                        ? 'CONFIRMED'
                        : 'FAILED'
                }
              />
            )}
          </div>

          <dl className="divide-y divide-[#E8E8E8]">
            <div className="px-6 py-3.5 flex items-center justify-between gap-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5C5C5C]">
                TOKEN CONTRACT
              </dt>
              <dd className="font-mono text-xs text-[#0A0A0A]">
                {shortenAddress(tokenAddress)}
              </dd>
            </div>

            <div className="px-6 py-3.5 flex items-center justify-between gap-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5C5C5C]">
                ON-CHAIN DECIMALS
              </dt>
              <dd className="font-mono text-xs text-[#0A0A0A] tabular-nums">
                {tokensLoading
                  ? 'Reading RPC...'
                  : activeDecimals !== null
                    ? `${activeDecimals} (${selectedTokenMeta?.symbol})`
                    : 'Unavailable'}
              </dd>
            </div>

            <div className="px-6 py-3.5 flex items-center justify-between gap-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5C5C5C]">
                ENCODED UNITS
              </dt>
              <dd className="font-mono text-xs text-[#0A0A0A] tabular-nums">
                {parsedUnits !== null ? parsedUnits.toString() : '—'}
              </dd>
            </div>
          </dl>

          {phase === 'pending' && (
            <div className="p-6 text-xs text-[#5C5C5C] leading-relaxed">
              Approve the transaction signature in your connected wallet to
              record this proof on Arc.
            </div>
          )}

          {phase === 'confirming' && txHash && (
            <div className="p-6 space-y-2">
              <p className="text-xs text-[#0A0A0A]">
                Transaction broadcast to Arc. Waiting for block confirmation.
              </p>
              <a
                href={getArcscanTxUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-[#8B1E2D] underline break-all block"
              >
                {txHash}
              </a>
            </div>
          )}

          {phase === 'confirmed' && txHash && (
            <div className="p-6 space-y-4 bg-[#F9F9F9]">
              <p className="font-serif text-xl font-medium text-[#0A0A0A]">
                Proof recorded on Arc
              </p>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5C5C5C] mb-1">
                  TRANSACTION HASH
                </p>
                <a
                  href={getArcscanTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-[#8B1E2D] underline break-all"
                >
                  {txHash}
                </a>
              </div>
              {issuedProofId && (
                <Link
                  to={`/verify/${issuedProofId}`}
                  className="inline-block px-4 py-2 bg-[#8B1E2D] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em]"
                >
                  Inspect Proof #{issuedProofId}
                </Link>
              )}
            </div>
          )}

          {phase === 'error' && errorMessage && (
            <div className="p-6 bg-[#F9F9F9]">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
                TRANSACTION ERROR
              </p>
              <p className="font-mono text-xs text-[#0A0A0A] break-words">
                {errorMessage}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
