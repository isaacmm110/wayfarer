"use client";

import dynamic from "next/dynamic";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { GlobeMethods } from "react-globe.gl";

import { GlassCard } from "@/components/ui/glass-card";
import {
  MOCK_DESTINATIONS,
  type Destination,
} from "@/lib/mock-destinations";

import { GlobeMarker } from "./GlobeMarker";
import type { GlobeRendererProps } from "./GlobeRenderer";

const ReactGlobe = dynamic<GlobeRendererProps>(
  () => import("./GlobeRenderer"),
  { ssr: false, loading: () => null },
);

// Local copy of the MIT-licensed earth-night example texture from three-globe.
const EARTH_TEXTURE_URL = "/textures/earth-night.jpg";
const ROTATION_RESUME_DELAY = 2_000;

type GlobeSize = {
  width: number;
  height: number;
};

type MarkerRoot = {
  element: HTMLDivElement;
  root: Root;
};

type GlobePropsInternal = {
  className?: string;
};

function GlobeLoading() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <GlassCard className="flex items-center justify-center px-5 py-4">
        <span className="relative flex size-9 items-center justify-center">
          <span className="absolute size-9 animate-ping rounded-full bg-accent-cyan opacity-20" />
          <span className="size-2.5 rounded-full bg-accent-cyan shadow-glow-cyan" />
        </span>
        <span className="sr-only">Loading interactive globe</span>
      </GlassCard>
    </div>
  );
}

export const Globe = memo(function Globe({
  className = "",
}: GlobePropsInternal) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods>();
  const controlsRef = useRef<ReturnType<GlobeMethods["controls"]> | null>(
    null,
  );
  const markerRootsRef = useRef(new Map<string, MarkerRoot>());
  const resumeTimeoutRef = useRef<number>();
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [size, setSize] = useState<GlobeSize>({ width: 0, height: 0 });
  const [accentCyan, setAccentCyan] = useState("");
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current !== undefined) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = undefined;
    }
  }, []);

  const pauseRotation = useCallback(() => {
    clearResumeTimeout();

    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  }, [clearResumeTimeout]);

  const scheduleRotationResume = useCallback(() => {
    clearResumeTimeout();

    if (isHoveredRef.current || isDraggingRef.current) {
      return;
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
      }
    }, ROTATION_RESUME_DELAY);
  }, [clearResumeTimeout]);

  const handleControlStart = useCallback(() => {
    isDraggingRef.current = true;
    pauseRotation();
  }, [pauseRotation]);

  const handleControlEnd = useCallback(() => {
    isDraggingRef.current = false;
    scheduleRotationResume();
  }, [scheduleRotationResume]);

  const handleDestinationSelect = useCallback(
    (destination: Destination) => {
      pauseRotation();
      globeRef.current?.pointOfView(
        { lat: destination.lat, lng: destination.lng, altitude: 1.45 },
        1_200,
      );
      scheduleRotationResume();
    },
    [pauseRotation, scheduleRotationResume],
  );

  const createMarkerElement = useCallback(
    (data: object) => {
      const destination = data as Destination;
      const existingMarker = markerRootsRef.current.get(destination.name);

      if (existingMarker) {
        return existingMarker.element;
      }

      const element = document.createElement("div");
      const root = createRoot(element);

      element.style.pointerEvents = "auto";
      root.render(
        <GlobeMarker
          destination={destination}
          onSelect={handleDestinationSelect}
        />,
      );

      markerRootsRef.current.set(destination.name, { element, root });
      return element;
    },
    [handleDestinationSelect],
  );

  const handleGlobeReady = useCallback(() => {
    setIsGlobeReady(true);

    const controls = globeRef.current?.controls();

    if (!controls) {
      return;
    }

    controlsRef.current = controls;
    controls.autoRotate = !isHoveredRef.current;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.addEventListener("start", handleControlStart);
    controls.addEventListener("end", handleControlEnd);

    globeRef.current?.pointOfView(
      { lat: 14, lng: 20, altitude: 2.05 },
      0,
    );
  }, [handleControlEnd, handleControlStart]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateSize = ({ width, height }: DOMRectReadOnly) => {
      const nextSize = {
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      };

      setSize((currentSize) =>
        currentSize.width === nextSize.width &&
        currentSize.height === nextSize.height
          ? currentSize
          : nextSize,
      );
    };

    updateSize(container.getBoundingClientRect());

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        updateSize(entry.contentRect);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setAccentCyan(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-cyan")
        .trim(),
    );
  }, []);

  useEffect(() => {
    const markerRoots = markerRootsRef.current;

    return () => {
      clearResumeTimeout();

      if (controlsRef.current) {
        controlsRef.current.removeEventListener("start", handleControlStart);
        controlsRef.current.removeEventListener("end", handleControlEnd);
        controlsRef.current = null;
      }

      markerRoots.forEach(({ root }) => root.unmount());
      markerRoots.clear();
    };
  }, [clearResumeTimeout, handleControlEnd, handleControlStart]);

  const isConfigured = size.width > 0 && size.height > 0 && accentCyan;

  return (
    <div
      ref={containerRef}
      className={`relative size-full cursor-grab touch-none active:cursor-grabbing ${className}`.trim()}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          isHoveredRef.current = true;
          pauseRotation();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          isHoveredRef.current = false;
          scheduleRotationResume();
        }
      }}
    >
      {isConfigured ? (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isGlobeReady
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <ReactGlobe
            globeRef={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={EARTH_TEXTURE_URL}
            showAtmosphere
            atmosphereColor={accentCyan}
            atmosphereAltitude={0.15}
            htmlElementsData={MOCK_DESTINATIONS}
            htmlLat="lat"
            htmlLng="lng"
            htmlAltitude={0.015}
            htmlElement={createMarkerElement}
            htmlTransitionDuration={0}
            enablePointerInteraction
            showPointerCursor={false}
            onGlobeReady={handleGlobeReady}
          />
        </div>
      ) : null}

      {!isGlobeReady ? <GlobeLoading /> : null}
    </div>
  );
});
