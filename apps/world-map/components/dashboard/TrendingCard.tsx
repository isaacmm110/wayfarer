import { Activity } from "lucide-react";

import { TRENDING_MOCK } from "@/lib/mock-stats";

import { DashboardCard } from "./DashboardCard";
import { Sparkline } from "./Sparkline";

type TrendingCardProps = { className?: string; index: number };

export function TrendingCard({ className, index }: TrendingCardProps) {
  return (
    <DashboardCard
      className={className}
      cardClassName="p-5"
      index={index}
      side="left"
      accent="cyan"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
          {TRENDING_MOCK.title}
        </p>
        <Activity className="size-4 text-accent-cyan" aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-medium text-text-secondary">
        {TRENDING_MOCK.metricLabel}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <strong className="text-3xl font-semibold tracking-[-0.04em] text-text-primary">
          {TRENDING_MOCK.metricValue}
        </strong>
        <span className="text-sm text-text-secondary">
          {TRENDING_MOCK.metricUnit}
        </span>
      </div>
      <div className="mt-2">
        <Sparkline data={TRENDING_MOCK.trend} tone="cyan" />
      </div>
    </DashboardCard>
  );
}
