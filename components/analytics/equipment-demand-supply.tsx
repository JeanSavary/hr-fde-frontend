"use client";

import { Card } from "@/components/ui/card";

interface EquipmentDemandSupplyProps {
  data?: Array<{ type: string; demand: number; supply: number }>;
}

const DEFAULT_DATA = [
  { type: "Dry Van", demand: 62, supply: 55 },
  { type: "Reefer", demand: 25, supply: 30 },
  { type: "Flatbed", demand: 13, supply: 15 },
];

export function EquipmentDemandSupply({ data }: EquipmentDemandSupplyProps) {
  const items = data ?? DEFAULT_DATA;

  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Equipment Demand vs. Supply
        </h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
            Demand
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Supply
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.type}>
            <div className="mb-2 flex justify-between">
              <span className="text-xs font-medium text-gray-900">
                {item.type}
              </span>
              <span
                className={`text-[11px] font-semibold ${item.demand > item.supply ? "text-rose-500" : "text-emerald-500"}`}
              >
                {item.demand > item.supply ? "Under-supplied" : "Balanced"}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${item.demand}%` }}
                  />
                </div>
                <span className="w-8 text-right font-heading text-[10px] font-semibold text-gray-500">
                  {item.demand}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${item.supply}%` }}
                  />
                </div>
                <span className="w-8 text-right font-heading text-[10px] font-semibold text-gray-500">
                  {item.supply}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
