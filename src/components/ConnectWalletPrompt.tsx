import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletPromptProps {
  title: string;
  description: string;
}

export function ConnectWalletPrompt({
  title,
  description,
}: ConnectWalletPromptProps) {
  return (
    <section className="bg-white border border-[#0A0A0A] p-8 md:p-12 max-w-2xl mx-auto my-8">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B1E2D] mb-3">
        WALLET REQUIRED
      </p>
      <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-[-0.015em] mb-4">
        {title}
      </h1>
      <p className="text-[15px] leading-relaxed text-[#5C5C5C] mb-8">
        {description}
      </p>
      <div className="pt-6 border-t border-[#E8E8E8] flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-[#5C5C5C] uppercase tracking-[0.06em]">
          Available on Arc
        </span>
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => (
            <button
              type="button"
              onClick={openConnectModal}
              disabled={!mounted}
              className="px-6 py-3 bg-[#8B1E2D] hover:bg-[#6B0119] text-white font-mono text-xs font-semibold uppercase tracking-[0.08em] border border-[#8B1E2D] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    </section>
  );
}
