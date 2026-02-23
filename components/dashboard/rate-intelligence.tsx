"use client";

import { CrossCard } from "@/components/ui/cross-card";
import { DashboardMetrics } from "@/lib/types";

interface RateIntelligenceProps {
  metrics: DashboardMetrics;
}

export function RateIntelligence({ metrics }: RateIntelligenceProps) {
  const ri = metrics.rate_intelligence;
  const discount = ri?.discount_pct ?? Math.abs(metrics.avg_rate_differential_percent ?? 0);
  const margin = ri?.margin_pct ?? 0;

  return (
    <CrossCard>
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Rate Intelligence</h3>
      {ri ? (
        <>
          <div className="mb-3 flex justify-between">
            <div>
              <div className="text-[10px] uppercase text-gray-400">Avg Loadboard</div>
              <div className="font-heading text-xl font-bold text-gray-900">
                ${ri.avg_loadboard.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-gray-400">Avg Agreed</div>
              <div className="font-heading text-xl font-bold text-indigo-600">
                ${ri.avg_agreed.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex gap-3 border-t border-gray-100 pt-2.5">
            <div>
              <div className="text-[10px] uppercase text-gray-400">Discount</div>
              <div className="font-heading text-base font-semibold text-gray-900">{discount.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-gray-400">Margin</div>
              <div className="font-heading text-base font-semibold text-emerald-500">{margin.toFixed(1)}%</div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 border-t border-gray-100 pt-2.5">
          <div>
            <div className="text-[10px] uppercase text-gray-400">Avg Rate Diff</div>
            <div className="font-heading text-base font-semibold text-gray-900">{discount.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </CrossCard>
  );
}
