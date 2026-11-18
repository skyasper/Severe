interface StatusBadgeProps {
  status: 'valid' | 'revoked' | 'pending' | 'confirming' | 'illustration';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  if (status === 'valid') {
    return (
      <span className="inline-block bg-[#8B1E2D] text-white font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 border border-[#8B1E2D] whitespace-nowrap shrink-0">
        {label ?? 'VALID'}
      </span>
    );
  }

  if (status === 'revoked') {
    return (
      <span className="inline-block bg-[#0A0A0A] text-white font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 border border-[#0A0A0A] whitespace-nowrap shrink-0">
        {label ?? 'REVOKED'}
      </span>
    );
  }

  if (status === 'illustration') {
    return (
      <span className="inline-block bg-white text-[#0A0A0A] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 border border-[#0A0A0A] whitespace-nowrap shrink-0">
        {label ?? 'LAYOUT ILLUSTRATION'}
      </span>
    );
  }

  return (
    <span className="inline-block bg-white text-[#5C5C5C] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 border border-[#5C5C5C] whitespace-nowrap shrink-0">
      {label ?? (status === 'confirming' ? 'CONFIRMING' : 'PENDING')}
    </span>
  );
}
