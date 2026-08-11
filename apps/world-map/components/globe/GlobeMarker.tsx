"use client";

import type { MouseEvent } from "react";

import type { Destination } from "@/lib/mock-destinations";

import styles from "./GlobeMarker.module.css";
import { LocationBanner } from "./LocationBanner";

type GlobeMarkerProps = {
  destination: Destination;
  onSelect: (destination: Destination) => void;
  registerBanner: (element: HTMLButtonElement | null) => void;
};

export function GlobeMarker({
  destination,
  onSelect,
  registerBanner,
}: GlobeMarkerProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onSelect(destination);
  }

  return (
    <div className={styles.markerRoot}>
      <LocationBanner
        destination={destination}
        onSelect={onSelect}
        registerElement={registerBanner}
      />
      <button
        type="button"
        className={styles.marker}
        aria-label={`Focus globe on ${destination.name}`}
        onClick={handleClick}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span className={styles.markerVisual} aria-hidden="true">
          <span className={styles.ripple} />
          <span className={`${styles.ripple} ${styles.rippleDelayed}`} />
          <span className={styles.dot} />
        </span>
      </button>
    </div>
  );
}
