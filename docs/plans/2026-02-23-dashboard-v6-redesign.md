# Dashboard V6 Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the dashboard from the `dashboard_v6.jsx` mock into the existing Next.js 16 project, translating inline styles to Tailwind + shadcn/ui, adding react-leaflet for maps, and gracefully degrading when backend data is missing.

**Architecture:** Extend existing types with optional fields for new data. Update existing components and create new ones following current conventions (shadcn Card/Table/Badge, SWR hooks, Tailwind classes). Add one new page route (`/analytics`) and one new API proxy route. All new backend fields are optional so the UI works with current data.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, SWR, Recharts, react-leaflet (new), Lucide icons

**Reference file:** `dashboard_v6.jsx` at project root — this is the mock containing all page designs with mock data

---

## Task 1: Extend Type System & Constants

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/constants.ts`

**Step 1: Add new types and extend existing interfaces in `lib/types.ts`**

Add after the existing `EquipmentType` type (line 24):

```typescript
export type LoadUrgency = "critical" | "high" | "normal";
export type LoadStatus = "matching" | "available" | "booked";
export type AgentTone = "professional" | "friendly" | "direct";
```

Extend `DashboardMetrics` (line 65-79) — add these optional fields after `recent_offers`:

```typescript
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
    avg_loadboard: number;
    avg_agreed: number;
    discount_pct: number;
    margin_pct: number;
  };
```

Extend `BookedLoad` (line 104-114) — add optional fields after `created_at`:

```typescript
  // v6 fields
  lane_origin?: string | null;
  lane_destination?: string | null;
  equipment_type?: string | null;
  loadboard_rate?: number | null;
  margin?: number | null;
  negotiation_rounds?: number | null;
  sentiment?: Sentiment | null;
  booked_at?: string | null;
```

Extend `Load` (line 116-140) — add optional fields after `differences`:

```typescript
  // v6 fields
  urgency?: LoadUrgency;
  pitch_count?: number;
  days_listed?: number;
  status?: LoadStatus;
```

Note: Load already has `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`, `notes`, `num_of_pieces`, `dimensions` — these map to the mock's `origin_lat/lng`, `dest_lat/lng`, `notes`, `pieces`, `dims`.

Extend `NegotiationSettings` (line 152-156) — add optional fields:

```typescript
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
```

Add new Analytics types at the bottom (before HappyRobot types):

```typescript
// === Analytics Types ===

export interface AnalyticsData {
  negotiation_depth: Array<{ round: string; pct: number }>;
  carrier_objections: Array<{ reason: string; count: number; pct: number }>;
  top_lanes: Array<{ lane: string; calls: number; bookings: number; avg_rate: string }>;
  equipment_demand_supply: Array<{ type: string; demand: number; supply: number }>;
}
```

**Step 2: Add equipment badge colors and urgency config to `lib/constants.ts`**

Add after `SENTIMENT_CHART_COLORS` (line 49):

```typescript
export const EQUIPMENT_BADGE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  dry_van: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  reefer: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  flatbed: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  step_deck: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  power_only: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
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
```

Add `analytics` to `REFRESH_INTERVALS` (line 51-58):

```typescript
export const REFRESH_INTERVALS = {
  overview: 10_000,
  callsList: 20_000,
  callDetail: 30_000,
  bookings: 20_000,
  loads: 20_000,
  settings: 0,
  analytics: 30_000,
} as const;
```

**Step 3: Add EquipmentBadge and UrgencyBadge to `components/shared/status-badge.tsx`**

Add these after the existing `SentimentBadge`:

```typescript
import { EQUIPMENT_BADGE_CONFIG, URGENCY_CONFIG, EQUIPMENT_CONFIG } from "@/lib/constants";
import { EquipmentType } from "@/lib/types";

export function EquipmentBadge({ type }: { type: string }) {
  const config = EQUIPMENT_BADGE_CONFIG[type];
  const label = EQUIPMENT_CONFIG[type as EquipmentType]?.label ?? type;
  if (!config) return <span className="text-xs">{label}</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.bg, config.text, config.border)}>
      {label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = URGENCY_CONFIG[urgency];
  if (!config) return <span className="text-xs capitalize">{urgency}</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", config.bg, config.text, config.border)}>
      {config.label}
    </span>
  );
}
```

**Step 4: Verify build compiles**

Run: `npx next build 2>&1 | tail -5` (or `npm run build`)
Expected: Compiles without errors

**Step 5: Commit**

```bash
git add lib/types.ts lib/constants.ts components/shared/status-badge.tsx
git commit -m "feat: extend types and constants for dashboard v6"
```

---

## Task 2: Install react-leaflet & Add StatusDot Component

**Files:**
- Modify: `package.json` (via npm install)
- Create: `components/shared/status-dot.tsx`

**Step 1: Install react-leaflet**

```bash
npm install react-leaflet leaflet
npm install -D @types/leaflet
```

**Step 2: Create StatusDot component**

Create `components/shared/status-dot.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";
import { CALL_STATUS_COLORS } from "@/lib/constants";

interface StatusDotProps {
  status: string;
  animate?: boolean;
  className?: string;
}

export function StatusDot({ status, animate, className }: StatusDotProps) {
  const color = CALL_STATUS_COLORS[status] ?? "#94a3b8";
  const isLive = status === "live" || animate;

  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", isLive && "animate-pulse", className)}
      style={{ backgroundColor: color, boxShadow: isLive ? `0 0 0 3px ${color}22` : undefined }}
    />
  );
}
```

**Step 3: Commit**

```bash
git add package.json package-lock.json components/shared/status-dot.tsx
git commit -m "feat: add react-leaflet and StatusDot component"
```

---

## Task 3: Update Sidebar — Add Analytics Nav Item

**Files:**
- Modify: `components/layout/sidebar.tsx`

**Step 1: Add BarChart3 icon import and Analytics nav item**

In `components/layout/sidebar.tsx`, add `BarChart3` to the lucide imports (line 8), then add the analytics item to `navItems` array (between Loads and Settings, line 19-25):

```typescript
import {
  LayoutDashboard,
  Phone,
  Package,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/bookings", label: "Bookings", icon: Package },
  { href: "/loads", label: "Loads", icon: Truck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
```

**Step 2: Verify in browser — sidebar should now show 6 nav items**

**Step 3: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: add Analytics to sidebar navigation"
```

---

## Task 4: Rebuild Overview Page

**Files:**
- Modify: `components/dashboard/overview-client.tsx`
- Modify: `components/dashboard/kpi-cards.tsx`
- Create: `components/dashboard/conversion-funnel.tsx`
- Create: `components/dashboard/live-call-feed.tsx`
- Create: `components/dashboard/rate-intelligence.tsx`
- Modify: `components/dashboard/outcome-chart.tsx`
- Modify: `components/dashboard/sentiment-chart.tsx`

**Step 1: Rewrite `components/dashboard/kpi-cards.tsx`**

Replace entirely. The v6 mock shows 5 KPI cards: Calls Today, Loads Booked, Revenue Locked, Conversion, Pending Transfer. Each has a trend badge. Use `DashboardMetrics` with fallbacks to existing fields when v6 fields are missing:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Phone, Package, DollarSign, Target, AlertTriangle } from "lucide-react";
import { DashboardMetrics } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const callsValue = metrics.calls_today ?? metrics.total_calls;
  const bookedValue = metrics.booked_today ?? (metrics.calls_by_outcome?.booked ?? 0);
  const revenueValue = metrics.revenue_today ?? metrics.total_revenue;
  const conversionValue = metrics.conversion_rate ?? metrics.booking_rate_percent;
  const pendingValue = metrics.pending_transfer ?? 0;

  const cards = [
    {
      label: "Calls Today",
      value: callsValue.toLocaleString(),
      trend: metrics.calls_trend,
      icon: Phone,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Loads Booked",
      value: bookedValue.toLocaleString(),
      trend: metrics.booked_trend,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Revenue Locked",
      value: revenueValue >= 1000 ? `$${(revenueValue / 1000).toFixed(1)}k` : formatCurrency(revenueValue),
      trend: metrics.revenue_trend,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Conversion",
      value: formatPercent(conversionValue),
      trend: metrics.conversion_trend,
      icon: Target,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Pending Transfer",
      value: pendingValue.toLocaleString(),
      trend: null,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      alert: pendingValue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`p-5 shadow-sm transition-shadow hover:shadow-md ${card.alert ? "border-orange-300" : ""}`}
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            {card.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-gray-900">
              {card.value}
            </span>
            {card.trend && (
              <span className={`text-xs font-medium ${card.trend.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>
                {card.trend}
              </span>
            )}
            {card.alert && (
              <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-500">
                ACTION
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Create `components/dashboard/conversion-funnel.tsx`**

This shows the call-to-booking funnel from the v6 mock. If `funnel_data` is not available, derive a simple funnel from `calls_by_outcome`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { DashboardMetrics } from "@/lib/types";

interface ConversionFunnelProps {
  metrics: DashboardMetrics;
}

export function ConversionFunnel({ metrics }: ConversionFunnelProps) {
  const funnelData = metrics.funnel_data ?? deriveFunnel(metrics);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Conversion Funnel</h3>
      <div className="flex flex-col gap-2">
        {funnelData.map((stage, i) => (
          <div key={stage.stage} className="flex items-center gap-2.5">
            <span className="w-24 text-right text-xs font-medium text-gray-500">
              {stage.stage}
            </span>
            <div className="flex-1 overflow-hidden rounded bg-gray-100" style={{ height: 22 }}>
              <div
                className="flex h-full items-center justify-end rounded pr-1.5 transition-all duration-500"
                style={{
                  width: `${stage.pct}%`,
                  backgroundColor: i === funnelData.length - 1 ? "#6366f1" : `rgba(99,102,241,${0.15 + i * 0.15})`,
                }}
              >
                <span className={`font-mono text-[10px] font-semibold ${i >= 3 ? "text-white" : "text-indigo-600"}`}>
                  {stage.count}
                </span>
              </div>
            </div>
            <span className="w-8 text-right font-mono text-[10px] text-gray-400">
              {stage.pct}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function deriveFunnel(metrics: DashboardMetrics) {
  const total = metrics.total_calls || 1;
  const booked = metrics.calls_by_outcome?.booked ?? 0;
  const noLoads = metrics.calls_by_outcome?.no_loads_available ?? 0;
  const invalid = metrics.calls_by_outcome?.invalid_carrier ?? 0;

  const authenticated = total - invalid;
  const matched = authenticated - noLoads;
  const offered = Math.round(matched * 0.85);

  return [
    { stage: "Inbound Calls", count: total, pct: 100 },
    { stage: "Authenticated", count: authenticated, pct: Math.round((authenticated / total) * 100) },
    { stage: "Load Matched", count: matched, pct: Math.round((matched / total) * 100) },
    { stage: "Offer Made", count: offered, pct: Math.round((offered / total) * 100) },
    { stage: "Booked", count: booked, pct: Math.round((booked / total) * 100) },
  ];
}
```

**Step 3: Create `components/dashboard/live-call-feed.tsx`**

Shows compact live call feed from the overview. Uses `recent_calls` from dashboard metrics:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { CallSummary } from "@/lib/types";
import { StatusDot } from "@/components/shared/status-dot";
import { formatLane, formatCurrency, formatRelativeTime } from "@/lib/utils";

interface LiveCallFeedProps {
  calls: CallSummary[];
}

export function LiveCallFeed({ calls }: LiveCallFeedProps) {
  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Live Call Feed</h3>
        <span className="text-xs text-gray-400">Just now</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {calls.slice(0, 6).map((call) => (
          <div
            key={call.id}
            className="grid cursor-pointer grid-cols-[8px_1fr_auto] items-center gap-2.5 border-t border-gray-50 px-5 py-2.5 transition-colors hover:bg-gray-50"
          >
            <StatusDot status={mapOutcomeToStatus(call.outcome)} />
            <div>
              <div className="text-xs font-medium text-gray-900">
                {call.carrier_name ?? "Unknown Carrier"}
              </div>
              <div className="text-[11px] text-gray-400">
                {call.mc_number ?? ""} · {formatLane(call.lane_origin, call.lane_destination)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs font-semibold text-indigo-600">
                {call.final_rate ? formatCurrency(call.final_rate) : "—"}
              </div>
              <div className="text-[10px] text-gray-400">
                {formatRelativeTime(call.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function mapOutcomeToStatus(outcome: string): string {
  const map: Record<string, string> = {
    booked: "booked",
    negotiation_failed: "declined",
    no_loads_available: "no_match",
    invalid_carrier: "auth_failed",
    transferred_to_ops: "transferred",
    dropped_call: "declined",
    carrier_thinking: "live",
  };
  return map[outcome] ?? "no_match";
}
```

**Step 4: Create `components/dashboard/rate-intelligence.tsx`**

Shows avg loadboard vs agreed rate, discount, margin. Falls back to `avg_rate_differential_percent` if `rate_intelligence` is missing:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { DashboardMetrics } from "@/lib/types";

interface RateIntelligenceProps {
  metrics: DashboardMetrics;
}

export function RateIntelligence({ metrics }: RateIntelligenceProps) {
  const ri = metrics.rate_intelligence;
  const discount = ri?.discount_pct ?? Math.abs(metrics.avg_rate_differential_percent ?? 0);
  const margin = ri?.margin_pct ?? 0;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Rate Intelligence</h3>
      {ri ? (
        <>
          <div className="mb-3 flex justify-between">
            <div>
              <div className="text-[10px] uppercase text-gray-400">Avg Loadboard</div>
              <div className="font-mono text-xl font-bold text-gray-900">
                ${ri.avg_loadboard.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-gray-400">Avg Agreed</div>
              <div className="font-mono text-xl font-bold text-indigo-600">
                ${ri.avg_agreed.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex gap-3 border-t border-gray-100 pt-2.5">
            <div>
              <div className="text-[10px] uppercase text-gray-400">Discount</div>
              <div className="font-mono text-base font-semibold text-gray-900">{discount.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-gray-400">Margin</div>
              <div className="font-mono text-base font-semibold text-emerald-500">{margin.toFixed(1)}%</div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 border-t border-gray-100 pt-2.5">
          <div>
            <div className="text-[10px] uppercase text-gray-400">Avg Rate Diff</div>
            <div className="font-mono text-base font-semibold text-gray-900">{discount.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </Card>
  );
}
```

**Step 5: Update `components/dashboard/outcome-chart.tsx`**

Rewrite to show horizontal stacked bar + labeled counts (matching v6 mock's Call Outcomes section) instead of the Recharts donut. Keep Recharts as fallback but show the v6-style list + bar:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { OUTCOME_CONFIG, OUTCOME_CHART_COLORS } from "@/lib/constants";

interface OutcomeChartProps {
  data: Record<string, number>;
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  const entries = Object.entries(data)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Call Outcomes</h3>
      <div className="space-y-1.5">
        {entries.map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: OUTCOME_CHART_COLORS[key] ?? "#94a3b8" }}
            />
            <span className="flex-1 text-xs text-gray-500">
              {OUTCOME_CONFIG[key as keyof typeof OUTCOME_CONFIG]?.label ?? key}
            </span>
            <span className="font-mono text-xs font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full">
        {entries.map(([key, count]) => (
          <div
            key={key}
            className="h-full"
            style={{
              flex: count,
              backgroundColor: OUTCOME_CHART_COLORS[key] ?? "#94a3b8",
            }}
          />
        ))}
      </div>
    </Card>
  );
}
```

**Step 6: Update `components/dashboard/sentiment-chart.tsx`**

Rewrite to show progress bars (matching v6 mock) instead of Recharts donut:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { SENTIMENT_CONFIG, SENTIMENT_CHART_COLORS } from "@/lib/constants";

interface SentimentChartProps {
  data: Record<string, number>;
}

export function SentimentChart({ data }: SentimentChartProps) {
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const entries = Object.entries(data).filter(([, v]) => v > 0);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Carrier Sentiment</h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const pct = Math.round((count / total) * 100);
          const color = SENTIMENT_CHART_COLORS[key] ?? "#94a3b8";
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-gray-500">
                  {SENTIMENT_CONFIG[key as keyof typeof SENTIMENT_CONFIG]?.label ?? key}
                </span>
                <span className="font-mono text-xs font-semibold text-gray-900">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

**Step 7: Rewrite `components/dashboard/overview-client.tsx`**

Update the layout to match v6: KPIs on top, funnel + live feed side by side, then outcomes + sentiment + rate intelligence in 3 columns:

```typescript
"use client";

import { DashboardMetrics } from "@/lib/types";
import { useDashboardMetrics } from "@/lib/swr";
import { KpiCards } from "./kpi-cards";
import { ConversionFunnel } from "./conversion-funnel";
import { LiveCallFeed } from "./live-call-feed";
import { OutcomeChart } from "./outcome-chart";
import { SentimentChart } from "./sentiment-chart";
import { RateIntelligence } from "./rate-intelligence";
import { KpiCardsSkeleton, ChartsSkeleton } from "@/components/shared/skeletons";

interface OverviewClientProps {
  initialMetrics: DashboardMetrics | null;
}

export function OverviewClient({ initialMetrics }: OverviewClientProps) {
  const { data: metrics, error } = useDashboardMetrics();
  const displayMetrics = metrics ?? initialMetrics;

  if (error && !displayMetrics) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load dashboard metrics. Check your API connection.
      </div>
    );
  }

  if (!displayMetrics) {
    return (
      <div className="space-y-5">
        <KpiCardsSkeleton />
        <ChartsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <KpiCards metrics={displayMetrics} />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <ConversionFunnel metrics={displayMetrics} />
        <LiveCallFeed calls={displayMetrics.recent_calls} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <OutcomeChart data={displayMetrics.calls_by_outcome} />
        <SentimentChart data={displayMetrics.sentiment_distribution} />
        <RateIntelligence metrics={displayMetrics} />
      </div>
    </div>
  );
}
```

**Step 8: Remove unused imports/components**

Delete the now-unused chart components if they're not used elsewhere:
- `components/dashboard/equipment-chart.tsx` — check if imported anywhere else
- `components/dashboard/top-lanes-chart.tsx` — these move to analytics page
- `components/dashboard/recent-calls-table.tsx` — replaced by live-call-feed
- `components/dashboard/recent-offers-table.tsx` — no longer on overview
- `components/dashboard/rate-trend-chart.tsx` — can keep or remove

Keep the files but remove imports from `overview-client.tsx`. We'll reuse equipment/top-lanes in Analytics later.

**Step 9: Verify in browser — overview page should show new layout**

**Step 10: Commit**

```bash
git add components/dashboard/
git commit -m "feat: rebuild overview page with v6 layout"
```

---

## Task 5: Rebuild Calls Page with Sidebar Preview

**Files:**
- Modify: `app/calls/page.tsx`
- Modify: `components/calls/calls-table.tsx`
- Create: `components/calls/call-sidebar.tsx`

**Step 1: Create `components/calls/call-sidebar.tsx`**

The v6 mock shows a sticky sidebar panel with carrier info, FMCSA badge, call metadata grid, sentiment, and negotiation timeline. Include a "Full Detail" link that goes to `/calls/[callId]`:

```typescript
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CallSummary } from "@/lib/types";
import { SentimentBadge } from "@/components/shared/status-badge";
import { EquipmentBadge } from "@/components/shared/status-badge";
import { OutcomeBadge } from "@/components/shared/status-badge";
import { formatLane, formatCurrency } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface CallSidebarProps {
  call: CallSummary;
  onClose: () => void;
}

export function CallSidebar({ call, onClose }: CallSidebarProps) {
  const equipLabel = call.equipment_type
    ? (EQUIPMENT_CONFIG[call.equipment_type as keyof typeof EQUIPMENT_CONFIG]?.label ?? call.equipment_type)
    : "—";

  return (
    <Card className="sticky top-20 self-start p-5 shadow-sm animate-in slide-in-from-right-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{call.carrier_name ?? "Unknown"}</div>
          <div className="font-mono text-[11px] text-gray-400">{call.mc_number ?? "—"}</div>
        </div>
        <button onClick={onClose} className="text-gray-300 transition-colors hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* FMCSA badge */}
      <div className="mb-4 rounded-lg border-l-[3px] border-emerald-400 bg-emerald-50 px-3 py-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          FMCSA Verified
        </div>
        <div className="text-[11px] text-emerald-600">Authorized · Insurance Active</div>
      </div>

      {/* Metadata grid */}
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {[
          ["Lane", formatLane(call.lane_origin, call.lane_destination)],
          ["Equipment", equipLabel],
          ["Outcome", null],
          ["Rate", call.final_rate ? formatCurrency(call.final_rate) : "—"],
        ].map(([label, value], i) => (
          <div key={i}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">{label}</div>
            {label === "Outcome" ? (
              <OutcomeBadge outcome={call.outcome} />
            ) : (
              <div className="text-[13px] font-semibold text-gray-900">{value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Sentiment */}
      <div className="mb-4">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">Sentiment</div>
        <SentimentBadge sentiment={call.sentiment} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild className="flex-1" size="sm">
          <Link href={`/calls/${call.call_id}`}>Full Detail</Link>
        </Button>
      </div>
    </Card>
  );
}
```

**Step 2: Update `components/calls/calls-table.tsx`**

Add a status dot, equipment badge, and `selectedId` + `onSelect` props so clicking a row selects it (shows sidebar) instead of navigating:

```typescript
"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import { OutcomeBadge, SentimentBadge, EquipmentBadge } from "@/components/shared/status-badge";
import { StatusDot } from "@/components/shared/status-dot";
import {
  formatDuration, formatLane, formatCurrency, formatRelativeTime,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CallsTableProps {
  calls: CallSummary[];
  selectedId?: string | null;
  onSelect?: (call: CallSummary) => void;
}

export function CallsTable({ calls, selectedId, onSelect }: CallsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="w-8 text-xs" />
          <TableHead className="text-xs">Carrier</TableHead>
          <TableHead className="text-xs">MC#</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equip.</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs">Sentiment</TableHead>
          <TableHead className="text-xs text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow
            key={call.id}
            className={cn(
              "cursor-pointer border-gray-100 transition-colors hover:bg-gray-50",
              selectedId === call.id && "bg-indigo-50/50"
            )}
            onClick={() => onSelect?.(call)}
          >
            <TableCell className="px-3">
              <StatusDot status={mapOutcomeToStatus(call.outcome)} />
            </TableCell>
            <TableCell className="text-sm font-medium">
              {call.carrier_name ?? "Unknown"}
            </TableCell>
            <TableCell className="font-mono text-xs text-gray-400">
              {call.mc_number ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatLane(call.lane_origin, call.lane_destination)}
            </TableCell>
            <TableCell>
              {call.equipment_type ? <EquipmentBadge type={call.equipment_type} /> : <span className="text-xs text-gray-400">—</span>}
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-semibold">
              {call.final_rate ? formatCurrency(call.final_rate) : "—"}
            </TableCell>
            <TableCell>
              <SentimentBadge sentiment={call.sentiment} />
            </TableCell>
            <TableCell className="text-right text-xs text-gray-400">
              {formatRelativeTime(call.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function mapOutcomeToStatus(outcome: string): string {
  const map: Record<string, string> = {
    booked: "booked",
    negotiation_failed: "declined",
    no_loads_available: "no_match",
    invalid_carrier: "auth_failed",
    transferred_to_ops: "transferred",
    dropped_call: "declined",
    carrier_thinking: "live",
  };
  return map[outcome] ?? "no_match";
}
```

**Step 3: Update `app/calls/page.tsx`**

Add sidebar state and layout grid that shows the sidebar when a call is selected:

```typescript
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { CallFilters } from "@/components/calls/call-filters";
import { CallsTable } from "@/components/calls/calls-table";
import { CallSidebar } from "@/components/calls/call-sidebar";
import { useCalls } from "@/lib/swr";
import { CallSummary } from "@/lib/types";
import { TableSkeleton } from "@/components/shared/skeletons";

export default function CallsPage() {
  const [filters, setFilters] = useState<{
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallSummary | null>(null);
  const pageSize = 20;

  const { data, error, isLoading } = useCalls({
    ...filters,
    page,
    page_size: pageSize,
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleExport = () => {
    if (!data) return;
    const headers = ["Call ID", "Carrier", "MC#", "Origin", "Destination", "Outcome", "Sentiment", "Duration", "Created"];
    const rows = data.calls.map((c) => [
      c.call_id, c.carrier_name ?? "", c.mc_number ?? "",
      c.lane_origin ?? "", c.lane_destination ?? "",
      c.outcome, c.sentiment,
      String(c.duration_seconds ?? ""), c.created_at,
    ]);
    downloadCSV("calls.csv", headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calls</h1>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>
      <CallFilters onFilterChange={handleFilterChange} />
      {error && !data ? (
        <Card className="shadow-sm">
          <div className="p-6 text-sm text-red-600">Failed to load calls.</div>
        </Card>
      ) : isLoading && !data ? (
        <TableSkeleton rows={10} />
      ) : data ? (
        <div className={`grid gap-4 ${selectedCall ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
          <Card className="shadow-sm">
            <CallsTable
              calls={data.calls}
              selectedId={selectedCall?.id}
              onSelect={setSelectedCall}
            />
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-500">
                {data.total} total calls
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {Math.ceil((data.total || 1) / pageSize)}
                </span>
                <Button variant="outline" size="sm" disabled={page * pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          {selectedCall && (
            <CallSidebar call={selectedCall} onClose={() => setSelectedCall(null)} />
          )}
        </div>
      ) : null}
    </div>
  );
}
```

**Step 4: Verify — calls page should show table with sidebar on click**

**Step 5: Commit**

```bash
git add app/calls/page.tsx components/calls/
git commit -m "feat: rebuild calls page with sidebar preview"
```

---

## Task 6: Rebuild Bookings Page

**Files:**
- Modify: `app/bookings/page.tsx`
- Modify: `components/bookings/bookings-summary.tsx`
- Modify: `components/bookings/bookings-table.tsx`
- Create: `components/bookings/margin-distribution.tsx`
- Create: `components/bookings/revenue-by-equipment.tsx`

**Step 1: Rewrite `components/bookings/bookings-summary.tsx`**

4 KPI cards matching v6: Total Booked, Total Revenue, Avg Margin, Avg Rounds. Use fallbacks for new fields:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface BookingsSummaryProps {
  bookings: BookedLoad[];
}

export function BookingsSummary({ bookings }: BookingsSummaryProps) {
  const totalRevenue = bookings.reduce((s, b) => s + b.agreed_rate, 0);
  const avgMargin = bookings.length
    ? bookings.reduce((s, b) => s + (b.margin ?? 0), 0) / bookings.length
    : 0;
  const avgRounds = bookings.length
    ? bookings.reduce((s, b) => s + (b.negotiation_rounds ?? 0), 0) / bookings.length
    : 0;
  const hasMarginData = bookings.some((b) => b.margin != null);
  const hasRoundsData = bookings.some((b) => b.negotiation_rounds != null);

  const cards = [
    { label: "Total Booked", value: bookings.length.toString() },
    { label: "Total Revenue", value: totalRevenue >= 1000 ? `$${(totalRevenue / 1000).toFixed(1)}k` : formatCurrency(totalRevenue) },
    { label: "Avg Margin", value: hasMarginData ? `${avgMargin.toFixed(1)}%` : "—" },
    { label: "Avg Rounds", value: hasRoundsData ? avgRounds.toFixed(1) : "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5 shadow-sm">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{card.label}</div>
          <div className="font-mono text-2xl font-bold tracking-tight text-gray-900">{card.value}</div>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Rewrite `components/bookings/bookings-table.tsx`**

Full table with load ID, carrier, lane, equipment, loadboard rate, agreed rate, margin, rounds, sentiment, booked time. All new columns degrade gracefully:

```typescript
"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BookedLoad } from "@/lib/types";
import { SentimentBadge, EquipmentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime, formatLane } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BookingsTableProps {
  bookings: BookedLoad[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const hasExtendedData = bookings.some((b) => b.lane_origin != null || b.loadboard_rate != null);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Carrier</TableHead>
          {hasExtendedData && <TableHead className="text-xs">Lane</TableHead>}
          {hasExtendedData && <TableHead className="text-xs">Equip.</TableHead>}
          {hasExtendedData && <TableHead className="text-xs text-right">Loadboard</TableHead>}
          <TableHead className="text-xs text-right">Agreed</TableHead>
          {hasExtendedData && <TableHead className="text-xs text-right">Margin</TableHead>}
          {hasExtendedData && <TableHead className="text-xs text-center">Rounds</TableHead>}
          {hasExtendedData && <TableHead className="text-xs">Sentiment</TableHead>}
          <TableHead className="text-xs text-right">Booked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id} className="border-gray-100">
            <TableCell className="font-mono text-xs text-indigo-600 font-medium">
              {b.load_id}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {b.carrier_name ?? "Unknown"}
            </TableCell>
            {hasExtendedData && (
              <TableCell className="text-sm text-gray-500">
                {formatLane(b.lane_origin ?? null, b.lane_destination ?? null)}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell>
                {b.equipment_type ? <EquipmentBadge type={b.equipment_type} /> : <span className="text-xs text-gray-400">—</span>}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell className="text-right font-mono text-sm text-gray-400">
                {b.loadboard_rate != null ? formatCurrency(b.loadboard_rate) : "—"}
              </TableCell>
            )}
            <TableCell className="text-right font-mono text-sm font-semibold">
              {formatCurrency(b.agreed_rate)}
            </TableCell>
            {hasExtendedData && (
              <TableCell className="text-right">
                {b.margin != null ? (
                  <span className={cn(
                    "font-mono text-sm font-semibold",
                    b.margin >= 15 ? "text-emerald-500" : b.margin >= 10 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {b.margin.toFixed(1)}%
                  </span>
                ) : <span className="text-xs text-gray-400">—</span>}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell className="text-center font-mono text-sm">
                {b.negotiation_rounds ?? "—"}
              </TableCell>
            )}
            {hasExtendedData && (
              <TableCell>
                {b.sentiment ? <SentimentBadge sentiment={b.sentiment} /> : <span className="text-xs text-gray-400">—</span>}
              </TableCell>
            )}
            <TableCell className="text-right text-sm text-gray-400">
              {formatDateTime(b.booked_at ?? b.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Step 3: Create `components/bookings/margin-distribution.tsx`**

Shows per-booking margin bars with min/target reference lines. Only renders if margin data exists:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MarginDistributionProps {
  bookings: BookedLoad[];
}

export function MarginDistribution({ bookings }: MarginDistributionProps) {
  const withMargin = bookings.filter((b) => b.margin != null);
  if (withMargin.length === 0) return null;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Margin Distribution</h3>
      <div className="space-y-2">
        {withMargin.map((b) => {
          const origin = b.lane_origin?.split(",")[0] ?? b.load_id;
          const margin = b.margin ?? 0;
          return (
            <div key={b.id} className="flex items-center gap-2.5">
              <span className="w-16 text-right text-[11px] text-gray-400">{origin}</span>
              <div className="relative flex-1 overflow-hidden rounded bg-gray-100" style={{ height: 16 }}>
                <div
                  className={cn("absolute left-0 top-0 h-full rounded transition-all duration-500",
                    margin >= 15 ? "bg-emerald-400" : margin >= 10 ? "bg-indigo-500" : "bg-amber-400"
                  )}
                  style={{ width: `${Math.min((margin / 20) * 100, 100)}%` }}
                />
                {/* min line at 5% */}
                <div className="absolute top-0 h-full w-px bg-rose-400/40" style={{ left: `${(5 / 20) * 100}%` }} />
                {/* target line at 15% */}
                <div className="absolute top-0 h-full w-px bg-emerald-400/40" style={{ left: `${(15 / 20) * 100}%` }} />
              </div>
              <span className={cn("w-9 font-mono text-[11px] font-semibold",
                margin >= 15 ? "text-emerald-500" : "text-amber-500"
              )}>
                {margin.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-4 text-[10px] text-gray-400">
        <span><span className="mr-1 inline-block h-0.5 w-2 rounded bg-rose-400/50" />Min 5%</span>
        <span><span className="mr-1 inline-block h-0.5 w-2 rounded bg-emerald-400/50" />Target 15%</span>
      </div>
    </Card>
  );
}
```

**Step 4: Create `components/bookings/revenue-by-equipment.tsx`**

Shows revenue breakdown by equipment type. Only renders if equipment data exists:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface RevenueByEquipmentProps {
  bookings: BookedLoad[];
}

const BAR_COLORS = ["#6366f1", "#34d399", "#f0913b"];

export function RevenueByEquipment({ bookings }: RevenueByEquipmentProps) {
  const hasEquipData = bookings.some((b) => b.equipment_type != null);
  if (!hasEquipData) return null;

  const total = bookings.reduce((s, b) => s + b.agreed_rate, 0) || 1;
  const byEquip = Object.entries(
    bookings.reduce<Record<string, { count: number; revenue: number }>>((acc, b) => {
      const key = b.equipment_type ?? "unknown";
      if (!acc[key]) acc[key] = { count: 0, revenue: 0 };
      acc[key].count++;
      acc[key].revenue += b.agreed_rate;
      return acc;
    }, {})
  ).sort(([, a], [, b]) => b.revenue - a.revenue);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-gray-900">Revenue by Equipment</h3>
      <div className="space-y-3.5">
        {byEquip.map(([key, data], i) => {
          const label = EQUIPMENT_CONFIG[key as keyof typeof EQUIPMENT_CONFIG]?.label ?? key;
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between">
                <span className="text-xs font-medium text-gray-900">
                  {label} <span className="font-normal text-gray-400">({data.count} loads)</span>
                </span>
                <span className="font-mono text-xs font-semibold text-gray-900">
                  ${(data.revenue / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(data.revenue / total) * 100}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

**Step 5: Update `app/bookings/page.tsx`**

Add margin and equipment charts below the table:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BookingsSummary } from "@/components/bookings/bookings-summary";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { MarginDistribution } from "@/components/bookings/margin-distribution";
import { RevenueByEquipment } from "@/components/bookings/revenue-by-equipment";
import { useBookings } from "@/lib/swr";
import { downloadCSV } from "@/lib/csv";
import { SummaryCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function BookingsPage() {
  const { data: bookings, error, isLoading } = useBookings();

  const handleExport = () => {
    if (!bookings) return;
    const headers = ["Load ID", "MC#", "Carrier", "Agreed Rate", "Pickup Date", "Created"];
    const rows = bookings.map((b) => [
      b.load_id, b.mc_number, b.carrier_name ?? "",
      String(b.agreed_rate), b.agreed_pickup_datetime ?? "", b.created_at,
    ]);
    downloadCSV("bookings.csv", headers, rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!bookings}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>
      {error && !bookings ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load bookings.</div>
      ) : isLoading && !bookings ? (
        <>
          <SummaryCardsSkeleton count={4} />
          <TableSkeleton rows={5} />
        </>
      ) : bookings ? (
        <>
          <BookingsSummary bookings={bookings} />
          <Card className="overflow-hidden shadow-sm">
            <div className="px-5 py-4 text-sm font-semibold text-gray-900">Today's Bookings</div>
            <BookingsTable bookings={bookings} />
          </Card>
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <MarginDistribution bookings={bookings} />
            <RevenueByEquipment bookings={bookings} />
          </div>
        </>
      ) : null}
    </div>
  );
}
```

**Step 6: Verify — bookings page should show KPIs, table, charts**

**Step 7: Commit**

```bash
git add app/bookings/page.tsx components/bookings/
git commit -m "feat: rebuild bookings page with margin and equipment charts"
```

---

## Task 7: Rebuild Loads Page with Urgency & Map Detail

**Files:**
- Modify: `app/loads/page.tsx`
- Modify: `components/loads/loads-table.tsx`
- Modify: `components/loads/load-filters.tsx`
- Modify: `components/loads/loads-card.tsx`
- Create: `components/loads/load-detail.tsx`
- Create: `components/loads/leaflet-map.tsx`

**Step 1: Create `components/loads/leaflet-map.tsx`**

Dynamic import wrapper for Leaflet map (needs to be client-only, no SSR):

```typescript
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  originLabel: string;
  destLabel: string;
}

export function LeafletMap({ originLat, originLng, destLat, destLng, originLabel, destLabel }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
    mapInstance.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const makeIcon = (color: string, label: string) =>
      L.divIcon({
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;box-shadow:0 2px 8px ${color}44;transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${label}</span></div>`,
      });

    L.marker([originLat, originLng], { icon: makeIcon("#6366f1", "A") })
      .bindPopup(`<strong>Pickup</strong><br/>${originLabel}`)
      .addTo(map);
    L.marker([destLat, destLng], { icon: makeIcon("#34d399", "B") })
      .bindPopup(`<strong>Delivery</strong><br/>${destLabel}`)
      .addTo(map);

    // Curved route line
    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;
    const offset = Math.abs(originLng - destLng) * 0.15;
    const curvedMidLat = midLat + offset * 0.5;
    const points: [number, number][] = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const lat = (1 - t) * (1 - t) * originLat + 2 * (1 - t) * t * curvedMidLat + t * t * destLat;
      const lng = (1 - t) * (1 - t) * originLng + 2 * (1 - t) * t * midLng + t * t * destLng;
      points.push([lat, lng]);
    }
    L.polyline(points, { color: "#6366f1", weight: 3, opacity: 0.7, dashArray: "8 6" }).addTo(map);
    L.polyline(points, { color: "#6366f1", weight: 1.5, opacity: 0.15 }).addTo(map);

    map.fitBounds(L.latLngBounds([[originLat, originLng], [destLat, destLng]]), { padding: [60, 60] });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [originLat, originLng, destLat, destLng, originLabel, destLabel]);

  return <div ref={mapRef} className="h-full w-full" />;
}
```

**Step 2: Create `components/loads/load-detail.tsx`**

Full load detail page with map and sidebar panel. Matches v6 mock's load detail view:

```typescript
"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Load } from "@/lib/types";
import { UrgencyBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => ({ default: m.LeafletMap })), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">Loading map...</div>,
});

interface LoadDetailProps {
  load: Load;
  onBack: () => void;
}

export function LoadDetail({ load, onBack }: LoadDetailProps) {
  const ratePerMile = load.miles > 0 ? load.loadboard_rate / load.miles : 0;

  const rows: [string, string][] = [
    ["Origin", load.origin],
    ["Destination", load.destination],
    ["Pickup", load.pickup_datetime],
    ["Delivery", load.delivery_datetime],
    ["Equipment", load.equipment_type],
    ["Weight", `${load.weight.toLocaleString()} lbs`],
    ["Commodity", load.commodity_type],
    ["Pieces", String(load.num_of_pieces)],
    ["Dimensions", load.dimensions],
    ["Miles", `${load.miles} mi`],
    ["Rate per Mile", formatCurrency(ratePerMile)],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-8 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-gray-500">
          <ArrowLeft className="h-4 w-4" /> Back to Loads
        </Button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-semibold text-gray-900">{load.load_id}</span>
        {load.urgency && <UrgencyBadge urgency={load.urgency} />}
      </div>
      {/* Content */}
      <div className="grid h-[calc(100vh-57px)] grid-cols-[1fr_380px]">
        {/* Map */}
        <div className="relative overflow-hidden">
          <LeafletMap
            originLat={load.origin_lat}
            originLng={load.origin_lng}
            destLat={load.dest_lat}
            destLng={load.dest_lng}
            originLabel={load.origin}
            destLabel={load.destination}
          />
          {/* Floating route info */}
          <div className="absolute bottom-5 left-1/2 z-[1000] flex -translate-x-1/2 gap-6 rounded-xl border border-gray-200 bg-white/95 px-6 py-3 text-sm shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-gray-400">{load.origin.split(",")[0]}</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-gray-400">{load.destination.split(",")[0]}</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div><span className="text-gray-400">Distance </span><strong>{load.miles} mi</strong></div>
            <div><span className="text-gray-400">Rate/mi </span><strong className="text-indigo-600">{formatCurrency(ratePerMile)}</strong></div>
          </div>
        </div>
        {/* Detail Panel */}
        <div className="overflow-y-auto border-l border-gray-200 bg-white">
          <div className="px-6 pt-6">
            <div className="text-[11px] uppercase tracking-widest text-gray-400">Load Details</div>
            <div className="flex items-baseline gap-2 font-mono text-2xl font-bold">
              {formatCurrency(load.loadboard_rate)}
              <span className="text-sm font-normal text-gray-400">loadboard rate</span>
            </div>
          </div>
          <div className="px-6 pt-4">
            <div className="mb-5 flex gap-2">
              {load.urgency && <UrgencyBadge urgency={load.urgency} />}
              {load.pitch_count != null && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${load.pitch_count > 8 ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"}`}>
                  Pitched {load.pitch_count}x
                </span>
              )}
              {load.days_listed != null && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  {load.days_listed}d listed
                </span>
              )}
            </div>
            {rows.map(([label, val]) => (
              <div key={label} className="flex items-center justify-between border-b border-gray-50 py-2.5">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-[13px] font-medium text-gray-900">{val}</span>
              </div>
            ))}
            {load.notes && (
              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notes</div>
                <div className="text-[13px] leading-relaxed text-gray-600">{load.notes}</div>
              </div>
            )}
            {load.urgency === "critical" && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <div className="mb-1 text-xs font-semibold text-rose-600">Needs Attention</div>
                <div className="text-xs leading-relaxed text-rose-500">
                  {(load.pitch_count ?? 0) > 8 && "Pitched 8+ times without booking — consider adjusting rate. "}
                  {(load.days_listed ?? 0) >= 2 && "Listed for 2+ days — aging load risk. "}
                  {(load.commodity_type.includes("temp") || load.commodity_type.includes("Seafood") || load.commodity_type.includes("Produce")) && "Perishable commodity — time-sensitive. "}
                  {load.notes?.includes("Dead-end") && "Dead-end destination — expect carrier resistance. "}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Update `components/loads/loads-table.tsx`**

Add urgency badges, priority sorting, pitch count, days listed columns. Add `onSelect` prop for opening detail:

```typescript
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Load } from "@/lib/types";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { UrgencyBadge, EquipmentBadge } from "@/components/shared/status-badge";

interface LoadsTableProps {
  loads: Load[];
  exactCount?: number;
  onSelect?: (load: Load) => void;
}

export function LoadsTable({ loads, exactCount, onSelect }: LoadsTableProps) {
  const sorted = [...loads].sort((a, b) => {
    const urgOrder: Record<string, number> = { critical: 0, high: 1, normal: 2 };
    return (urgOrder[a.urgency ?? "normal"] ?? 2) - (urgOrder[b.urgency ?? "normal"] ?? 2);
  });

  const hasUrgency = loads.some((l) => l.urgency != null);
  const hasPitchCount = loads.some((l) => l.pitch_count != null);
  const hasDaysListed = loads.some((l) => l.days_listed != null);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          {hasUrgency && <TableHead className="text-xs">Priority</TableHead>}
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equip.</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs text-right">$/mi</TableHead>
          <TableHead className="text-xs">Pickup</TableHead>
          <TableHead className="text-xs text-right">Weight</TableHead>
          {hasPitchCount && <TableHead className="text-xs text-right">Pitched</TableHead>}
          {hasDaysListed && <TableHead className="text-xs text-right">Listed</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((load, index) => (
          <TableRow
            key={load.load_id}
            className={cn(
              "cursor-pointer border-gray-100 transition-colors hover:bg-gray-50",
              load.urgency === "critical" && "border-rose-100 bg-rose-50/30",
              exactCount !== undefined && index === exactCount && "border-t-2 border-t-gray-200"
            )}
            onClick={() => onSelect?.(load)}
          >
            {hasUrgency && (
              <TableCell>
                <UrgencyBadge urgency={load.urgency ?? "normal"} />
              </TableCell>
            )}
            <TableCell className="font-mono text-xs font-semibold text-indigo-600">
              {load.load_id}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {load.origin.split(",")[0]} &rarr; {load.destination.split(",")[0]}
            </TableCell>
            <TableCell>
              <EquipmentBadge type={load.equipment_type} />
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-semibold">
              {formatCurrency(load.loadboard_rate)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm text-gray-400">
              {load.miles > 0 ? formatCurrency(load.loadboard_rate / load.miles) : "—"}
            </TableCell>
            <TableCell className="text-xs text-gray-500">
              {formatDateTime(load.pickup_datetime)}
            </TableCell>
            <TableCell className="text-right text-xs text-gray-400">
              {load.weight.toLocaleString()} lbs
            </TableCell>
            {hasPitchCount && (
              <TableCell className={cn(
                "text-right font-mono text-sm font-semibold",
                (load.pitch_count ?? 0) > 8 ? "text-rose-500" : (load.pitch_count ?? 0) > 4 ? "text-amber-500" : "text-gray-400"
              )}>
                {load.pitch_count ?? "—"}
              </TableCell>
            )}
            {hasDaysListed && (
              <TableCell className="text-right text-sm text-gray-400">
                {load.days_listed != null ? `${load.days_listed}d` : "—"}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Step 4: Update `app/loads/page.tsx`**

Add load detail modal, KPI cards for available loads, critical priority, avg rate/mile. The load detail opens as a full-screen overlay:

```typescript
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Search } from "lucide-react";
import { LoadFilters } from "@/components/loads/load-filters";
import { LoadsTable } from "@/components/loads/loads-table";
import { LoadsCardView } from "@/components/loads/loads-card";
import { LoadDetail } from "@/components/loads/load-detail";
import { useLoads } from "@/lib/swr";
import { Load } from "@/lib/types";
import { TableSkeleton } from "@/components/shared/skeletons";

export default function LoadsPage() {
  const [view, setView] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<{
    origin?: string;
    equipment_type?: string;
    destination?: string;
  }>({});
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const { data, error, isLoading } = useLoads(filters);

  const hasOrigin = !!filters.origin?.trim();
  const allLoads = data ? [...data.loads, ...data.alternative_loads] : [];

  // KPI stats
  const criticalCount = allLoads.filter((l) => l.urgency === "critical").length;
  const avgRatePerMile = allLoads.length
    ? allLoads.reduce((s, l) => s + (l.miles > 0 ? l.loadboard_rate / l.miles : 0), 0) / allLoads.length
    : 0;

  if (selectedLoad) {
    return <LoadDetail load={selectedLoad} onBack={() => setSelectedLoad(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Load Board</h1>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setView("table")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={view === "card" ? "secondary" : "ghost"} size="sm" onClick={() => setView("card")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <LoadFilters onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))} />

      {!hasOrigin ? (
        <Card className="shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <Search className="h-10 w-10" />
            <p className="text-sm">Enter an origin city to search for available loads</p>
          </div>
        </Card>
      ) : error && !data ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load loads.</div>
      ) : isLoading && !data ? (
        <TableSkeleton rows={8} />
      ) : data ? (
        <>
          {/* KPI cards */}
          {allLoads.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              <Card className="p-5 shadow-sm">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Available Loads</div>
                <div className="font-mono text-2xl font-bold text-gray-900">{allLoads.length}</div>
              </Card>
              {criticalCount > 0 && (
                <Card className="border-rose-200 p-5 shadow-sm">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Critical Priority</div>
                  <div className="font-mono text-2xl font-bold text-gray-900">{criticalCount}</div>
                </Card>
              )}
              <Card className="p-5 shadow-sm">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Avg Rate/Mile</div>
                <div className="font-mono text-2xl font-bold text-gray-900">${avgRatePerMile.toFixed(2)}</div>
              </Card>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {data.origin_resolved && (
              <span>Searching near <span className="font-medium text-gray-700">{data.origin_resolved.label}</span> ({data.radius_miles} mi)</span>
            )}
            <span>{data.total_found} exact match{data.total_found !== 1 ? "es" : ""}</span>
            {data.total_alternatives > 0 && <span>+ {data.total_alternatives} alternatives</span>}
          </div>

          {allLoads.length === 0 ? (
            <Card className="shadow-sm">
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                <p className="text-sm">No loads found for this search</p>
              </div>
            </Card>
          ) : view === "table" ? (
            <Card className="overflow-hidden shadow-sm">
              <LoadsTable loads={allLoads} exactCount={data.total_found} onSelect={setSelectedLoad} />
            </Card>
          ) : (
            <LoadsCardView loads={allLoads} exactCount={data.total_found} />
          )}
        </>
      ) : null}
    </div>
  );
}
```

**Step 5: Verify — loads page should show KPIs, priority-sorted table, and load detail with map on click**

**Step 6: Commit**

```bash
git add app/loads/page.tsx components/loads/
git commit -m "feat: rebuild loads page with urgency, priority, and map detail"
```

---

## Task 8: Create Analytics Page

**Files:**
- Create: `app/analytics/page.tsx`
- Create: `components/analytics/negotiation-depth.tsx`
- Create: `components/analytics/carrier-objections.tsx`
- Create: `components/analytics/top-lanes-analytics.tsx`
- Create: `components/analytics/equipment-demand-supply.tsx`
- Modify: `lib/swr.ts` — add `useAnalytics()` hook
- Create: `app/api/analytics/route.ts`
- Modify: `lib/api.ts` — add `getAnalytics()`
- Modify: `lib/constants.ts` — add analytics refresh interval (already done in Task 1)

**Step 1: Add analytics API function and SWR hook**

In `lib/api.ts`, add after `getHealthStatus()`:

```typescript
import { AnalyticsData } from "./types";

export async function getAnalytics(): Promise<AnalyticsData> {
  return fetchApi<AnalyticsData>("/api/analytics");
}
```

In `lib/swr.ts`, add at the bottom:

```typescript
import { AnalyticsData } from "./types";

export function useAnalytics() {
  return useSWR<AnalyticsData>("/api/analytics", fetcher, {
    refreshInterval: REFRESH_INTERVALS.analytics,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
}
```

Create `app/api/analytics/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/analytics", request);
}
```

**Step 2: Create `components/analytics/negotiation-depth.tsx`**

```typescript
"use client";

import { Card } from "@/components/ui/card";

interface NegotiationDepthProps {
  data?: Array<{ round: string; pct: number }>;
}

const DEFAULT_DATA = [
  { round: "1st offer", pct: 42 },
  { round: "1 round", pct: 35 },
  { round: "2 rounds", pct: 15 },
  { round: "3 rounds (max)", pct: 8 },
];

export function NegotiationDepth({ data }: NegotiationDepthProps) {
  const items = data ?? DEFAULT_DATA;
  const closeWithinOne = items.slice(0, 2).reduce((s, i) => s + i.pct, 0);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Negotiation Depth</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.round} className="flex items-center gap-2.5">
            <span className="w-24 text-right text-[11px] text-gray-500">{item.round}</span>
            <div className="flex-1 overflow-hidden rounded bg-gray-100" style={{ height: 24 }}>
              <div
                className="flex h-full items-center rounded pl-2"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor: i === 0 ? "#6366f1" : `rgba(99,102,241,${0.7 - i * 0.15})`,
                }}
              >
                <span className="font-mono text-[11px] font-semibold text-white">{item.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
        <strong className="text-gray-900">{closeWithinOne}% close within 1 round</strong> — pricing is well-calibrated.
      </div>
    </Card>
  );
}
```

**Step 3: Create `components/analytics/carrier-objections.tsx`**

```typescript
"use client";

import { Card } from "@/components/ui/card";

interface CarrierObjectionsProps {
  data?: Array<{ reason: string; count: number; pct: number }>;
}

const DEFAULT_DATA = [
  { reason: "Rate too low", count: 14, pct: 33 },
  { reason: "Deadhead too far", count: 9, pct: 21 },
  { reason: "Timing doesn't work", count: 8, pct: 19 },
  { reason: "Wrong equipment", count: 6, pct: 14 },
  { reason: "Prefer different lane", count: 5, pct: 12 },
];

export function CarrierObjections({ data }: CarrierObjectionsProps) {
  const items = data ?? DEFAULT_DATA;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Carrier Objections</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.reason} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 font-mono text-[10px] font-semibold text-gray-400">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900">{item.reason}</div>
              <div className="mt-0.5 h-0.5 rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-indigo-400/65" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
            <span className="font-mono text-[11px] text-gray-400">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

**Step 4: Create `components/analytics/top-lanes-analytics.tsx`**

```typescript
"use client";

import { Card } from "@/components/ui/card";

interface TopLanesAnalyticsProps {
  data?: Array<{ lane: string; calls: number; bookings: number; avg_rate: string }>;
}

const DEFAULT_DATA = [
  { lane: "Chicago → Detroit", calls: 8, bookings: 5, avg_rate: "$2,850" },
  { lane: "Dallas → Memphis", calls: 6, bookings: 3, avg_rate: "$2,400" },
  { lane: "Phoenix → LA", calls: 5, bookings: 4, avg_rate: "$1,450" },
  { lane: "Atlanta → Jacksonville", calls: 4, bookings: 2, avg_rate: "$1,920" },
  { lane: "Nashville → Charlotte", calls: 3, bookings: 2, avg_rate: "$2,100" },
];

export function TopLanesAnalytics({ data }: TopLanesAnalyticsProps) {
  const items = data ?? DEFAULT_DATA;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Lanes by Volume</h3>
      <div className="space-y-1">
        {items.map((item, i) => {
          const convRate = item.calls > 0 ? Math.round((item.bookings / item.calls) * 100) : 0;
          return (
            <div key={item.lane} className={`grid grid-cols-[1fr_50px_50px_60px] items-center rounded-md px-2.5 py-2 ${i === 0 ? "bg-indigo-50/50" : ""}`}>
              <span className="text-xs font-medium text-gray-900">{item.lane}</span>
              <span className="text-center text-[11px] text-gray-400">{item.calls} calls</span>
              <span className="text-center">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${convRate > 50 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                  {convRate}%
                </span>
              </span>
              <span className="text-right font-mono text-xs font-semibold text-gray-900">{item.avg_rate}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

**Step 5: Create `components/analytics/equipment-demand-supply.tsx`**

```typescript
"use client";

import { Card } from "@/components/ui/card";

interface EquipmentDemandSupplyProps {
  data?: Array<{ type: string; demand: number; supply: number }>;
}

const DEFAULT_DATA = [
  { type: "Dry Van", demand: 62, supply: 55 },
  { type: "Reefer", demand: 25, supply: 30 },
  { type: "Flatbed", demand: 13, supply: 15 },
];

export function EquipmentDemandSupply({ data }: EquipmentDemandSupplyProps) {
  const items = data ?? DEFAULT_DATA;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Equipment Demand vs. Inventory</h3>
      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.type}>
            <div className="mb-1.5 flex justify-between">
              <span className="text-xs font-medium text-gray-900">{item.type}</span>
              <span className={`text-[11px] font-semibold ${item.demand > item.supply ? "text-rose-500" : "text-emerald-500"}`}>
                {item.demand > item.supply ? "Under-supplied" : "Balanced"}
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="flex-1">
                <div className="mb-0.5 text-[9px] uppercase text-gray-400">Demand</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.demand}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-0.5 text-[9px] uppercase text-gray-400">Supply</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.supply}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

**Step 6: Create `app/analytics/page.tsx`**

```typescript
"use client";

import { useAnalytics } from "@/lib/swr";
import { NegotiationDepth } from "@/components/analytics/negotiation-depth";
import { CarrierObjections } from "@/components/analytics/carrier-objections";
import { TopLanesAnalytics } from "@/components/analytics/top-lanes-analytics";
import { EquipmentDemandSupply } from "@/components/analytics/equipment-demand-supply";
import { ChartsSkeleton } from "@/components/shared/skeletons";

export default function AnalyticsPage() {
  const { data, error, isLoading } = useAnalytics();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
      {error && !data ? (
        // If analytics endpoint doesn't exist yet, show with default data
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <NegotiationDepth />
          <CarrierObjections />
          <TopLanesAnalytics />
          <EquipmentDemandSupply />
        </div>
      ) : isLoading && !data ? (
        <ChartsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <NegotiationDepth data={data?.negotiation_depth} />
          <CarrierObjections data={data?.carrier_objections} />
          <TopLanesAnalytics data={data?.top_lanes} />
          <EquipmentDemandSupply data={data?.equipment_demand_supply} />
        </div>
      )}
    </div>
  );
}
```

**Step 7: Verify — analytics page renders at /analytics with default data**

**Step 8: Commit**

```bash
git add app/analytics/ components/analytics/ app/api/analytics/ lib/swr.ts lib/api.ts
git commit -m "feat: add analytics page with negotiation depth, objections, lanes, demand"
```

---

## Task 9: Rebuild Settings Page

**Files:**
- Modify: `app/settings/page.tsx`
- Modify: `components/settings/negotiation-form.tsx`

**Step 1: Rewrite `components/settings/negotiation-form.tsx`**

4 sections matching v6 mock: Pricing & Margins, Negotiation Behavior, Smart Features, Agent Voice & Greeting. Use existing `Slider`, `Switch` (install if needed), and `Button` shadcn components. Gracefully handle missing fields with defaults:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { NegotiationSettings } from "@/lib/types";
import { toast } from "sonner";

interface NegotiationFormProps {
  initialSettings: NegotiationSettings;
}

export function NegotiationForm({ initialSettings }: NegotiationFormProps) {
  const [settings, setSettings] = useState({
    target_margin: initialSettings.target_margin,
    min_margin: initialSettings.min_margin,
    max_bump_above_loadboard: initialSettings.max_bump_above_loadboard,
    max_negotiation_rounds: initialSettings.max_negotiation_rounds ?? 3,
    max_offers_per_call: initialSettings.max_offers_per_call ?? 3,
    auto_transfer_threshold: initialSettings.auto_transfer_threshold ?? 500,
    deadhead_warning_miles: initialSettings.deadhead_warning_miles ?? 150,
    floor_rate_protection: initialSettings.floor_rate_protection ?? true,
    sentiment_escalation: initialSettings.sentiment_escalation ?? true,
    prioritize_perishables: initialSettings.prioritize_perishables ?? true,
    agent_greeting: initialSettings.agent_greeting ?? "Thanks for calling, this is your AI carrier sales agent. How can I help you today?",
    agent_tone: initialSettings.agent_tone ?? "professional",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      target_margin: initialSettings.target_margin,
      min_margin: initialSettings.min_margin,
      max_bump_above_loadboard: initialSettings.max_bump_above_loadboard,
      ...(initialSettings.max_negotiation_rounds != null && { max_negotiation_rounds: initialSettings.max_negotiation_rounds }),
      ...(initialSettings.max_offers_per_call != null && { max_offers_per_call: initialSettings.max_offers_per_call }),
      ...(initialSettings.auto_transfer_threshold != null && { auto_transfer_threshold: initialSettings.auto_transfer_threshold }),
      ...(initialSettings.deadhead_warning_miles != null && { deadhead_warning_miles: initialSettings.deadhead_warning_miles }),
      ...(initialSettings.floor_rate_protection != null && { floor_rate_protection: initialSettings.floor_rate_protection }),
      ...(initialSettings.sentiment_escalation != null && { sentiment_escalation: initialSettings.sentiment_escalation }),
      ...(initialSettings.prioritize_perishables != null && { prioritize_perishables: initialSettings.prioritize_perishables }),
      ...(initialSettings.agent_greeting != null && { agent_greeting: initialSettings.agent_greeting }),
      ...(initialSettings.agent_tone != null && { agent_tone: initialSettings.agent_tone }),
    }));
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof typeof settings>(key: K, val: (typeof settings)[K]) =>
    setSettings((s) => ({ ...s, [key]: val }));

  // Multiplier: existing fields are stored as decimals (0.15), display as whole numbers
  const tM = Math.round(settings.target_margin * 100);
  const mM = Math.round(settings.min_margin * 100);
  const bL = Math.round(settings.max_bump_above_loadboard * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Pricing & Margins */}
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Pricing & Margins</h3>
          <p className="mb-5 text-xs text-gray-400">Controls how the AI agent negotiates rates with carriers</p>
          {[
            { label: "Target Margin", desc: "Ideal margin the agent aims for on every deal", value: tM, unit: "%", min: 5, max: 30, onChange: (v: number) => update("target_margin", v / 100) },
            { label: "Minimum Margin", desc: "Absolute floor — agent will never go below this", value: mM, unit: "%", min: 1, max: 20, onChange: (v: number) => update("min_margin", v / 100) },
            { label: "Max Bump Above Loadboard", desc: "How much above loadboard rate the agent can offer", value: bL, unit: "%", min: 0, max: 15, onChange: (v: number) => update("max_bump_above_loadboard", v / 100) },
          ].map((s) => (
            <SliderField key={s.label} {...s} />
          ))}
        </Card>

        {/* Negotiation Behavior */}
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Negotiation Behavior</h3>
          <p className="mb-5 text-xs text-gray-400">Rules governing how the AI conducts negotiations</p>
          {[
            { label: "Max Negotiation Rounds", desc: "Rounds before the agent stops negotiating", value: settings.max_negotiation_rounds, min: 1, max: 5, onChange: (v: number) => update("max_negotiation_rounds", v) },
            { label: "Max Offers Per Call", desc: "Different loads to pitch in a single call", value: settings.max_offers_per_call, min: 1, max: 5, onChange: (v: number) => update("max_offers_per_call", v) },
            { label: "Auto-Transfer Threshold", desc: "Rate gap ($) that triggers transfer to human rep", value: settings.auto_transfer_threshold, unit: "$", min: 100, max: 1000, step: 50, onChange: (v: number) => update("auto_transfer_threshold", v) },
            { label: "Deadhead Warning", desc: "Miles before agent acknowledges carrier concern", value: settings.deadhead_warning_miles, unit: "mi", min: 50, max: 300, step: 10, onChange: (v: number) => update("deadhead_warning_miles", v) },
          ].map((s) => (
            <SliderField key={s.label} {...s} />
          ))}
        </Card>

        {/* Smart Features */}
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Smart Features</h3>
          <p className="mb-5 text-xs text-gray-400">Toggle intelligent behaviors for the AI agent</p>
          {[
            { key: "floor_rate_protection" as const, label: "Floor Rate Protection", desc: "Prevent agent from accepting rates below minimum margin" },
            { key: "sentiment_escalation" as const, label: "Sentiment Escalation", desc: "Auto-transfer to human when carrier sentiment turns very negative" },
            { key: "prioritize_perishables" as const, label: "Prioritize Perishables", desc: "Pitch temperature-controlled loads first when urgency is high" },
          ].map((s, i) => (
            <div key={s.key} className={`flex items-center justify-between py-3 ${i < 2 ? "border-b border-gray-100" : ""}`}>
              <div>
                <div className="text-[13px] font-medium text-gray-900">{s.label}</div>
                <div className="text-[11px] text-gray-400">{s.desc}</div>
              </div>
              <button
                onClick={() => update(s.key, !settings[s.key])}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings[s.key] ? "bg-indigo-500" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${settings[s.key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </Card>

        {/* Agent Voice & Greeting */}
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Agent Voice & Greeting</h3>
          <p className="mb-5 text-xs text-gray-400">Customize how the AI agent sounds and introduces itself</p>
          <div className="mb-4">
            <div className="mb-2 text-[13px] font-medium text-gray-900">Tone</div>
            <div className="flex gap-1.5">
              {(["professional", "friendly", "direct"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update("agent_tone", t)}
                  className={`rounded-lg border-[1.5px] px-4 py-2 text-xs font-medium capitalize transition-colors ${
                    settings.agent_tone === t
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[13px] font-medium text-gray-900">Opening Greeting</div>
            <textarea
              value={settings.agent_greeting}
              onChange={(e) => update("agent_greeting", e.target.value)}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] leading-relaxed text-gray-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
              rows={3}
            />
            <p className="mt-1 text-[11px] text-gray-400">This is the first thing carriers hear when they call in.</p>
          </div>
        </Card>
      </div>

      {/* Save/Reset */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setSettings({
          target_margin: initialSettings.target_margin,
          min_margin: initialSettings.min_margin,
          max_bump_above_loadboard: initialSettings.max_bump_above_loadboard,
          max_negotiation_rounds: initialSettings.max_negotiation_rounds ?? 3,
          max_offers_per_call: initialSettings.max_offers_per_call ?? 3,
          auto_transfer_threshold: initialSettings.auto_transfer_threshold ?? 500,
          deadhead_warning_miles: initialSettings.deadhead_warning_miles ?? 150,
          floor_rate_protection: initialSettings.floor_rate_protection ?? true,
          sentiment_escalation: initialSettings.sentiment_escalation ?? true,
          prioritize_perishables: initialSettings.prioritize_perishables ?? true,
          agent_greeting: initialSettings.agent_greeting ?? "Thanks for calling, this is your AI carrier sales agent. How can I help you today?",
          agent_tone: initialSettings.agent_tone ?? "professional",
        })}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

function SliderField({ label, desc, value, unit, min, max, step, onChange }: {
  label: string; desc: string; value: number; unit?: string; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-gray-900">{label}</div>
          <div className="text-[11px] text-gray-400">{desc}</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1">
          <span className="font-mono text-base font-bold text-gray-900">{value}</span>
          {unit && <span className="text-xs text-gray-400">{unit}</span>}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step ?? 1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
```

**Step 2: Verify — settings page should show 4 sections**

**Step 3: Commit**

```bash
git add app/settings/page.tsx components/settings/negotiation-form.tsx
git commit -m "feat: rebuild settings page with 4 sections matching v6"
```

---

## Task 10: Final Polish & Cleanup

**Files:**
- Potentially modify: `components/loads/loads-card.tsx` — update with urgency if needed
- Clean up any unused imports

**Step 1: Update `loads-card.tsx`**

Update the card view to show urgency badges and use `onSelect` handler. Read the current file first and add urgency + pitch count indicators.

**Step 2: Run `npm run build` to verify no type errors**

Expected: Build succeeds

**Step 3: Manual smoke test**

Visit each page in the browser:
- `/` — Overview: 5 KPIs, funnel, live feed, outcomes, sentiment, rate intel
- `/calls` — Table with status dots, sidebar on click
- `/bookings` — 4 KPIs, rich table, margin + equipment charts (if data available)
- `/loads` — Search loads, KPIs appear, priority table, click for detail with map
- `/analytics` — 4 chart cards with default data
- `/settings` — 4 settings sections with sliders, toggles, greeting

**Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "feat: complete dashboard v6 redesign"
```
