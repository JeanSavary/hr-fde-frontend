"use client";

import {
  Phone,
  Package,
  DollarSign,
  Target,
  AlertTriangle,
} from "lucide-react";
import { DashboardMetrics } from "@/lib/types";
import { formatCurrency, formatPercent, formatDuration, cn } from "@/lib/utils";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const callsValue = metrics.calls_today || metrics.total_calls;
  const bookedValue =
    metrics.booked_today || metrics.calls_by_outcome?.booked || 0;
  const revenueValue = metrics.revenue_today || metrics.total_revenue;
  const conversionValue =
    metrics.conversion_rate || metrics.booking_rate_percent;
  const pendingValue = metrics.pending_transfer ?? 0;

  const cards = [
    {
      label: "Calls",
      value: callsValue.toLocaleString(),
      sub: metrics.avg_duration_seconds
        ? `avg ${formatDuration(metrics.avg_duration_seconds)}`
        : null,
      trend: metrics.calls_trend,
      icon: Phone,
    },
    {
      label: "Loads Booked",
      value: bookedValue.toLocaleString(),
      trend: metrics.booked_trend,
      icon: Package,
    },
    {
      label: "Revenue Locked",
      value:
        revenueValue >= 1000
          ? `$${(revenueValue / 1000).toFixed(1)}k`
          : formatCurrency(revenueValue),
      trend: metrics.revenue_trend,
      icon: DollarSign,
    },
    {
      label: "Conversion",
      value: formatPercent(conversionValue),
      trend: metrics.conversion_trend,
      icon: Target,
    },
    {
      label: "Pending Transfer",
      value: pendingValue.toLocaleString(),
      trend: null,
      icon: AlertTriangle,
      alert: pendingValue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200">
      {cards.map((card) => (
        <div key={card.label} className="bg-white px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            <card.icon className="h-3.5 w-3.5 text-indigo-500" />
            {card.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-semibold tracking-wide text-gray-900">
              {card.value}
            </span>
            {"sub" in card && card.sub && (
              <span className="text-[10px] font-medium text-gray-400">
                {card.sub}
              </span>
            )}
            {card.trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  card.trend.startsWith("+")
                    ? "text-emerald-500"
                    : "text-rose-500",
                )}
              >
                {card.trend}
              </span>
            )}
            {card.alert && (
              <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-500">
                ACTION
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
