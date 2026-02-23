"use client";

import { CrossCard } from "@/components/ui/cross-card";
import { SENTIMENT_CONFIG, SENTIMENT_CHART_COLORS } from "@/lib/constants";

interface SentimentChartProps {
  data: Record<string, number>;
}

export function SentimentChart({ data }: SentimentChartProps) {
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const entries = Object.entries(data).filter(([, v]) => v > 0);

  return (
    <CrossCard>
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Carrier Sentiment</h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const pct = Math.round((count / total) * 100);
          const color = SENTIMENT_CHART_COLORS[key] ?? "#94a3b8";
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-gray-500">
                  {SENTIMENT_CONFIG[key as keyof typeof SENTIMENT_CONFIG]?.label ?? key}
                </span>
                <span className="font-heading text-xs font-semibold text-gray-900">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </CrossCard>
  );
}
