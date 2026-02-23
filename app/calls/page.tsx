"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CallFilters } from "@/components/calls/call-filters";
import { CallsTable } from "@/components/calls/calls-table";
import { useCalls } from "@/lib/swr";
import { TableSkeleton } from "@/components/shared/skeletons";

export default function CallsPage() {
  const [filters, setFilters] = useState<{
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }>({});
  const [page, setPage] = useState(1);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Calls</h1>
      <CallFilters onFilterChange={handleFilterChange} />
      {error && !data ? (
        <Card className="shadow-sm">
          <div className="p-6 text-sm text-red-600">
            Failed to load calls.
          </div>
        </Card>
      ) : isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : data ? (
        <Card className="shadow-sm">
          <CallsTable calls={data.items} />
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
      ) : null}
    </div>
  );
}
