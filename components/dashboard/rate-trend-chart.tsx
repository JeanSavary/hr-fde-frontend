"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CallSummary } from "@/lib/types";

interface RateTrendChartProps {
  calls: CallSummary[];
}

export function RateTrendChart({ calls }: RateTrendChartProps) {
  const byDate = calls
    .filter((c) => c.final_rate)
    .reduce<Record<string, { total: number; count: number }>>((acc, c) => {
      const date = new Date(c.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = { total: 0, count: 0 };
      acc[date].total += c.final_rate!;
      acc[date].count += 1;
      return acc;
    }, {});

  const chartData = Object.entries(byDate).map(([date, { total, count }]) => ({
    date,
    avgRate: Math.round(total / count),
  }));

  if (chartData.length < 2) return null;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-gray-700">Rate Trends</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number | undefined) => [
                `$${value ?? 0}`,
                "Avg Rate",
              ]}
            />
            <Line
              type="monotone"
              dataKey="avgRate"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: "#4F46E5", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
