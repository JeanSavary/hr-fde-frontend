import { cn } from "@/lib/utils";
import { OUTCOME_CONFIG, SENTIMENT_CONFIG, EQUIPMENT_BADGE_CONFIG, URGENCY_CONFIG, EQUIPMENT_CONFIG } from "@/lib/constants";
import { CallOutcome, Sentiment, EquipmentType } from "@/lib/types";

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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {config.label}
    </span>
  );
}

export function EquipmentBadge({ type }: { type: string }) {
  const config = EQUIPMENT_BADGE_CONFIG[type];
  const label = EQUIPMENT_CONFIG[type as EquipmentType]?.label ?? type;
  if (!config) return <span className="text-xs">{label}</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = URGENCY_CONFIG[urgency];
  if (!config) return <span className="text-xs capitalize">{urgency}</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {config.label}
    </span>
  );
}
