"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface BookingsSummaryProps {
  bookings: BookedLoad[];
}

export function BookingsSummary({ bookings }: BookingsSummaryProps) {
  const totalRevenue = bookings.reduce((s, b) => s + b.agreed_rate, 0);
  const avgMargin = bookings.length
    ? bookings.reduce((s, b) => s + (b.margin ?? 0), 0) / bookings.length
    : 0;
  const avgRounds = bookings.length
    ? bookings.reduce((s, b) => s + (b.negotiation_rounds ?? 0), 0) / bookings.length
    : 0;
  const hasMarginData = bookings.some((b) => b.margin != null);
  const hasRoundsData = bookings.some((b) => b.negotiation_rounds != null);

  const cards = [
    { label: "Total Booked", value: bookings.length.toString() },
    { label: "Total Revenue", value: totalRevenue >= 1000 ? `$${(totalRevenue / 1000).toFixed(1)}k` : formatCurrency(totalRevenue) },
    { label: "Avg Margin", value: hasMarginData ? `${avgMargin.toFixed(1)}%` : "\u2014" },
    { label: "Avg Rounds", value: hasRoundsData ? avgRounds.toFixed(1) : "\u2014" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5 shadow-sm">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{card.label}</div>
          <div className="font-heading text-2xl font-semibold tracking-wide text-gray-900">{card.value}</div>
        </Card>
      ))}
    </div>
  );
}
