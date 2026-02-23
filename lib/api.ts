import {
  DashboardMetrics,
  CallDetail,
  CallSummary,
  BookedLoad,
  Load,
  NegotiationSettings,
  PaginatedResponse,
  AnalyticsData,
} from "./types";

const BACKEND_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.BACKEND_API_KEY;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  if (!BACKEND_URL || !API_KEY) {
    throw new Error("BACKEND_API_URL and BACKEND_API_KEY must be set");
  }

  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return fetchApi<DashboardMetrics>("/api/dashboard/metrics");
}

export async function getCalls(params?: {
  outcome?: string;
  sentiment?: string;
  mc_number?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<CallSummary>> {
  const searchParams = new URLSearchParams();
  if (params?.outcome) searchParams.set("outcome", params.outcome);
  if (params?.sentiment) searchParams.set("sentiment", params.sentiment);
  if (params?.mc_number) searchParams.set("mc_number", params.mc_number);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return fetchApi<PaginatedResponse<CallSummary>>(`/api/calls${qs ? `?${qs}` : ""}`);
}

export async function getCallDetail(callId: string): Promise<CallDetail> {
  return fetchApi<CallDetail>(`/api/calls/${callId}`);
}

export async function getBookedLoads(): Promise<BookedLoad[]> {
  return fetchApi<BookedLoad[]>("/api/booked-loads");
}

export async function getLoad(loadId: string): Promise<Load> {
  return fetchApi<Load>(`/api/loads/${loadId}`);
}

export async function searchLoads(filters?: Record<string, unknown>): Promise<Load[]> {
  return fetchApi<Load[]>("/api/loads/search", {
    method: "POST",
    body: JSON.stringify(filters ?? {}),
  });
}

export async function getNegotiationSettings(): Promise<NegotiationSettings> {
  return fetchApi<NegotiationSettings>("/api/settings/negotiation");
}

export async function updateNegotiationSettings(
  settings: NegotiationSettings
): Promise<NegotiationSettings> {
  return fetchApi<NegotiationSettings>("/api/settings/negotiation", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function getHealthStatus(): Promise<boolean> {
  try {
    if (!BACKEND_URL) return false;
    const res = await fetch(`${BACKEND_URL}/health`, { next: { revalidate: 0 } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAnalytics(): Promise<AnalyticsData> {
  return fetchApi<AnalyticsData>("/api/analytics");
}
