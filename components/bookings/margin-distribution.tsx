"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MarginDistributionProps {
  bookings: BookedLoad[];
}

export function MarginDistribution({ bookings }: MarginDistributionProps) {
  const withMargin = bookings.filter((b) => b.margin != null);
  if (withMargin.length === 0) return null;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Margin Distribution</h3>
      <div className="space-y-2">
        {withMargin.map((b) => {
          const origin = b.lane_origin?.split(",")[0] ?? b.load_id;
          const margin = b.margin ?? 0;
          return (
            <div key={b.id} className="flex items-center gap-2.5">
              <span className="w-16 text-right text-[11px] text-gray-400">{origin}</span>
              <div className="relative flex-1 overflow-hidden rounded bg-gray-100" style={{ height: 16 }}>
                <div
                  className={cn("absolute left-0 top-0 h-full rounded transition-all duration-500",
                    margin >= 15 ? "bg-emerald-400" : margin >= 10 ? "bg-indigo-500" : "bg-amber-400"
                  )}
                  style={{ width: `${Math.min((margin / 20) * 100, 100)}%` }}
                />
                {/* min line at 5% */}
                <div className="absolute top-0 h-full w-px bg-rose-400/40" style={{ left: `${(5 / 20) * 100}%` }} />
                {/* target line at 15% */}
                <div className="absolute top-0 h-full w-px bg-emerald-400/40" style={{ left: `${(15 / 20) * 100}%` }} />
              </div>
              <span className={cn("w-9 font-mono text-[11px] font-semibold",
                margin >= 15 ? "text-emerald-500" : "text-amber-500"
              )}>
                {margin.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-4 text-[10px] text-gray-400">
        <span><span className="mr-1 inline-block h-0.5 w-2 rounded bg-rose-400/50" />Min 5%</span>
        <span><span className="mr-1 inline-block h-0.5 w-2 rounded bg-emerald-400/50" />Target 15%</span>
      </div>
    </Card>
  );
}
