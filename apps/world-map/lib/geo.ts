import { Vector3 } from "three";

export const EARTH_RADIUS = 1;

const DEGREES_TO_RADIANS = Math.PI / 180;

export function latLngToVector3(lat: number, lng: number, radius: number) {
  const latitude = lat * DEGREES_TO_RADIANS;
  const longitude = lng * DEGREES_TO_RADIANS;
  const radiusAtLatitude = Math.cos(latitude) * radius;

  return new Vector3(
    radiusAtLatitude * Math.cos(longitude),
    Math.sin(latitude) * radius,
    -radiusAtLatitude * Math.sin(longitude),
  );
}
