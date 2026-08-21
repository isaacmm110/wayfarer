"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { latLngToVector3 } from "@/lib/geo";
import type { Destination } from "@/lib/mock-destinations";

export const DEFAULT_CAMERA_POSITION = latLngToVector3(0, 20, 3.15);

const FOCUSED_CAMERA_DISTANCE = 2.28;
const TRANSITION_DURATION = 1.25;
const ROTATION_RESUME_DELAY = 2_000;
const ORIGIN = new Vector3();

type CameraRigProps = {
  selectedDestination: Destination | null;
};

type CameraTransition = {
  from: Vector3;
  to: Vector3;
  startedAt: number;
};

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function CameraRig({ selectedDestination }: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const transitionRef = useRef<CameraTransition | null>(null);
  const resumeTimeoutRef = useRef<number>();
  const selectedDestinationRef = useRef(selectedDestination);
  const hasMountedRef = useRef(false);
  const camera = useThree((state) => state.camera);
  const clock = useThree((state) => state.clock);
  const gl = useThree((state) => state.gl);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current !== undefined) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = undefined;
    }
  }, []);

  const handleDragStart = useCallback(() => {
    clearResumeTimeout();
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  }, [clearResumeTimeout]);

  const handleDragEnd = useCallback(() => {
    clearResumeTimeout();

    if (selectedDestinationRef.current) {
      return;
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      if (controlsRef.current && !selectedDestinationRef.current) {
        controlsRef.current.autoRotate = true;
      }
    }, ROTATION_RESUME_DELAY);
  }, [clearResumeTimeout]);

  useEffect(() => {
    const canvas = gl.domElement;
    let pointerStart: { pointerId: number; x: number; y: number } | null = null;
    let didDrag = false;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || selectedDestinationRef.current) {
        return;
      }

      pointerStart = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      didDrag = false;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerStart || pointerStart.pointerId !== event.pointerId || didDrag) {
        return;
      }

      if (
        Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y,
        ) >= 3
      ) {
        didDrag = true;
        handleDragStart();
      }
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!pointerStart || pointerStart.pointerId !== event.pointerId) {
        return;
      }

      if (didDrag) {
        handleDragEnd();
      }

      pointerStart = null;
      didDrag = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerEnd);
    canvas.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerEnd);
      canvas.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [gl, handleDragEnd, handleDragStart]);

  useEffect(() => {
    selectedDestinationRef.current = selectedDestination;

    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    clearResumeTimeout();

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      controls.autoRotate = !selectedDestination;
      controls.enabled = !selectedDestination;
      return;
    }

    controls.autoRotate = false;
    controls.enabled = false;
    transitionRef.current = {
      from: camera.position.clone(),
      to: selectedDestination
        ? latLngToVector3(
            selectedDestination.lat,
            selectedDestination.lng,
            FOCUSED_CAMERA_DISTANCE,
          )
        : DEFAULT_CAMERA_POSITION.clone(),
      startedAt: clock.elapsedTime,
    };
  }, [camera, clearResumeTimeout, clock, selectedDestination]);

  useEffect(
    () => () => {
      clearResumeTimeout();
    },
    [clearResumeTimeout],
  );

  useFrame(({ camera: activeCamera, clock: activeClock }) => {
    const transition = transitionRef.current;

    if (!transition) {
      return;
    }

    const progress = Math.min(
      1,
      (activeClock.elapsedTime - transition.startedAt) / TRANSITION_DURATION,
    );
    activeCamera.position.lerpVectors(
      transition.from,
      transition.to,
      easeInOutCubic(progress),
    );
    activeCamera.lookAt(ORIGIN);

    if (progress >= 1) {
      transitionRef.current = null;

      if (controlsRef.current && !selectedDestinationRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.autoRotate = true;
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={!selectedDestination}
      autoRotateSpeed={1.25}
      dampingFactor={0.075}
      enableDamping
      enablePan={false}
      enableZoom={false}
      makeDefault
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 2}
      rotateSpeed={0.62}
      target={[0, 0, 0]}
    />
  );
}
