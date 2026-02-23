"use client";

import useSWR from "swr";
import {
  DashboardMetrics,
  CallSummary,
  CallDetail,
  BookedLoad,
  Load,
  NegotiationSettings,
  PaginatedResponse,
} from "./types";
import { REFRESH_INTERVALS } from "./constants";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
};

export function useDashboardMetrics() {
  return useSWR<DashboardMetrics>("/api/dashboard", fetcher, {
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
}) {
  const searchParams = new URLSearchParams();
  if (params?.outcome) searchParams.set("outcome", params.outcome);
  if (params?.sentiment) searchParams.set("sentiment", params.sentiment);
  if (params?.mc_number) searchParams.set("mc_number", params.mc_number);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
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

export function useBookings() {
  return useSWR<BookedLoad[]>("/api/bookings", fetcher, {
    refreshInterval: REFRESH_INTERVALS.bookings,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });
}

export function useLoads(filters?: Record<string, unknown>) {
  const key = filters
    ? `/api/loads?${new URLSearchParams(filters as Record<string, string>).toString()}`
    : "/api/loads";
  return useSWR<Load[]>(key, fetcher, {
    refreshInterval: REFRESH_INTERVALS.loads,
    revalidateOnFocus: true,
  });
}

export function useSettings() {
  return useSWR<NegotiationSettings>("/api/settings", fetcher, {
    refreshInterval: REFRESH_INTERVALS.settings,
    revalidateOnFocus: false,
  });
}
