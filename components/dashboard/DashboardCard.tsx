"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import type { AccentTone } from "@/lib/mock-stats";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  cardClassName?: string;
  index: number;
  side: "left" | "right" | "bottom";
  accent: AccentTone;
};

const glowClasses: Record<AccentTone, string> = {
  blue: "group-hover:shadow-glow-blue",
  green: "group-hover:shadow-glow-green",
  amber: "group-hover:shadow-glow-amber",
  cyan: "group-hover:shadow-glow-cyan",
  secondary: "group-hover:shadow-soft",
};

const entranceOffsets = {
  left: { x: -16, y: 6 },
  right: { x: 16, y: 6 },
  bottom: { x: 0, y: 14 },
};

export function DashboardCard({
  children,
  className = "",
  cardClassName = "",
  index,
  side,
  accent,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...entranceOffsets[side] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.72 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.2, delay: 0 } }}
      className={`group pointer-events-auto ${className}`.trim()}
    >
      <GlassCard
        className={`h-full transition-shadow duration-200 ${glowClasses[accent]} ${cardClassName}`.trim()}
      >
        {children}
      </GlassCard>
    </motion.div>
  );
}
