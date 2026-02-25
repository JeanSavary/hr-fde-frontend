"use client";

import useSWR from "swr";
import {
  DashboardMetrics,
  CallSummary,
  CallDetail,
  BookedLoad,
  LoadSearchResponse,
  Load,
  LoadListResponse,
  BookingsListResponse,
  NegotiationSettings,
  PaginatedResponse,
  AnalyticsData,
} from "./types";
import { REFRESH_INTERVALS } from "./constants";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
};

export function useDashboardMetrics(period?: string) {
  const qs = period ? `?period=${period}` : "";
  return useSWR<DashboardMetrics>(`/api/dashboard${qs}`, fetcher, {
    refreshInterval: REFRESH_INTERVALS.overview,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });
}

export function useCalls(params?: {
  outcome?: string;
  sentiment?: string;
  mc_number?: string;
  page?: number;
  page_size?: number;
  period?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.outcome) searchParams.set("outcome", params.outcome);
  if (params?.sentiment) searchParams.set("sentiment", params.sentiment);
  if (params?.mc_number) searchParams.set("mc_number", params.mc_number);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  if (params?.period) searchParams.set("period", params.period);
  const qs = searchParams.toString();

  return useSWR<PaginatedResponse<CallSummary>>(
    `/api/calls${qs ? `?${qs}` : ""}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVALS.callsList,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );
}

export function useCallDetail(callId: string) {
  return useSWR<CallDetail>(
    callId ? `/api/calls/${callId}` : null,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVALS.callDetail,
      revalidateOnFocus: true,
    }
  );
}

export function useBookings(params?: { page?: number; page_size?: number; period?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  if (params?.period) searchParams.set("period", params.period);
  const qs = searchParams.toString();

  return useSWR<BookingsListResponse>(
    `/api/bookings${qs ? `?${qs}` : ""}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVALS.bookings,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );
}

export function useLoads(filters: {
  origin?: string;
  equipment_type?: string;
  destination?: string;
  page?: number;
  page_size?: number;
  period?: string;
  sort_by?: string;
  sort_order?: string;
}) {
  // Build GET query params
  const params = new URLSearchParams();
  if (filters.origin?.trim()) params.set("origin", filters.origin.trim());
  if (filters.equipment_type) params.set("equipment_type", filters.equipment_type);
  if (filters.destination?.trim()) params.set("destination", filters.destination.trim());
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.period) params.set("period", filters.period);
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.sort_order) params.set("sort_order", filters.sort_order);
  const qs = params.toString();
  const key = `/api/loads${qs ? `?${qs}` : ""}`;

  return useSWR<LoadListResponse>(key, fetcher, {
    refreshInterval: REFRESH_INTERVALS.loads,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });
}

export function useLoad(loadId: string | null) {
  return useSWR<Load>(loadId ? `/api/loads/${loadId}` : null, fetcher, {
    revalidateOnFocus: false,
  });
}

export function useLoadSearch(filters: {
  origin?: string;
  equipment_type?: string;
  destination?: string;
}) {
  const hasOrigin = !!filters.origin?.trim();
  const body = {
    origin: filters.origin ?? "",
    equipment_type: filters.equipment_type || "dry_van",
    ...(filters.destination ? { destination: filters.destination } : {}),
  };
  const key = hasOrigin ? ["loads-search", JSON.stringify(body)] : null;

  const postFetcher = async (): Promise<LoadSearchResponse> => {
    const res = await fetch("/api/loads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  };

  return useSWR<LoadSearchResponse>(key, postFetcher, {
    refreshInterval: hasOrigin ? REFRESH_INTERVALS.loads : 0,
    revalidateOnFocus: hasOrigin,
  });
}

export function useSettings() {
  return useSWR<NegotiationSettings>("/api/settings", fetcher, {
    refreshInterval: REFRESH_INTERVALS.settings,
    revalidateOnFocus: false,
  });
}

export function useAnalytics() {
  return useSWR<AnalyticsData>("/api/analytics", fetcher, {
    refreshInterval: REFRESH_INTERVALS.analytics,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
}
