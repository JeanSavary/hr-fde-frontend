"use client";

import { Card } from "@/components/ui/card";
import { BookingsSummary } from "@/components/bookings/bookings-summary";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { useBookings } from "@/lib/swr";
import { SummaryCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function BookingsPage() {
  const { data: bookings, error, isLoading } = useBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
      {error && !bookings ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load bookings.
        </div>
      ) : isLoading && !bookings ? (
        <>
          <SummaryCardsSkeleton count={4} />
          <TableSkeleton rows={5} />
        </>
      ) : bookings ? (
        <>
          <BookingsSummary bookings={bookings} />
          <Card className="shadow-sm">
            <BookingsTable bookings={bookings} />
          </Card>
        </>
      ) : null}
    </div>
  );
}
