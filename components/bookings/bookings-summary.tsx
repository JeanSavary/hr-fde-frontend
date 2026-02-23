"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Package, DollarSign, TrendingUp, Users } from "lucide-react";

interface BookingsSummaryProps {
  bookings: BookedLoad[];
}

export function BookingsSummary({ bookings }: BookingsSummaryProps) {
  const totalRevenue = bookings.reduce((sum, b) => sum + b.agreed_rate, 0);
  const carrierCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    const name = b.carrier_name ?? b.mc_number;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const mostActive = Object.entries(carrierCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const cards = [
    {
      label: "Total Bookings",
      value: bookings.length.toString(),
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Avg Rate",
      value: formatCurrency(
        bookings.length ? totalRevenue / bookings.length : 0,
      ),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Top Carrier",
      value: mostActive ? mostActive[0] : "\u2014",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="flex items-center gap-4 p-4 shadow-sm"
        >
          <div className={`rounded-lg p-2.5 ${card.bg}`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-xl font-semibold tracking-tight text-gray-900">
              {card.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
