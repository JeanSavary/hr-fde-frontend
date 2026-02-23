"use client";

import { Card } from "@/components/ui/card";
import { DashboardMetrics } from "@/lib/types";

interface RateIntelligenceProps {
  metrics: DashboardMetrics;
}

export function RateIntelligence({ metrics }: RateIntelligenceProps) {
  const ri = metrics.rate_intelligence;
  const discount =
    ri?.discount_pct ?? Math.abs(metrics.avg_rate_differential_percent ?? 0);
  const margin = ri?.margin_pct ?? 0;
  const avgLoadboard = ri?.avg_loadboard ?? 0;
  const avgAgreed = ri?.avg_agreed ?? 0;
  const agreedPct = avgLoadboard > 0 ? (avgAgreed / avgLoadboard) * 100 : 0;

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Rate Intelligence
      </h3>
      {ri ? (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">Avg Loadboard</span>
                <span className="font-heading text-sm font-bold tabular-nums text-gray-800">
                  ${avgLoadboard.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-full rounded-full bg-gray-300" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">Avg Agreed</span>
                <span className="font-heading text-sm font-bold tabular-nums text-indigo-600">
                  ${avgAgreed.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${agreedPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200">
            <div className="bg-white px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Discount
              </div>
              <div className="mt-0.5 font-heading text-base font-bold tabular-nums text-gray-800">
                {discount.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Margin
              </div>
              <div className="mt-0.5 font-heading text-base font-bold tabular-nums text-emerald-600">
                {margin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200">
          <div className="bg-white px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Avg Rate Diff
            </div>
            <div className="mt-0.5 font-heading text-base font-bold tabular-nums text-gray-800">
              {discount.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
