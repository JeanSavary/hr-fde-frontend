"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import { OutcomeBadge, SentimentBadge, EquipmentBadge } from "@/components/shared/status-badge";
import { StatusDot } from "@/components/shared/status-dot";
import {
  formatDuration, formatLane, formatCurrency, formatRelativeTime, cn,
} from "@/lib/utils";

interface CallsTableProps {
  calls: CallSummary[];
  selectedId?: string | null;
  onSelect?: (call: CallSummary) => void;
}

export function CallsTable({ calls, selectedId, onSelect }: CallsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="w-8 text-xs" />
          <TableHead className="text-xs">Carrier</TableHead>
          <TableHead className="text-xs">MC#</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equip.</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs">Sentiment</TableHead>
          <TableHead className="text-xs text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow
            key={call.id}
            className={cn(
              "cursor-pointer border-gray-100 transition-colors hover:bg-gray-50",
              selectedId === call.id && "bg-indigo-50/50"
            )}
            onClick={() => onSelect?.(call)}
          >
            <TableCell className="px-3">
              <StatusDot status={mapOutcomeToStatus(call.outcome)} />
            </TableCell>
            <TableCell className="text-sm font-medium">
              {call.carrier_name ?? "Unknown"}
            </TableCell>
            <TableCell className="font-mono text-xs text-gray-400">
              {call.mc_number ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatLane(call.lane_origin, call.lane_destination)}
            </TableCell>
            <TableCell>
              {call.equipment_type ? <EquipmentBadge type={call.equipment_type} /> : <span className="text-xs text-gray-400">—</span>}
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-semibold">
              {call.final_rate ? formatCurrency(call.final_rate) : "—"}
            </TableCell>
            <TableCell>
              <SentimentBadge sentiment={call.sentiment} />
            </TableCell>
            <TableCell className="text-right text-xs text-gray-400">
              {formatRelativeTime(call.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
