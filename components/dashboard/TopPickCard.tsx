import { MapPin } from "lucide-react";

import { StatBadge } from "@/components/ui/stat-badge";
import { TOP_PICK_MOCK } from "@/lib/mock-stats";

import { DashboardCard } from "./DashboardCard";
import { Sparkline } from "./Sparkline";

type TopPickCardProps = { className?: string; index: number };

export function TopPickCard({ className, index }: TopPickCardProps) {
  return (
    <DashboardCard className={className} cardClassName="p-5" index={index} side="right" accent="green">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
            {TOP_PICK_MOCK.title}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-accent-green" aria-hidden="true" />
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">
              {TOP_PICK_MOCK.destination}
            </h2>
          </div>
        </div>
        <StatBadge
          label={TOP_PICK_MOCK.trendLabel}
          value={TOP_PICK_MOCK.trendValue}
          className="shrink-0 [&>span:last-child]:text-accent-green"
        />
      </div>
      <div className="mt-3">
        <Sparkline data={TOP_PICK_MOCK.trend} tone="green" />
      </div>
    </DashboardCard>
  );
}
