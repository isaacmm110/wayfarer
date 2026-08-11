import { MOCK_DESTINATIONS } from "@/lib/mock-destinations";

export type AccentTone = "blue" | "green" | "amber" | "cyan" | "secondary";
export type CategoryIconName = "plane" | "sparkles" | "clock";

export type TrendPoint = {
  day: string;
  value: number;
};

export type CategoryStat = {
  label: string;
  value: string;
  tone: Extract<AccentTone, "blue" | "green" | "amber">;
  icon: CategoryIconName;
};

export type ConditionStat = {
  label: string;
  value: number;
  score: string;
  tone: Exclude<AccentTone, "cyan">;
};

export type SeasonStat = {
  label: string;
  value: number;
  tone: Extract<AccentTone, "green" | "amber">;
};

// MOCK DATA — TODO: replace every export in this file with live API data.
export const NAV_MOCK = {
  breadcrumbs: ["Explore", "World", "Live"],
  searchPlaceholder: "Search a destination or vibe...",
  liveLabel: "Live",
} as const;

export const TRENDING_MOCK = {
  title: "Trending Right Now",
  metricLabel: "City count",
  metricValue: 12,
  metricUnit: "destinations",
  trend: [
    { day: "Mon", value: 7 },
    { day: "Tue", value: 8 },
    { day: "Wed", value: 7.5 },
    { day: "Thu", value: 10 },
    { day: "Fri", value: 9.5 },
    { day: "Sat", value: 11 },
    { day: "Sun", value: 12 },
  ] satisfies TrendPoint[],
} as const;

export const CATEGORY_MOCK = {
  title: "Discovery Signals",
  items: [
    { label: "Best Weather", value: "18 spots", tone: "blue", icon: "plane" },
    { label: "Trending Up", value: "9 spots", tone: "green", icon: "sparkles" },
    { label: "Best Value", value: "14 spots", tone: "amber", icon: "clock" },
  ] satisfies CategoryStat[],
} as const;

const lisbon = MOCK_DESTINATIONS.find(({ name }) => name === "Lisbon")!;

export const TOP_PICK_MOCK = {
  title: "Top Pick This Week",
  destination: `${lisbon.name}, ${lisbon.country}`,
  trendLabel: "Weekly",
  trendValue: "+12%",
  trend: [
    { day: "Mon", value: 42 },
    { day: "Tue", value: 45 },
    { day: "Wed", value: 44 },
    { day: "Thu", value: 52 },
    { day: "Fri", value: 55 },
    { day: "Sat", value: 59 },
    { day: "Sun", value: 64 },
  ] satisfies TrendPoint[],
} as const;

export const CONDITIONS_MOCK = {
  title: "Conditions by Category",
  items: [
    { label: "Weather", value: 88, score: "8.8 / 10", tone: "blue" },
    { label: "Price", value: 74, score: "7.4 / 10", tone: "green" },
    { label: "Crowds", value: 56, score: "5.6 / 10", tone: "secondary" },
    { label: "Safety", value: 82, score: "8.2 / 10", tone: "amber" },
  ] satisfies ConditionStat[],
} as const;

export const SEASON_MOCK = {
  title: "Season Window",
  items: [
    { label: "Ideal Now", value: 78, tone: "green" },
    { label: "Shoulder Season", value: 22, tone: "amber" },
  ] satisfies SeasonStat[],
} as const;
