"use client";

import { Card } from "@/components/ui/card";
import { OUTCOME_CONFIG, OUTCOME_CHART_COLORS } from "@/lib/constants";

interface OutcomeChartProps {
  data: Record<string, number>;
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  const entries = Object.entries(data)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const total = entries.reduce((s, [, c]) => s + c, 0) || 1;
  const maxCount = entries[0]?.[1] ?? 1;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Call Outcomes</h3>
        <span className="text-xs tabular-nums text-gray-400">
          {total} calls
        </span>
      </div>
      <div className="mb-4 flex h-2 overflow-hidden rounded-full">
        {entries.map(([key, count]) => (
          <div
            key={key}
            className="h-full"
            style={{
              flex: count,
              backgroundColor: OUTCOME_CHART_COLORS[key] ?? "#94a3b8",
            }}
          />
        ))}
      </div>
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const pct = Math.round((count / total) * 100);
          const barWidth = Math.round((count / maxCount) * 100);
          const color = OUTCOME_CHART_COLORS[key] ?? "#94a3b8";
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {OUTCOME_CONFIG[key as keyof typeof OUTCOME_CONFIG]
                      ?.label ?? key}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-xs font-bold tabular-nums text-gray-800">
                    {count}
                  </span>
                  <span className="w-8 text-right text-[11px] tabular-nums text-gray-400">
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
