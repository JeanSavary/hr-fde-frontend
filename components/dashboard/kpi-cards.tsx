"use client";

import { Card } from "@/components/ui/card";
import { Phone, Package, DollarSign, Target, AlertTriangle } from "lucide-react";
import { DashboardMetrics } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const callsValue = metrics.calls_today ?? metrics.total_calls;
  const bookedValue = metrics.booked_today ?? (metrics.calls_by_outcome?.booked ?? 0);
  const revenueValue = metrics.revenue_today ?? metrics.total_revenue;
  const conversionValue = metrics.conversion_rate ?? metrics.booking_rate_percent;
  const pendingValue = metrics.pending_transfer ?? 0;

  const cards = [
    {
      label: "Calls Today",
      value: callsValue.toLocaleString(),
      trend: metrics.calls_trend,
      icon: Phone,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Loads Booked",
      value: bookedValue.toLocaleString(),
      trend: metrics.booked_trend,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Revenue Locked",
      value: revenueValue >= 1000 ? `$${(revenueValue / 1000).toFixed(1)}k` : formatCurrency(revenueValue),
      trend: metrics.revenue_trend,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Conversion",
      value: formatPercent(conversionValue),
      trend: metrics.conversion_trend,
      icon: Target,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Pending Transfer",
      value: pendingValue.toLocaleString(),
      trend: null,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      alert: pendingValue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`p-5 shadow-sm transition-shadow hover:shadow-md ${card.alert ? "border-orange-300" : ""}`}
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            {card.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-gray-900">
              {card.value}
            </span>
            {card.trend && (
              <span className={`text-xs font-medium ${card.trend.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>
                {card.trend}
              </span>
            )}
            {card.alert && (
              <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-500">
                ACTION
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
