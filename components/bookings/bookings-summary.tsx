"use client";

import { BookedLoad, BookingsListResponse } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface BookingsSummaryProps {
  bookings: BookedLoad[];
  response?: BookingsListResponse;
}

export function BookingsSummary({ bookings, response }: BookingsSummaryProps) {
  // Prefer backend KPIs, fall back to client-side computation
  const hasBackendKpis = response?.kpi_total_bookings != null;

  const totalBookings = hasBackendKpis
    ? response.kpi_total_bookings!
    : bookings.length;
  const totalRevenue = hasBackendKpis
    ? (response.kpi_total_revenue ?? 0)
    : bookings.reduce((s, b) => s + b.agreed_rate, 0);
  const avgMargin = hasBackendKpis
    ? (response.kpi_avg_margin ?? 0)
    : bookings.length
      ? bookings.reduce((s, b) => s + (b.margin ?? 0), 0) / bookings.length
      : 0;
  const totalSaved = bookings.reduce(
    (s, b) =>
      s +
      (b.loadboard_rate != null && b.loadboard_rate > 0
        ? b.loadboard_rate - b.agreed_rate
        : 0),
    0,
  );
  const hasMarginData = hasBackendKpis
    ? response.kpi_avg_margin != null
    : bookings.some((b) => b.margin != null);
  const hasSavingsData = bookings.some(
    (b) => b.loadboard_rate != null && b.loadboard_rate > 0,
  );

  const metrics = [
    { label: "Booked", value: totalBookings.toString() },
    {
      label: "Revenue",
      value:
        totalRevenue >= 1000
          ? `$${(totalRevenue / 1000).toFixed(1)}k`
          : formatCurrency(totalRevenue),
    },
    {
      label: "Avg Margin",
      value: hasMarginData ? `${avgMargin.toFixed(1)}%` : "\u2014",
      color: hasMarginData
        ? avgMargin <= 5
          ? "text-emerald-600"
          : "text-rose-600"
        : undefined,
    },
    {
      label: "Total Saved",
      value: hasSavingsData
        ? totalSaved >= 1000
          ? `$${(totalSaved / 1000).toFixed(1)}k`
          : formatCurrency(totalSaved)
        : "\u2014",
      color: hasSavingsData && totalSaved > 0 ? "text-emerald-600" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200">
      {metrics.map((m) => (
        <div key={m.label} className="bg-white px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {m.label}
          </div>
          <div
            className={cn(
              "mt-0.5 font-heading text-lg font-semibold tracking-wide",
              m.color ?? "text-gray-900",
            )}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}
