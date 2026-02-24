"use client";

import { CallDetail } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CallSidebarProps {
  call: CallDetail;
}

export function CallSidebar({ call }: CallSidebarProps) {
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
    <div className="space-y-0 divide-y divide-gray-100">
      {/* Rate Negotiation */}
      {(hasInitial || hasFinal) && (
      <div className="pb-5">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Rate Negotiation
        </div>
        <div className="flex items-end gap-3">
          {hasInitial && (
          <div>
            <div className="text-[10px] text-gray-400">Initial</div>
            <div className="text-lg font-bold tabular-nums text-gray-900">
              {formatCurrency(call.initial_rate!)}
            </div>
          </div>
          )}
          {hasFinal && hasInitial && (
            <>
              <div className="mb-1 text-gray-300">&rarr;</div>
              <div>
                <div className="text-[10px] text-gray-400">Final</div>
                <div className="text-lg font-bold tabular-nums text-gray-900">
                  {formatCurrency(call.final_rate!)}
                </div>
              </div>
              {rateDiff && (
                <div
                  className={`mb-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    Number(rateDiff) >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {Number(rateDiff) >= 0 ? "+" : ""}
                  {rateDiff}%
                </div>
              )}
            </>
          )}
          {hasFinal && !hasInitial && (
            <div>
              <div className="text-[10px] text-gray-400">Final</div>
              <div className="text-lg font-bold tabular-nums text-gray-900">
                {formatCurrency(call.final_rate!)}
              </div>
            </div>
          )}
        </div>
        {call.negotiation_rounds > 0 && (
          <div className="mt-2 text-[11px] text-gray-400">
            {call.negotiation_rounds} negotiation round
            {call.negotiation_rounds !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      )}

      {/* Negotiation Timeline */}
      <div className="py-5">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Timeline
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

      {/* Key Points */}
      {call.key_points && call.key_points.length > 0 && (
        <div className="py-5">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Key Points
          </div>
          <ul className="space-y-1.5 items-center">
            {call.key_points.map((point, i) => (
              <div
                key={i}
                className="flex gap-2 text-[12px] leading-relaxed text-gray-600"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                {point}
              </div>
            ))}
          </ul>
        </div>
      )}

      {/* AI Summary */}
      {call.summary && (
        <div className="pt-5">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            AI Summary
          </div>
          <p className="text-[12px] leading-relaxed text-gray-500">
            {call.summary}
          </p>
        </div>
      )}
    </div>
  );
}

function buildTimeline(call: CallDetail) {
  const steps: { label: string; detail: string }[] = [];

  steps.push({
    label: "Call started",
    detail: call.equipment_type
      ? `${call.equipment_type} · ${call.lane_origin ?? "?"} → ${call.lane_destination ?? "?"}`
      : new Date(call.created_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
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
