"use client";

import { Card } from "@/components/ui/card";
import { Load } from "@/lib/types";
import { formatCurrency, formatLane } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadsCardViewProps {
  loads: Load[];
}

export function LoadsCardView({ loads }: LoadsCardViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loads.map((load) => (
        <Card key={load.load_id} className="p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">{load.load_id}</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {EQUIPMENT_CONFIG[load.equipment_type]?.label ?? load.equipment_type}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">{formatLane(load.origin, load.destination)}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">{load.miles} mi &bull; {load.weight.toLocaleString()} lbs</span>
            <span className="font-semibold text-gray-900">{formatCurrency(load.loadboard_rate)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
