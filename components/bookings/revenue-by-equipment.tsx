"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface RevenueByEquipmentProps {
  bookings: BookedLoad[];
}

const BAR_COLORS = ["#6366f1", "#34d399", "#f0913b"];

export function RevenueByEquipment({ bookings }: RevenueByEquipmentProps) {
  const hasEquipData = bookings.some((b) => b.equipment_type != null);
  if (!hasEquipData) return null;

  const total = bookings.reduce((s, b) => s + b.agreed_rate, 0) || 1;
  const byEquip = Object.entries(
    bookings.reduce<Record<string, { count: number; revenue: number }>>((acc, b) => {
      const key = b.equipment_type ?? "unknown";
      if (!acc[key]) acc[key] = { count: 0, revenue: 0 };
      acc[key].count++;
      acc[key].revenue += b.agreed_rate;
      return acc;
    }, {})
  ).sort(([, a], [, b]) => b.revenue - a.revenue);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Revenue by Equipment</h3>
      <div className="space-y-3.5">
        {byEquip.map(([key, data], i) => {
          const label = EQUIPMENT_CONFIG[key as keyof typeof EQUIPMENT_CONFIG]?.label ?? key;
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between">
                <span className="text-xs font-medium text-gray-900">
                  {label} <span className="font-normal text-gray-400">({data.count} loads)</span>
                </span>
                <span className="font-mono text-xs font-semibold text-gray-900">
                  ${(data.revenue / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(data.revenue / total) * 100}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
