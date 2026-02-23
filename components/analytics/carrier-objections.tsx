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

export function CarrierObjections({ data }: CarrierObjectionsProps) {
  const items = data ?? DEFAULT_DATA;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Carrier Objections</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.reason} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 font-mono text-[10px] font-semibold text-gray-400">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900">{item.reason}</div>
              <div className="mt-0.5 h-0.5 rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-indigo-400/65" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
            <span className="font-mono text-[11px] text-gray-400">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
