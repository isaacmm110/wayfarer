"use client";

import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  forwardRef,
  useEffect,
  type ForwardedRef,
} from "react";
import {
  AdditiveBlending,
  Mesh,
  SRGBColorSpace,
  type Texture,
} from "three";

import { EARTH_RADIUS } from "@/lib/geo";

const EARTH_TEXTURES = [
  "/textures/earth-blue-marble.jpg",
  "/textures/earth-night.jpg",
  "/textures/earth-topology.png",
  "/textures/earth-water.png",
];

type EarthProps = {
  onReady: () => void;
};

export const Earth = forwardRef(function Earth(
  { onReady }: EarthProps,
  ref: ForwardedRef<Mesh>,
) {
  const gl = useThree((state) => state.gl);
  const [dayTexture, cityLightsTexture, bumpTexture, waterTexture] = useTexture(
    EARTH_TEXTURES,
  ) as Texture[];

  useEffect(() => {
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

    dayTexture.colorSpace = SRGBColorSpace;
    cityLightsTexture.colorSpace = SRGBColorSpace;

    [dayTexture, cityLightsTexture, bumpTexture, waterTexture].forEach((texture) => {
      texture.anisotropy = maxAnisotropy;
      texture.needsUpdate = true;
    });

    onReady();
  }, [bumpTexture, cityLightsTexture, dayTexture, gl, onReady, waterTexture]);

  return (
    <group>
      <mesh ref={ref} renderOrder={0}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshStandardMaterial
          bumpMap={bumpTexture}
          bumpScale={0.018}
          color="white"
          emissive="#ff9a54"
          emissiveIntensity={0.7}
          emissiveMap={cityLightsTexture}
          map={dayTexture}
          metalness={0}
          roughness={0.96}
        />
      </mesh>

      <mesh renderOrder={1}>
        <sphereGeometry args={[EARTH_RADIUS * 1.0015, 96, 96]} />
        <meshBasicMaterial
          alphaMap={waterTexture}
          color="#2e98d2"
          depthWrite={false}
          opacity={0.33}
          toneMapped
          transparent
        />
      </mesh>

      <mesh renderOrder={2}>
        <sphereGeometry args={[EARTH_RADIUS * 1.003, 96, 96]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ffc078"
          depthWrite={false}
          map={cityLightsTexture}
          opacity={1}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
});
