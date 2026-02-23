"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CallDetail } from "@/lib/types";
import { useCallDetail } from "@/lib/swr";
import { OutcomeBadge, SentimentBadge, EquipmentBadge } from "@/components/shared/status-badge";
import { TranscriptViewer } from "./transcript-viewer";
import { CallSidebar } from "./call-detail-sidebar";
import { TableSkeleton } from "@/components/shared/skeletons";
import { formatDuration, formatDateTime, formatLane } from "@/lib/utils";

interface CallDetailClientProps {
  callId: string;
  initialCall: CallDetail | null;
}

export function CallDetailClient({ callId, initialCall }: CallDetailClientProps) {
  const { data: call, error } = useCallDetail(callId);
  const displayCall = call ?? initialCall;

  if (error && !displayCall) {
    return (
      <div className="space-y-4">
        <Link href="/calls" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Calls
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load call details.</div>
      </div>
    );
  }

  if (!displayCall) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-6">
        <Link href="/calls" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Calls
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {displayCall.carrier_name ?? "Unknown Carrier"}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              {displayCall.mc_number && (
                <span className="font-mono text-[11px] text-gray-400">MC-{displayCall.mc_number}</span>
              )}
              {displayCall.carrier_phone && (
                <span className="text-[11px] text-gray-400">{displayCall.carrier_phone}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OutcomeBadge outcome={displayCall.outcome} />
            <SentimentBadge sentiment={displayCall.sentiment} />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-4 gap-px rounded-lg border border-gray-200 bg-gray-200 overflow-hidden">
        {[
          { label: "Duration", value: formatDuration(displayCall.duration_seconds) },
          { label: "Lane", value: formatLane(displayCall.lane_origin, displayCall.lane_destination) },
          { label: "Equipment", value: displayCall.equipment_type, isBadge: true },
          { label: "Date", value: formatDateTime(displayCall.created_at) },
        ].map((s) => (
          <div key={s.label} className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</div>
            <div className="mt-0.5 text-[13px] font-semibold text-gray-900">
              {s.isBadge && s.value ? <EquipmentBadge type={s.value} /> : (s.value || "\u2014")}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Transcript + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TranscriptViewer transcript={displayCall.transcript} />
        </div>
        <div className="lg:col-span-1">
          <CallSidebar call={displayCall} />
        </div>
      </div>
    </div>
  );
}
