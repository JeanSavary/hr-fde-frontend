import { CallOutcome, Sentiment, EquipmentType } from "./types";

export const OUTCOME_CONFIG: Record<CallOutcome, { label: string; bg: string; text: string }> = {
  booked: { label: "Booked", bg: "bg-emerald-50", text: "text-emerald-700" },
  negotiation_failed: { label: "Failed", bg: "bg-amber-50", text: "text-amber-700" },
  no_loads_available: { label: "No Loads", bg: "bg-gray-100", text: "text-gray-600" },
  invalid_carrier: { label: "Invalid", bg: "bg-rose-50", text: "text-rose-700" },
  carrier_thinking: { label: "Thinking", bg: "bg-sky-50", text: "text-sky-700" },
  transferred_to_ops: { label: "Transferred", bg: "bg-violet-50", text: "text-violet-700" },
  dropped_call: { label: "Dropped", bg: "bg-red-50", text: "text-red-700" },
};

export const SENTIMENT_CONFIG: Record<Sentiment, { label: string; bg: string; text: string; border: string }> = {
  positive: { label: "Positive", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  neutral: { label: "Neutral", bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
  frustrated: { label: "Frustrated", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  aggressive: { label: "Aggressive", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  confused: { label: "Confused", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
};

export const EQUIPMENT_CONFIG: Record<EquipmentType, { label: string }> = {
  dry_van: { label: "Dry Van" },
  reefer: { label: "Reefer" },
  flatbed: { label: "Flatbed" },
  step_deck: { label: "Step Deck" },
  power_only: { label: "Power Only" },
};

export const CHART_COLORS = [
  "#4F46E5", "#059669", "#D97706", "#E11D48", "#0284C7", "#7C3AED", "#64748B",
];

export const OUTCOME_CHART_COLORS: Record<string, string> = {
  booked: "#059669",
  negotiation_failed: "#D97706",
  no_loads_available: "#9CA3AF",
  invalid_carrier: "#E11D48",
  carrier_thinking: "#0284C7",
  transferred_to_ops: "#7C3AED",
  dropped_call: "#BE123C",
};

export const SENTIMENT_CHART_COLORS: Record<string, string> = {
  positive: "#059669",
  neutral: "#9CA3AF",
  frustrated: "#D97706",
  aggressive: "#E11D48",
  confused: "#7C3AED",
};

export const EQUIPMENT_BADGE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  dry_van: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  reefer: { bg: "bg-cyan-50", text: "text-teal-600", border: "border-cyan-200" },
  flatbed: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  step_deck: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  power_only: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
};

export const URGENCY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: "Critical", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  high: { label: "High", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  normal: { label: "Normal", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
};

export const CALL_STATUS_COLORS: Record<string, string> = {
  live: "#34d399",
  booked: "#6366f1",
  transferred: "#f0913b",
  declined: "#f25c54",
  no_match: "#94a3b8",
  auth_failed: "#f0913b",
};

export const REFRESH_INTERVALS = {
  overview: 10_000,
  callsList: 20_000,
  callDetail: 30_000,
  bookings: 20_000,
  loads: 20_000,
  settings: 0,
  analytics: 30_000,
} as const;
