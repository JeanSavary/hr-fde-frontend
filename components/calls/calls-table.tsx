"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import { OutcomeBadge, SentimentBadge } from "@/components/shared/status-badge";
import {
  formatDuration,
  formatLane,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface CallsTableProps {
  calls: CallSummary[];
}

export function CallsTable({ calls }: CallsTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Call ID</TableHead>
          <TableHead className="text-xs">Carrier</TableHead>
          <TableHead className="text-xs">MC#</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equipment</TableHead>
          <TableHead className="text-xs">Outcome</TableHead>
          <TableHead className="text-xs">Sentiment</TableHead>
          <TableHead className="text-xs text-right">Duration</TableHead>
          <TableHead className="text-xs text-right">Rounds</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs text-right">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow
            key={call.id}
            className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50"
            onClick={() => router.push(`/calls/${call.call_id}`)}
          >
            <TableCell className="font-mono text-xs text-gray-500">
              {call.call_id.slice(0, 8)}
            </TableCell>
            <TableCell className="text-sm">
              {call.carrier_name ?? "Unknown"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {call.mc_number ?? "\u2014"}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatLane(call.lane_origin, call.lane_destination)}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {call.equipment_type
                ? (EQUIPMENT_CONFIG[
                    call.equipment_type as keyof typeof EQUIPMENT_CONFIG
                  ]?.label ?? call.equipment_type)
                : "\u2014"}
            </TableCell>
            <TableCell>
              <OutcomeBadge outcome={call.outcome} />
            </TableCell>
            <TableCell>
              <SentimentBadge sentiment={call.sentiment} />
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {formatDuration(call.duration_seconds)}
            </TableCell>
            <TableCell className="text-right text-sm">
              {call.negotiation_rounds}
            </TableCell>
            <TableCell className="text-right text-sm">
              {call.initial_rate && call.final_rate
                ? `${formatCurrency(call.initial_rate)} \u2192 ${formatCurrency(call.final_rate)}`
                : "\u2014"}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {formatDateTime(call.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
