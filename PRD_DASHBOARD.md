# PRD — Carrier Sales AI Agent Dashboard

## 1. Context

We have built a **Carrier Inbound Sales API** — a FastAPI backend that powers a HappyRobot voice AI agent. The agent handles inbound calls from motor carriers calling on posted freight loads. It verifies carriers via FMCSA, searches available loads, negotiates rates using a structured 3-round framework, and books loads.

The backend runs on Railway, uses SQLite for persistence, and logs every call, offer, booking, and carrier interaction. The HappyRobot platform provides additional data: run details, session transcripts, call recordings, and platform usage metrics.

**This dashboard is a demo/recruiter-facing app** that visualizes the AI agent's performance, call activity, load operations, and negotiation outcomes in real time. It should feel like the internal operations dashboard a freight brokerage would actually use to monitor their AI-powered carrier sales desk.

---

## 2. Data Sources

### 2.1 — Backend API (our FastAPI server)

**Base URL:** `https://<railway-domain>` (configurable via env var)  
**Auth:** `X-API-Key` header on all `/api/*` routes.

#### Available Endpoints

| Method | Path                                     | Returns                                                               |
| ------ | ---------------------------------------- | --------------------------------------------------------------------- |
| `GET`  | `/api/dashboard/metrics`                 | Aggregated KPIs (see schema below)                                    |
| `GET`  | `/api/calls`                             | Paginated call list (filterable by outcome, sentiment, mc_number)     |
| `GET`  | `/api/calls/{call_id}`                   | Full call detail with transcript, summary, key_points                 |
| `GET`  | `/api/booked-loads`                      | All bookings                                                          |
| `GET`  | `/api/booked-loads/{load_id}`            | Single booking detail                                                 |
| `GET`  | `/api/loads/{load_id}`                   | Load details (origin/dest, rate, equipment, weight, commodity, miles) |
| `POST` | `/api/loads/search`                      | Search loads by origin/dest/equipment/filters                         |
| `GET`  | `/api/carriers/{mc_number}/interactions` | Carrier interaction history                                           |
| `GET`  | `/api/settings/negotiation`              | Current negotiation settings (margins, bump limits)                   |
| `PUT`  | `/api/settings/negotiation`              | Update negotiation settings                                           |
| `GET`  | `/health`                                | Health check (no auth)                                                |

#### Key Data Schemas

**DashboardMetrics** (from `GET /api/dashboard/metrics`):

```typescript
interface DashboardMetrics {
  total_calls: number;
  avg_duration_seconds: number | null;
  calls_by_outcome: Record<string, number>;
  // Outcomes: "booked" | "negotiation_failed" | "no_loads_available" |
  //           "invalid_carrier" | "carrier_thinking" | "transferred_to_ops" | "dropped_call"
  sentiment_distribution: Record<string, number>;
  // Sentiments: "positive" | "neutral" | "frustrated" | "aggressive" | "confused"
  booking_rate_percent: number;
  avg_negotiation_rounds: number | null;
  avg_rate_differential_percent: number | null;
  total_revenue: number;
  unique_carriers: number;
  top_lanes: Array<{ lane: string; count: number }>;
  equipment_demand: Record<string, number>;
  // Equipment: "dry_van" | "reefer" | "flatbed" | "step_deck" | "power_only"
  recent_calls: Array<CallSummary>;
  recent_offers: Array<OfferSummary>;
}
```

**CallDetail** (from `GET /api/calls/{call_id}`):

```typescript
interface CallDetail {
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
  created_at: string; // ISO 8601
}
```

**BookedLoad** (from `GET /api/booked-loads`):

```typescript
interface BookedLoad {
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
```

**Load** (from `GET /api/loads/{load_id}`):

```typescript
interface Load {
  load_id: string;
  origin: string; // "Dallas, TX"
  origin_lat: number;
  origin_lng: number;
  destination: string; // "Chicago, IL"
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
```

**NegotiationSettings** (from `GET /api/settings/negotiation`):

```typescript
interface NegotiationSettings {
  target_margin: number; // e.g. 0.15 = 15%
  min_margin: number; // e.g. 0.05 = 5%
  max_bump_above_loadboard: number; // e.g. 0.03 = 3%
}
```

### 2.2 — HappyRobot Platform API

**Base URL:** `https://platform.happyrobot.ai/api/v2` (and v1 for some endpoints)  
**Auth:** `Authorization: Bearer <HR_API_KEY>` header.

#### Useful Endpoints

| Method | Path                        | Returns                                                              |
| ------ | --------------------------- | -------------------------------------------------------------------- |
| `GET`  | `/runs/`                    | Paginated runs list (status, annotation, timestamps, data, tokens)   |
| `GET`  | `/runs/{run_id}`            | Full run detail with events, sessions, messages (transcript), issues |
| `GET`  | `/runs/{run_id}/recordings` | Signed URLs for call audio recordings                                |
| `POST` | `/runs/{run_id}/cancel`     | Cancel a running/scheduled run                                       |
| `GET`  | `/use-cases/`               | List use cases (workflow configurations)                             |
| `GET`  | `/contacts/`                | Paginated contacts with interaction counts and tags                  |
| `GET`  | `/contacts/resolve`         | Lookup contact by phone/email                                        |
| `GET`  | `/billing/usage/totals`     | Aggregated usage (total minutes, emails, texts)                      |
| `GET`  | `/billing/usage/details`    | Usage breakdown by use case                                          |
| `GET`  | `/usage/call_minutes`       | Detailed call minutes by direction                                   |
| `GET`  | `/usage/llm_tokens`         | LLM token usage by model                                             |
| `GET`  | `/issues`                   | QA issues (transcriber, message, tool_call errors)                   |

#### Key HappyRobot Data Structures

**Run** (from `/runs/`):

```typescript
interface HRRun {
  id: string; // UUID
  status: "scheduled" | "running" | "completed" | "canceled" | "failed";
  annotation: "correct" | "incorrect" | "critical" | null;
  timestamp: string; // ISO 8601
  completed_at: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  data: Record<string, any>; // custom columns from runs table
}
```

**Run Detail** (from `/runs/{run_id}`) — includes full conversation:

```typescript
interface HRRunDetail extends HRRun {
  events: Array<HRActionEvent | HRSessionEvent>;
  issues: HRIssue[];
  version: HRVersion | null;
}

interface HRSessionEvent {
  type: "session";
  id: string;
  duration: number | null; // call duration in seconds
  messages: HRMessage[];
  actions: any[];
  timestamp: string;
  sip_code: string | null;
  sip_reason: string | null;
}

interface HRMessage {
  id: string;
  role: "assistant" | "user" | "tool" | "event";
  content: string;
  is_filler: boolean;
  is_interrupted: boolean;
  tool_calls: any[] | null;
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
```

**Recording** (from `/runs/{run_id}/recordings`):

```typescript
interface HRRecording {
  session_id: string;
  url: string; // signed URL, expires in 1-7 days
}
```

---

## 3. Dashboard Pages & Features

### 3.1 — Overview / Home Page

The main landing page. Shows high-level KPIs and recent activity at a glance.

**KPI Cards (top row):**

- Total Calls (with trend indicator if possible)
- Booking Rate % (booked / total calls)
- Total Revenue (sum of agreed rates on booked loads)
- Avg Call Duration (in seconds, formatted as mm:ss)
- Unique Carriers Contacted
- Avg Negotiation Rounds (for booked calls)

**Charts:**

- **Calls by Outcome** — donut/pie chart showing distribution: booked, negotiation_failed, no_loads_available, invalid_carrier, carrier_thinking, transferred_to_ops, dropped_call
- **Sentiment Distribution** — horizontal bar or donut: positive, neutral, frustrated, aggressive, confused
- **Equipment Demand** — bar chart of equipment type breakdown (dry_van, reefer, flatbed, step_deck, power_only)
- **Top Lanes** — horizontal bar chart showing most requested origin→destination lanes

**Tables:**

- **Recent Calls** — last 10 calls with: carrier name, lane, outcome (color-coded badge), sentiment (color-coded), duration, timestamp. Each row clickable → Call Detail page.
- **Recent Offers** — last 10 offers with: load_id, carrier, amount, type (initial/counter/final), status, rate vs. original

**Data source:** `GET /api/dashboard/metrics` (single call returns everything needed)

---

### 3.2 — Calls Page

Filterable, paginated list of all calls with drill-down capability.

**Filters (top bar):**

- Outcome dropdown (multi-select)
- Sentiment dropdown (multi-select)
- MC Number search input
- Date range picker (if we add this to the API later, otherwise client-side)

**Table columns:**

- Call ID
- Carrier Name
- MC Number
- Lane (origin → destination)
- Equipment Type (icon + label)
- Outcome (colored badge)
- Sentiment (colored badge)
- Duration (mm:ss)
- Negotiation Rounds
- Initial Rate → Final Rate (with % difference)
- Created At

**Pagination:** page + page_size controls

**Data source:** `GET /api/calls?outcome=...&sentiment=...&mc_number=...&page=...&page_size=...`

---

### 3.3 — Call Detail Page

Deep dive into a single call. This is the most important page for demonstrating the AI agent's capabilities.

**Layout: two-column**

**Left column — Call Info:**

- Call metadata card: carrier name, MC number, phone, outcome badge, sentiment badge, duration, equipment type, created_at
- Load details card (if load_id present): origin/dest with map pins, pickup/delivery times, loadboard rate, weight, commodity, miles
- Negotiation summary card: initial rate, final rate, rate differential %, number of rounds, agreed rate badge (green if booked)
- Key points (bullet list from key_points array)
- AI Summary (from summary field)

**Right column — Transcript:**

- Chat-style transcript viewer (if transcript field is populated)
- Messages displayed as a conversation: carrier messages on left, agent messages on right
- If connected to HappyRobot: also show audio player for the call recording

**Optional HappyRobot integration:**

- If a matching run is found (by call_id correlation), show:
  - Full message-by-message transcript from `HRMessage[]` with role-based styling
  - Latency breakdown per message (network, LLM, TTS times)
  - Audio recording player (from `/runs/{run_id}/recordings`)
  - Run annotation status (correct/incorrect/critical)
  - Any QA issues flagged

**Data source:** `GET /api/calls/{call_id}` + optionally `GET /api/loads/{load_id}` + HappyRobot run data

---

### 3.4 — Bookings Page

All successfully booked loads.

**Table columns:**

- Load ID
- Carrier Name
- MC Number
- Agreed Rate
- Loadboard Rate (from load details — requires join)
- Savings/Premium % (difference between loadboard and agreed)
- Lane (origin → destination)
- Pickup DateTime
- Equipment Type
- Booked At

**Summary cards at top:**

- Total Bookings
- Total Revenue (sum of agreed_rate)
- Average Rate Differential %
- Most Active Carrier

**Data source:** `GET /api/booked-loads` + `GET /api/loads/{load_id}` for enrichment

---

### 3.5 — Loads Board

Visual overview of the freight load inventory.

**Table/Card view toggle:**

**Table columns:**

- Load ID
- Origin → Destination
- Equipment Type (icon)
- Pickup DateTime
- Delivery DateTime
- Loadboard Rate
- Rate/Mile
- Weight
- Miles
- Commodity
- Status (available / booked)

**Map View (stretch goal):**

- US map with load origins/destinations plotted
- Color-coded by equipment type
- Click on a pin to see load details

**Filters:**

- Equipment type
- Origin state/city
- Destination state/city
- Status (available/booked)
- Weight range
- Miles range

**Data source:** `POST /api/loads/search` (with broad search params to get all loads) or directly from the backend if a list-all endpoint is added

---

### 3.6 — Settings Page

View and update negotiation parameters.

**Editable form fields:**

- Target Margin (%) — slider + input, e.g. 15%
- Minimum Margin (%) — slider + input, e.g. 5%
- Max Bump Above Loadboard (%) — slider + input, e.g. 3%

**Display calculated example:**

> "For a load posted at $2,000: floor rate = $1,700 (15% margin), ceiling = $2,060 (3% bump)"

**Save button** that calls `PUT /api/settings/negotiation`

**Data source:** `GET /api/settings/negotiation` + `PUT /api/settings/negotiation`

---

### 3.7 — HappyRobot Platform Page (Optional/Stretch)

If the HappyRobot API key is configured, show platform-level analytics.

**Usage metrics:**

- Total call minutes (from `/billing/usage/totals` or `/usage/call_minutes`)
- LLM token consumption (from `/usage/llm_tokens`)
- Breakdown by use case (from `/billing/usage/details`)

**Run Quality:**

- Annotation distribution (correct/incorrect/critical from runs list)
- Issues count and types (from `/issues`)
- Run success rate (completed vs failed/canceled)

**Data source:** HappyRobot API endpoints listed in section 2.2

---

## 4. UI/UX Requirements

### Design System

- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui component library
- **Charts:** Recharts (lightweight, React-native charting)
- **Icons:** Lucide React
- **Color palette:** Dark theme preferred (freight/logistics feel), with a professional navy/slate base and accent colors for status badges:
  - Booked: green
  - Negotiation Failed: amber/orange
  - No Loads: gray
  - Invalid Carrier: red
  - Carrier Thinking: blue
  - Transferred: purple
  - Dropped: dark red
  - Positive sentiment: green
  - Neutral: gray
  - Frustrated: amber
  - Aggressive: red
  - Confused: purple

### Layout

- **Sidebar navigation** (collapsible) with page links: Overview, Calls, Bookings, Loads, Settings
- **Top bar** with: app title "Carrier Sales AI Dashboard", health status indicator (green dot if `/health` returns OK), last refresh timestamp
- **Responsive** but primarily optimized for desktop (1280px+)

### Interactions

- Auto-refresh dashboard data every 30 seconds (configurable)
- Loading skeletons for all data-heavy sections
- Toast notifications for settings save success/error
- Click-through from any call/booking row to detail page
- Filterable tables with debounced search inputs

---

## 5. Technical Architecture

```
┌─────────────────────────────────────────────┐
│            Next.js App (Vercel)              │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Pages   │  │  Server   │  │  Client   │  │
│  │ (routes) │  │ Actions / │  │Components │  │
│  │          │  │ API proxy │  │ (React)   │  │
│  └────┬─────┘  └────┬──────┘  └─────┬─────┘  │
│       │              │               │        │
│       └──────────────┼───────────────┘        │
│                      │                        │
└──────────────────────┼────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
    ┌──────▼──────┐    ┌───────────▼──────────┐
    │  Backend    │    │  HappyRobot Platform  │
    │  FastAPI    │    │  API (v1/v2)          │
    │  (Railway)  │    │                       │
    └─────────────┘    └──────────────────────-┘
```

### Key Technical Decisions

1. **Server Components by default** — fetch data on the server using `fetch()` in Server Components or Server Actions. This keeps API keys server-side.
2. **API proxy route** — create `/app/api/[...proxy]/route.ts` or individual route handlers to proxy requests to the backend, keeping the API key in `process.env` and never exposing it to the client.
3. **SWR or React Query** for client-side data fetching where real-time updates are needed (e.g., auto-refresh on Overview page).
4. **Environment variables:**
   - `BACKEND_API_URL` — the Railway FastAPI base URL
   - `BACKEND_API_KEY` — the X-API-Key value
   - `HR_API_KEY` — HappyRobot platform Bearer token (optional)
   - `HR_ORG_ID` — HappyRobot organization ID (optional)
   - `HR_USE_CASE_ID` — HappyRobot use case UUID (optional)

---

## 6. File Structure (Suggested)

```
dashboard/
├── app/
│   ├── layout.tsx              # Root layout with sidebar + topbar
│   ├── page.tsx                # Overview / Home
│   ├── calls/
│   │   ├── page.tsx            # Calls list
│   │   └── [callId]/
│   │       └── page.tsx        # Call detail
│   ├── bookings/
│   │   └── page.tsx            # Bookings list
│   ├── loads/
│   │   └── page.tsx            # Loads board
│   ├── settings/
│   │   └── page.tsx            # Negotiation settings
│   └── api/
│       ├── dashboard/
│       │   └── route.ts        # Proxy to backend /api/dashboard/metrics
│       ├── calls/
│       │   └── route.ts        # Proxy to backend /api/calls
│       ├── bookings/
│       │   └── route.ts        # Proxy to backend /api/booked-loads
│       ├── loads/
│       │   └── route.ts        # Proxy to backend /api/loads
│       └── settings/
│           └── route.ts        # Proxy to backend /api/settings/negotiation
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── dashboard/
│   │   ├── kpi-cards.tsx
│   │   ├── outcome-chart.tsx
│   │   ├── sentiment-chart.tsx
│   │   ├── equipment-chart.tsx
│   │   ├── top-lanes-chart.tsx
│   │   ├── recent-calls-table.tsx
│   │   └── recent-offers-table.tsx
│   ├── calls/
│   │   ├── calls-table.tsx
│   │   ├── call-filters.tsx
│   │   ├── call-detail-card.tsx
│   │   └── transcript-viewer.tsx
│   ├── bookings/
│   │   └── bookings-table.tsx
│   ├── loads/
│   │   └── loads-table.tsx
│   └── settings/
│       └── negotiation-form.tsx
├── lib/
│   ├── api.ts                  # Backend API client functions
│   ├── hr-api.ts               # HappyRobot API client (optional)
│   ├── types.ts                # TypeScript interfaces (from section 2)
│   └── utils.ts                # Formatting helpers (duration, currency, %)
├── public/
│   └── ...
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 7. Enums & Constants Reference

```typescript
// Call Outcomes
type CallOutcome =
  | "booked"
  | "negotiation_failed"
  | "no_loads_available"
  | "invalid_carrier"
  | "carrier_thinking"
  | "transferred_to_ops"
  | "dropped_call";

// Sentiment
type Sentiment =
  | "positive"
  | "neutral"
  | "frustrated"
  | "aggressive"
  | "confused";

// Equipment Types
type EquipmentType =
  | "dry_van"
  | "reefer"
  | "flatbed"
  | "step_deck"
  | "power_only";

// Offer Types
type OfferType = "initial" | "counter" | "final";

// Offer Status
type OfferStatus = "pending" | "accepted" | "rejected" | "expired";

// Verdict (offer analysis)
type Verdict = "accept" | "counter" | "reject";
```

---

## 8. Priority & Scope

### P0 — Must Have (MVP)

- Overview page with all KPI cards and charts
- Calls list page with filters and pagination
- Call detail page with transcript viewer
- Bookings page
- Settings page (view + edit negotiation params)
- Dark theme, responsive sidebar layout
- API key proxy (never expose keys to client)

### P1 — Should Have

- Loads board page
- Color-coded badges for all outcomes and sentiments
- Auto-refresh on overview page
- Loading skeletons

### P2 — Nice to Have

- HappyRobot platform integration (recordings player, run quality metrics)
- Map view for loads
- Rate differential trend chart over time
- Export data to CSV
- Call duration histogram

---

## 9. Demo Script Context

This dashboard will be used during a demo/evaluation. The typical flow:

1. A carrier calls the HappyRobot voice agent's phone number
2. The AI agent verifies the carrier, searches loads, and negotiates
3. Post-call, metrics are logged to our backend automatically
4. The evaluator opens this dashboard to see the call results appear in real time
5. They can drill into call transcripts, see negotiation outcomes, and verify the AI agent performed correctly

The dashboard should feel **live and operational** — not like a static report. Real-time data appearance and professional freight-industry aesthetics matter.
