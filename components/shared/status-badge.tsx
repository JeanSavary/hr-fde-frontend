import { cn } from "@/lib/utils";
import { OUTCOME_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { CallOutcome, Sentiment } from "@/lib/types";

export function OutcomeBadge({ outcome }: { outcome: CallOutcome }) {
  const config = OUTCOME_CONFIG[outcome];
  if (!config) return <span>{outcome}</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
      )}
    >
      {config.label}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const config = SENTIMENT_CONFIG[sentiment];
  if (!config) return <span>{sentiment}</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
      )}
    >
      {config.label}
    </span>
  );
}
