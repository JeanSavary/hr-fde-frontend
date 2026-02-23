"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { CallFilters } from "@/components/calls/call-filters";
import { CallsTable } from "@/components/calls/calls-table";
import { CallSidebar } from "@/components/calls/call-sidebar";
import { useCalls } from "@/lib/swr";
import { CallSummary } from "@/lib/types";
import { TableSkeleton } from "@/components/shared/skeletons";

export default function CallsPage() {
  const [filters, setFilters] = useState<{
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallSummary | null>(null);
  const pageSize = 20;

  const { data, error, isLoading } = useCalls({
    ...filters,
    page,
    page_size: pageSize,
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleExport = () => {
    if (!data) return;
    const headers = ["Call ID", "Carrier", "MC#", "Origin", "Destination", "Outcome", "Sentiment", "Duration", "Created"];
    const rows = data.calls.map((c) => [
      c.call_id, c.carrier_name ?? "", c.mc_number ?? "",
      c.lane_origin ?? "", c.lane_destination ?? "",
      c.outcome, c.sentiment,
      String(c.duration_seconds ?? ""), c.created_at,
    ]);
    downloadCSV("calls.csv", headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calls</h1>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>
      <CallFilters onFilterChange={handleFilterChange} />
      {error && !data ? (
        <Card className="shadow-sm">
          <div className="p-6 text-sm text-red-600">Failed to load calls.</div>
        </Card>
      ) : isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : data ? (
        <div className={`grid gap-4 ${selectedCall ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
          <Card className="shadow-sm">
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
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {Math.ceil((data.total || 1) / pageSize)}
                </span>
                <Button variant="outline" size="sm" disabled={page * pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          {selectedCall && (
            <CallSidebar call={selectedCall} onClose={() => setSelectedCall(null)} />
          )}
        </div>
      ) : null}
    </div>
  );
}
