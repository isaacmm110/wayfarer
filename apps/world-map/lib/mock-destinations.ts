export type Destination = {
  name: string;
  country: string;
  lat: number;
  lng: number;
};

// MOCK DATA: replace this array with the real "best places right now" dataset.
export const MOCK_DESTINATIONS: Destination[] = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426 },
  {
    name: "Cape Town",
    country: "South Africa",
    lat: -33.9249,
    lng: 18.4241,
  },
  {
    name: "Queenstown",
    country: "New Zealand",
    lat: -45.0312,
    lng: 168.6626,
  },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { name: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889 },
];
