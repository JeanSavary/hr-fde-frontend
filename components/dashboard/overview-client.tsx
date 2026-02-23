"use client";

import { DashboardMetrics } from "@/lib/types";
import { useDashboardMetrics } from "@/lib/swr";
import { KpiCards } from "./kpi-cards";
import { OutcomeChart } from "./outcome-chart";
import { SentimentChart } from "./sentiment-chart";
import { EquipmentChart } from "./equipment-chart";
import { TopLanesChart } from "./top-lanes-chart";
import { RecentCallsTable } from "./recent-calls-table";
import { RecentOffersTable } from "./recent-offers-table";
import { KpiCardsSkeleton, ChartsSkeleton, TableSkeleton } from "@/components/shared/skeletons";

interface OverviewClientProps {
  initialMetrics: DashboardMetrics | null;
}

export function OverviewClient({ initialMetrics }: OverviewClientProps) {
  const { data: metrics, error } = useDashboardMetrics();
  const displayMetrics = metrics ?? initialMetrics;

  if (error && !displayMetrics) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load dashboard metrics. Check your API connection.
      </div>
    );
  }

  if (!displayMetrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <KpiCardsSkeleton />
        <ChartsSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TableSkeleton rows={5} />
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <KpiCards metrics={displayMetrics} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OutcomeChart data={displayMetrics.calls_by_outcome} />
        <SentimentChart data={displayMetrics.sentiment_distribution} />
        <EquipmentChart data={displayMetrics.equipment_demand} />
        <TopLanesChart data={displayMetrics.top_lanes} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentCallsTable calls={displayMetrics.recent_calls} />
        <RecentOffersTable offers={displayMetrics.recent_offers} />
      </div>
    </div>
  );
}
