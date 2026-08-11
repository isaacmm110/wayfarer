"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

import type { TrendPoint } from "@/lib/mock-stats";

type SparklineProps = {
  data: readonly TrendPoint[];
  tone: "cyan" | "green";
};

const strokeColors = {
  cyan: "var(--accent-cyan)",
  green: "var(--accent-green)",
};

export function Sparkline({ data, tone }: SparklineProps) {
  return (
    <div className="h-14 w-full" aria-hidden="true">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 240, height: 56 }}
      >
        <LineChart data={data} margin={{ top: 8, right: 3, bottom: 3, left: 3 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColors[tone]}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
