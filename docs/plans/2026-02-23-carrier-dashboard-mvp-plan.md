# Carrier Sales AI Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a premium light-themed operations dashboard for a Carrier Sales AI Agent, covering P0 + P1 + select P2 features.

**Architecture:** Next.js 15+ App Router with Server Components for initial data fetching and SWR for client-side polling. API keys stay server-side via proxy routes. shadcn/ui for components, Recharts for charts, Tailwind for styling.

**Tech Stack:** Next.js 15+, TypeScript (strict), Tailwind CSS, shadcn/ui, Recharts, SWR, Lucide React

**Design Doc:** `docs/plans/2026-02-23-carrier-dashboard-mvp-design.md`
**PRD:** `PRD_DASHBOARD.md`

---

## Phase 1 — Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `.env.local`

**Step 1: Create Next.js app**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

Select defaults. This scaffolds the project with App Router, TypeScript, Tailwind, and ESLint.

**Step 2: Verify it runs**

```bash
npm run dev
```

Open `http://localhost:3000` — should see the Next.js welcome page.

**Step 3: Create `.env.local`**

```env
BACKEND_API_URL=https://YOUR_FLY_IO_DOMAIN
BACKEND_API_KEY=YOUR_API_KEY
HR_API_KEY=
HR_ORG_ID=
HR_USE_CASE_ID=
```

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Install Dependencies and Configure shadcn/ui

**Files:**
- Modify: `package.json`
- Create: `components.json`, `lib/utils.ts`
- Modify: `app/globals.css`

**Step 1: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

**Step 2: Install additional dependencies**

```bash
npm install recharts swr lucide-react
```

**Step 3: Install shadcn/ui components we'll need**

```bash
npx shadcn@latest add button card badge table input select slider separator skeleton sheet dropdown-menu tooltip tabs sonner
```

**Step 4: Verify dev server still runs**

```bash
npm run dev
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui, Recharts, SWR, and Lucide React"
```

---

### Task 3: TypeScript Types

**Files:**
- Create: `lib/types.ts`

**Step 1: Write all TypeScript interfaces**

Create `lib/types.ts` with every type from the PRD:

```typescript
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

// === Paginated Response ===

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
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add all TypeScript interfaces from PRD"
```

---

### Task 4: Constants and Utilities

**Files:**
- Create: `lib/constants.ts`
- Modify: `lib/utils.ts` (add formatting helpers)

**Step 1: Write constants**

Create `lib/constants.ts`:

```typescript
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

export const SENTIMENT_CONFIG: Record<Sentiment, { label: string; bg: string; text: string }> = {
  positive: { label: "Positive", bg: "bg-emerald-50", text: "text-emerald-700" },
  neutral: { label: "Neutral", bg: "bg-gray-100", text: "text-gray-600" },
  frustrated: { label: "Frustrated", bg: "bg-amber-50", text: "text-amber-700" },
  aggressive: { label: "Aggressive", bg: "bg-rose-50", text: "text-rose-700" },
  confused: { label: "Confused", bg: "bg-violet-50", text: "text-violet-700" },
};

export const EQUIPMENT_CONFIG: Record<EquipmentType, { label: string }> = {
  dry_van: { label: "Dry Van" },
  reefer: { label: "Reefer" },
  flatbed: { label: "Flatbed" },
  step_deck: { label: "Step Deck" },
  power_only: { label: "Power Only" },
};

// Chart colors (indigo palette + accent)
export const CHART_COLORS = [
  "#4F46E5", // indigo
  "#059669", // emerald
  "#D97706", // amber
  "#E11D48", // rose
  "#0284C7", // sky
  "#7C3AED", // violet
  "#64748B", // slate
];

// Outcome-specific chart colors
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

// Refresh intervals (ms)
export const REFRESH_INTERVALS = {
  overview: 10_000,
  callsList: 20_000,
  callDetail: 30_000,
  bookings: 20_000,
  loads: 20_000,
  settings: 0, // no auto-refresh
} as const;
```

**Step 2: Add formatting helpers to `lib/utils.ts`**

The file already exists from shadcn init (with `cn()`). Append to it:

```typescript
// Add these below the existing cn() function:

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatLane(origin: string | null, destination: string | null): string {
  if (!origin && !destination) return "—";
  return `${origin ?? "?"} → ${destination ?? "?"}`;
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(isoString: string | null): string {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add lib/constants.ts lib/utils.ts
git commit -m "feat: add constants (status colors, chart config) and formatting utilities"
```

---

### Task 5: Server-Side API Client

**Files:**
- Create: `lib/api.ts`

**Step 1: Write the server-side API client**

Create `lib/api.ts`:

```typescript
import {
  DashboardMetrics,
  CallDetail,
  CallSummary,
  BookedLoad,
  Load,
  NegotiationSettings,
  PaginatedResponse,
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
    next: { revalidate: 0 }, // always fresh for server components
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// === Dashboard ===

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return fetchApi<DashboardMetrics>("/api/dashboard/metrics");
}

// === Calls ===

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

// === Bookings ===

export async function getBookedLoads(): Promise<BookedLoad[]> {
  return fetchApi<BookedLoad[]>("/api/booked-loads");
}

// === Loads ===

export async function getLoad(loadId: string): Promise<Load> {
  return fetchApi<Load>(`/api/loads/${loadId}`);
}

export async function searchLoads(filters?: Record<string, unknown>): Promise<Load[]> {
  return fetchApi<Load[]>("/api/loads/search", {
    method: "POST",
    body: JSON.stringify(filters ?? {}),
  });
}

// === Settings ===

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

// === Health ===

export async function getHealthStatus(): Promise<boolean> {
  try {
    if (!BACKEND_URL) return false;
    const res = await fetch(`${BACKEND_URL}/health`, { next: { revalidate: 0 } });
    return res.ok;
  } catch {
    return false;
  }
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add typed server-side API client for backend endpoints"
```

---

### Task 6: API Proxy Routes

**Files:**
- Create: `app/api/dashboard/route.ts`
- Create: `app/api/calls/route.ts`
- Create: `app/api/calls/[callId]/route.ts`
- Create: `app/api/bookings/route.ts`
- Create: `app/api/loads/route.ts`
- Create: `app/api/settings/route.ts`

**Step 1: Create a shared proxy helper**

Create `lib/proxy.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.BACKEND_API_KEY;

export async function proxyGet(path: string, request: NextRequest): Promise<NextResponse> {
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const url = new URL(path, BACKEND_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function proxyMutate(
  path: string,
  request: NextRequest,
  method: "POST" | "PUT" | "PATCH" | "DELETE"
): Promise<NextResponse> {
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

**Step 2: Create each proxy route**

`app/api/dashboard/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/dashboard/metrics", request);
}
```

`app/api/calls/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/calls", request);
}
```

`app/api/calls/[callId]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.BACKEND_API_KEY;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  const { callId } = await params;
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = await fetch(`${BACKEND_URL}/api/calls/${callId}`, {
    headers: { "X-API-Key": API_KEY },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

`app/api/bookings/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/booked-loads", request);
}
```

`app/api/loads/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyGet, proxyMutate } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/loads/search", request);
}

export async function POST(request: NextRequest) {
  return proxyMutate("/api/loads/search", request, "POST");
}
```

`app/api/settings/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyGet, proxyMutate } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/settings/negotiation", request);
}

export async function PUT(request: NextRequest) {
  return proxyMutate("/api/settings/negotiation", request, "PUT");
}
```

**Step 3: Verify dev server runs and test one route**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/dashboard
```

Should return JSON from the backend (or an error if env vars not set yet — that's OK).

**Step 4: Commit**

```bash
git add lib/proxy.ts app/api/
git commit -m "feat: add API proxy routes for all backend endpoints"
```

---

### Task 7: SWR Client Hooks

**Files:**
- Create: `lib/swr.ts`

**Step 1: Write SWR hooks**

Create `lib/swr.ts`:

```typescript
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
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add lib/swr.ts
git commit -m "feat: add SWR hooks with configurable polling intervals"
```

---

### Task 8: Layout Shell — Sidebar + Topbar

**Files:**
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/topbar.tsx`
- Create: `components/layout/sidebar-context.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Step 1: Create sidebar context for collapse state**

Create `components/layout/sidebar-context.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((c) => !c) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
```

**Step 2: Create sidebar**

Create `components/layout/sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  Package,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/bookings", label: "Bookings", icon: Package },
  { href: "/loads", label: "Loads", icon: Truck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          {!collapsed && (
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              Carrier Sales AI
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-gray-200 p-2">
          <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-center">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
```

**Step 3: Create topbar**

Create `components/layout/topbar.tsx`:

```typescript
"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

export function Topbar() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      setHealthy(res.ok);
      setLastRefresh(new Date());
    } catch {
      setHealthy(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefresh.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefresh]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className={`h-2 w-2 rounded-full ${
              healthy === null ? "bg-gray-300" : healthy ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span>
            {secondsAgo < 5 ? "Just now" : `${secondsAgo}s ago`}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={checkHealth}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
```

**Step 4: Update root layout**

Replace `app/layout.tsx` contents:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carrier Sales AI Dashboard",
  description: "Operations dashboard for the Carrier Sales AI Agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

**Step 5: Update globals.css** — keep Tailwind directives, remove default Next.js styles. Ensure the file has:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* shadcn/ui CSS variables will be here from init — keep them */
```

Remove any default Next.js template styles (grid patterns, etc.).

**Step 6: Create placeholder page**

Replace `app/page.tsx`:

```typescript
export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <p className="mt-2 text-sm text-gray-500">Dashboard coming soon.</p>
    </div>
  );
}
```

**Step 7: Verify the layout renders**

```bash
npm run dev
```

Open `http://localhost:3000` — should see sidebar with nav links, topbar with health dot, and the placeholder content.

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add layout shell with collapsible sidebar, topbar, and Inter font"
```

---

## Phase 2 — Core Pages (P0)

### Task 9: Overview Page — KPI Cards

**Files:**
- Create: `components/dashboard/kpi-cards.tsx`
- Modify: `app/page.tsx`

**Step 1: Create KPI cards component**

Create `components/dashboard/kpi-cards.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import {
  Phone,
  Target,
  DollarSign,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";
import { DashboardMetrics } from "@/lib/types";
import { formatDuration, formatCurrency, formatPercent } from "@/lib/utils";

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const cards = [
    {
      label: "Total Calls",
      value: metrics.total_calls.toLocaleString(),
      icon: Phone,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Booking Rate",
      value: formatPercent(metrics.booking_rate_percent),
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.total_revenue),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Avg Duration",
      value: formatDuration(metrics.avg_duration_seconds),
      icon: Clock,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Unique Carriers",
      value: metrics.unique_carriers.toLocaleString(),
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Avg Rounds",
      value: metrics.avg_negotiation_rounds?.toFixed(1) ?? "—",
      icon: MessageSquare,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="flex items-center gap-4 p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className={`rounded-lg p-2.5 ${card.bg}`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900">
              {card.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Wire up overview page with server-side data + SWR**

Replace `app/page.tsx`:

```typescript
import { getDashboardMetrics } from "@/lib/api";
import { OverviewClient } from "@/components/dashboard/overview-client";

export default async function OverviewPage() {
  let initialMetrics = null;
  try {
    initialMetrics = await getDashboardMetrics();
  } catch {
    // Will show error state in client component
  }

  return <OverviewClient initialMetrics={initialMetrics} />;
}
```

Create `components/dashboard/overview-client.tsx`:

```typescript
"use client";

import { DashboardMetrics } from "@/lib/types";
import { useDashboardMetrics } from "@/lib/swr";
import { KpiCards } from "./kpi-cards";

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
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <KpiCards metrics={displayMetrics} />
      {/* Charts and tables will be added in subsequent tasks */}
    </div>
  );
}
```

**Step 3: Verify KPI cards render**

```bash
npm run dev
```

Open `http://localhost:3000` — should see 6 KPI cards with data from the backend (or error state if backend isn't configured).

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add overview page with KPI cards and SWR polling"
```

---

### Task 10: Overview Page — Charts

**Files:**
- Create: `components/dashboard/outcome-chart.tsx`
- Create: `components/dashboard/sentiment-chart.tsx`
- Create: `components/dashboard/equipment-chart.tsx`
- Create: `components/dashboard/top-lanes-chart.tsx`
- Modify: `components/dashboard/overview-client.tsx`

**Step 1: Create outcome donut chart**

Create `components/dashboard/outcome-chart.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { OUTCOME_CHART_COLORS } from "@/lib/constants";
import { OUTCOME_CONFIG } from "@/lib/constants";

interface OutcomeChartProps {
  data: Record<string, number>;
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: OUTCOME_CONFIG[key as keyof typeof OUTCOME_CONFIG]?.label ?? key,
    value,
    color: OUTCOME_CHART_COLORS[key] ?? "#9CA3AF",
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Calls by Outcome</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [value, "Calls"]}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-900 text-2xl font-semibold"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

**Step 2: Create sentiment chart**

Create `components/dashboard/sentiment-chart.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { SENTIMENT_CHART_COLORS, SENTIMENT_CONFIG } from "@/lib/constants";

interface SentimentChartProps {
  data: Record<string, number>;
}

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: SENTIMENT_CONFIG[key as keyof typeof SENTIMENT_CONFIG]?.label ?? key,
    value,
    color: SENTIMENT_CHART_COLORS[key] ?? "#9CA3AF",
  }));

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Sentiment Distribution</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

**Step 3: Create equipment chart**

Create `components/dashboard/equipment-chart.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface EquipmentChartProps {
  data: Record<string, number>;
}

export function EquipmentChart({ data }: EquipmentChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: EQUIPMENT_CONFIG[key as keyof typeof EQUIPMENT_CONFIG]?.label ?? key,
    value,
  }));

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Equipment Demand</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

**Step 4: Create top lanes chart**

Create `components/dashboard/top-lanes-chart.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface TopLanesChartProps {
  data: Array<{ lane: string; count: number }>;
}

export function TopLanesChart({ data }: TopLanesChartProps) {
  const chartData = data.slice(0, 8);

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Top Lanes</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="lane"
              width={140}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

**Step 5: Update overview-client to include charts**

Add charts to `components/dashboard/overview-client.tsx` below `<KpiCards />`:

```typescript
// Add imports at top:
import { OutcomeChart } from "./outcome-chart";
import { SentimentChart } from "./sentiment-chart";
import { EquipmentChart } from "./equipment-chart";
import { TopLanesChart } from "./top-lanes-chart";

// In the return, after <KpiCards metrics={displayMetrics} />:
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <OutcomeChart data={displayMetrics.calls_by_outcome} />
  <SentimentChart data={displayMetrics.sentiment_distribution} />
  <EquipmentChart data={displayMetrics.equipment_demand} />
  <TopLanesChart data={displayMetrics.top_lanes} />
</div>
```

**Step 6: Verify charts render**

```bash
npm run dev
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add overview charts (outcome donut, sentiment, equipment, top lanes)"
```

---

### Task 11: Overview Page — Recent Tables

**Files:**
- Create: `components/dashboard/recent-calls-table.tsx`
- Create: `components/dashboard/recent-offers-table.tsx`
- Create: `components/shared/status-badge.tsx`
- Modify: `components/dashboard/overview-client.tsx`

**Step 1: Create reusable status badge component**

Create `components/shared/status-badge.tsx`:

```typescript
import { cn } from "@/lib/utils";
import { OUTCOME_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { CallOutcome, Sentiment } from "@/lib/types";

export function OutcomeBadge({ outcome }: { outcome: CallOutcome }) {
  const config = OUTCOME_CONFIG[outcome];
  if (!config) return <span>{outcome}</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const config = SENTIMENT_CONFIG[sentiment];
  if (!config) return <span>{sentiment}</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.bg, config.text)}>
      {config.label}
    </span>
  );
}
```

**Step 2: Create recent calls table**

Create `components/dashboard/recent-calls-table.tsx`:

```typescript
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import { OutcomeBadge, SentimentBadge } from "@/components/shared/status-badge";
import { formatDuration, formatLane, formatRelativeTime } from "@/lib/utils";

interface RecentCallsTableProps {
  calls: CallSummary[];
}

export function RecentCallsTable({ calls }: RecentCallsTableProps) {
  return (
    <Card className="shadow-sm">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Calls</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="text-xs">Carrier</TableHead>
            <TableHead className="text-xs">Lane</TableHead>
            <TableHead className="text-xs">Outcome</TableHead>
            <TableHead className="text-xs">Sentiment</TableHead>
            <TableHead className="text-xs text-right">Duration</TableHead>
            <TableHead className="text-xs text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow
              key={call.id}
              className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50"
            >
              <TableCell className="text-sm">
                <Link href={`/calls/${call.call_id}`} className="hover:text-indigo-600">
                  {call.carrier_name ?? "Unknown"}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatLane(call.lane_origin, call.lane_destination)}
              </TableCell>
              <TableCell><OutcomeBadge outcome={call.outcome} /></TableCell>
              <TableCell><SentimentBadge sentiment={call.sentiment} /></TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {formatDuration(call.duration_seconds)}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {formatRelativeTime(call.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
```

**Step 3: Create recent offers table**

Create `components/dashboard/recent-offers-table.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OfferSummary } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RecentOffersTableProps {
  offers: OfferSummary[];
}

export function RecentOffersTable({ offers }: RecentOffersTableProps) {
  return (
    <Card className="shadow-sm">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Offers</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="text-xs">Load</TableHead>
            <TableHead className="text-xs">Carrier</TableHead>
            <TableHead className="text-xs">Amount</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id} className="border-gray-100">
              <TableCell className="text-sm font-mono text-xs">{offer.load_id}</TableCell>
              <TableCell className="text-sm">{offer.carrier_name ?? "Unknown"}</TableCell>
              <TableCell className="text-sm">{formatCurrency(offer.amount)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {offer.offer_type}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  offer.status === "accepted" && "bg-emerald-50 text-emerald-700",
                  offer.status === "rejected" && "bg-rose-50 text-rose-700",
                  offer.status === "pending" && "bg-amber-50 text-amber-700",
                  offer.status === "expired" && "bg-gray-100 text-gray-600"
                )}>
                  {offer.status}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {formatRelativeTime(offer.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
```

**Step 4: Add tables to overview-client.tsx**

Add after the charts grid:

```typescript
// Add imports:
import { RecentCallsTable } from "./recent-calls-table";
import { RecentOffersTable } from "./recent-offers-table";

// Add after charts grid:
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <RecentCallsTable calls={displayMetrics.recent_calls} />
  <RecentOffersTable offers={displayMetrics.recent_offers} />
</div>
```

**Step 5: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add recent calls and offers tables to overview with status badges"
```

---

### Task 12: Calls List Page

**Files:**
- Create: `components/calls/call-filters.tsx`
- Create: `components/calls/calls-table.tsx`
- Create: `app/calls/page.tsx`

**Step 1: Create call filters component**

Create `components/calls/call-filters.tsx`:

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OUTCOME_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { useCallback, useState } from "react";

interface CallFiltersProps {
  onFilterChange: (filters: {
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }) => void;
}

export function CallFilters({ onFilterChange }: CallFiltersProps) {
  const [mcNumber, setMcNumber] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMcChange = useCallback(
    (value: string) => {
      setMcNumber(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        onFilterChange({ mc_number: value || undefined });
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer, onFilterChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select onValueChange={(v) => onFilterChange({ outcome: v === "all" ? undefined : v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Outcomes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Outcomes</SelectItem>
          {Object.entries(OUTCOME_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>{config.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => onFilterChange({ sentiment: v === "all" ? undefined : v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Sentiments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiments</SelectItem>
          {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>{config.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="MC Number..."
        value={mcNumber}
        onChange={(e) => handleMcChange(e.target.value)}
        className="w-44"
      />
    </div>
  );
}
```

**Step 2: Create calls table**

Create `components/calls/calls-table.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import { OutcomeBadge, SentimentBadge } from "@/components/shared/status-badge";
import { formatDuration, formatLane, formatCurrency, formatDateTime } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface CallsTableProps {
  calls: CallSummary[];
}

export function CallsTable({ calls }: CallsTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Call ID</TableHead>
          <TableHead className="text-xs">Carrier</TableHead>
          <TableHead className="text-xs">MC#</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equipment</TableHead>
          <TableHead className="text-xs">Outcome</TableHead>
          <TableHead className="text-xs">Sentiment</TableHead>
          <TableHead className="text-xs text-right">Duration</TableHead>
          <TableHead className="text-xs text-right">Rounds</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs text-right">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow
            key={call.id}
            className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50"
            onClick={() => router.push(`/calls/${call.call_id}`)}
          >
            <TableCell className="font-mono text-xs text-gray-500">
              {call.call_id.slice(0, 8)}
            </TableCell>
            <TableCell className="text-sm">{call.carrier_name ?? "Unknown"}</TableCell>
            <TableCell className="font-mono text-xs">{call.mc_number ?? "—"}</TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatLane(call.lane_origin, call.lane_destination)}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {call.equipment_type
                ? EQUIPMENT_CONFIG[call.equipment_type as keyof typeof EQUIPMENT_CONFIG]?.label ?? call.equipment_type
                : "—"}
            </TableCell>
            <TableCell><OutcomeBadge outcome={call.outcome} /></TableCell>
            <TableCell><SentimentBadge sentiment={call.sentiment} /></TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {formatDuration(call.duration_seconds)}
            </TableCell>
            <TableCell className="text-right text-sm">{call.negotiation_rounds}</TableCell>
            <TableCell className="text-right text-sm">
              {call.initial_rate && call.final_rate
                ? `${formatCurrency(call.initial_rate)} → ${formatCurrency(call.final_rate)}`
                : "—"}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {formatDateTime(call.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Step 3: Create calls page**

Create `app/calls/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CallFilters } from "@/components/calls/call-filters";
import { CallsTable } from "@/components/calls/calls-table";
import { useCalls } from "@/lib/swr";

export default function CallsPage() {
  const [filters, setFilters] = useState<{
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }>({});
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, error, isLoading } = useCalls({ ...filters, page, page_size: pageSize });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Calls</h1>

      <CallFilters onFilterChange={handleFilterChange} />

      <Card className="shadow-sm">
        {error && !data ? (
          <div className="p-6 text-sm text-red-600">Failed to load calls.</div>
        ) : isLoading && !data ? (
          <div className="p-6 text-sm text-gray-500">Loading...</div>
        ) : data ? (
          <>
            <CallsTable calls={data.items} />
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-500">
                {data.total} total calls
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {Math.ceil((data.total || 1) / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= data.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
```

**Step 4: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add calls list page with filters, table, and pagination"
```

---

### Task 13: Call Detail Page

**Files:**
- Create: `components/calls/call-metadata.tsx`
- Create: `components/calls/transcript-viewer.tsx`
- Create: `app/calls/[callId]/page.tsx`

**Step 1: Create call metadata component**

Create `components/calls/call-metadata.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { CallDetail } from "@/lib/types";
import { OutcomeBadge, SentimentBadge } from "@/components/shared/status-badge";
import { formatDuration, formatCurrency, formatDateTime, formatLane } from "@/lib/utils";

interface CallMetadataProps {
  call: CallDetail;
}

export function CallMetadata({ call }: CallMetadataProps) {
  const rateDiff =
    call.initial_rate && call.final_rate
      ? (((call.final_rate - call.initial_rate) / call.initial_rate) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-4">
      {/* Call Info */}
      <Card className="p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">Call Info</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Carrier</dt>
            <dd className="font-medium">{call.carrier_name ?? "Unknown"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">MC Number</dt>
            <dd className="font-mono text-xs">{call.mc_number ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Phone</dt>
            <dd>{call.carrier_phone ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Lane</dt>
            <dd>{formatLane(call.lane_origin, call.lane_destination)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Equipment</dt>
            <dd>{call.equipment_type ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Duration</dt>
            <dd>{formatDuration(call.duration_seconds)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Outcome</dt>
            <dd><OutcomeBadge outcome={call.outcome} /></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Sentiment</dt>
            <dd><SentimentBadge sentiment={call.sentiment} /></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Created</dt>
            <dd>{formatDateTime(call.created_at)}</dd>
          </div>
        </dl>
      </Card>

      {/* Negotiation Summary */}
      <Card className="p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">Negotiation</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Rounds</dt>
            <dd className="font-medium">{call.negotiation_rounds}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Initial Rate</dt>
            <dd>{formatCurrency(call.initial_rate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Final Rate</dt>
            <dd className="font-medium">{formatCurrency(call.final_rate)}</dd>
          </div>
          {rateDiff && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Rate Change</dt>
              <dd className={Number(rateDiff) >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {Number(rateDiff) >= 0 ? "+" : ""}{rateDiff}%
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Key Points */}
      {call.key_points && call.key_points.length > 0 && (
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Key Points</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            {call.key_points.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-indigo-400">•</span>
                {point}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* AI Summary */}
      {call.summary && (
        <Card className="p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">AI Summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{call.summary}</p>
        </Card>
      )}
    </div>
  );
}
```

**Step 2: Create transcript viewer**

Create `components/calls/transcript-viewer.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  transcript: string | null;
}

interface ParsedMessage {
  role: "agent" | "carrier" | "system";
  content: string;
}

function parseTranscript(raw: string): ParsedMessage[] {
  // Try to parse as JSON array first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((msg: { role?: string; content?: string }) => ({
        role: msg.role === "assistant" || msg.role === "agent" ? "agent"
          : msg.role === "user" || msg.role === "carrier" ? "carrier"
          : "system",
        content: msg.content ?? "",
      }));
    }
  } catch {
    // Not JSON — try line-by-line parsing
  }

  // Fallback: split by newlines, detect role prefixes
  return raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      if (line.match(/^(agent|assistant|ai):/i)) {
        return { role: "agent" as const, content: line.replace(/^(agent|assistant|ai):\s*/i, "") };
      }
      if (line.match(/^(carrier|user|caller):/i)) {
        return { role: "carrier" as const, content: line.replace(/^(carrier|user|caller):\s*/i, "") };
      }
      return { role: "system" as const, content: line };
    });
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript) {
    return (
      <Card className="flex h-full items-center justify-center p-10 shadow-sm">
        <p className="text-sm text-gray-400">No transcript available.</p>
      </Card>
    );
  }

  const messages = parseTranscript(transcript);

  return (
    <Card className="shadow-sm">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-medium text-gray-700">Transcript</h3>
      </div>
      <div className="max-h-[600px] space-y-3 overflow-y-auto px-5 pb-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "agent" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "agent"
                  ? "bg-indigo-50 text-indigo-900"
                  : msg.role === "carrier"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-amber-50 text-amber-800 text-xs italic"
              )}
            >
              <span className="mb-1 block text-xs font-medium opacity-60">
                {msg.role === "agent" ? "AI Agent" : msg.role === "carrier" ? "Carrier" : "System"}
              </span>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

**Step 3: Create call detail page**

Create `app/calls/[callId]/page.tsx`:

```typescript
import { getCallDetail } from "@/lib/api";
import { CallDetailClient } from "@/components/calls/call-detail-client";

interface CallDetailPageProps {
  params: Promise<{ callId: string }>;
}

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { callId } = await params;

  let initialCall = null;
  try {
    initialCall = await getCallDetail(callId);
  } catch {
    // Client component will handle error
  }

  return <CallDetailClient callId={callId} initialCall={initialCall} />;
}
```

Create `components/calls/call-detail-client.tsx`:

```typescript
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallDetail } from "@/lib/types";
import { useCallDetail } from "@/lib/swr";
import { CallMetadata } from "./call-metadata";
import { TranscriptViewer } from "./transcript-viewer";

interface CallDetailClientProps {
  callId: string;
  initialCall: CallDetail | null;
}

export function CallDetailClient({ callId, initialCall }: CallDetailClientProps) {
  const { data: call, error } = useCallDetail(callId);
  const displayCall = call ?? initialCall;

  if (error && !displayCall) {
    return (
      <div className="space-y-4">
        <Link href="/calls">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back to Calls</Button>
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load call details.
        </div>
      </div>
    );
  }

  if (!displayCall) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/calls">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Call — {displayCall.carrier_name ?? displayCall.call_id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CallMetadata call={displayCall} />
        </div>
        <div className="lg:col-span-3">
          <TranscriptViewer transcript={displayCall.transcript} />
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add call detail page with metadata cards and transcript viewer"
```

---

### Task 14: Bookings Page

**Files:**
- Create: `components/bookings/bookings-summary.tsx`
- Create: `components/bookings/bookings-table.tsx`
- Create: `app/bookings/page.tsx`

**Step 1: Create bookings summary cards**

Create `components/bookings/bookings-summary.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BookedLoad } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Package, DollarSign, TrendingUp, Users } from "lucide-react";

interface BookingsSummaryProps {
  bookings: BookedLoad[];
}

export function BookingsSummary({ bookings }: BookingsSummaryProps) {
  const totalRevenue = bookings.reduce((sum, b) => sum + b.agreed_rate, 0);

  // Find most active carrier
  const carrierCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    const name = b.carrier_name ?? b.mc_number;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const mostActive = Object.entries(carrierCounts).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    { label: "Total Bookings", value: bookings.length.toString(), icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg Rate", value: formatCurrency(bookings.length ? totalRevenue / bookings.length : 0), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Top Carrier", value: mostActive ? mostActive[0] : "—", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="flex items-center gap-4 p-4 shadow-sm">
          <div className={`rounded-lg p-2.5 ${card.bg}`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-xl font-semibold tracking-tight text-gray-900">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Create bookings table**

Create `components/bookings/bookings-table.tsx`:

```typescript
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookedLoad } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface BookingsTableProps {
  bookings: BookedLoad[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Carrier</TableHead>
          <TableHead className="text-xs">MC#</TableHead>
          <TableHead className="text-xs text-right">Agreed Rate</TableHead>
          <TableHead className="text-xs">Pickup</TableHead>
          <TableHead className="text-xs text-right">Booked At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id} className="border-gray-100">
            <TableCell className="font-mono text-xs">{booking.load_id}</TableCell>
            <TableCell className="text-sm">{booking.carrier_name ?? "Unknown"}</TableCell>
            <TableCell className="font-mono text-xs">{booking.mc_number}</TableCell>
            <TableCell className="text-right text-sm font-medium text-emerald-600">
              {formatCurrency(booking.agreed_rate)}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatDateTime(booking.agreed_pickup_datetime)}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {formatDateTime(booking.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Step 3: Create bookings page**

Create `app/bookings/page.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { BookingsSummary } from "@/components/bookings/bookings-summary";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { useBookings } from "@/lib/swr";

export default function BookingsPage() {
  const { data: bookings, error, isLoading } = useBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>

      {error && !bookings ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load bookings.
        </div>
      ) : isLoading && !bookings ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : bookings ? (
        <>
          <BookingsSummary bookings={bookings} />
          <Card className="shadow-sm">
            <BookingsTable bookings={bookings} />
          </Card>
        </>
      ) : null}
    </div>
  );
}
```

**Step 4: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add bookings page with summary cards and table"
```

---

### Task 15: Settings Page

**Files:**
- Create: `components/settings/negotiation-form.tsx`
- Create: `app/settings/page.tsx`

**Step 1: Create negotiation form**

Create `components/settings/negotiation-form.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { NegotiationSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface NegotiationFormProps {
  initialSettings: NegotiationSettings;
}

export function NegotiationForm({ initialSettings }: NegotiationFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const exampleRate = 2000;
  const floorRate = exampleRate * (1 - settings.target_margin);
  const ceilingRate = exampleRate * (1 + settings.max_bump_above_loadboard);

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

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="space-y-6 p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Target Margin — {(settings.target_margin * 100).toFixed(0)}%
          </label>
          <Slider
            className="mt-3"
            min={0}
            max={50}
            step={1}
            value={[settings.target_margin * 100]}
            onValueChange={([v]) => setSettings((s) => ({ ...s, target_margin: v / 100 }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Minimum Margin — {(settings.min_margin * 100).toFixed(0)}%
          </label>
          <Slider
            className="mt-3"
            min={0}
            max={30}
            step={1}
            value={[settings.min_margin * 100]}
            onValueChange={([v]) => setSettings((s) => ({ ...s, min_margin: v / 100 }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Max Bump Above Loadboard — {(settings.max_bump_above_loadboard * 100).toFixed(0)}%
          </label>
          <Slider
            className="mt-3"
            min={0}
            max={20}
            step={1}
            value={[settings.max_bump_above_loadboard * 100]}
            onValueChange={([v]) => setSettings((s) => ({ ...s, max_bump_above_loadboard: v / 100 }))}
          />
        </div>
      </Card>

      {/* Example calculation */}
      <Card className="bg-gray-50 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">Example Calculation</h3>
        <p className="mt-2 text-sm text-gray-600">
          For a load posted at <span className="font-semibold">{formatCurrency(exampleRate)}</span>:
          floor rate = <span className="font-semibold text-amber-600">{formatCurrency(floorRate)}</span>{" "}
          ({(settings.target_margin * 100).toFixed(0)}% margin), ceiling ={" "}
          <span className="font-semibold text-emerald-600">{formatCurrency(ceilingRate)}</span>{" "}
          ({(settings.max_bump_above_loadboard * 100).toFixed(0)}% bump)
        </p>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
```

**Step 2: Create settings page**

Create `app/settings/page.tsx`:

```typescript
"use client";

import { NegotiationForm } from "@/components/settings/negotiation-form";
import { useSettings } from "@/lib/swr";

export default function SettingsPage() {
  const { data: settings, error, isLoading } = useSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Negotiation Settings</h1>

      {error && !settings ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load settings.
        </div>
      ) : isLoading && !settings ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : settings ? (
        <NegotiationForm initialSettings={settings} />
      ) : null}
    </div>
  );
}
```

**Step 3: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add settings page with margin sliders and example calculation"
```

---

## Phase 3 — Polish (P1)

### Task 16: Loads Page

**Files:**
- Create: `components/loads/loads-table.tsx`
- Create: `components/loads/loads-card.tsx`
- Create: `components/loads/load-filters.tsx`
- Create: `app/loads/page.tsx`

**Step 1: Create load filters**

Create `components/loads/load-filters.tsx`:

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadFiltersProps {
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export function LoadFilters({ onFilterChange }: LoadFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select onValueChange={(v) => onFilterChange({ equipment_type: v === "all" ? undefined : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Equipment" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Equipment</SelectItem>
          {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>{config.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input placeholder="Origin..." className="w-36" onChange={(e) => onFilterChange({ origin: e.target.value || undefined })} />
      <Input placeholder="Destination..." className="w-36" onChange={(e) => onFilterChange({ destination: e.target.value || undefined })} />
    </div>
  );
}
```

**Step 2: Create loads table**

Create `components/loads/loads-table.tsx`:

```typescript
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Load } from "@/lib/types";
import { formatCurrency, formatDateTime, formatLane } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadsTableProps {
  loads: Load[];
}

export function LoadsTable({ loads }: LoadsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equipment</TableHead>
          <TableHead className="text-xs">Pickup</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs text-right">$/Mile</TableHead>
          <TableHead className="text-xs text-right">Weight</TableHead>
          <TableHead className="text-xs text-right">Miles</TableHead>
          <TableHead className="text-xs">Commodity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loads.map((load) => (
          <TableRow key={load.load_id} className="border-gray-100">
            <TableCell className="font-mono text-xs">{load.load_id}</TableCell>
            <TableCell className="text-sm">{formatLane(load.origin, load.destination)}</TableCell>
            <TableCell className="text-sm">
              {EQUIPMENT_CONFIG[load.equipment_type]?.label ?? load.equipment_type}
            </TableCell>
            <TableCell className="text-sm text-gray-500">{formatDateTime(load.pickup_datetime)}</TableCell>
            <TableCell className="text-right text-sm font-medium">{formatCurrency(load.loadboard_rate)}</TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {load.miles > 0 ? formatCurrency(load.loadboard_rate / load.miles) : "—"}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {load.weight.toLocaleString()} lbs
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">{load.miles}</TableCell>
            <TableCell className="text-sm text-gray-500">{load.commodity_type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Step 3: Create loads card view**

Create `components/loads/loads-card.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Load } from "@/lib/types";
import { formatCurrency, formatLane } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadsCardViewProps {
  loads: Load[];
}

export function LoadsCardView({ loads }: LoadsCardViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loads.map((load) => (
        <Card key={load.load_id} className="p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">{load.load_id}</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {EQUIPMENT_CONFIG[load.equipment_type]?.label ?? load.equipment_type}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {formatLane(load.origin, load.destination)}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">{load.miles} mi • {load.weight.toLocaleString()} lbs</span>
            <span className="font-semibold text-gray-900">{formatCurrency(load.loadboard_rate)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Step 4: Create loads page**

Create `app/loads/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { LoadFilters } from "@/components/loads/load-filters";
import { LoadsTable } from "@/components/loads/loads-table";
import { LoadsCardView } from "@/components/loads/loads-card";
import { useLoads } from "@/lib/swr";

export default function LoadsPage() {
  const [view, setView] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  const { data: loads, error, isLoading } = useLoads(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Loads</h1>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "card" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <LoadFilters onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))} />

      {error && !loads ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load loads.
        </div>
      ) : isLoading && !loads ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : loads ? (
        view === "table" ? (
          <Card className="shadow-sm"><LoadsTable loads={loads} /></Card>
        ) : (
          <LoadsCardView loads={loads} />
        )
      ) : null}
    </div>
  );
}
```

**Step 5: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add loads page with table/card toggle and filters"
```

---

### Task 17: Loading Skeletons

**Files:**
- Create: `components/shared/skeletons.tsx`
- Modify: overview, calls, bookings, loads pages to use skeletons instead of "Loading..." text

**Step 1: Create skeleton components**

Create `components/shared/skeletons.tsx`:

```typescript
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="h-52 w-full rounded" />
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </Card>
  );
}
```

**Step 2: Replace "Loading..." with skeletons in each page component**

In `components/dashboard/overview-client.tsx`, replace the loading state:
```typescript
import { KpiCardsSkeleton, ChartsSkeleton, TableSkeleton } from "@/components/shared/skeletons";

// Replace: <div className="text-sm text-gray-500">Loading...</div>
// With:
<div className="space-y-6">
  <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
  <KpiCardsSkeleton />
  <ChartsSkeleton />
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <TableSkeleton rows={5} />
    <TableSkeleton rows={5} />
  </div>
</div>
```

Similarly update calls, bookings, loads pages to use `<TableSkeleton />` instead of "Loading..." text.

**Step 3: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add loading skeletons for all data sections"
```

---

## Phase 4 — Extended (P2)

### Task 18: HappyRobot Integration

**Files:**
- Create: `lib/happyrobot.ts`
- Create: `app/api/happyrobot/[...path]/route.ts`
- Create: `components/calls/audio-player.tsx`
- Create: `components/calls/hr-details.tsx`
- Modify: `components/calls/call-detail-client.tsx`

**Step 1: Create HappyRobot API client**

Create `lib/happyrobot.ts`:

```typescript
const HR_BASE_URL = "https://platform.happyrobot.ai/api/v2";
const HR_API_KEY = process.env.HR_API_KEY;

async function fetchHR<T>(path: string): Promise<T | null> {
  if (!HR_API_KEY) return null;

  const res = await fetch(`${HR_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${HR_API_KEY}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function getHRRunDetail(runId: string) {
  return fetchHR<Record<string, unknown>>(`/runs/${runId}`);
}

export async function getHRRecordings(runId: string) {
  return fetchHR<Array<{ session_id: string; url: string }>>(`/runs/${runId}/recordings`);
}

export function isHRConfigured(): boolean {
  return !!HR_API_KEY;
}
```

**Step 2: Create audio player component**

Create `components/calls/audio-player.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Volume2 className="h-5 w-5 text-indigo-600" />
        <span className="text-sm font-medium text-gray-700">Call Recording</span>
      </div>
      <audio controls className="mt-3 w-full" src={url}>
        Your browser does not support audio playback.
      </audio>
    </Card>
  );
}
```

**Step 3: Update call-detail-client.tsx to include HR data**

Add the audio player conditionally when HR recording data is available. Fetch HR data through an API proxy route if the call has a matching run ID. The implementation depends on how the backend correlates call_id to run_id — add a conditional render:

```typescript
// If hrRecordingUrl is available:
{hrRecordingUrl && <AudioPlayer url={hrRecordingUrl} />}
```

**Step 4: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add HappyRobot integration with audio player on call detail"
```

---

### Task 19: Rate Trend Charts

**Files:**
- Create: `components/dashboard/rate-trend-chart.tsx`
- Modify: `components/dashboard/overview-client.tsx`

**Step 1: Create rate trend chart**

Create `components/dashboard/rate-trend-chart.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { CallSummary } from "@/lib/types";

interface RateTrendChartProps {
  calls: CallSummary[];
}

export function RateTrendChart({ calls }: RateTrendChartProps) {
  // Group calls by date, compute avg final rate per day
  const byDate = calls
    .filter((c) => c.final_rate)
    .reduce<Record<string, { total: number; count: number }>>((acc, c) => {
      const date = new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!acc[date]) acc[date] = { total: 0, count: 0 };
      acc[date].total += c.final_rate!;
      acc[date].count += 1;
      return acc;
    }, {});

  const chartData = Object.entries(byDate).map(([date, { total, count }]) => ({
    date,
    avgRate: Math.round(total / count),
  }));

  if (chartData.length < 2) return null;

  return (
    <Card className="p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700">Rate Trends</h3>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => [`$${value}`, "Avg Rate"]}
            />
            <Line
              type="monotone"
              dataKey="avgRate"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: "#4F46E5", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

**Step 2: Add to overview-client.tsx**

Add the rate trend chart between KPI cards and the 4 chart grid:

```typescript
import { RateTrendChart } from "./rate-trend-chart";

// After <KpiCards />:
<RateTrendChart calls={displayMetrics.recent_calls} />
```

**Step 3: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add rate trend line chart to overview page"
```

---

### Task 20: CSV Export

**Files:**
- Create: `lib/csv.ts`
- Modify: `app/calls/page.tsx` — add export button
- Modify: `app/bookings/page.tsx` — add export button

**Step 1: Create CSV utility**

Create `lib/csv.ts`:

```typescript
export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

**Step 2: Add export button to calls page**

In `app/calls/page.tsx`, add a button next to the heading:

```typescript
import { Download } from "lucide-react";
import { downloadCSV } from "@/lib/csv";

// Add export function:
const handleExport = () => {
  if (!data) return;
  const headers = ["Call ID", "Carrier", "MC#", "Origin", "Destination", "Outcome", "Sentiment", "Duration", "Created"];
  const rows = data.items.map((c) => [
    c.call_id, c.carrier_name ?? "", c.mc_number ?? "",
    c.lane_origin ?? "", c.lane_destination ?? "",
    c.outcome, c.sentiment,
    String(c.duration_seconds ?? ""), c.created_at,
  ]);
  downloadCSV("calls.csv", headers, rows);
};

// Add button next to h1:
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-semibold text-gray-900">Calls</h1>
  <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
    <Download className="mr-2 h-4 w-4" />Export CSV
  </Button>
</div>
```

**Step 3: Add export button to bookings page** (same pattern)

**Step 4: Verify and commit**

```bash
npm run dev
git add .
git commit -m "feat: add CSV export for calls and bookings"
```

---

### Task 21: Final Premium Polish

**Files:**
- Modify: multiple component files for transition classes and spacing audit

**Step 1: Add hover transitions to all cards**

Ensure all `<Card>` usages have `transition-shadow hover:shadow-md`.

**Step 2: Add subtle entrance animations**

In `app/globals.css`, add:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

Apply `animate-fade-in` class to page content wrappers.

**Step 3: Spacing and typography audit**

Review all pages for consistent spacing (`space-y-6` between sections), consistent text sizes, proper gray scale usage.

**Step 4: Verify full app looks polished**

```bash
npm run dev
```

Navigate through all pages, verify visual consistency.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: final premium polish — transitions, animations, spacing audit"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 — Foundation | Tasks 1–8 | Project init, deps, types, API layer, layout shell |
| 2 — Core Pages | Tasks 9–15 | Overview, Calls, Call Detail, Bookings, Settings |
| 3 — Polish | Tasks 16–17 | Loads page, loading skeletons |
| 4 — Extended | Tasks 18–21 | HappyRobot, rate trends, CSV export, final polish |

**Total: 21 tasks, ~4 phases, frequent commits throughout.**
