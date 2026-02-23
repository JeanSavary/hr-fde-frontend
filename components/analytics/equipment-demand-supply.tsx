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
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Equipment Demand vs. Inventory</h3>
      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.type}>
            <div className="mb-1.5 flex justify-between">
              <span className="text-xs font-medium text-gray-900">{item.type}</span>
              <span className={`text-[11px] font-semibold ${item.demand > item.supply ? "text-rose-500" : "text-emerald-500"}`}>
                {item.demand > item.supply ? "Under-supplied" : "Balanced"}
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="flex-1">
                <div className="mb-0.5 text-[9px] uppercase text-gray-400">Demand</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.demand}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-0.5 text-[9px] uppercase text-gray-400">Supply</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.supply}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
