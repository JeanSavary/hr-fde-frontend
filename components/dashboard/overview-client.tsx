"use client";

import { useState } from "react";
import { DashboardMetrics } from "@/lib/types";
import { useDashboardMetrics } from "@/lib/swr";
import { KpiCards } from "./kpi-cards";
import { ConversionFunnel } from "./conversion-funnel";
import { LiveCallFeed } from "./live-call-feed";
import { OutcomeChart } from "./outcome-chart";
import { SentimentChart } from "./sentiment-chart";
import { RateIntelligence } from "./rate-intelligence";
import {
  KpiCardsSkeleton,
  ChartsSkeleton,
} from "@/components/shared/skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last 30 days" },
  { value: "all_time", label: "All time" },
] as const;

interface OverviewClientProps {
  initialMetrics: DashboardMetrics | null;
}

export function OverviewClient({ initialMetrics }: OverviewClientProps) {
  const [period, setPeriod] = useState("today");
  const { data: metrics, error } = useDashboardMetrics(period);
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
      <div className="space-y-5">
        <KpiCardsSkeleton />
        <ChartsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
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
      </div>
      <KpiCards metrics={displayMetrics} />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_300px]">
        <ConversionFunnel metrics={displayMetrics} />
        <LiveCallFeed calls={displayMetrics.recent_calls ?? []} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <OutcomeChart data={displayMetrics.calls_by_outcome ?? {}} />
        <SentimentChart data={displayMetrics.sentiment_distribution ?? {}} />
        <RateIntelligence metrics={displayMetrics} />
      </div>
    </div>
  );
}
