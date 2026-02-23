"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { SENTIMENT_CHART_COLORS, SENTIMENT_CONFIG } from "@/lib/constants";

interface SentimentChartProps {
  data: Record<string, number>;
}

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name:
      SENTIMENT_CONFIG[key as keyof typeof SENTIMENT_CONFIG]?.label ?? key,
    value,
    color: SENTIMENT_CHART_COLORS[key] ?? "#9CA3AF",
  }));

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">
        Sentiment Distribution
      </h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
