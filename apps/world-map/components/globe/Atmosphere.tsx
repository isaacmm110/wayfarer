"use client";

import { AdditiveBlending, BackSide } from "three";

import { EARTH_RADIUS } from "@/lib/geo";
import { accentCyan } from "@/lib/three-colors";

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 atmosphereColor;
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  #include <common>

  void main() {
    float grazingAngle = 1.0 - abs(dot(
      normalize(vViewNormal),
      normalize(vViewDirection)
    ));
    float limb = smoothstep(0.18, 1.0, pow(grazingAngle, 2.2));
    gl_FragColor = vec4(
      atmosphereColor * (0.44 + limb * 0.68),
      limb * 0.46
    );
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function Atmosphere() {
  return (
    <mesh renderOrder={4}>
      <sphereGeometry args={[EARTH_RADIUS * 1.06, 64, 64]} />
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={FRAGMENT_SHADER}
        side={BackSide}
        toneMapped
        transparent
        uniforms={{ atmosphereColor: { value: accentCyan.clone() } }}
        vertexShader={VERTEX_SHADER}
      />
    </mesh>
  );
}
