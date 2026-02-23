"use client";

import { CrossCard } from "@/components/ui/cross-card";
import { CallSummary } from "@/lib/types";
import { StatusDot } from "@/components/shared/status-dot";
import { formatLane, formatCurrency, formatRelativeTime } from "@/lib/utils";

interface LiveCallFeedProps {
  calls: CallSummary[];
}

export function LiveCallFeed({ calls }: LiveCallFeedProps) {
  return (
    <CrossCard>
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Live Call Feed</h3>
        <span className="text-xs text-gray-400">Just now</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {calls.slice(0, 6).map((call) => (
          <div
            key={call.id}
            className="grid cursor-pointer grid-cols-[8px_1fr_auto] items-center gap-2.5 border-t border-gray-50 px-5 py-2.5 transition-colors hover:bg-gray-50"
          >
            <StatusDot status={mapOutcomeToStatus(call.outcome)} />
            <div>
              <div className="text-xs font-medium text-gray-900">
                {call.carrier_name ?? "Unknown Carrier"}
              </div>
              <div className="text-[11px] text-gray-400">
                {call.mc_number ?? ""} · {formatLane(call.lane_origin, call.lane_destination)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs font-semibold text-indigo-600">
                {call.final_rate ? formatCurrency(call.final_rate) : "\u2014"}
              </div>
              <div className="text-[10px] text-gray-400">
                {formatRelativeTime(call.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CrossCard>
  );
}

function mapOutcomeToStatus(outcome: string): string {
  const map: Record<string, string> = {
    booked: "booked",
    negotiation_failed: "declined",
    no_loads_available: "no_match",
    invalid_carrier: "auth_failed",
    transferred_to_ops: "transferred",
    dropped_call: "declined",
    carrier_thinking: "live",
  };
  return map[outcome] ?? "no_match";
}
