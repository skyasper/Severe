import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { SevereLogo } from './SevereLogo';
import { shortenAddress } from '../lib/proofUtils';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/issue', label: 'Issue a Proof' },
  { to: '/proofs', label: 'My Proofs' },
  { to: '/verify', label: 'Verify' },
  { to: '/dashboard', label: 'Issuer Dashboard' },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 text-[#0A0A0A] whitespace-nowrap shrink-0"
          aria-label="Severe home"
        >
          <SevereLogo className="w-7 h-7 shrink-0" />
          <span className="font-serif text-xl font-semibold tracking-[-0.01em]">
            Severe
          </span>
        </Link>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-[13px] font-medium whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                  isActive
                    ? 'text-[#8B1E2D] border-[#8B1E2D]'
                    : 'text-[#5C5C5C] border-transparent hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single Primary Wallet Action + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                >
                  {!connected ? (
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#6B0119] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] border border-[#8B1E2D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Connect Wallet
                    </button>
                  ) : chain.unsupported ? (
                    <button
                      type="button"
                      onClick={openChainModal}
                      className="px-4 py-2 bg-[#0A0A0A] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] border border-[#0A0A0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Switch to Arc
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openAccountModal}
                      className="px-4 py-2 bg-white hover:bg-[#0A0A0A] text-[#0A0A0A] hover:text-white font-mono text-xs font-medium tracking-[0.02em] border border-[#0A0A0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {shortenAddress(account.address)}
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[#E8E8E8] bg-white px-4 py-3 flex flex-col divide-y divide-[#E8E8E8]"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-3 text-sm font-medium ${
                  isActive ? 'text-[#8B1E2D]' : 'text-[#0A0A0A]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
