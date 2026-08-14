"use client";

import { Canvas } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { ACESFilmicToneMapping, Mesh, SRGBColorSpace } from "three";

import { GlassCard } from "@/components/ui/glass-card";
import { MOCK_DESTINATIONS, type Destination } from "@/lib/mock-destinations";
import { accentBlue } from "@/lib/three-colors";

import { Atmosphere } from "./Atmosphere";
import { CameraRig, DEFAULT_CAMERA_POSITION } from "./CameraRig";
import { Clouds } from "./Clouds";
import { DestinationArcs } from "./DestinationArcs";
import { Earth } from "./Earth";
import { Marker } from "./Marker";
import { NetworkOverlay } from "./NetworkOverlay";

export type SceneProps = {
  className?: string;
  selectedDestination?: Destination | null;
  onDestinationSelect?: (destination: Destination) => void;
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

function GlobeLayers({
  earthRef,
  htmlPortalRef,
  onEarthReady,
  onDestinationSelect,
}: {
  earthRef: MutableRefObject<Mesh | null>;
  htmlPortalRef: MutableRefObject<HTMLElement>;
  onEarthReady: () => void;
  onDestinationSelect: (destination: Destination) => void;
}) {
  return (
    <>
      <ambientLight color="white" intensity={1.05} />
      <hemisphereLight
        color="white"
        groundColor={accentBlue}
        intensity={0.42}
      />
      <directionalLight
        color="white"
        intensity={0.28}
        position={[-2.2, 1.15, 2.8]}
      />

      <Earth ref={earthRef} onReady={onEarthReady} />
      <Clouds />
      <NetworkOverlay />
      <DestinationArcs />
      <Atmosphere />

      {MOCK_DESTINATIONS.map((destination) => (
        <Marker
          key={destination.name}
          destination={destination}
          earthRef={earthRef}
          htmlPortalRef={htmlPortalRef}
          onSelect={onDestinationSelect}
        />
      ))}
    </>
  );
}

export default function Scene({
  className = "",
  selectedDestination = null,
  onDestinationSelect,
}: SceneProps) {
  const earthRef = useRef<Mesh>(null);
  const htmlPortalRef = useRef<HTMLDivElement>(null!);
  const [isReady, setIsReady] = useState(false);
  const handleEarthReady = useCallback(() => setIsReady(true), []);
  const handleDestinationSelect = useCallback(
    (destination: Destination) => onDestinationSelect?.(destination),
    [onDestinationSelect],
  );

  return (
    <div
      ref={htmlPortalRef}
      className={`relative size-full ${
        selectedDestination
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing"
      } ${className}`.trim()}
    >
      <Canvas
        camera={{
          far: 100,
          fov: 42,
          near: 0.1,
          position: DEFAULT_CAMERA_POSITION.toArray(),
        }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.94;
        }}
        style={{ touchAction: "pan-y" }}
      >
        <CameraRig selectedDestination={selectedDestination} />
        <Suspense fallback={null}>
          <GlobeLayers
            earthRef={earthRef}
            htmlPortalRef={htmlPortalRef}
            onDestinationSelect={handleDestinationSelect}
            onEarthReady={handleEarthReady}
          />
        </Suspense>
      </Canvas>

      {!isReady ? <GlobeLoading /> : null}
    </div>
  );
}
