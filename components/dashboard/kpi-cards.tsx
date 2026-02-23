"use client";

import { Card } from "@/components/ui/card";
import {
  Phone,
  Target,
  DollarSign,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";
import { DashboardMetrics } from "@/lib/types";
import { formatDuration, formatCurrency, formatPercent } from "@/lib/utils";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const cards = [
    {
      label: "Total Calls",
      value: metrics.total_calls.toLocaleString(),
      icon: Phone,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Booking Rate",
      value: formatPercent(metrics.booking_rate_percent),
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.total_revenue),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Avg Duration",
      value: formatDuration(metrics.avg_duration_seconds),
      icon: Clock,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Unique Carriers",
      value: metrics.unique_carriers.toLocaleString(),
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Avg Rounds",
      value: metrics.avg_negotiation_rounds?.toFixed(1) ?? "\u2014",
      icon: MessageSquare,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="flex items-center gap-4 p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className={`rounded-lg p-2.5 ${card.bg}`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900">
              {card.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
