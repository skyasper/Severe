import { Link } from 'react-router-dom';
import { SevereLogo } from './SevereLogo';

export function Footer() {
  return (
    <footer className="no-print bg-[#0A0A0A] text-white border-t border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-3">
          <SevereLogo className="w-6 h-6 shrink-0 mt-0.5 border border-white/30" />
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Built by Sky
            </p>
            <p className="text-xs text-[#D4D4D4] mt-1">
              Severe is an independent project available on Arc.
            </p>
          </div>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#D4D4D4]"
        >
          <Link to="/" className="hover:text-white transition-colors whitespace-nowrap">
            Home
          </Link>
          <Link to="/issue" className="hover:text-white transition-colors whitespace-nowrap">
            Issue a Proof
          </Link>
          <Link to="/proofs" className="hover:text-white transition-colors whitespace-nowrap">
            My Proofs
          </Link>
          <Link to="/verify" className="hover:text-white transition-colors whitespace-nowrap">
            Verify
          </Link>
          <Link to="/dashboard" className="hover:text-white transition-colors whitespace-nowrap">
            Issuer Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
