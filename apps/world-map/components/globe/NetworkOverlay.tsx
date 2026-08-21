"use client";

import { useMemo } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
} from "three";

import { EARTH_RADIUS, latLngToVector3 } from "@/lib/geo";
import {
  MOCK_AMBIENT_NETWORK_NODES,
  MOCK_AMBIENT_NETWORK_PATHS,
} from "@/lib/mock-globe-network";
import { accentCyan } from "@/lib/three-colors";

const NETWORK_RADIUS = EARTH_RADIUS * 1.015;

function createSurfaceSegment(start: Vector3, end: Vector3) {
  const startDirection = start.clone().normalize();
  const endDirection = end.clone().normalize();
  const points: Vector3[] = [];
  const segments = 12;

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const direction = startDirection
      .clone()
      .lerp(endDirection, progress)
      .normalize();
    const altitude = Math.sin(progress * Math.PI) * 0.018;
    points.push(direction.multiplyScalar(NETWORK_RADIUS + altitude));
  }

  return points;
}

export function NetworkOverlay() {
  const pointGeometry = useMemo(() => {
    const positions = MOCK_AMBIENT_NETWORK_NODES.map((node) =>
      latLngToVector3(node.lat, node.lng, NETWORK_RADIUS),
    );

    return new BufferGeometry().setFromPoints(positions);
  }, []);

  const lineGeometry = useMemo(() => {
    const positions: number[] = [];

    MOCK_AMBIENT_NETWORK_PATHS.forEach(({ points: [start, end] }) => {
      const curvePoints = createSurfaceSegment(
        latLngToVector3(start.lat, start.lng, NETWORK_RADIUS),
        latLngToVector3(end.lat, end.lng, NETWORK_RADIUS),
      );

      for (let index = 1; index < curvePoints.length; index += 1) {
        const previous = curvePoints[index - 1];
        const current = curvePoints[index];
        positions.push(
          previous.x,
          previous.y,
          previous.z,
          current.x,
          current.y,
          current.z,
        );
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  return (
    <group renderOrder={1}>
      <points geometry={pointGeometry}>
        <pointsMaterial
          blending={AdditiveBlending}
          color={accentCyan}
          depthWrite={false}
          opacity={0.46}
          size={0.015}
          sizeAttenuation
          transparent
        />
      </points>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          blending={AdditiveBlending}
          color={accentCyan}
          depthWrite={false}
          opacity={0.2}
          transparent
        />
      </lineSegments>
    </group>
  );
}
