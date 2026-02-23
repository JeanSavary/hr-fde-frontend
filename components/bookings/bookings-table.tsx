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
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface BookingsTableProps {
  bookings: BookedLoad[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Carrier</TableHead>
          <TableHead className="text-xs">MC#</TableHead>
          <TableHead className="text-xs text-right">Agreed Rate</TableHead>
          <TableHead className="text-xs">Pickup</TableHead>
          <TableHead className="text-xs text-right">Booked At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id} className="border-gray-100">
            <TableCell className="font-mono text-xs">
              {booking.load_id}
            </TableCell>
            <TableCell className="text-sm">
              {booking.carrier_name ?? "Unknown"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {booking.mc_number}
            </TableCell>
            <TableCell className="text-right text-sm font-medium text-emerald-600">
              {formatCurrency(booking.agreed_rate)}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatDateTime(booking.agreed_pickup_datetime)}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {formatDateTime(booking.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
