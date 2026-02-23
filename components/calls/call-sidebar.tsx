"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CallSummary } from "@/lib/types";
import { SentimentBadge, EquipmentBadge, OutcomeBadge } from "@/components/shared/status-badge";
import { formatLane, formatCurrency } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface CallSidebarProps {
  call: CallSummary;
  onClose: () => void;
}

export function CallSidebar({ call, onClose }: CallSidebarProps) {
  const equipLabel = call.equipment_type
    ? (EQUIPMENT_CONFIG[call.equipment_type as keyof typeof EQUIPMENT_CONFIG]?.label ?? call.equipment_type)
    : "—";

  return (
    <Card className="sticky top-20 self-start p-5 shadow-sm animate-in slide-in-from-right-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{call.carrier_name ?? "Unknown"}</div>
          <div className="font-mono text-[11px] text-gray-400">{call.mc_number ?? "—"}</div>
        </div>
        <button onClick={onClose} className="text-gray-300 transition-colors hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* FMCSA badge */}
      <div className="mb-4 rounded-lg border-l-[3px] border-emerald-400 bg-emerald-50 px-3 py-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          FMCSA Verified
        </div>
        <div className="text-[11px] text-emerald-600">Authorized · Insurance Active</div>
      </div>

      {/* Metadata grid */}
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {[
          ["Lane", formatLane(call.lane_origin, call.lane_destination)],
          ["Equipment", equipLabel],
          ["Outcome", null],
          ["Rate", call.final_rate ? formatCurrency(call.final_rate) : "—"],
        ].map(([label, value], i) => (
          <div key={i}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">{label}</div>
            {label === "Outcome" ? (
              <OutcomeBadge outcome={call.outcome} />
            ) : (
              <div className="text-[13px] font-semibold text-gray-900">{value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Sentiment */}
      <div className="mb-4">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">Sentiment</div>
        <SentimentBadge sentiment={call.sentiment} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild className="flex-1" size="sm">
          <Link href={`/calls/${call.call_id}`}>Full Detail</Link>
        </Button>
      </div>
    </Card>
  );
}
