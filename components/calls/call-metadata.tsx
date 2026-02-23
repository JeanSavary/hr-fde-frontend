"use client";

import { Card } from "@/components/ui/card";
import { CallDetail } from "@/lib/types";
import { OutcomeBadge, SentimentBadge } from "@/components/shared/status-badge";
import { formatDuration, formatCurrency, formatDateTime, formatLane } from "@/lib/utils";

interface CallMetadataProps {
  call: CallDetail;
}

export function CallMetadata({ call }: CallMetadataProps) {
  const rateDiff =
    call.initial_rate && call.final_rate
      ? (((call.final_rate - call.initial_rate) / call.initial_rate) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">Call Info</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Carrier</dt><dd className="font-medium">{call.carrier_name ?? "Unknown"}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">MC Number</dt><dd className="font-mono text-xs">{call.mc_number ?? "\u2014"}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{call.carrier_phone ?? "\u2014"}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Lane</dt><dd>{formatLane(call.lane_origin, call.lane_destination)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Equipment</dt><dd>{call.equipment_type ?? "\u2014"}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Duration</dt><dd>{formatDuration(call.duration_seconds)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Outcome</dt><dd><OutcomeBadge outcome={call.outcome} /></dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Sentiment</dt><dd><SentimentBadge sentiment={call.sentiment} /></dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Created</dt><dd>{formatDateTime(call.created_at)}</dd></div>
        </dl>
      </Card>

      <Card className="p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">Negotiation</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Rounds</dt><dd className="font-medium">{call.negotiation_rounds}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Initial Rate</dt><dd>{formatCurrency(call.initial_rate)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Final Rate</dt><dd className="font-medium">{formatCurrency(call.final_rate)}</dd></div>
          {rateDiff && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Rate Change</dt>
              <dd className={Number(rateDiff) >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {Number(rateDiff) >= 0 ? "+" : ""}{rateDiff}%
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {call.key_points && call.key_points.length > 0 && (
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Key Points</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            {call.key_points.map((point, i) => (
              <li key={i} className="flex gap-2"><span className="text-indigo-400">&bull;</span>{point}</li>
            ))}
          </ul>
        </Card>
      )}

      {call.summary && (
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">AI Summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{call.summary}</p>
        </Card>
      )}
    </div>
  );
}
