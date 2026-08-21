"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import {
  AdditiveBlending,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three";

import { EARTH_RADIUS, latLngToVector3 } from "@/lib/geo";
import type { Destination } from "@/lib/mock-destinations";
import { accentRed } from "@/lib/three-colors";

import { LocationBanner } from "./LocationBanner";

const MARKER_RADIUS = EARTH_RADIUS * 1.022;
const OUTWARD_AXIS = new Vector3(0, 0, 1);

type MarkerProps = {
  destination: Destination;
  earthRef: React.RefObject<Mesh>;
  htmlPortalRef: MutableRefObject<HTMLElement>;
  onSelect: (destination: Destination) => void;
};

export function Marker({
  destination,
  earthRef,
  htmlPortalRef,
  onSelect,
}: MarkerProps) {
  const pulseRef = useRef<Mesh>(null);
  const pulseMaterialRef = useRef<MeshBasicMaterial>(null);
  const phase = useMemo(
    () => Math.abs(destination.lat * 0.17 + destination.lng * 0.11) % 1,
    [destination.lat, destination.lng],
  );
  const position = useMemo(
    () => latLngToVector3(destination.lat, destination.lng, MARKER_RADIUS),
    [destination.lat, destination.lng],
  );
  const orientation = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(
        OUTWARD_AXIS,
        position.clone().normalize(),
      ),
    [position],
  );

  useFrame(({ clock }) => {
    const progress = (clock.elapsedTime * 0.52 + phase) % 1;

    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(0.72 + progress * 1.05);
    }
    if (pulseMaterialRef.current) {
      pulseMaterialRef.current.opacity = (1 - progress) * 0.68;
    }
  });

  function handleSelect(event: ThreeEvent<MouseEvent>) {
    if (event.intersections[0]?.object !== event.object) {
      return;
    }

    event.stopPropagation();
    onSelect(destination);
  }

  return (
    <>
      <group position={position} quaternion={orientation}>
        <mesh onClick={handleSelect} renderOrder={6}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color={accentRed} toneMapped={false} />
        </mesh>
        <mesh onClick={handleSelect}>
          <sphereGeometry args={[0.048, 12, 12]} />
          <meshBasicMaterial depthWrite={false} opacity={0} transparent />
        </mesh>
        <mesh ref={pulseRef} renderOrder={5}>
          <ringGeometry args={[0.021, 0.027, 32]} />
          <meshBasicMaterial
            ref={pulseMaterialRef}
            blending={AdditiveBlending}
            color={accentRed}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
      <LocationBanner
        destination={destination}
        earthRef={earthRef}
        htmlPortalRef={htmlPortalRef}
        markerPosition={position}
        onSelect={onSelect}
      />
    </>
  );
}
