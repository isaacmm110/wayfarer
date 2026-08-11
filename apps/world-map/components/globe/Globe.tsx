"use client";

import dynamic from "next/dynamic";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { GlobeMethods } from "react-globe.gl";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BackSide,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";

import { GlassCard } from "@/components/ui/glass-card";
import {
  MOCK_DESTINATIONS,
  type Destination,
} from "@/lib/mock-destinations";
import {
  MOCK_AMBIENT_NETWORK_NODES,
  MOCK_AMBIENT_NETWORK_PATHS,
  MOCK_DESTINATION_ARCS,
} from "@/lib/mock-globe-network";

import { GlobeMarker } from "./GlobeMarker";
import type { GlobeRendererProps } from "./GlobeRenderer";

const ReactGlobe = dynamic<GlobeRendererProps>(
  () => import("./GlobeRenderer"),
  { ssr: false, loading: () => null },
);

// Local copies of the Earth surface assets bundled with three-globe.
const EARTH_DAY_TEXTURE_URL = "/textures/earth-blue-marble.jpg";
const EARTH_NIGHT_TEXTURE_URL = "/textures/earth-night.jpg";
const EARTH_BUMP_TEXTURE_URL = "/textures/earth-topology.png";
const EARTH_SPECULAR_TEXTURE_URL = "/textures/earth-water.png";
const EARTH_CLOUDS_TEXTURE_URL = "/textures/earth-clouds.png";
const CLOUD_ALTITUDE = 0.008;
const CLOUD_ROTATION_SPEED = -0.000006;
const ATMOSPHERE_ALTITUDE = 0.036;
const AUTO_ROTATION_SPEED = 0.8;
const ROTATION_RESUME_DELAY = 2_000;
const INITIAL_GLOBE_ALTITUDE = 3.05;
const FOCUSED_GLOBE_ALTITUDE = 1.15;
const MARKER_ALTITUDE = 0.024;
const DEFAULT_POINT_OF_VIEW = {
  lat: 0,
  lng: 20,
  altitude: INITIAL_GLOBE_ALTITUDE,
} as const;

const KEY_LIGHT_POSITION = new Vector3(-2.2, 1.15, 2.8);
const KEY_LIGHT_DIRECTION = KEY_LIGHT_POSITION.clone().normalize();

const EARTH_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D bumpTexture;
  uniform sampler2D waterTexture;
  uniform vec2 bumpTexelSize;
  uniform vec3 lightDirection;
  uniform vec3 atmosphereColor;
  uniform float bumpStrength;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  #include <common>

  void main() {
    vec3 baseNormal = normalize(vWorldNormal);
    vec3 tangentAxis = abs(baseNormal.y) < 0.98
      ? vec3(0.0, 1.0, 0.0)
      : vec3(1.0, 0.0, 0.0);
    vec3 tangent = normalize(cross(tangentAxis, baseNormal));
    vec3 bitangent = normalize(cross(baseNormal, tangent));

    float centerHeight = texture2D(bumpTexture, vUv).r;
    float eastHeight = texture2D(
      bumpTexture,
      vUv + vec2(bumpTexelSize.x, 0.0)
    ).r;
    float northHeight = texture2D(
      bumpTexture,
      vUv + vec2(0.0, bumpTexelSize.y)
    ).r;
    vec3 surfaceNormal = normalize(
      baseNormal
      + tangent * (centerHeight - eastHeight) * bumpStrength
      + bitangent * (centerHeight - northHeight) * bumpStrength
    );

    vec3 sunDirection = normalize(lightDirection);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float sunAmount = dot(surfaceNormal, sunDirection);
    float dayBlend = smoothstep(-0.16, 0.2, sunAmount);

    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
    float cityLight = max(nightColor.r, max(nightColor.g, nightColor.b));
    float daylight = 0.34 + max(sunAmount, 0.0) * 0.78;
    vec3 litDay = dayColor * daylight;
    vec3 litNight = nightColor * (
      0.82 + smoothstep(0.16, 0.82, cityLight) * 0.72
    );
    vec3 surfaceColor = mix(litNight, litDay, dayBlend);

    float waterMask = texture2D(waterTexture, vUv).r;
    vec3 halfDirection = normalize(sunDirection + viewDirection);
    float oceanHighlight = pow(
      max(dot(surfaceNormal, halfDirection), 0.0),
      42.0
    );
    oceanHighlight *= waterMask * dayBlend * 0.14;

    float fresnel = pow(
      1.0 - max(dot(surfaceNormal, viewDirection), 0.0),
      4.0
    );
    surfaceColor += vec3(oceanHighlight);
    surfaceColor += atmosphereColor * fresnel * 0.045;

    gl_FragColor = vec4(surfaceColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATMOSPHERE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 atmosphereColor;
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  #include <common>

  void main() {
    float grazingAngle = 1.0 - abs(dot(
      normalize(vViewNormal),
      normalize(vViewDirection)
    ));
    float limb = smoothstep(0.24, 1.0, pow(grazingAngle, 2.35));
    gl_FragColor = vec4(atmosphereColor * (0.52 + limb * 0.72), limb * 0.48);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

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
  selectedDestination?: Destination | null;
  onDestinationSelect?: (destination: Destination) => void;
};

type AccentColors = {
  blue: string;
  cyan: string;
  red: string;
};

function withAlpha(color: string, alpha: number) {
  const normalized = color.replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return color;
  }

  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

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
  selectedDestination = null,
  onDestinationSelect,
}: GlobePropsInternal) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods>();
  const controlsRef = useRef<ReturnType<GlobeMethods["controls"]> | null>(
    null,
  );
  const markerRootsRef = useRef(new Map<string, MarkerRoot>());
  const bannerElementsRef = useRef(new Map<string, HTMLButtonElement>());
  const resumeTimeoutRef = useRef<number>();
  const resetTimeoutRef = useRef<number>();
  const isDraggingRef = useRef(false);
  const isSelectionActiveRef = useRef(false);
  const hasInitializedGlobeRef = useRef(false);
  const lastAppliedSelectionRef = useRef<string | null>(null);
  const [size, setSize] = useState<GlobeSize>({ width: 0, height: 0 });
  const [accentColors, setAccentColors] = useState<AccentColors>({
    blue: "",
    cyan: "",
    red: "",
  });
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [areSurfaceTexturesReady, setAreSurfaceTexturesReady] =
    useState(false);

  const globeMaterial = useMemo(() => {
    if (!accentColors.cyan) {
      return null;
    }

    return new ShaderMaterial({
      uniforms: {
        dayTexture: { value: null },
        nightTexture: { value: null },
        bumpTexture: { value: null },
        waterTexture: { value: null },
        bumpTexelSize: { value: new Vector2(1 / 2048, 1 / 1024) },
        lightDirection: { value: KEY_LIGHT_DIRECTION.clone() },
        atmosphereColor: { value: new Color(accentColors.cyan) },
        bumpStrength: { value: 13 },
      },
      vertexShader: EARTH_VERTEX_SHADER,
      fragmentShader: EARTH_FRAGMENT_SHADER,
      toneMapped: true,
    });
  }, [accentColors.cyan]);

  const arcColors = useMemo(
    () => [
      withAlpha(accentColors.cyan, 0.58),
      withAlpha(accentColors.red, 0.44),
    ],
    [accentColors.cyan, accentColors.red],
  );

  const networkNodeColor = useMemo(
    () => withAlpha(accentColors.cyan, 0.46),
    [accentColors.cyan],
  );

  const getNetworkNodeColor = useCallback(
    () => networkNodeColor,
    [networkNodeColor],
  );

  const networkPathColors = useMemo(
    () => [
      withAlpha(accentColors.cyan, 0.08),
      withAlpha(accentColors.cyan, 0.32),
      withAlpha(accentColors.blue, 0.08),
    ],
    [accentColors.blue, accentColors.cyan],
  );

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current !== undefined) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = undefined;
    }
  }, []);

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current !== undefined) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
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

    if (isSelectionActiveRef.current || isDraggingRef.current) {
      return;
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      if (controlsRef.current && !isSelectionActiveRef.current) {
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
      isSelectionActiveRef.current = true;
      clearResetTimeout();
      pauseRotation();
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      onDestinationSelect?.(destination);
    },
    [clearResetTimeout, onDestinationSelect, pauseRotation],
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
          registerBanner={(banner) => {
            if (banner) {
              bannerElementsRef.current.set(destination.name, banner);
            } else {
              bannerElementsRef.current.delete(destination.name);
            }
          }}
        />,
      );

      markerRootsRef.current.set(destination.name, { element, root });
      return element;
    },
    [handleDestinationSelect],
  );

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    const controls = globe?.controls();

    if (!globe || !controls || hasInitializedGlobeRef.current) {
      return;
    }

    hasInitializedGlobeRef.current = true;
    setIsGlobeReady(true);
    controlsRef.current = controls;
    isSelectionActiveRef.current = Boolean(selectedDestination);
    controls.enabled = !selectedDestination;
    controls.autoRotate = !selectedDestination;
    controls.autoRotateSpeed = AUTO_ROTATION_SPEED;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.addEventListener("start", handleControlStart);
    controls.addEventListener("end", handleControlEnd);
    controls.update();

    const renderer = globe.renderer();

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;

    const ambientLight = new AmbientLight(accentColors.blue, 0.58);
    const hemisphereLight = new HemisphereLight(
      accentColors.cyan,
      accentColors.blue,
      1.05,
    );
    const keyLight = new DirectionalLight(0xffffff, 2.35);

    keyLight.position.copy(KEY_LIGHT_POSITION);
    globe.lights([ambientLight, hemisphereLight, keyLight]);

    const nextView = selectedDestination
      ? {
          lat: selectedDestination.lat,
          lng: selectedDestination.lng,
          altitude: FOCUSED_GLOBE_ALTITUDE,
        }
      : DEFAULT_POINT_OF_VIEW;

    lastAppliedSelectionRef.current = selectedDestination?.name ?? null;
    globe.pointOfView(nextView, 0);
  }, [
    accentColors.blue,
    accentColors.cyan,
    handleControlEnd,
    handleControlStart,
    selectedDestination,
  ]);

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
    const rootStyles = getComputedStyle(document.documentElement);

    setAccentColors({
      blue: rootStyles.getPropertyValue("--accent-blue").trim(),
      cyan: rootStyles.getPropertyValue("--accent-cyan").trim(),
      red: rootStyles.getPropertyValue("--accent-red").trim(),
    });
  }, []);

  useEffect(() => {
    const isConfiguredForInitialization = Boolean(
      size.width > 0 &&
        size.height > 0 &&
        accentColors.blue &&
        accentColors.cyan &&
        accentColors.red &&
        globeMaterial,
    );

    if (isGlobeReady || !isConfiguredForInitialization) {
      return;
    }

    let animationFrame = 0;

    const initializeWhenRefIsReady = () => {
      handleGlobeReady();

      if (!hasInitializedGlobeRef.current) {
        animationFrame = window.requestAnimationFrame(initializeWhenRefIsReady);
      }
    };

    animationFrame = window.requestAnimationFrame(initializeWhenRefIsReady);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [
    accentColors.blue,
    accentColors.cyan,
    accentColors.red,
    globeMaterial,
    handleGlobeReady,
    isGlobeReady,
    size.height,
    size.width,
  ]);

  useEffect(() => {
    if (!isGlobeReady) {
      return;
    }

    const nextSelectionKey = selectedDestination?.name ?? null;

    if (lastAppliedSelectionRef.current === nextSelectionKey) {
      return;
    }

    const globe = globeRef.current;
    const controls = controlsRef.current;

    if (!globe || !controls) {
      return;
    }

    clearResumeTimeout();
    clearResetTimeout();
    lastAppliedSelectionRef.current = nextSelectionKey;
    isSelectionActiveRef.current = Boolean(selectedDestination);

    if (selectedDestination) {
      controls.autoRotate = false;
      controls.enabled = false;
      globe.pointOfView(
        {
          lat: selectedDestination.lat,
          lng: selectedDestination.lng,
          altitude: FOCUSED_GLOBE_ALTITUDE,
        },
        1_250,
      );
      return;
    }

    controls.enabled = false;
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = false;
    globe.pointOfView(DEFAULT_POINT_OF_VIEW, 1_250);

    resetTimeoutRef.current = window.setTimeout(() => {
      controls.enabled = true;
      controls.update();
      controls.autoRotate = true;
      resetTimeoutRef.current = undefined;
    }, 1_250);
  }, [
    clearResetTimeout,
    clearResumeTimeout,
    isGlobeReady,
    selectedDestination,
  ]);

  useEffect(() => {
    if (!isGlobeReady || !globeMaterial) {
      return;
    }

    const globe = globeRef.current;

    if (!globe) {
      return;
    }

    let isDisposed = false;
    const loadedTextures: Texture[] = [];
    const textureLoader = new TextureLoader();
    const maxAnisotropy = Math.min(
      8,
      globe.renderer().capabilities.getMaxAnisotropy(),
    );
    const loadTexture = (url: string) =>
      textureLoader.loadAsync(url).then((texture) => {
        loadedTextures.push(texture);
        return texture;
      });

    setAreSurfaceTexturesReady(false);

    void Promise.all([
      loadTexture(EARTH_DAY_TEXTURE_URL),
      loadTexture(EARTH_NIGHT_TEXTURE_URL),
      loadTexture(EARTH_BUMP_TEXTURE_URL),
      loadTexture(EARTH_SPECULAR_TEXTURE_URL),
    ])
      .then(([dayTexture, nightTexture, bumpTexture, waterTexture]) => {
        if (isDisposed) {
          return;
        }

        dayTexture.colorSpace = SRGBColorSpace;
        nightTexture.colorSpace = SRGBColorSpace;

        loadedTextures.forEach((texture) => {
          texture.anisotropy = maxAnisotropy;
        });

        const bumpImage = bumpTexture.image as {
          width?: number;
          height?: number;
        };
        const bumpWidth = bumpImage.width ?? 2048;
        const bumpHeight = bumpImage.height ?? 1024;

        globeMaterial.uniforms.dayTexture.value = dayTexture;
        globeMaterial.uniforms.nightTexture.value = nightTexture;
        globeMaterial.uniforms.bumpTexture.value = bumpTexture;
        globeMaterial.uniforms.waterTexture.value = waterTexture;
        globeMaterial.uniforms.bumpTexelSize.value.set(
          1 / bumpWidth,
          1 / bumpHeight,
        );
        setAreSurfaceTexturesReady(true);
      })
      .catch(() => {
        if (!isDisposed) {
          setAreSurfaceTexturesReady(false);
        }
      });

    return () => {
      isDisposed = true;
      loadedTextures.forEach((texture) => texture.dispose());
      globeMaterial.uniforms.dayTexture.value = null;
      globeMaterial.uniforms.nightTexture.value = null;
      globeMaterial.uniforms.bumpTexture.value = null;
      globeMaterial.uniforms.waterTexture.value = null;
    };
  }, [globeMaterial, isGlobeReady]);

  useEffect(() => {
    if (!isGlobeReady || !accentColors.cyan) {
      return;
    }

    const globe = globeRef.current;

    if (!globe) {
      return;
    }

    let isDisposed = false;
    let animationFrame = 0;
    let cloudTexture: Texture | null = null;
    let previousFrameTime = performance.now();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const textureLoader = new TextureLoader();
    const maxAnisotropy = Math.min(
      8,
      globe.renderer().capabilities.getMaxAnisotropy(),
    );
    const cloudGeometry = new SphereGeometry(
      globe.getGlobeRadius() * (1 + CLOUD_ALTITUDE),
      64,
      64,
    );
    const cloudMaterial = new MeshPhongMaterial({
      alphaTest: 0.02,
      depthWrite: false,
      opacity: 0.26,
      transparent: true,
    });
    const cloudMesh = new Mesh(cloudGeometry, cloudMaterial);
    const atmosphereGeometry = new SphereGeometry(
      globe.getGlobeRadius() * (1 + ATMOSPHERE_ALTITUDE),
      64,
      64,
    );
    const atmosphereMaterial = new ShaderMaterial({
      blending: AdditiveBlending,
      depthWrite: false,
      fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
      side: BackSide,
      toneMapped: true,
      transparent: true,
      uniforms: {
        atmosphereColor: { value: new Color(accentColors.cyan) },
      },
      vertexShader: ATMOSPHERE_VERTEX_SHADER,
    });
    const atmosphereMesh = new Mesh(
      atmosphereGeometry,
      atmosphereMaterial,
    );

    cloudMesh.visible = false;
    cloudMesh.renderOrder = 1;
    atmosphereMesh.renderOrder = 2;
    globe.scene().add(cloudMesh, atmosphereMesh);

    textureLoader.load(
      EARTH_CLOUDS_TEXTURE_URL,
      (texture) => {
        if (isDisposed) {
          texture.dispose();
          return;
        }

        texture.anisotropy = maxAnisotropy;
        texture.colorSpace = SRGBColorSpace;
        cloudTexture = texture;
        cloudMaterial.map = texture;
        cloudMaterial.needsUpdate = true;
        cloudMesh.visible = true;
      },
      undefined,
      () => undefined,
    );

    const rotateClouds = (frameTime: number) => {
      const elapsed = Math.min(50, frameTime - previousFrameTime);

      previousFrameTime = frameTime;
      if (!prefersReducedMotion && !isSelectionActiveRef.current) {
        cloudMesh.rotation.y += elapsed * CLOUD_ROTATION_SPEED;
      }
      animationFrame = window.requestAnimationFrame(rotateClouds);
    };

    animationFrame = window.requestAnimationFrame(rotateClouds);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrame);
      globe.scene().remove(cloudMesh, atmosphereMesh);

      cloudTexture?.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
    };
  }, [accentColors.cyan, isGlobeReady]);

  useEffect(() => {
    if (!isGlobeReady) {
      return;
    }

    let animationFrame = 0;
    const cameraDirection = new Vector3();
    const pointDirection = new Vector3();

    const updateBannerVisibility = () => {
      const globe = globeRef.current;

      if (globe) {
        globe.camera().getWorldPosition(cameraDirection).normalize();

        MOCK_DESTINATIONS.forEach((destination) => {
          const banner = bannerElementsRef.current.get(destination.name);

          if (!banner) {
            return;
          }

          const point = globe.getCoords(
            destination.lat,
            destination.lng,
            MARKER_ALTITUDE,
          );
          pointDirection.set(point.x, point.y, point.z).normalize();

          const facing = pointDirection.dot(cameraDirection);
          const opacity = Math.min(1, Math.max(0, (facing + 0.04) / 0.18));

          banner.style.opacity = opacity.toFixed(3);
          banner.style.pointerEvents = opacity > 0.24 ? "auto" : "none";
        });
      }

      animationFrame = window.requestAnimationFrame(updateBannerVisibility);
    };

    updateBannerVisibility();

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isGlobeReady]);

  useEffect(
    () => () => {
      globeMaterial?.dispose();
    },
    [globeMaterial],
  );

  useEffect(() => {
    const markerRoots = markerRootsRef.current;
    const bannerElements = bannerElementsRef.current;

    return () => {
      clearResumeTimeout();
      clearResetTimeout();

      if (controlsRef.current) {
        controlsRef.current.removeEventListener("start", handleControlStart);
        controlsRef.current.removeEventListener("end", handleControlEnd);
        controlsRef.current = null;
      }

      markerRoots.forEach(({ root }) => root.unmount());
      markerRoots.clear();
      bannerElements.clear();
    };
  }, [
    clearResetTimeout,
    clearResumeTimeout,
    handleControlEnd,
    handleControlStart,
  ]);

  const isConfigured = Boolean(
    size.width > 0 &&
      size.height > 0 &&
      accentColors.blue &&
      accentColors.cyan &&
      accentColors.red &&
      globeMaterial,
  );
  const isRendered = isGlobeReady && areSurfaceTexturesReady;

  return (
    <div
      ref={containerRef}
      className={`relative size-full touch-none ${
        selectedDestination
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing"
      } ${className}`.trim()}
    >
      {isConfigured ? (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isRendered
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <ReactGlobe
            globeRef={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={null}
            bumpImageUrl={null}
            globeMaterial={globeMaterial ?? undefined}
            waitForGlobeReady={false}
            showAtmosphere={false}
            arcsData={MOCK_DESTINATION_ARCS}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor={arcColors}
            arcAltitudeAutoScale={0.2}
            arcStroke={0.3}
            arcDashLength={0.28}
            arcDashGap={0.72}
            arcDashInitialGap="dashOffset"
            arcDashAnimateTime={9_000}
            arcsTransitionDuration={0}
            pointsData={MOCK_AMBIENT_NETWORK_NODES}
            pointLat="lat"
            pointLng="lng"
            pointAltitude="altitude"
            pointRadius="radius"
            pointColor={getNetworkNodeColor}
            pointResolution={5}
            pointsMerge
            pointsTransitionDuration={0}
            pathsData={MOCK_AMBIENT_NETWORK_PATHS}
            pathPoints="points"
            pathPointLat="lat"
            pathPointLng="lng"
            pathPointAlt="altitude"
            pathColor={networkPathColors}
            pathStroke={0.1}
            pathResolution={2}
            pathTransitionDuration={0}
            htmlElementsData={MOCK_DESTINATIONS}
            htmlLat="lat"
            htmlLng="lng"
            htmlAltitude={MARKER_ALTITUDE}
            htmlElement={createMarkerElement}
            htmlTransitionDuration={0}
            enablePointerInteraction
            showPointerCursor={false}
            onGlobeReady={handleGlobeReady}
          />
        </div>
      ) : null}

      {!isRendered ? <GlobeLoading /> : null}
    </div>
  );
});
