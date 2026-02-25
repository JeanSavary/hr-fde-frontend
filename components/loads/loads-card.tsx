"use client";

import { Card } from "@/components/ui/card";
import { Load } from "@/lib/types";
import { formatCurrency, formatLane } from "@/lib/utils";
import { EquipmentBadge, UrgencyBadge } from "@/components/shared/status-badge";

interface LoadsCardViewProps {
  loads: Load[];
  exactCount?: number;
  onSelect?: (load: Load) => void;
}

export function LoadsCardView({ loads, onSelect }: LoadsCardViewProps) {
  const sorted = [...loads].sort((a, b) => {
    const urgOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      normal: 2,
    };
    const urgDiff =
      (urgOrder[a.urgency ?? "normal"] ?? 2) -
      (urgOrder[b.urgency ?? "normal"] ?? 2);
    if (urgDiff !== 0) return urgDiff;
    const aTime = a.pickup_datetime ? new Date(a.pickup_datetime).getTime() : Infinity;
    const bTime = b.pickup_datetime ? new Date(b.pickup_datetime).getTime() : Infinity;
    return aTime - bTime;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((load) => (
        <Card
          key={load.load_id}
          className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${load.urgency === "critical" ? "border-rose-200" : ""}`}
          onClick={() => onSelect?.(load)}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">
              {load.load_id}
            </span>
            <EquipmentBadge type={load.equipment_type} />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {formatLane(load.origin, load.destination)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {load.urgency && <UrgencyBadge urgency={load.urgency} />}
            {load.pitch_count != null && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${load.pitch_count > 8 ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"}`}
              >
                {load.pitch_count}x pitched
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {load.miles} mi &bull; {load.weight.toLocaleString()} lbs
            </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(load.loadboard_rate)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
