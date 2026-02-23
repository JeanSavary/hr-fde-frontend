"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookedLoad } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MarginDistributionProps {
  bookings: BookedLoad[];
}

const PAGE_SIZE = 5;

export function MarginDistribution({ bookings }: MarginDistributionProps) {
  const withMargin = bookings
    .filter((b) => b.margin != null)
    .sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0));
  const [page, setPage] = useState(0);

  if (withMargin.length === 0) return null;

  const totalPages = Math.ceil(withMargin.length / PAGE_SIZE);
  const visible = withMargin.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card className="p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Margin Distribution
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] tabular-nums text-gray-400">
              {page + 1}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {visible.map((b) => {
          const origin = b.lane_origin?.split(",")[0] ?? b.load_id;
          const margin = b.margin ?? 0;
          return (
            <div key={b.id} className="flex items-center gap-2.5">
              <span className="w-16 text-right text-[11px] text-gray-400">
                {origin}
              </span>
              <div
                className="relative flex-1 overflow-hidden rounded bg-gray-100"
                style={{ height: 16 }}
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded transition-all duration-500",
                    margin >= 15
                      ? "bg-emerald-400"
                      : margin < 5
                        ? "bg-rose-400"
                        : "bg-indigo-400",
                  )}
                  style={{ width: `${Math.min((margin / 20) * 100, 100)}%` }}
                />
                {/* min line at 5% */}
                <div
                  className="absolute top-0 h-full w-px bg-rose-400/40"
                  style={{ left: `${(5 / 20) * 100}%` }}
                />
                {/* target line at 15% */}
                <div
                  className="absolute top-0 h-full w-px bg-emerald-400/40"
                  style={{ left: `${(15 / 20) * 100}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-9 font-heading text-[11px] font-semibold",
                  margin >= 15
                    ? "text-emerald-500"
                    : margin < 5
                      ? "text-rose-500"
                      : "text-indigo-500",
                )}
              >
                {margin.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-4 text-[10px] text-gray-400">
        <span>
          <span className="mr-1 inline-block h-0.5 w-2 rounded bg-rose-400/50" />
          Min 5%
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-2 rounded bg-emerald-400/50" />
          Target 15%
        </span>
      </div>
    </Card>
  );
}
