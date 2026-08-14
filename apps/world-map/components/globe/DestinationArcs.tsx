"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  QuadraticBezierCurve3,
  ShaderMaterial,
  type Color,
} from "three";

import { EARTH_RADIUS, latLngToVector3 } from "@/lib/geo";
import { MOCK_DESTINATION_ARCS } from "@/lib/mock-globe-network";
import { accentCyan, accentRed } from "@/lib/three-colors";

const VERTEX_SHADER = /* glsl */ `
  attribute float arcProgress;
  varying float vProgress;

  void main() {
    vProgress = arcProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 arcColor;
  uniform float time;
  uniform float offset;
  varying float vProgress;

  void main() {
    float phase = fract(vProgress * 5.5 - time * 0.34 + offset);
    float pulse = smoothstep(0.0, 0.12, phase)
      * (1.0 - smoothstep(0.42, 0.62, phase));
    float alpha = 0.08 + pulse * 0.62;
    gl_FragColor = vec4(arcColor, alpha);
  }
`;

type DestinationArc = (typeof MOCK_DESTINATION_ARCS)[number];

function AnimatedArc({ arc, color }: { arc: DestinationArc; color: Color }) {
  const materialRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const start = latLngToVector3(
      arc.startLat,
      arc.startLng,
      EARTH_RADIUS * 1.022,
    );
    const end = latLngToVector3(
      arc.endLat,
      arc.endLng,
      EARTH_RADIUS * 1.022,
    );
    const angularDistance = start.angleTo(end);
    const midpoint = start
      .clone()
      .add(end)
      .normalize()
      .multiplyScalar(EARTH_RADIUS * (1.12 + angularDistance * 0.13));
    const points = new QuadraticBezierCurve3(start, midpoint, end).getPoints(72);
    const positions: number[] = [];
    const progress: number[] = [];

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];

      positions.push(
        previous.x,
        previous.y,
        previous.z,
        current.x,
        current.y,
        current.z,
      );
      progress.push(
        (index - 1) / (points.length - 1),
        index / (points.length - 1),
      );
    }

    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3),
    );

    nextGeometry.setAttribute(
      "arcProgress",
      new Float32BufferAttribute(progress, 1),
    );
    return nextGeometry;
  }, [arc]);

  const uniforms = useMemo(
    () => ({
      arcColor: { value: color.clone() },
      time: { value: 0 },
      offset: { value: arc.dashOffset },
    }),
    [arc.dashOffset, color],
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <lineSegments frustumCulled={false} geometry={geometry} renderOrder={3}>
      <shaderMaterial
        ref={materialRef}
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
      />
    </lineSegments>
  );
}

export function DestinationArcs() {
  return (
    <group>
      {MOCK_DESTINATION_ARCS.map((arc, index) => (
        <AnimatedArc
          key={arc.id}
          arc={arc}
          color={index % 2 === 0 ? accentCyan : accentRed}
        />
      ))}
    </group>
  );
}
