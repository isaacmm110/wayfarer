import type { ReactNode } from "react";

type StatBadgeProps = {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
};

export function StatBadge({
  icon,
  label,
  value,
  className = "",
}: StatBadgeProps) {
  return (
    <div
      className={`inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs shadow-card backdrop-blur-md ${className}`.trim()}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center text-accent-cyan"
        >
          {icon}
        </span>
      ) : null}
      <span className="font-medium text-text-secondary">{label}</span>
      <span className="font-semibold tabular-nums text-text-primary">{value}</span>
    </div>
  );
}
