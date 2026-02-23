// === Enums ===

export type CallOutcome =
  | "booked"
  | "negotiation_failed"
  | "no_loads_available"
  | "invalid_carrier"
  | "carrier_thinking"
  | "transferred_to_ops"
  | "dropped_call";

export type Sentiment =
  | "positive"
  | "neutral"
  | "frustrated"
  | "aggressive"
  | "confused";

export type EquipmentType =
  | "dry_van"
  | "reefer"
  | "flatbed"
  | "step_deck"
  | "power_only";

export type OfferType = "initial" | "counter" | "final";
export type OfferStatus = "pending" | "accepted" | "rejected" | "expired";
export type Verdict = "accept" | "counter" | "reject";

// === Backend API Types ===

export interface CallSummary {
  id: string;
  call_id: string;
  carrier_name: string | null;
  mc_number: string | null;
  lane_origin: string | null;
  lane_destination: string | null;
  equipment_type: string | null;
  outcome: CallOutcome;
  sentiment: Sentiment;
  duration_seconds: number | null;
  negotiation_rounds: number;
  initial_rate: number | null;
  final_rate: number | null;
  created_at: string;
}

export interface OfferSummary {
  id: string;
  load_id: string;
  carrier_name: string | null;
  mc_number: string | null;
  amount: number;
  offer_type: OfferType;
  status: OfferStatus;
  loadboard_rate: number | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_calls: number;
  avg_duration_seconds: number | null;
  calls_by_outcome: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  booking_rate_percent: number;
  avg_negotiation_rounds: number | null;
  avg_rate_differential_percent: number | null;
  total_revenue: number;
  unique_carriers: number;
  top_lanes: Array<{ lane: string; count: number }>;
  equipment_demand: Record<string, number>;
  recent_calls: CallSummary[];
  recent_offers: OfferSummary[];
}

export interface CallDetail {
  id: string;
  call_id: string;
  mc_number: string | null;
  carrier_name: string | null;
  lane_origin: string | null;
  lane_destination: string | null;
  equipment_type: string | null;
  load_id: string | null;
  initial_rate: number | null;
  final_rate: number | null;
  negotiation_rounds: number;
  carrier_phone: string | null;
  special_requests: string | null;
  outcome: CallOutcome;
  sentiment: Sentiment;
  duration_seconds: number | null;
  transcript: string | null;
  summary: string | null;
  key_points: string[] | null;
  created_at: string;
}

export interface BookedLoad {
  id: string;
  load_id: string;
  mc_number: string;
  carrier_name: string | null;
  agreed_rate: number;
  agreed_pickup_datetime: string | null;
  offer_id: string | null;
  call_id: string | null;
  created_at: string;
}

export interface Load {
  load_id: string;
  origin: string;
  origin_lat: number;
  origin_lng: number;
  destination: string;
  dest_lat: number;
  dest_lng: number;
  pickup_datetime: string;
  delivery_datetime: string;
  equipment_type: EquipmentType;
  loadboard_rate: number;
  notes: string;
  weight: number;
  commodity_type: string;
  num_of_pieces: number;
  miles: number;
  dimensions: string;
}

export interface NegotiationSettings {
  target_margin: number;
  min_margin: number;
  max_bump_above_loadboard: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// === HappyRobot Types (P2) ===

export interface HRRun {
  id: string;
  status: "scheduled" | "running" | "completed" | "canceled" | "failed";
  annotation: "correct" | "incorrect" | "critical" | null;
  timestamp: string;
  completed_at: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  data: Record<string, unknown>;
}

export interface HRMessage {
  id: string;
  role: "assistant" | "user" | "tool" | "event";
  content: string;
  is_filler: boolean;
  is_interrupted: boolean;
  tool_calls: unknown[] | null;
  latency_breakdown: {
    network: number;
    initial_wait: number;
    transcriber: number;
    eos: number;
    llm: number;
    tts: number;
  } | null;
  timestamp: string;
}

export interface HRSessionEvent {
  type: "session";
  id: string;
  duration: number | null;
  messages: HRMessage[];
  actions: unknown[];
  timestamp: string;
  sip_code: string | null;
  sip_reason: string | null;
}

export interface HRRunDetail extends HRRun {
  events: Array<HRSessionEvent | Record<string, unknown>>;
  issues: Array<{ id: string; type: string; message: string }>;
  version: Record<string, unknown> | null;
}

export interface HRRecording {
  session_id: string;
  url: string;
}
