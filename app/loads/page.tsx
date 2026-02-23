"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { LoadFilters } from "@/components/loads/load-filters";
import { LoadsTable } from "@/components/loads/loads-table";
import { LoadsCardView } from "@/components/loads/loads-card";
import { useLoads } from "@/lib/swr";

export default function LoadsPage() {
  const [view, setView] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  const { data: loads, error, isLoading } = useLoads(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Loads</h1>
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
      {error && !loads ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load loads.</div>
      ) : isLoading && !loads ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : loads ? (
        view === "table" ? (
          <Card className="shadow-sm"><LoadsTable loads={loads} /></Card>
        ) : (
          <LoadsCardView loads={loads} />
        )
      ) : null}
    </div>
  );
}
