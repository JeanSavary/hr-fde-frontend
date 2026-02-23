"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface EquipmentChartProps {
  data: Record<string, number>;
}

export function EquipmentChart({ data }: EquipmentChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name:
      EQUIPMENT_CONFIG[key as keyof typeof EQUIPMENT_CONFIG]?.label ?? key,
    value,
  }));

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Equipment Demand</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
