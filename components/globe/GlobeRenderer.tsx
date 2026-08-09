"use client";

import type { MutableRefObject } from "react";
import ReactGlobe, {
  type GlobeMethods,
  type GlobeProps,
} from "react-globe.gl";

export type GlobeRendererProps = GlobeProps & {
  globeRef: MutableRefObject<GlobeMethods | undefined>;
};

export default function GlobeRenderer({
  globeRef,
  ...props
}: GlobeRendererProps) {
  return <ReactGlobe ref={globeRef} {...props} />;
}
