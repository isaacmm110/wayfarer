import { SEASON_MOCK, type SeasonStat } from "@/lib/mock-stats";

import { DashboardCard } from "./DashboardCard";

type TwoRingsCardProps = { className?: string; index: number };

const RADIUS = 37;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ringColors = { green: "text-accent-green", amber: "text-accent-amber" };

function ProgressRing({ item }: { item: SeasonStat }) {
  const offset = CIRCUMFERENCE * (1 - item.value / 100);
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center" aria-label={`${item.value}% ${item.label}`}>
      <div className="relative size-20">
        <svg viewBox="0 0 100 100" className="size-20 -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={ringColors[item.tone]}
          />
        </svg>
        <strong className="absolute inset-0 grid place-items-center text-lg font-semibold tabular-nums text-text-primary">
          {item.value}%
        </strong>
      </div>
      <span className="mt-2 text-center text-[11px] font-medium leading-4 text-text-secondary">
        {item.label}
      </span>
    </div>
  );
}

export function TwoRingsCard({ className, index }: TwoRingsCardProps) {
  return (
    <DashboardCard className={className} cardClassName="p-4" index={index} side="bottom" accent="green">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
        {SEASON_MOCK.title}
      </p>
      <div className="mt-3 flex items-start gap-3">
        {SEASON_MOCK.items.map((item) => <ProgressRing key={item.label} item={item} />)}
      </div>
    </DashboardCard>
  );
}
