import { Clock, Plane, Sparkles, type LucideIcon } from "lucide-react";

import {
  CATEGORY_MOCK,
  type AccentTone,
  type CategoryIconName,
} from "@/lib/mock-stats";

import { DashboardCard } from "./DashboardCard";

type CategoryListProps = { className?: string; index: number };

const icons: Record<CategoryIconName, LucideIcon> = { plane: Plane, sparkles: Sparkles, clock: Clock };
const tones: Record<Extract<AccentTone, "blue" | "green" | "amber">, { bg: string; text: string }> = {
  blue: { bg: "bg-accent-blue", text: "text-accent-blue" },
  green: { bg: "bg-accent-green", text: "text-accent-green" },
  amber: { bg: "bg-accent-amber", text: "text-accent-amber" },
};

export function CategoryList({ className, index }: CategoryListProps) {
  return (
    <DashboardCard className={className} cardClassName="p-5" index={index} side="left" accent="blue">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
        {CATEGORY_MOCK.title}
      </p>
      <div className="mt-3 divide-y divide-border">
        {CATEGORY_MOCK.items.map((item) => {
          const Icon = icons[item.icon];
          const tone = tones[item.tone];
          return (
            <div key={item.label} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
              <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg">
                <span className={`absolute inset-0 ${tone.bg} opacity-15`} />
                <Icon className={`relative size-4 ${tone.text}`} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">{item.label}</span>
              <span className="text-xs font-medium tabular-nums text-text-secondary">{item.value}</span>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
