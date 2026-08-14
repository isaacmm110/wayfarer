"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type MutableRefObject,
} from "react";
import { Mesh, Vector3 } from "three";

import { EARTH_RADIUS } from "@/lib/geo";
import type { Destination } from "@/lib/mock-destinations";

import styles from "./LocationBanner.module.css";

const BANNER_GLOBE_GAP = 16;
const VIEWPORT_EDGE_GAP = 12;

const BANNER_LANE_OFFSETS: Record<string, number> = {
  Reykjavik: -28,
  Lisbon: 24,
  Queenstown: 18,
  Tokyo: -10,
};

const ORIGIN = new Vector3();

type LocationBannerProps = {
  destination: Destination;
  earthRef: React.RefObject<Mesh>;
  htmlPortalRef: MutableRefObject<HTMLElement>;
  markerPosition: Vector3;
  onSelect: (destination: Destination) => void;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function toScreenPosition(point: Vector3, width: number, height: number) {
  return {
    x: (point.x * 0.5 + 0.5) * width,
    y: (-point.y * 0.5 + 0.5) * height,
  };
}

export function LocationBanner({
  destination,
  earthRef,
  htmlPortalRef,
  markerPosition,
  onSelect,
}: LocationBannerProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bannerRef = useRef<HTMLButtonElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const projectedMarker = useMemo(() => new Vector3(), []);
  const projectedCenter = useMemo(() => new Vector3(), []);
  const projectedEdge = useMemo(() => new Vector3(), []);
  const cameraRight = useMemo(() => new Vector3(), []);
  const laneOffset = BANNER_LANE_OFFSETS[destination.name] ?? 0;
  const glitchDelay = -(
    Math.abs(destination.lat * 0.13 + destination.lng * 0.07) % 5.4
  ).toFixed(2);
  const bannerStyle = {
    "--glitch-delay": `${glitchDelay}s`,
  } as CSSProperties;

  useFrame(() => {
    const anchor = anchorRef.current;
    const banner = bannerRef.current;
    const pin = pinRef.current;
    const portal = htmlPortalRef.current;

    if (!anchor || !banner || !pin || !portal) {
      return;
    }

    const marker = toScreenPosition(
      projectedMarker.copy(markerPosition).project(camera),
      size.width,
      size.height,
    );
    const center = toScreenPosition(
      projectedCenter.copy(ORIGIN).project(camera),
      size.width,
      size.height,
    );

    cameraRight
      .set(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .normalize()
      .multiplyScalar(EARTH_RADIUS * 1.06);
    const edge = toScreenPosition(
      projectedEdge.copy(cameraRight).project(camera),
      size.width,
      size.height,
    );
    const globeRadius = Math.hypot(edge.x - center.x, edge.y - center.y);
    const side = marker.x >= center.x ? 1 : -1;
    const bannerWidth = banner.offsetWidth || 170;
    const bannerHeight = banner.offsetHeight || 29;
    const portalBounds = portal.getBoundingClientRect();
    const minimumX =
      VIEWPORT_EDGE_GAP + bannerWidth / 2 - portalBounds.left;
    const maximumX =
      window.innerWidth -
      VIEWPORT_EDGE_GAP -
      bannerWidth / 2 -
      portalBounds.left;
    const idealX =
      center.x +
      side * (globeRadius + BANNER_GLOBE_GAP + bannerWidth / 2);
    const targetX = clamp(idealX, minimumX, maximumX);
    const safeTop = window.innerWidth >= 1024 ? 200 : 170;
    const minimumY = safeTop + bannerHeight / 2 - portalBounds.top;
    const maximumY =
      window.innerHeight - 24 - bannerHeight / 2 - portalBounds.top;
    const targetY = clamp(marker.y + laneOffset, minimumY, maximumY);

    anchor.style.transform = `translate3d(${(targetX - marker.x).toFixed(2)}px, ${(targetY - marker.y).toFixed(2)}px, 0)`;
    anchor.dataset.side = side > 0 ? "right" : "left";

    const deltaX = marker.x - targetX;
    const deltaY = marker.y - targetY;
    const horizontalScale =
      Math.abs(deltaX) > 0.001
        ? bannerWidth / 2 / Math.abs(deltaX)
        : Number.POSITIVE_INFINITY;
    const verticalScale =
      Math.abs(deltaY) > 0.001
        ? bannerHeight / 2 / Math.abs(deltaY)
        : Number.POSITIVE_INFINITY;
    const edgeScale = Math.min(horizontalScale, verticalScale);
    const edgeX = deltaX * edgeScale;
    const edgeY = deltaY * edgeScale;
    const remainingX = deltaX - edgeX;
    const remainingY = deltaY - edgeY;

    pin.style.left = `calc(50% + ${edgeX.toFixed(2)}px)`;
    pin.style.top = `calc(50% + ${edgeY.toFixed(2)}px)`;
    pin.style.width = `${Math.hypot(remainingX, remainingY).toFixed(2)}px`;
    pin.style.transform = `rotate(${Math.atan2(remainingY, remainingX)}rad)`;
  });

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onSelect(destination);
  }

  return (
    <Html
      center
      occlude={[earthRef]}
      portal={htmlPortalRef}
      position={markerPosition}
      style={{ pointerEvents: "none" }}
      zIndexRange={[40, 10]}
    >
      <span ref={anchorRef} className={styles.anchor}>
        <span ref={pinRef} className={styles.pin} aria-hidden="true" />
        <button
          ref={bannerRef}
          type="button"
          className={styles.banner}
          style={bannerStyle}
          aria-label={`Focus globe on ${destination.name}, ${destination.country}`}
          onClick={handleClick}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span className={styles.scanlines} aria-hidden="true" />
          <span className={styles.label}>
            {destination.name}, {destination.country}
          </span>
        </button>
      </span>
    </Html>
  );
}
