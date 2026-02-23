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
import { downloadCSV } from "@/lib/csv";
import { CallFilters } from "@/components/calls/call-filters";
import { CallsTable } from "@/components/calls/calls-table";
import { CallSidebar } from "@/components/calls/call-sidebar";
import { useCalls } from "@/lib/swr";
import { CallSummary } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/skeletons";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last 30 days" },
  { value: "all_time", label: "All time" },
] as const;

export default function CallsPage() {
  const [period, setPeriod] = useState("today");
  const [filters, setFilters] = useState<{
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallSummary | null>(null);
  const pageSize = 10;

  const { data, error, isLoading } = useCalls({
    ...filters,
    page,
    page_size: pageSize,
    period,
  });

  const calls = data?.calls ?? [];
  const kpis = useMemo(() => {
    // Prefer backend KPIs when available
    if (data?.kpi_total_calls != null) {
      return {
        totalCalls: data.kpi_total_calls,
        bookingRate: data.kpi_booking_rate ?? 0,
        avgDuration: data.kpi_avg_duration ?? 0,
        totalDuration: data.kpi_total_duration ?? 0,
      };
    }
    // Fallback: compute from current page data
    if (!calls.length) return null;
    const booked = calls.filter((c) => c.outcome === "booked").length;
    const bookingRate = (booked / calls.length) * 100;
    const withDuration = calls.filter((c) => c.duration_seconds != null);
    const avgDuration = withDuration.length
      ? withDuration.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) /
        withDuration.length
      : 0;
    const totalDuration = calls.reduce(
      (s, c) => s + (c.duration_seconds ?? 0),
      0,
    );
    return { totalCalls: data?.total ?? calls.length, bookingRate, avgDuration, totalDuration };
  }, [calls, data]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleExport = () => {
    if (!data) return;
    const headers = [
      "Call ID",
      "Carrier",
      "MC#",
      "Origin",
      "Destination",
      "Outcome",
      "Sentiment",
      "Duration",
      "Created",
    ];
    const rows = data.calls.map((c) => [
      c.call_id,
      c.carrier_name ?? "",
      c.mc_number ?? "",
      c.lane_origin ?? "",
      c.lane_destination ?? "",
      c.outcome,
      c.sentiment,
      String(c.duration_seconds ?? ""),
      c.created_at,
    ]);
    downloadCSV("calls.csv", headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calls</h1>
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
            disabled={!data}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      {data && kpis && (
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200">
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Total Calls
            </div>
            <div className="mt-0.5 font-heading text-lg font-semibold tracking-wide text-gray-900">
              {kpis.totalCalls}
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Booking Rate
            </div>
            <div
              className={`mt-0.5 font-heading text-lg font-semibold tracking-wide ${kpis.bookingRate >= 30 ? "text-emerald-600" : kpis.bookingRate >= 15 ? "text-amber-600" : "text-rose-600"}`}
            >
              {kpis.bookingRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Avg Duration
            </div>
            <div className="mt-0.5 font-heading text-lg font-semibold tracking-wide text-gray-900">
              {formatDuration(Math.round(kpis.avgDuration))}
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Total Duration
            </div>
            <div className="mt-0.5 font-heading text-lg font-semibold tracking-wide text-gray-900">
              {formatDuration(Math.round(kpis.totalDuration))}
            </div>
          </div>
        </div>
      )}
      <CallFilters onFilterChange={handleFilterChange} />
      {error && !data ? (
        <Card className="">
          <div className="p-6 text-sm text-red-600">Failed to load calls.</div>
        </Card>
      ) : isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : data ? (
        <div
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]"
          style={{ gridTemplateColumns: selectedCall ? undefined : "1fr" }}
        >
          <Card className="min-w-0 overflow-hidden">
            <CallsTable
              calls={data.calls}
              selectedId={selectedCall?.id}
              onSelect={setSelectedCall}
            />
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-500">
                {data.total} total calls
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
                  Page {page} of {Math.ceil((data.total || 1) / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= data.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          {selectedCall && (
            <CallSidebar
              call={selectedCall}
              onClose={() => setSelectedCall(null)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
