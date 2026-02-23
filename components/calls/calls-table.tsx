"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import {
  OutcomeBadge,
  SentimentBadge,
  EquipmentBadge,
} from "@/components/shared/status-badge";
import { StatusDot } from "@/components/shared/status-dot";
import {
  formatDuration,
  formatLane,
  formatCurrency,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import { CALL_STATUS_COLORS } from "@/lib/constants";

interface CallsTableProps {
  calls: CallSummary[];
  selectedId?: string | null;
  onSelect?: (call: CallSummary) => void;
}

const STATUS_LEGEND = [
  { label: "Booked", color: CALL_STATUS_COLORS.booked },
  { label: "Live", color: CALL_STATUS_COLORS.live },
  { label: "Transferred", color: CALL_STATUS_COLORS.transferred },
  { label: "Declined", color: CALL_STATUS_COLORS.declined },
  { label: "No match", color: CALL_STATUS_COLORS.no_match },
];

export function CallsTable({ calls, selectedId, onSelect }: CallsTableProps) {
  return (
    <div>
      <div className="flex items-center justify-end gap-3 px-5 pb-4">
        <div className="text-[12px] text-gray-400 font-semibold">
          Status Legend:
        </div>
        {STATUS_LEGEND.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[12px] text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="w-8 pl-6 text-xs" />
            <TableHead className="text-left text-xs font-bold">
              Carrier
            </TableHead>
            <TableHead className="text-xs font-bold">MC#</TableHead>
            <TableHead className="text-xs font-bold">Lane</TableHead>
            <TableHead className="text-xs font-bold">Equip.</TableHead>
            <TableHead className="text-xs font-bold text-right">Rate</TableHead>
            <TableHead className="text-xs font-bold">Sentiment</TableHead>
            <TableHead className="pr-6 text-xs font-bold text-right">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow
              key={call.id}
              className={cn(
                "cursor-pointer border-gray-100 transition-colors hover:bg-gray-50",
                selectedId === call.id && "bg-indigo-50/50",
              )}
              onClick={() => onSelect?.(call)}
            >
              <TableCell className="pl-6 pr-3">
                <StatusDot status={mapOutcomeToStatus(call.outcome)} />
              </TableCell>
              <TableCell className="text-sm font-medium">
                {call.carrier_name ?? "Unknown"}
              </TableCell>
              <TableCell className="font-mono text-xs text-gray-500">
                {call.mc_number ?? (
                  <span className="text-xs font-medium text-gray-500">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatLane(call.lane_origin, call.lane_destination)}
              </TableCell>
              <TableCell>
                {call.equipment_type ? (
                  <EquipmentBadge type={call.equipment_type} />
                ) : (
                  <span className="text-xs font-medium text-gray-500">—</span>
                )}
              </TableCell>
              <TableCell className="text-right font-heading text-sm font-semibold tracking-wide">
                {call.final_rate ? (
                  formatCurrency(call.final_rate)
                ) : (
                  <span className="text-xs font-medium text-gray-500">—</span>
                )}
              </TableCell>
              <TableCell>
                <SentimentBadge sentiment={call.sentiment} />
              </TableCell>
              <TableCell className="pr-6 text-right text-xs text-gray-400">
                {formatRelativeTime(call.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
