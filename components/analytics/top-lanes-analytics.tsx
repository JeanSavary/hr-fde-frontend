"use client";

import { Card } from "@/components/ui/card";

interface TopLanesAnalyticsProps {
  data?: Array<{ lane: string; calls: number; bookings: number; avg_rate: string }>;
}

const DEFAULT_DATA = [
  { lane: "Chicago \u2192 Detroit", calls: 8, bookings: 5, avg_rate: "$2,850" },
  { lane: "Dallas \u2192 Memphis", calls: 6, bookings: 3, avg_rate: "$2,400" },
  { lane: "Phoenix \u2192 LA", calls: 5, bookings: 4, avg_rate: "$1,450" },
  { lane: "Atlanta \u2192 Jacksonville", calls: 4, bookings: 2, avg_rate: "$1,920" },
  { lane: "Nashville \u2192 Charlotte", calls: 3, bookings: 2, avg_rate: "$2,100" },
];

export function TopLanesAnalytics({ data }: TopLanesAnalyticsProps) {
  const items = data ?? DEFAULT_DATA;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Lanes by Volume</h3>
      <div className="space-y-1">
        {items.map((item, i) => {
          const convRate = item.calls > 0 ? Math.round((item.bookings / item.calls) * 100) : 0;
          return (
            <div key={item.lane} className={`grid grid-cols-[1fr_50px_50px_60px] items-center rounded-md px-2.5 py-2 ${i === 0 ? "bg-indigo-50/50" : ""}`}>
              <span className="text-xs font-medium text-gray-900">{item.lane}</span>
              <span className="text-center text-[11px] text-gray-400">{item.calls} calls</span>
              <span className="text-center">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${convRate > 50 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                  {convRate}%
                </span>
              </span>
              <span className="text-right font-mono text-xs font-semibold text-gray-900">{item.avg_rate}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
