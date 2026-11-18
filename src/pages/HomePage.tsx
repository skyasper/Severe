import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ProofCertificateIllustration } from '../components/ProofCertificate';
import { usePlatformStats } from '../hooks/useSevereContract';
import { useKnownTokensMetadata } from '../hooks/useTokenMetadata';
import { KNOWN_TOKENS } from '../config/network';

const ROADMAP_PHASES = [
  {
    phase: 'PHASE 01',
    title: 'Core proofs live',
    status: 'ACTIVE',
    description:
      'On-chain proof issuance, public verification by proof ID, and issuer-only revocation deployed for wallets on Arc.',
  },
  {
    phase: 'PHASE 02',
    title: 'Printable and PDF certificates',
    status: 'AVAILABLE',
    description:
      'Archival certificate print formatting so recipients can export clean records for landlords, lenders, and counterparties.',
  },
  {
    phase: 'PHASE 03',
    title: 'Trusted issuer badges',
    status: 'PLANNED',
    description:
      'Recognized issuer verification markers allowing verifiers to identify established payroll providers and DAOs at a glance.',
  },
  {
    phase: 'PHASE 04',
    title: 'Proofs for recurring income streams',
    status: 'PLANNED',
    description:
      'Multi-period attestations capturing recurring payouts and retainer cadence without revealing underlying treasury flows.',
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Who can issue a proof',
    answer:
      'Any wallet address can sign and record an income proof for a recipient wallet. The issuer wallet address is permanently recorded on-chain as the signer of that certificate so verifiers always know who attested the figure.',
  },
  {
    question: 'Can a proof be faked',
    answer:
      'A third party cannot forge an attestation from another wallet. Because the smart contract records msg.sender as the issuer signer, any verification check cryptographically reveals the exact wallet that issued the proof.',
  },
  {
    question: 'What does a verifier see',
    answer:
      'A verifier sees only the proof ID, recipient wallet, issuer signer, token contract and attested total amount, covered start and end dates, issuance timestamp, optional note, and current valid or revoked status. Wallet balances and unrelated transactions remain private.',
  },
  {
    question: 'Can a proof be revoked',
    answer:
      'Yes. Only the original issuer wallet that signed a proof can revoke it on-chain. Once revoked, any public verification lookup immediately displays the revoked seal.',
  },
] as const;

export function HomePage() {
  const { data: statsData, isLoading: statsLoading } = usePlatformStats();
  const { data: tokensMeta, isLoading: tokensLoading } = useKnownTokensMetadata();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const usdcMeta = tokensMeta?.[KNOWN_TOKENS[0].address.toLowerCase()];
  const eurcMeta = tokensMeta?.[KNOWN_TOKENS[1].address.toLowerCase()];

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[#0A0A0A] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-6 space-y-6"
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D]">
              BUILT ON ARC
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#0A0A0A] leading-[1.12] tracking-[-0.02em] text-balance">
              On chain income proofs without wallet exposure
            </h1>
            <p className="text-base text-[#5C5C5C] leading-relaxed max-w-xl">
              An issuer records a signed proof of income for a recipient wallet.
              The wallet owner shares the certificate and anyone verifies it
              publicly without inspecting the rest of the wallet history.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/verify"
                className="px-6 py-3 bg-[#8B1E2D] hover:bg-[#6B0119] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] border border-[#8B1E2D] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Verify a Proof</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/issue"
                className="px-6 py-3 bg-white hover:bg-[#0A0A0A] text-[#0A0A0A] hover:text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] border border-[#0A0A0A] transition-colors whitespace-nowrap shrink-0"
              >
                Issue a Proof
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="lg:col-span-6"
          >
            <ProofCertificateIllustration />
          </motion.div>
        </div>
      </section>

      {/* Live Registry Stats Strip */}
      <section className="border-b border-[#E8E8E8] bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
            <h2 className="font-serif text-2xl font-medium text-[#0A0A0A]">
              Live registry ledger
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5C5C5C]">
              Direct contract read on Arc
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E8E8E8] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E8E8E8]">
            <div className="p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
                TOTAL PROOFS
              </p>
              <p className="font-mono text-3xl font-medium text-[#0A0A0A] tabular-nums mt-2">
                {statsLoading
                  ? '...'
                  : statsData?.configured && statsData.stats
                    ? statsData.stats.totalProofs
                    : '0'}
              </p>
              <p className="text-xs text-[#5C5C5C] mt-1">
                {statsData?.configured
                  ? 'Recorded on-chain'
                  : 'Awaiting contract address'}
              </p>
            </div>

            <div className="p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
                ACTIVE PROOFS
              </p>
              <p className="font-mono text-3xl font-medium text-[#8B1E2D] tabular-nums mt-2">
                {statsLoading
                  ? '...'
                  : statsData?.configured && statsData.stats
                    ? statsData.stats.activeProofs
                    : '0'}
              </p>
              <p className="text-xs text-[#5C5C5C] mt-1">Currently valid</p>
            </div>

            <div className="p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
                REVOKED PROOFS
              </p>
              <p className="font-mono text-3xl font-medium text-[#0A0A0A] tabular-nums mt-2">
                {statsLoading
                  ? '...'
                  : statsData?.configured && statsData.stats
                    ? statsData.stats.revokedProofs
                    : '0'}
              </p>
              <p className="text-xs text-[#5C5C5C] mt-1">Invalidated by issuer</p>
            </div>

            <div className="p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
                SUPPORTED ASSETS
              </p>
              <p className="font-mono text-lg font-medium text-[#0A0A0A] tabular-nums mt-3">
                {tokensLoading
                  ? 'Reading Arc RPC...'
                  : `${usdcMeta?.symbol ?? 'USDC'} (${usdcMeta?.decimals ?? '—'}d) / ${eurcMeta?.symbol ?? 'EURC'} (${eurcMeta?.decimals ?? '—'}d)`}
              </p>
              <p className="text-xs text-[#5C5C5C] mt-2">
                Decimals read from ERC-20 contracts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-b border-[#E8E8E8] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
          <div className="max-w-2xl mb-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
              DISCLOSURE BOUNDARY
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#0A0A0A] tracking-[-0.015em]">
              What a proof contains and what it never contains
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#0A0A0A] divide-y md:divide-y-0 md:divide-x divide-[#0A0A0A]">
            <div className="p-6 md:p-8 bg-white">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-4">
                CONTAINED IN A PROOF
              </p>
              <ul className="space-y-3 text-sm text-[#0A0A0A] leading-relaxed">
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Recipient wallet address
                </li>
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Token contract and attested total amount
                </li>
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Covered period start and end timestamps
                </li>
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Optional issuer note and issuance date
                </li>
                <li>Current valid or revoked status</li>
              </ul>
            </div>

            <div className="p-6 md:p-8 bg-[#F9F9F9]">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-4">
                NEVER CONTAINED
              </p>
              <ul className="space-y-3 text-sm text-[#5C5C5C] leading-relaxed">
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Current or historical wallet balances
                </li>
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Unrelated incoming or outgoing transfers
                </li>
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Other counterparties or spending activity
                </li>
                <li className="pb-2.5 border-b border-[#E8E8E8]">
                  Individual line-item payroll invoices
                </li>
                <li>Off-chain personal identity documents</li>
              </ul>
            </div>

            <div className="p-6 md:p-8 bg-white">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] mb-4">
                ISSUER AS SIGNER
              </p>
              <p className="text-sm text-[#0A0A0A] leading-relaxed mb-4">
                Every certificate records the issuing wallet address directly on
                Arc as the cryptographic signer. Verifiers inspect who signed
                the income statement and whether that signer later revoked it.
              </p>
              <p className="text-xs text-[#5C5C5C] leading-relaxed border-t border-[#E8E8E8] pt-4">
                Severe is available on Arc with public verification open to any
                reader without a wallet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="border-b border-[#E8E8E8] bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
          <div className="max-w-2xl mb-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
              DEVELOPMENT PHASES
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#0A0A0A] tracking-[-0.015em]">
              Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-[#E8E8E8] bg-white divide-y md:divide-y-0 md:divide-x divide-[#E8E8E8]">
            {ROADMAP_PHASES.map((item) => (
              <div key={item.phase} className="p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5C5C]">
                      {item.phase}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 border ${
                        item.status === 'ACTIVE'
                          ? 'bg-[#8B1E2D] text-white border-[#8B1E2D]'
                          : item.status === 'AVAILABLE'
                            ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                            : 'bg-white text-[#5C5C5C] border-[#E8E8E8]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#0A0A0A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5C5C5C] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-2">
                PROTOCOL QUESTIONS
              </p>
              <h2 className="font-serif text-3xl font-medium text-[#0A0A0A] tracking-[-0.015em]">
                Frequently asked questions
              </h2>
            </div>

            <div className="lg:col-span-8 border border-[#0A0A0A] divide-y divide-[#E8E8E8]">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.question} className="bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                    >
                      <span className="font-serif text-lg font-medium text-[#0A0A0A]">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#0A0A0A] shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-[#5C5C5C] leading-relaxed border-t border-[#E8E8E8] pt-4 bg-[#F9F9F9]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
