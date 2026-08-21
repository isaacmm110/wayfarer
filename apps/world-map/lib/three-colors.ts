import { Color } from "three";

export const accentHex = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  cyan: "#22d3ee",
  red: "#ef4444",
} as const;

export const accentBlue = new Color(accentHex.blue);
export const accentGreen = new Color(accentHex.green);
export const accentAmber = new Color(accentHex.amber);
export const accentCyan = new Color(accentHex.cyan);
export const accentRed = new Color(accentHex.red);
