"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight } from "lucide-react";
import { CallSummary } from "@/lib/types";
import {
  SentimentBadge,
  EquipmentBadge,
  OutcomeBadge,
} from "@/components/shared/status-badge";
import { formatLane, formatCurrency, formatDuration } from "@/lib/utils";

interface CallSidebarProps {
  call: CallSummary;
  onClose: () => void;
}

export function CallSidebar({ call, onClose }: CallSidebarProps) {
  const hasInitial = call.initial_rate != null && call.initial_rate > 0;
  const hasFinal = call.final_rate != null && call.final_rate > 0;
  const rateDiff =
    hasInitial && hasFinal
      ? (
          ((call.final_rate! - call.initial_rate!) / call.initial_rate!) *
          100
        ).toFixed(1)
      : null;

  return (
    <Card className="sticky top-20 w-[380px] shrink-0 self-start overflow-hidden animate-in slide-in-from-right-4 py-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <div className="text-[15px] font-semibold text-gray-900">
            {call.carrier_name ?? "Unknown"}
          </div>
          <div className="font-mono text-[11px] text-gray-400">
            {call.mc_number ?? "\u2014"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pb-4 space-y-4">
        {/* FMCSA badge */}
        <div className="rounded-lg border-l-[3px] border-emerald-400 bg-emerald-50 px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            FMCSA Verified
          </div>
          <div className="text-[11px] text-emerald-600">
            Authorized &middot; Insurance Active
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["Lane", formatLane(call.lane_origin, call.lane_destination)],
              ["Equipment", call.equipment_type],
              ["Outcome", call.outcome],
              ["Duration", formatDuration(call.duration_seconds)],
            ] as const
          ).map(([label, value], i) => (
            <div key={i}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </div>
              <div className="mt-0.5">
                {label === "Outcome" ? (
                  <OutcomeBadge outcome={call.outcome} />
                ) : label === "Equipment" && value ? (
                  <EquipmentBadge type={value} />
                ) : (
                  <div className="text-[13px] font-semibold text-gray-900">
                    {value || "\u2014"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Sentiment
          </div>
          <SentimentBadge sentiment={call.sentiment} />
        </div>

        {/* Negotiation Timeline */}
        <div>
          <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Negotiation Timeline
          </div>
          <div className="flex flex-col gap-1.5 border-l-2 border-gray-100 pl-3">
            {buildTimeline(call).map((step, i, arr) => (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-[17px] top-[5px] h-[7px] w-[7px] rounded-full ${
                    i === arr.length - 1 ? "bg-indigo-500" : "bg-gray-200"
                  }`}
                />
                <div className="pl-1">
                  <div className="text-[11px] font-semibold text-gray-700">
                    {step.label}
                  </div>
                  <div className="text-[10px] text-gray-400">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate summary */}
        {(hasInitial || hasFinal) && (
          <div className="flex items-end gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
            {hasInitial && (
              <div>
                <div className="text-[10px] text-gray-400">Initial</div>
                <div className="text-sm font-bold tabular-nums text-gray-900">
                  {formatCurrency(call.initial_rate!)}
                </div>
              </div>
            )}
            {hasFinal && hasInitial && (
              <span className="mb-0.5 text-xs text-gray-300">&rarr;</span>
            )}
            {hasFinal && (
              <div>
                <div className="text-[10px] text-gray-400">Final</div>
                <div className="text-sm font-bold tabular-nums text-gray-900">
                  {formatCurrency(call.final_rate!)}
                </div>
              </div>
            )}
            {rateDiff && (
              <div
                className={`mb-0.5 ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  Number(rateDiff) <= 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {Number(rateDiff) >= 0 ? "+" : ""}
                {rateDiff}%
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <Button
            asChild
            variant="default"
            size="sm"
            className="group w-full justify-between text-white bg-gray-800 hover:bg-gray-800 font-heading font-semibold"
          >
            <Link href={`/calls/${call.call_id}`}>
              View Detail
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function buildTimeline(call: CallSummary) {
  const steps: { label: string; detail: string }[] = [];

  steps.push({
    label: "Load pitched",
    detail: call.equipment_type
      ? `${call.equipment_type.replace("_", " ")} \u00B7 ${formatLane(call.lane_origin, call.lane_destination)}`
      : formatLane(call.lane_origin, call.lane_destination),
  });

  if (call.initial_rate != null && call.initial_rate > 0) {
    steps.push({
      label: "Initial offer",
      detail: `${formatCurrency(call.initial_rate)} (loadboard rate)`,
    });
  }

  if (call.negotiation_rounds > 0) {
    steps.push({
      label:
        call.negotiation_rounds === 1
          ? "Counter offer"
          : `${call.negotiation_rounds} rounds`,
      detail: "Carrier negotiated rate",
    });
  }

  const outcomeMap: Record<string, string> = {
    booked: "Booked",
    negotiation_failed: "Negotiation failed",
    no_loads_available: "No loads available",
    invalid_carrier: "Invalid carrier",
    carrier_thinking: "Carrier considering",
    transferred_to_ops: "Transferred to ops",
    dropped_call: "Call dropped",
  };

  steps.push({
    label: outcomeMap[call.outcome] ?? call.outcome,
    detail: call.final_rate != null && call.final_rate > 0
      ? `Final rate: ${formatCurrency(call.final_rate)}`
      : "Call ended",
  });

  return steps;
}
