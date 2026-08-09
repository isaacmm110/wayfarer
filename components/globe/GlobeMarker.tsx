"use client";

import type { MouseEvent } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import type { Destination } from "@/lib/mock-destinations";

import styles from "./GlobeMarker.module.css";

type GlobeMarkerProps = {
  destination: Destination;
  onSelect: (destination: Destination) => void;
};

export function GlobeMarker({ destination, onSelect }: GlobeMarkerProps) {
  const tooltipId = `destination-${destination.name
    .toLowerCase()
    .replaceAll(" ", "-")}`;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onSelect(destination);
  }

  return (
    <button
      type="button"
      className={styles.marker}
      aria-label={`Focus globe on ${destination.name}`}
      aria-describedby={tooltipId}
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className={styles.markerVisual} aria-hidden="true">
        <span className={styles.ripple} />
        <span className={`${styles.ripple} ${styles.rippleDelayed}`} />
        <span className={styles.dot} />
      </span>

      <GlassCard
        id={tooltipId}
        role="tooltip"
        className={`${styles.tooltip} px-3 py-2 text-left`}
      >
        <span className="block text-xs font-semibold text-text-primary">
          {destination.name}
        </span>
        <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-text-secondary">
          Live data coming soon
        </span>
      </GlassCard>
    </button>
  );
}
