import {
  MOCK_DESTINATIONS,
  type Destination,
} from "@/lib/mock-destinations";

export type DestinationArc = {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  dashOffset: number;
};

export type AmbientNetworkNode = {
  id: string;
  lat: number;
  lng: number;
  altitude: number;
  radius: number;
};

export type AmbientNetworkPath = {
  id: string;
  points: readonly AmbientNetworkNode[];
};

// MOCK CONNECTIONS: replace these route pairs alongside the destination feed.
const MOCK_ROUTE_PAIRS = [
  ["Lisbon", "Reykjavik"],
  ["Lisbon", "Cape Town"],
  ["Cape Town", "Bali"],
  ["Bali", "Tokyo"],
  ["Tokyo", "Queenstown"],
] as const;

const destinationsByName = new Map<string, Destination>(
  MOCK_DESTINATIONS.map((destination) => [destination.name, destination]),
);

function getDestination(name: string) {
  const destination = destinationsByName.get(name);

  if (!destination) {
    throw new Error(`Unknown mock destination: ${name}`);
  }

  return destination;
}

export const MOCK_DESTINATION_ARCS: DestinationArc[] = MOCK_ROUTE_PAIRS.map(
  ([startName, endName], index) => {
    const start = getDestination(startName);
    const end = getDestination(endName);

    return {
      id: `${start.name}-${end.name}`,
      startLat: start.lat,
      startLng: start.lng,
      endLat: end.lat,
      endLng: end.lng,
      dashOffset: (index * 0.17) % 1,
    };
  },
);

// MOCK AMBIENT NETWORK: a deterministic, sparse instrument layer. These nodes
// are intentionally unrelated to destinations and can be replaced by live
// telemetry without changing the globe component.
export const MOCK_AMBIENT_NETWORK_NODES: AmbientNetworkNode[] = Array.from(
  { length: 28 },
  (_, index) => {
    const normalizedY = 1 - (index / 27) * 2;

    return {
      id: `ambient-node-${index + 1}`,
      lat: (Math.asin(normalizedY) * 180) / Math.PI,
      lng: ((index * 137.508 + 23) % 360) - 180,
      altitude: 0.013 + (index % 3) * 0.0015,
      radius: index % 5 === 0 ? 0.075 : 0.052,
    };
  },
);

const AMBIENT_CONNECTIONS = [
  [0, 5],
  [1, 8],
  [2, 10],
  [3, 7],
  [4, 12],
  [6, 14],
  [7, 15],
  [8, 17],
  [9, 13],
  [10, 19],
  [11, 16],
  [12, 21],
  [13, 23],
  [14, 20],
  [16, 24],
  [17, 26],
  [18, 25],
  [20, 27],
] as const;

export const MOCK_AMBIENT_NETWORK_PATHS: AmbientNetworkPath[] =
  AMBIENT_CONNECTIONS.map(([startIndex, endIndex], index) => ({
    id: `ambient-path-${index + 1}`,
    points: [
      MOCK_AMBIENT_NETWORK_NODES[startIndex],
      MOCK_AMBIENT_NETWORK_NODES[endIndex],
    ],
  }));
