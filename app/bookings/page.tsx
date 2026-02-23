"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { BookingsSummary } from "@/components/bookings/bookings-summary";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingSidebar } from "@/components/bookings/booking-sidebar";
import {
  BookingFilters,
  type BookingFilters as BookingFiltersType,
} from "@/components/bookings/booking-filters";
import { MarginDistribution } from "@/components/bookings/margin-distribution";
import { RevenueByEquipment } from "@/components/bookings/revenue-by-equipment";
import { useBookings } from "@/lib/swr";
import { downloadCSV } from "@/lib/csv";
import { BookedLoad, BookingsListResponse } from "@/lib/types";
import { TableSkeleton } from "@/components/shared/skeletons";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last 30 days" },
  { value: "all_time", label: "All time" },
] as const;

export default function BookingsPage() {
  const [period, setPeriod] = useState("today");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { data, error, isLoading } = useBookings({ page, page_size: pageSize, period });
  const [selected, setSelected] = useState<BookedLoad | null>(null);
  const [filters, setFilters] = useState<BookingFiltersType>({});

  const allBookings = data?.items ?? [];
  const bookings = useMemo(() => {
    return allBookings.filter((b) => {
      if (filters.equipment_type && b.equipment_type !== filters.equipment_type)
        return false;
      if (filters.sentiment && b.sentiment !== filters.sentiment) return false;
      if (
        filters.carrier &&
        !(b.carrier_name ?? "")
          .toLowerCase()
          .includes(filters.carrier.toLowerCase())
      )
        return false;
      return true;
    });
  }, [allBookings, filters]);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil((total || 1) / pageSize);

  const handleExport = () => {
    if (!bookings.length) return;
    const headers = [
      "Carrier",
      "MC#",
      "Lane",
      "Equipment",
      "Pickup",
      "Agreed Rate",
      "Margin",
      "Booked",
    ];
    const rows = bookings.map((b) => [
      b.carrier_name ?? "",
      b.mc_number,
      `${b.lane_origin ?? ""} → ${b.lane_destination ?? ""}`,
      b.equipment_type ?? "",
      b.agreed_pickup_datetime ?? "",
      String(b.agreed_rate),
      b.margin != null ? `${b.margin.toFixed(1)}%` : "",
      b.booked_at ?? b.created_at,
    ]);
    downloadCSV("bookings.csv", headers, rows);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!bookings.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      {error && !data ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load bookings.
        </div>
      ) : isLoading && !data ? (
        <TableSkeleton rows={5} />
      ) : data ? (
        <>
          <BookingsSummary bookings={bookings} response={data} />
          <BookingFilters
            onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
          />
          <div
            className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]"
            style={{ gridTemplateColumns: selected ? undefined : "1fr" }}
          >
            <Card className="overflow-hidden">
              <BookingsTable
                bookings={bookings}
                selectedId={selected?.id}
                onSelect={(b) => setSelected(selected?.id === b.id ? null : b)}
              />
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">
                  {total} total bookings
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * pageSize >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
