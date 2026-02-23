"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Load } from "@/lib/types";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { UrgencyBadge, EquipmentBadge } from "@/components/shared/status-badge";

interface LoadsTableProps {
  loads: Load[];
  exactCount?: number;
  onSelect?: (load: Load) => void;
}

export function LoadsTable({ loads, exactCount, onSelect }: LoadsTableProps) {
  const sorted = [...loads].sort((a, b) => {
    const urgOrder: Record<string, number> = { critical: 0, high: 1, normal: 2 };
    return (urgOrder[a.urgency ?? "normal"] ?? 2) - (urgOrder[b.urgency ?? "normal"] ?? 2);
  });

  const hasUrgency = loads.some((l) => l.urgency != null);
  const hasPitchCount = loads.some((l) => l.pitch_count != null);
  const hasDaysListed = loads.some((l) => l.days_listed != null);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          {hasUrgency && <TableHead className="text-xs">Priority</TableHead>}
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equip.</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs text-right">$/mi</TableHead>
          <TableHead className="text-xs">Pickup</TableHead>
          <TableHead className="text-xs text-right">Weight</TableHead>
          {hasPitchCount && <TableHead className="text-xs text-right">Pitched</TableHead>}
          {hasDaysListed && <TableHead className="text-xs text-right">Listed</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((load, index) => (
          <TableRow
            key={load.load_id}
            className={cn(
              "cursor-pointer border-gray-100 transition-colors hover:bg-gray-50",
              load.urgency === "critical" && "border-rose-100 bg-rose-50/30",
              exactCount !== undefined && index === exactCount && "border-t-2 border-t-gray-200"
            )}
            onClick={() => onSelect?.(load)}
          >
            {hasUrgency && (
              <TableCell>
                <UrgencyBadge urgency={load.urgency ?? "normal"} />
              </TableCell>
            )}
            <TableCell className="font-mono text-xs font-semibold text-indigo-600">
              {load.load_id}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {load.origin.split(",")[0]} &rarr; {load.destination.split(",")[0]}
            </TableCell>
            <TableCell>
              <EquipmentBadge type={load.equipment_type} />
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-semibold">
              {formatCurrency(load.loadboard_rate)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm text-gray-400">
              {load.miles > 0 ? formatCurrency(load.loadboard_rate / load.miles) : "—"}
            </TableCell>
            <TableCell className="text-xs text-gray-500">
              {formatDateTime(load.pickup_datetime)}
            </TableCell>
            <TableCell className="text-right text-xs text-gray-400">
              {load.weight.toLocaleString()} lbs
            </TableCell>
            {hasPitchCount && (
              <TableCell className={cn(
                "text-right font-mono text-sm font-semibold",
                (load.pitch_count ?? 0) > 8 ? "text-rose-500" : (load.pitch_count ?? 0) > 4 ? "text-amber-500" : "text-gray-400"
              )}>
                {load.pitch_count ?? "—"}
              </TableCell>
            )}
            {hasDaysListed && (
              <TableCell className="text-right text-sm text-gray-400">
                {load.days_listed != null ? `${load.days_listed}d` : "—"}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
