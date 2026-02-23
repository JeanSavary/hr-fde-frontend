import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.BACKEND_API_KEY;

export async function GET(request: NextRequest) {
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const url = new URL("/api/dashboard/metrics", BACKEND_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
  });

  const raw = await res.json();
  if (!res.ok) return NextResponse.json(raw, { status: res.status });

  // Only forward fields the dashboard actually uses
  const data = {
    // KPI cards
    total_calls: raw.total_calls,
    total_revenue: raw.total_revenue,
    booking_rate_percent: raw.booking_rate_percent,
    calls_by_outcome: raw.calls_by_outcome,
    calls_today: raw.calls_today,
    calls_trend: raw.calls_trend,
    booked_today: raw.booked_today,
    booked_trend: raw.booked_trend,
    revenue_today: raw.revenue_today,
    revenue_trend: raw.revenue_trend,
    conversion_rate: raw.conversion_rate,
    conversion_trend: raw.conversion_trend,
    pending_transfer: raw.pending_transfer,

    // Sentiment chart
    sentiment_distribution: raw.sentiment_distribution,

    // Conversion funnel
    funnel_data: raw.funnel_data,

    // Rate intelligence
    rate_intelligence: raw.rate_intelligence,
    avg_rate_differential_percent: raw.avg_rate_differential_percent,

    // Call feed (only the fields each row needs)
    recent_calls: (raw.recent_calls ?? []).map(
      (c: Record<string, unknown>) => ({
        id: c.id,
        call_id: c.call_id,
        carrier_name: c.carrier_name,
        mc_number: c.mc_number,
        lane_origin: c.lane_origin,
        lane_destination: c.lane_destination,
        outcome: c.outcome,
        final_rate: c.final_rate,
        created_at: c.created_at,
      }),
    ),
  };

  return NextResponse.json(data);
}
