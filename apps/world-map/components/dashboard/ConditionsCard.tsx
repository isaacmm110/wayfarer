"use client";

import { Bar, BarChart, Cell, ResponsiveContainer } from "recharts";

import { CONDITIONS_MOCK, type AccentTone } from "@/lib/mock-stats";

import { DashboardCard } from "./DashboardCard";

type ConditionsCardProps = { className?: string; index: number };

const colors: Record<Exclude<AccentTone, "cyan">, { fill: string; dot: string }> = {
  blue: { fill: "var(--accent-blue)", dot: "bg-accent-blue" },
  green: { fill: "var(--accent-green)", dot: "bg-accent-green" },
  secondary: { fill: "var(--text-secondary)", dot: "bg-text-secondary" },
  amber: { fill: "var(--accent-amber)", dot: "bg-accent-amber" },
};

export function ConditionsCard({ className, index }: ConditionsCardProps) {
  return (
    <DashboardCard className={className} cardClassName="p-4" index={index} side="right" accent="amber">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
        {CONDITIONS_MOCK.title}
      </p>
      <div className="mt-3 h-16 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 280, height: 64 }}>
          <BarChart data={CONDITIONS_MOCK.items} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
            <Bar dataKey="value" radius={[6, 6, 2, 2]} isAnimationActive={false}>
              {CONDITIONS_MOCK.items.map((item) => (
                <Cell key={item.label} fill={colors[item.tone].fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 space-y-2">
        {CONDITIONS_MOCK.items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className={`size-1.5 rounded-full ${colors[item.tone].dot}`} />
            <span className="flex-1 font-medium text-text-secondary">{item.label}</span>
            <span className="font-semibold tabular-nums text-text-primary">{item.score}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
