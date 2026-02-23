"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BookedLoad } from "@/lib/types";
import { SentimentBadge, EquipmentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime, formatLane, cn } from "@/lib/utils";

interface BookingsTableProps {
  bookings: BookedLoad[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const hasExtendedData = bookings.some((b) => b.lane_origin != null || b.loadboard_rate != null);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Carrier</TableHead>
          {hasExtendedData && <TableHead className="text-xs">Lane</TableHead>}
          {hasExtendedData && <TableHead className="text-xs">Equip.</TableHead>}
          {hasExtendedData && <TableHead className="text-xs text-right">Loadboard</TableHead>}
          <TableHead className="text-xs text-right">Agreed</TableHead>
          {hasExtendedData && <TableHead className="text-xs text-right">Margin</TableHead>}
          {hasExtendedData && <TableHead className="text-xs text-center">Rounds</TableHead>}
          {hasExtendedData && <TableHead className="text-xs">Sentiment</TableHead>}
          <TableHead className="text-xs text-right">Booked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id} className="border-gray-100">
            <TableCell className="font-mono text-xs text-indigo-600 font-medium">
              {b.load_id}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {b.carrier_name ?? "Unknown"}
            </TableCell>
            {hasExtendedData && (
              <TableCell className="text-sm text-gray-500">
                {formatLane(b.lane_origin ?? null, b.lane_destination ?? null)}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell>
                {b.equipment_type ? <EquipmentBadge type={b.equipment_type} /> : <span className="text-xs text-gray-400">&mdash;</span>}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell className="text-right font-mono text-sm text-gray-400">
                {b.loadboard_rate != null ? formatCurrency(b.loadboard_rate) : "\u2014"}
              </TableCell>
            )}
            <TableCell className="text-right font-mono text-sm font-semibold">
              {formatCurrency(b.agreed_rate)}
            </TableCell>
            {hasExtendedData && (
              <TableCell className="text-right">
                {b.margin != null ? (
                  <span className={cn(
                    "font-mono text-sm font-semibold",
                    b.margin >= 15 ? "text-emerald-500" : b.margin >= 10 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {b.margin.toFixed(1)}%
                  </span>
                ) : <span className="text-xs text-gray-400">&mdash;</span>}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell className="text-center font-mono text-sm">
                {b.negotiation_rounds ?? "\u2014"}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell>
                {b.sentiment ? <SentimentBadge sentiment={b.sentiment} /> : <span className="text-xs text-gray-400">&mdash;</span>}
              </TableCell>
            )}
            <TableCell className="text-right text-sm text-gray-400">
              {formatDateTime(b.booked_at ?? b.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
