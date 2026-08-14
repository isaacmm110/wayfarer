"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Mesh, SRGBColorSpace } from "three";

import { EARTH_RADIUS } from "@/lib/geo";

const CLOUD_ROTATION_SPEED = -0.006;

export function Clouds() {
  const primaryCloudRef = useRef<Mesh>(null);
  const secondaryCloudRef = useRef<Mesh>(null);
  const gl = useThree((state) => state.gl);
  const cloudTexture = useTexture("/textures/earth-clouds.png");
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    cloudTexture.anisotropy = Math.min(
      8,
      gl.capabilities.getMaxAnisotropy(),
    );
    cloudTexture.colorSpace = SRGBColorSpace;
    cloudTexture.needsUpdate = true;
  }, [cloudTexture, gl]);

  useFrame((_, delta) => {
    if (!prefersReducedMotionRef.current) {
      const frameDelta = Math.min(delta, 0.05);

      if (primaryCloudRef.current) {
        primaryCloudRef.current.rotation.y += frameDelta * CLOUD_ROTATION_SPEED;
      }
      if (secondaryCloudRef.current) {
        secondaryCloudRef.current.rotation.y +=
          frameDelta * CLOUD_ROTATION_SPEED * 0.72;
      }
    }
  });

  return (
    <group>
      <mesh ref={primaryCloudRef} renderOrder={3}>
        <sphereGeometry args={[EARTH_RADIUS * 1.014, 64, 64]} />
        <meshBasicMaterial
          alphaTest={0.02}
          depthWrite={false}
          map={cloudTexture}
          opacity={0.44}
          toneMapped
          transparent
        />
      </mesh>
      <mesh
        ref={secondaryCloudRef}
        renderOrder={3}
        rotation={[0.025, 2.15, -0.018]}
      >
        <sphereGeometry args={[EARTH_RADIUS * 1.018, 64, 64]} />
        <meshBasicMaterial
          alphaTest={0.025}
          depthWrite={false}
          map={cloudTexture}
          opacity={0.26}
          toneMapped
          transparent
        />
      </mesh>
    </group>
  );
}
