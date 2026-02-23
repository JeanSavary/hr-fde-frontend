"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BookingsSummary } from "@/components/bookings/bookings-summary";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingSidebar } from "@/components/bookings/booking-sidebar";
import { MarginDistribution } from "@/components/bookings/margin-distribution";
import { RevenueByEquipment } from "@/components/bookings/revenue-by-equipment";
import { useBookings } from "@/lib/swr";
import { downloadCSV } from "@/lib/csv";
import { BookedLoad } from "@/lib/types";
import { SummaryCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function BookingsPage() {
  const { data: bookings, error, isLoading } = useBookings();
  const [selected, setSelected] = useState<BookedLoad | null>(null);

  const handleExport = () => {
    if (!bookings) return;
    const headers = ["Carrier", "MC#", "Lane", "Equipment", "Pickup", "Agreed Rate", "Margin", "Booked"];
    const rows = bookings.map((b) => [
      b.carrier_name ?? "", b.mc_number,
      `${b.lane_origin ?? ""} → ${b.lane_destination ?? ""}`,
      b.equipment_type ?? "", b.agreed_pickup_datetime ?? "",
      String(b.agreed_rate), b.margin != null ? `${b.margin.toFixed(1)}%` : "",
      b.booked_at ?? b.created_at,
    ]);
    downloadCSV("bookings.csv", headers, rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div />
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!bookings}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>
      {error && !bookings ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load bookings.</div>
      ) : isLoading && !bookings ? (
        <>
          <SummaryCardsSkeleton count={4} />
          <TableSkeleton rows={5} />
        </>
      ) : bookings ? (
        <>
          <BookingsSummary bookings={bookings} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]" style={{ gridTemplateColumns: selected ? undefined : "1fr" }}>
            <Card className="overflow-hidden shadow-sm">
              <div className="px-5 py-4 text-sm font-semibold text-gray-900">Today&apos;s Bookings</div>
              <BookingsTable
                bookings={bookings}
                selectedId={selected?.id}
                onSelect={(b) => setSelected(selected?.id === b.id ? null : b)}
              />
            </Card>
            {selected && (
              <BookingSidebar
                booking={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </div>
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <MarginDistribution bookings={bookings} />
            <RevenueByEquipment bookings={bookings} />
          </div>
        </>
      ) : null}
    </div>
  );
}
