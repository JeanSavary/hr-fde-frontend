"use client";

import { Card } from "@/components/ui/card";

interface NegotiationDepthProps {
  data?: Array<{ round: string; pct: number }>;
}

const DEFAULT_DATA = [
  { round: "1st offer", pct: 42 },
  { round: "1 round", pct: 35 },
  { round: "2 rounds", pct: 15 },
  { round: "3 rounds (max)", pct: 8 },
];

export function NegotiationDepth({ data }: NegotiationDepthProps) {
  const items = data ?? DEFAULT_DATA;
  const closeWithinOne = items.slice(0, 2).reduce((s, i) => s + i.pct, 0);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Negotiation Depth</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.round} className="flex items-center gap-2.5">
            <span className="w-24 text-right text-[11px] text-gray-500">{item.round}</span>
            <div className="flex-1 overflow-hidden rounded bg-gray-100" style={{ height: 24 }}>
              <div
                className="flex h-full items-center rounded pl-2"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor: i === 0 ? "#6366f1" : `rgba(99,102,241,${0.7 - i * 0.15})`,
                }}
              >
                <span className="font-mono text-[11px] font-semibold text-white">{item.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
        <strong className="text-gray-900">{closeWithinOne}% close within 1 round</strong> — pricing is well-calibrated.
      </div>
    </Card>
  );
}
