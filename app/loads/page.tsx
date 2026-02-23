"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Search } from "lucide-react";
import { LoadFilters } from "@/components/loads/load-filters";
import { LoadsTable } from "@/components/loads/loads-table";
import { LoadsCardView } from "@/components/loads/loads-card";
import { LoadDetail } from "@/components/loads/load-detail";
import { useLoads } from "@/lib/swr";
import { Load } from "@/lib/types";
import { TableSkeleton } from "@/components/shared/skeletons";

export default function LoadsPage() {
  const [view, setView] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<{
    origin?: string;
    equipment_type?: string;
    destination?: string;
  }>({});
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const { data, error, isLoading } = useLoads(filters);

  const hasOrigin = !!filters.origin?.trim();
  const allLoads = data ? [...data.loads, ...data.alternative_loads] : [];

  // KPI stats
  const criticalCount = allLoads.filter((l) => l.urgency === "critical").length;
  const avgRatePerMile = allLoads.length
    ? allLoads.reduce((s, l) => s + (l.miles > 0 ? l.loadboard_rate / l.miles : 0), 0) / allLoads.length
    : 0;

  if (selectedLoad) {
    return <LoadDetail load={selectedLoad} onBack={() => setSelectedLoad(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Load Board</h1>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setView("table")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={view === "card" ? "secondary" : "ghost"} size="sm" onClick={() => setView("card")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <LoadFilters onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))} />

      {!hasOrigin ? (
        <Card className="shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <Search className="h-10 w-10" />
            <p className="text-sm">Enter an origin city to search for available loads</p>
          </div>
        </Card>
      ) : error && !data ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load loads.</div>
      ) : isLoading && !data ? (
        <TableSkeleton rows={8} />
      ) : data ? (
        <>
          {/* KPI cards */}
          {allLoads.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              <Card className="p-5 shadow-sm">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Available Loads</div>
                <div className="font-mono text-2xl font-bold text-gray-900">{allLoads.length}</div>
              </Card>
              {criticalCount > 0 && (
                <Card className="border-rose-200 p-5 shadow-sm">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Critical Priority</div>
                  <div className="font-mono text-2xl font-bold text-gray-900">{criticalCount}</div>
                </Card>
              )}
              <Card className="p-5 shadow-sm">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Avg Rate/Mile</div>
                <div className="font-mono text-2xl font-bold text-gray-900">${avgRatePerMile.toFixed(2)}</div>
              </Card>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {data.origin_resolved && (
              <span>Searching near <span className="font-medium text-gray-700">{data.origin_resolved.label}</span> ({data.radius_miles} mi)</span>
            )}
            <span>{data.total_found} exact match{data.total_found !== 1 ? "es" : ""}</span>
            {data.total_alternatives > 0 && <span>+ {data.total_alternatives} alternatives</span>}
          </div>

          {allLoads.length === 0 ? (
            <Card className="shadow-sm">
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                <p className="text-sm">No loads found for this search</p>
              </div>
            </Card>
          ) : view === "table" ? (
            <Card className="overflow-hidden shadow-sm">
              <LoadsTable loads={allLoads} exactCount={data.total_found} onSelect={setSelectedLoad} />
            </Card>
          ) : (
            <LoadsCardView loads={allLoads} exactCount={data.total_found} onSelect={setSelectedLoad} />
          )}
        </>
      ) : null}
    </div>
  );
}
