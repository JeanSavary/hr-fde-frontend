# Carrier Sales AI Dashboard — MVP Design

**Date:** 2026-02-23
**Scope:** P0 + P1 + select P2 (HappyRobot integration, rate trend charts, CSV export)

## Decisions

- **Approach:** Server Components First — server-side initial render + SWR client polling
- **Theme:** Light premium (departure from PRD's dark theme)
- **Deployment:** Vercel
- **Auth:** None (internal tool)
- **Real-time:** Snappy — 10-15s polling on overview, 20s on lists, SWR revalidateOnFocus
- **Backend:** Live FastAPI backend on Fly.io, accessible now

## Tech Stack

- Next.js 15+ (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Recharts
- SWR
- Lucide React

## Architecture

### Data Flow

1. Page loads → Server Component fetches via `lib/api.ts` (direct backend call with API key)
2. Server renders initial HTML with real data (no loading skeleton on first visit)
3. Client-side SWR hook hydrates and begins polling
4. API proxy routes (`app/api/*`) handle client-side SWR requests (keeps API key server-side)

### Project Structure

```
app/
├── layout.tsx              # Root layout: sidebar + topbar shell
├── page.tsx                # Overview dashboard (Server Component)
├── calls/
│   ├── page.tsx            # Call list with filters
│   └── [callId]/page.tsx   # Call detail with transcript
├── bookings/page.tsx       # Bookings table
├── loads/page.tsx          # Loads board (table/card toggle)
├── settings/page.tsx       # Negotiation settings form
└── api/                    # API proxy routes
    ├── dashboard/route.ts
    ├── calls/route.ts
    ├── bookings/route.ts
    ├── loads/route.ts
    └── settings/route.ts
components/
├── layout/                 # Sidebar, Topbar, NavLinks
├── ui/                     # shadcn/ui primitives
├── dashboard/              # KPI cards, charts, recent tables
├── calls/                  # Call table, filters, transcript viewer
├── bookings/               # Bookings table, summary cards
├── loads/                  # Loads table, card view
└── settings/               # Settings form, sliders
lib/
├── api.ts                  # Server-side fetch helpers (typed)
├── swr.ts                  # SWR hooks for client-side polling
├── happyrobot.ts           # HappyRobot API wrapper (P2)
├── types.ts                # TypeScript interfaces from PRD
├── utils.ts                # Formatting, color mappings, helpers
└── constants.ts            # Status colors, chart configs
```

## Visual Design — Light Premium Theme

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | White | `#FFFFFF` |
| Surface | Warm gray | `#F9FAFB` |
| Card bg | Light gray | `#F3F4F6` |
| Primary text | Near-black | `#111827` |
| Secondary text | Medium gray | `#6B7280` |
| Accent/Primary | Deep indigo | `#4F46E5` |
| Success | Emerald | `#059669` |
| Warning | Amber | `#D97706` |
| Danger | Rose | `#E11D48` |
| Info | Sky blue | `#0284C7` |
| Neutral | Slate | `#64748B` |

### Status Badges

| Status | Background | Text |
|--------|-----------|------|
| booked | `bg-emerald-50` | `text-emerald-700` |
| negotiation_failed | `bg-amber-50` | `text-amber-700` |
| no_loads_available | `bg-gray-100` | `text-gray-600` |
| invalid_carrier | `bg-rose-50` | `text-rose-700` |
| carrier_thinking | `bg-sky-50` | `text-sky-700` |
| transferred_to_ops | `bg-violet-50` | `text-violet-700` |
| dropped_call | `bg-red-50` | `text-red-700` |

### Typography

- Font: Inter or Geist
- KPI values: `text-3xl font-semibold tracking-tight`
- Section headers: `text-lg font-medium`
- Table data: `text-sm` with generous line height

### Premium Touches

- Soft box shadows (`shadow-sm` base, `shadow-md` hover)
- Rounded corners (`rounded-xl` cards, `rounded-lg` buttons)
- Micro-animations: 150ms ease transitions on hover
- Badge pills with soft colored backgrounds
- Generous whitespace
- Thin dividers (`border-gray-100`)

## Pages

### Overview (`/`)

- 6 KPI cards (3x2 grid): Total Calls, Booking Rate %, Revenue, Avg Duration, Unique Carriers, Avg Negotiation Rounds
- Rate trend line chart (P2)
- 4 charts (2x2): Calls by Outcome (donut), Sentiment Distribution (h-bar), Equipment Demand (bar), Top Lanes (h-bar)
- Recent Calls table (10 rows, clickable) + Recent Offers table (10 rows)
- SWR polling: 10s interval

### Calls (`/calls`)

- Filter bar: Outcome, Sentiment, MC Number, Date range — debounced 300ms
- 11-column sortable table with server-side pagination
- Row click → `/calls/[callId]`
- CSV export button

### Call Detail (`/calls/[callId]`)

- Two-column layout
- Left: Call metadata, load details, negotiation summary, key points, AI summary
- Right: Chat-style transcript (role-based styling, timestamps)
- HappyRobot section (P2): Audio player, message latencies, QA issue badges
- SWR polling: 30s

### Bookings (`/bookings`)

- 4 summary cards: Total Bookings, Total Revenue, Avg Rate Differential %, Most Active Carrier
- 9-column sortable table, rate differential color-coded
- CSV export button

### Loads (`/loads`)

- Table/card view toggle
- Filters: Equipment, Origin, Destination, Status, Weight range, Miles range
- 10 columns in table view, compact cards in grid view

### Settings (`/settings`)

- Form with 3 sliders: Target Margin %, Minimum Margin %, Max Bump Above Loadboard %
- Live example calculation preview
- Save button with toast notification (Sonner)

### Layout Shell

- Collapsible sidebar (icon-only when collapsed), nav links with active state
- Topbar: page title, health dot, "Last refreshed X ago", refresh button
- Hamburger menu on mobile (< 768px)

## Data Layer

### Server-Side (`lib/api.ts`)

- Typed fetch wrapper with `X-API-Key` from `process.env.BACKEND_API_KEY`
- Base URL from `process.env.BACKEND_API_URL`
- Returns typed responses matching PRD interfaces
- Error handling with typed errors + error boundaries

### API Proxy Routes (`app/api/*`)

- Thin proxies: validate params → add auth → forward → return typed JSON
- Used only for client-side SWR polling (initial render is direct server-side)

### Client Polling (`lib/swr.ts`)

- Hooks: `useDashboardMetrics()`, `useCalls(filters)`, `useBookings()`, `useLoads(filters)`, `useSettings()`
- Refresh intervals: Overview 10s, Lists 20s, Detail 30s, Settings off
- `dedupingInterval` to prevent redundant requests
- `revalidateOnFocus` enabled

### HappyRobot (`lib/happyrobot.ts`)

- Separate wrapper using `HR_API_KEY` Bearer token
- Used on call detail page only
- Graceful degradation if env vars not set

## Build Sequence

### Phase 1 — Foundation

1. Initialize Next.js 15+ with TypeScript + Tailwind
2. Install deps: shadcn/ui, Recharts, SWR, Lucide React
3. Configure shadcn/ui light theme
4. `lib/types.ts` — all TypeScript interfaces
5. `lib/api.ts` — server-side fetch wrapper
6. `lib/constants.ts` — color mappings, configs
7. Layout shell: Sidebar + Topbar

### Phase 2 — Core Pages (P0)

8. API proxy routes (all 5)
9. SWR hooks (`lib/swr.ts`)
10. Overview: KPI cards → charts → recent tables
11. Calls list: filters → table → pagination
12. Call detail: metadata + transcript
13. Bookings: summary cards + table
14. Settings: form + sliders + save

### Phase 3 — Polish (P1)

15. Loads page: table + card toggle + filters
16. Reusable status/sentiment badge component
17. Loading skeletons for all data sections
18. Auto-refresh indicators in topbar

### Phase 4 — Extended (P2)

19. HappyRobot integration on call detail
20. Rate trend charts on overview
21. CSV export for calls, bookings, loads
22. Final premium polish: transitions, hover states, spacing audit
