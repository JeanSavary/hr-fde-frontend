"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    const urgOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      normal: 2,
    };
    const urgDiff =
      (urgOrder[a.urgency ?? "normal"] ?? 2) -
      (urgOrder[b.urgency ?? "normal"] ?? 2);
    if (urgDiff !== 0) return urgDiff;
    // Secondary sort: earliest pickup first
    const aTime = a.pickup_datetime ? new Date(a.pickup_datetime).getTime() : Infinity;
    const bTime = b.pickup_datetime ? new Date(b.pickup_datetime).getTime() : Infinity;
    return aTime - bTime;
  });

  const hasUrgency = loads.some((l) => l.urgency != null);
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          {hasUrgency && (
            <TableHead className="pl-6 text-xs font-semibold">
              Priority
            </TableHead>
          )}
          <TableHead className="text-xs font-semibold">Load ID</TableHead>
          <TableHead className="text-xs font-semibold">Lane</TableHead>
          <TableHead className="text-xs font-semibold">Equip.</TableHead>
          <TableHead className="text-xs font-semibold text-right">
            Rate
          </TableHead>
          <TableHead className="pr-6 text-xs font-semibold">Pickup</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((load, index) => (
          <TableRow
            key={load.load_id}
            className={cn(
              "cursor-pointer border-gray-100 transition-colors hover:bg-gray-50",
              load.urgency === "critical" && "border-rose-100 bg-rose-50/30",
              exactCount !== undefined &&
                index === exactCount &&
                "border-t-2 border-t-gray-200",
            )}
            onClick={() => onSelect?.(load)}
          >
            {hasUrgency && (
              <TableCell className="pl-6">
                <UrgencyBadge urgency={load.urgency ?? "normal"} />
              </TableCell>
            )}
            <TableCell className="font-mono text-xs font-normal text-gray-500">
              {load.load_id}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {load.origin.split(",")[0]} &rarr;{" "}
              {load.destination.split(",")[0]}
            </TableCell>
            <TableCell>
              <EquipmentBadge type={load.equipment_type} />
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-semibold text-gray-700">
              {formatCurrency(load.loadboard_rate)}
            </TableCell>
            <TableCell className="pr-6 text-xs text-gray-500">
              {formatDateTime(load.pickup_datetime)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
