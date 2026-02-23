"use client";

import { Card } from "@/components/ui/card";

interface CarrierObjectionsProps {
  data?: Array<{ reason: string; count: number; pct: number }>;
}

const DEFAULT_DATA = [
  { reason: "Rate too low", count: 14, pct: 33 },
  { reason: "Deadhead too far", count: 9, pct: 21 },
  { reason: "Timing doesn't work", count: 8, pct: 19 },
  { reason: "Wrong equipment", count: 6, pct: 14 },
  { reason: "Prefer different lane", count: 5, pct: 12 },
];

const BAR_COLORS = [
  "bg-indigo-500",
  "bg-indigo-400",
  "bg-indigo-400/70",
  "bg-indigo-300",
  "bg-indigo-300/70",
];

export function CarrierObjections({ data }: CarrierObjectionsProps) {
  const items = data ?? DEFAULT_DATA;
  const total = items.reduce((s, i) => s + i.count, 0);

  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Top Carrier Objections</h3>
        <span className="text-[11px] text-gray-400">{total} total</span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={item.reason}>
            <div className="mb-1 flex justify-between">
              <span className="text-xs font-medium text-gray-900">{item.reason}</span>
              <span className="font-heading text-[11px] text-gray-400">{item.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${BAR_COLORS[i] ?? "bg-indigo-300"}`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
