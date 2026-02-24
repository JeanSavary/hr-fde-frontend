"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookedLoad } from "@/lib/types";
import { EquipmentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime, formatLane, cn } from "@/lib/utils";

interface BookingsTableProps {
  bookings: BookedLoad[];
  selectedId?: string | null;
  onSelect?: (booking: BookedLoad) => void;
}

export function BookingsTable({
  bookings,
  selectedId,
  onSelect,
}: BookingsTableProps) {
  const hasExtendedData = bookings.some(
    (b) => b.lane_origin != null || b.loadboard_rate != null,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="pl-6 text-xs font-semibold">Carrier</TableHead>
          <TableHead className="text-xs font-semibold">MC#</TableHead>
          {hasExtendedData && (
            <TableHead className="text-xs font-semibold">Lane</TableHead>
          )}
          {hasExtendedData && (
            <TableHead className="text-xs font-semibold">Equip.</TableHead>
          )}
          <TableHead className="text-xs font-semibold">Pickup</TableHead>
          <TableHead className="text-xs font-semibold text-right">
            Agreed
          </TableHead>
          {hasExtendedData && (
            <TableHead className="text-xs font-semibold text-right">
              Margin
            </TableHead>
          )}
          <TableHead className="pr-6 text-xs font-semibold text-right">
            Booked
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow
            key={b.id}
            className={cn(
              "border-gray-100 transition-colors",
              onSelect && "cursor-pointer hover:bg-gray-50",
              selectedId === b.id && "bg-indigo-50/50",
            )}
            onClick={() => onSelect?.(b)}
          >
            <TableCell className="pl-6 text-sm font-medium">
              {b.carrier_name ?? "Unknown"}
            </TableCell>
            <TableCell className="font-mono text-xs text-gray-500">
              {b.mc_number ?? "\u2014"}
            </TableCell>
            {hasExtendedData && (
              <TableCell className="text-sm text-gray-500">
                {formatLane(b.lane_origin ?? null, b.lane_destination ?? null)}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell>
                {b.equipment_type ? (
                  <EquipmentBadge type={b.equipment_type} />
                ) : (
                  <span className="text-xs text-gray-500">&mdash;</span>
                )}
              </TableCell>
            )}
            <TableCell className="text-sm text-gray-500">
              {b.agreed_pickup_datetime
                ? formatDateTime(b.agreed_pickup_datetime)
                : "\u2014"}
            </TableCell>
            <TableCell className="text-right font-heading text-sm font-semibold text-gray-800 tracking-wide">
              {formatCurrency(b.agreed_rate)}
            </TableCell>
            {hasExtendedData && (
              <TableCell className="text-right">
                {b.margin != null ? (
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold",
                      b.margin >= 15
                        ? "text-emerald-500"
                        : b.margin < 5
                          ? "text-rose-500"
                          : "text-indigo-500",
                    )}
                  >
                    {b.margin.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">&mdash;</span>
                )}
              </TableCell>
            )}
            <TableCell className="pr-6 text-right text-sm text-gray-500">
              {formatDateTime(b.booked_at ?? b.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
