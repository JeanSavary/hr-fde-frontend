"use client";

import { Card } from "@/components/ui/card";
import { DashboardMetrics } from "@/lib/types";

interface ConversionFunnelProps {
  metrics: DashboardMetrics;
}

export function ConversionFunnel({ metrics }: ConversionFunnelProps) {
  const funnelData = metrics.funnel_data ?? deriveFunnel(metrics);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Conversion Funnel</h3>
      <div className="flex flex-col gap-2">
        {funnelData.map((stage, i) => (
          <div key={stage.stage} className="flex items-center gap-2.5">
            <span className="w-24 text-right text-xs font-medium text-gray-500">
              {stage.stage}
            </span>
            <div className="flex-1 overflow-hidden rounded bg-gray-100" style={{ height: 22 }}>
              <div
                className="flex h-full items-center justify-end rounded pr-1.5 transition-all duration-500"
                style={{
                  width: `${stage.pct}%`,
                  backgroundColor: i === funnelData.length - 1 ? "#6366f1" : `rgba(99,102,241,${0.15 + i * 0.15})`,
                }}
              >
                <span className={`font-mono text-[10px] font-semibold ${i >= 3 ? "text-white" : "text-indigo-600"}`}>
                  {stage.count}
                </span>
              </div>
            </div>
            <span className="w-8 text-right font-mono text-[10px] text-gray-400">
              {stage.pct}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function deriveFunnel(metrics: DashboardMetrics) {
  const total = metrics.total_calls || 1;
  const booked = metrics.calls_by_outcome?.booked ?? 0;
  const noLoads = metrics.calls_by_outcome?.no_loads_available ?? 0;
  const invalid = metrics.calls_by_outcome?.invalid_carrier ?? 0;

  const authenticated = total - invalid;
  const matched = authenticated - noLoads;
  const offered = Math.round(matched * 0.85);

  return [
    { stage: "Inbound Calls", count: total, pct: 100 },
    { stage: "Authenticated", count: authenticated, pct: Math.round((authenticated / total) * 100) },
    { stage: "Load Matched", count: matched, pct: Math.round((matched / total) * 100) },
    { stage: "Offer Made", count: offered, pct: Math.round((offered / total) * 100) },
    { stage: "Booked", count: booked, pct: Math.round((booked / total) * 100) },
  ];
}
