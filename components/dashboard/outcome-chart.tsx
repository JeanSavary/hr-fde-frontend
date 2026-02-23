"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { OUTCOME_CHART_COLORS, OUTCOME_CONFIG } from "@/lib/constants";

interface OutcomeChartProps {
  data: Record<string, number>;
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name:
      OUTCOME_CONFIG[key as keyof typeof OUTCOME_CONFIG]?.label ?? key,
    value,
    color: OUTCOME_CHART_COLORS[key] ?? "#9CA3AF",
  }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Calls by Outcome</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number | undefined) => [value ?? 0, "Calls"]}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-900 text-2xl font-semibold"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
