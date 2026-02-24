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

export type LoadUrgency = "critical" | "high" | "normal";
export type LoadStatus = "matching" | "available" | "booked";
export type AgentTone = "professional" | "friendly" | "direct";

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
  offer_id: string;
  call_id: string | null;
  load_id: string;
  mc_number: string | null;
  offer_amount: number;
  offer_type: OfferType;
  round_number: number;
  status: OfferStatus;
  notes: string | null;
  created_at: string;
  original_rate: number | null;
  rate_difference: number | null;
  rate_difference_pct: number | null;
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

  // v6 fields (optional — graceful degradation)
  calls_today?: number;
  calls_trend?: string;
  booked_today?: number;
  booked_trend?: string;
  revenue_today?: number;
  revenue_trend?: string;
  conversion_rate?: number;
  conversion_trend?: string;
  pending_transfer?: number;
  funnel_data?: Array<{ stage: string; count: number; pct: number }>;
  rate_intelligence?: {
    avg_loadboard: number | null;
    avg_agreed: number | null;
    discount_pct: number | null;
    margin_pct: number | null;
  } | null;
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

  // v6 fields
  lane_origin?: string | null;
  lane_destination?: string | null;
  equipment_type?: string | null;
  loadboard_rate?: number | null;
  margin?: number | null;
  negotiation_rounds?: number | null;
  sentiment?: Sentiment | null;
  booked_at?: string | null;
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
  rate_per_mile?: number;
  deadhead_miles?: number;
  deadend_miles?: number;
  floor_rate?: number;
  max_rate?: number;
  differences?: string[];

  // v6 fields
  urgency?: LoadUrgency;
  pitch_count?: number;
  days_listed?: number;
  status?: LoadStatus;
}

export interface LoadListResponse {
  loads: Load[];
  total: number;
  page: number;
  page_size: number;
  kpi_total_loads?: number;
  kpi_critical_count?: number;
  kpi_avg_rate_per_mile?: number;
}

export interface BookingsListResponse {
  items: BookedLoad[];
  total: number;
  page: number;
  page_size: number;
  kpi_total_bookings?: number;
  kpi_total_revenue?: number;
  kpi_avg_margin?: number | null;
  kpi_avg_rounds?: number | null;
}

export interface LoadSearchResponse {
  loads: Load[];
  alternative_loads: Load[];
  origin_resolved: { type: string; label: string; lat: number; lng: number } | null;
  destination_resolved: { type: string; label: string; lat: number; lng: number } | null;
  radius_miles: number;
  total_found: number;
  total_alternatives: number;
}

export interface NegotiationSettings {
  target_margin: number;
  min_margin: number;
  max_bump_above_loadboard: number;

  // v6 extended fields
  max_negotiation_rounds?: number;
  max_offers_per_call?: number;
  auto_transfer_threshold?: number;
  deadhead_warning_miles?: number;
  floor_rate_protection?: boolean;
  sentiment_escalation?: boolean;
  prioritize_perishables?: boolean;
  agent_greeting?: string;
  agent_tone?: AgentTone;
}

export interface PaginatedResponse<T> {
  calls: T[];
  total: number;
  page: number;
  page_size: number;
  kpi_total_calls?: number;
  kpi_booking_rate?: number;
  kpi_avg_duration?: number;
  kpi_total_duration?: number;
  kpi_avg_negotiation_pct?: number;
}

// === Analytics Types ===

export interface AnalyticsData {
  negotiation_depth: Array<{ round: string; pct: number }>;
  carrier_objections: Array<{ reason: string; count: number; pct: number }>;
  top_lanes: Array<{ lane: string; calls: number; bookings: number; avg_rate: string }>;
  equipment_demand_supply: Array<{ type: string; demand: number; supply: number }>;
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
