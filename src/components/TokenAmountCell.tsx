import { useTokenMetadata } from '../hooks/useTokenMetadata';
import { formatTokenAmount } from '../lib/proofUtils';

interface TokenAmountCellProps {
  tokenAddress: string;
  rawAmount: bigint;
}

export function TokenAmountCell({ tokenAddress, rawAmount }: TokenAmountCellProps) {
  const { data: meta, isLoading } = useTokenMetadata(tokenAddress);

  if (isLoading) {
    return <span className="font-mono text-xs text-[#5C5C5C]">Reading...</span>;
  }

  if (!meta) {
    return (
      <span className="font-mono text-xs text-[#0A0A0A] tabular-nums">
        {rawAmount.toString()} units
      </span>
    );
  }

  return (
    <span className="font-mono text-[13px] font-medium text-[#0A0A0A] tabular-nums">
      {formatTokenAmount(rawAmount, meta.decimals, meta.symbol)}
    </span>
  );
}
