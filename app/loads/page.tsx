"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { LoadFilters } from "@/components/loads/load-filters";
import { LoadsTable } from "@/components/loads/loads-table";
import { LoadsCardView } from "@/components/loads/loads-card";
import { useLoads } from "@/lib/swr";
import { TableSkeleton } from "@/components/shared/skeletons";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last 30 days" },
  { value: "all_time", label: "All time" },
] as const;

export default function LoadsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState("all_time");
  const [view, setView] = useState<"table" | "card">("table");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState<{
    origin?: string;
    equipment_type?: string;
    destination?: string;
  }>({});

  const { data, error, isLoading } = useLoads({
    ...filters,
    page,
    page_size: pageSize,
    period,
    sort_by: "urgency,pickup_datetime",
    sort_order: "desc,asc",
  });

  const allLoads = data?.loads ?? [];

  // KPI stats — prefer backend, fallback to client-side
  const totalLoads = data?.kpi_total_loads ?? data?.total ?? allLoads.length;
  const criticalCount =
    data?.kpi_critical_count ??
    allLoads.filter((l) => l.urgency === "critical").length;
  const avgRatePerMile =
    data?.kpi_avg_rate_per_mile ??
    (allLoads.length
      ? allLoads.reduce(
          (s, l) => s + (l.miles > 0 ? l.loadboard_rate / l.miles : 0),
          0,
        ) / allLoads.length
      : 0);

  const handleSelect = (load: { load_id: string }) => {
    router.push(`/loads/${load.load_id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Load Board</h1>
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
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "card" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>
      {/* KPI strip */}
      {allLoads.length > 0 && (
        <div
          className={`grid gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200 ${criticalCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Available Loads
            </div>
            <div className="mt-0.5 font-heading text-lg font-semibold tracking-wide text-gray-900">
              {totalLoads}
            </div>
          </div>
          {criticalCount > 0 && (
            <div className="bg-white px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Critical Priority
              </div>
              <div className="mt-0.5 font-heading text-lg font-semibold tracking-wide text-rose-600">
                {criticalCount}
              </div>
            </div>
          )}
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Avg Rate/Mile
            </div>
            <div className="mt-0.5 font-heading text-lg font-semibold tracking-wide text-gray-900">
              ${avgRatePerMile.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <LoadFilters
        onFilterChange={(f) => {
          setFilters((prev) => ({ ...prev, ...f }));
          setPage(1);
        }}
      />

      {error && !data ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load loads.
        </div>
      ) : isLoading && !data ? (
        <TableSkeleton rows={8} />
      ) : data ? (
        <>
          {allLoads.length === 0 ? (
            <Card className="">
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                <p className="text-sm">No loads found</p>
              </div>
            </Card>
          ) : view === "table" ? (
            <Card className="overflow-hidden">
              <LoadsTable
                loads={allLoads}
                exactCount={allLoads.length}
                onSelect={handleSelect}
              />
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">
                  {data.total} total loads
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
          ) : (
            <>
              <LoadsCardView
                loads={allLoads}
                exactCount={allLoads.length}
                onSelect={handleSelect}
              />
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm text-gray-500">
                  {data.total} total loads
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
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
