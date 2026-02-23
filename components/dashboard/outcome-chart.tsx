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

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Call Outcomes</h3>
      <div className="space-y-1.5">
        {entries.map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: OUTCOME_CHART_COLORS[key] ?? "#94a3b8" }}
            />
            <span className="flex-1 text-xs text-gray-500">
              {OUTCOME_CONFIG[key as keyof typeof OUTCOME_CONFIG]?.label ?? key}
            </span>
            <span className="font-mono text-xs font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full">
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
    </Card>
  );
}
