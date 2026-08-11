"use client";

import type { CSSProperties, MouseEvent } from "react";

import type { Destination } from "@/lib/mock-destinations";

import styles from "./LocationBanner.module.css";

type LocationBannerProps = {
  destination: Destination;
  onSelect: (destination: Destination) => void;
  registerElement: (element: HTMLButtonElement | null) => void;
};

export function LocationBanner({
  destination,
  onSelect,
  registerElement,
}: LocationBannerProps) {
  const glitchDelay = -(
    Math.abs(destination.lat * 0.13 + destination.lng * 0.07) % 5.4
  ).toFixed(2);
  const bannerStyle = {
    "--glitch-delay": `${glitchDelay}s`,
  } as CSSProperties;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onSelect(destination);
  }

  return (
    <button
      ref={registerElement}
      type="button"
      className={styles.banner}
      style={bannerStyle}
      aria-label={`Focus globe on ${destination.name}, ${destination.country}`}
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className={styles.pin} aria-hidden="true" />
      <span className={styles.scanlines} aria-hidden="true" />
      <span className={styles.label}>
        {destination.name}, {destination.country}
      </span>
    </button>
  );
}
