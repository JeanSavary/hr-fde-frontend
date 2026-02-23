"use client";

import { Card } from "@/components/ui/card";

interface TopLanesAnalyticsProps {
  data?: Array<{
    lane: string;
    calls: number;
    bookings: number;
    avg_rate: string;
  }>;
}

const DEFAULT_DATA = [
  { lane: "Chicago \u2192 Detroit", calls: 8, bookings: 5, avg_rate: "$2,850" },
  { lane: "Dallas \u2192 Memphis", calls: 6, bookings: 3, avg_rate: "$2,400" },
  { lane: "Phoenix \u2192 LA", calls: 5, bookings: 4, avg_rate: "$1,450" },
  {
    lane: "Atlanta \u2192 Jacksonville",
    calls: 4,
    bookings: 2,
    avg_rate: "$1,920",
  },
  {
    lane: "Nashville \u2192 Charlotte",
    calls: 3,
    bookings: 2,
    avg_rate: "$2,100",
  },
];

export function TopLanesAnalytics({ data }: TopLanesAnalyticsProps) {
  const items = data ?? DEFAULT_DATA;
  const maxCalls = Math.max(...items.map((i) => i.calls));

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Top Lanes by Volume
      </h3>
      <div className="space-y-2.5">
        {items.map((item) => {
          const convRate =
            item.calls > 0 ? Math.round((item.bookings / item.calls) * 100) : 0;
          const barWidth = maxCalls > 0 ? (item.calls / maxCalls) * 100 : 0;
          return (
            <div key={item.lane} className="group">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-900">
                  {item.lane}
                </span>
                <span className="font-heading text-xs font-semibold text-gray-900">
                  {item.avg_rate}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400">
                  {item.calls} calls
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${convRate > 50 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
                >
                  {convRate}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
