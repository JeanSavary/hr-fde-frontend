# Carrier Sales AI Agent Dashboard

An internal operations dashboard for monitoring an AI voice agent that handles inbound calls from motor carriers inquiring about freight loads. Built for freight brokerages, the dashboard visualizes real-time agent performance: call outcomes, rate negotiations, load bookings, and carrier analytics.

The AI agent (powered by the [HappyRobot](https://www.happyrobot.ai/) platform) answers incoming carrier calls, verifies them via FMCSA, searches available loads, negotiates rates using a multi-round framework, and books loads — all autonomously. This dashboard is the human-facing window into that operation.

## What It Does

| Page            | Purpose                                                                                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**    | Live KPI strip (Calls Today, Loads Booked, Revenue Locked, Conversion %, Pending Transfers), conversion funnel, call feed, outcome & sentiment charts, rate intelligence. Auto-refreshes every 10s. |
| **Calls**       | Filterable, paginated table of all AI agent calls. Click any row for a slide-in preview. Supports CSV export.                                                                                       |
| **Call Detail** | Full call view: carrier metadata, load info, negotiation summary, AI-generated key points, chat-style transcript, and audio playback via HappyRobot.                                                |
| **Bookings**    | Booked loads with summary KPIs, margin distribution histogram, and revenue-by-equipment breakdown.                                                                                                  |
| **Load Board**  | Freight inventory in table or card view. Filterable by origin, destination, equipment type. Includes priority badges and rate/mile metrics.                                                         |
| **Load Detail** | Individual load with origin/destination, rate, equipment, commodity, weight, miles, and an interactive Leaflet map.                                                                                 |
| **Analytics**   | Negotiation depth, carrier objections, top lanes (calls vs bookings vs avg rate), equipment demand vs supply.                                                                                       |
| **Settings**    | Configure pricing margins, negotiation behavior (max rounds, max offers), and agent parameters via slider controls.                                                                                 |

## Tech Stack

| Layer         | Technology                                                                         |
| ------------- | ---------------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router, Server + Client Components)         |
| Language      | TypeScript 5 (strict)                                                              |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/)                                        |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)                             |
| Charts        | [Recharts 3](https://recharts.org/)                                                |
| Maps          | [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) |
| Data Fetching | [SWR 2](https://swr.vercel.app/) (client-side polling with configurable intervals) |
| Icons         | [Lucide React](https://lucide.dev/)                                                |
| Fonts         | Satoshi (body) + Clash Grotesk (headings), self-hosted                             |

## Architecture

```
Browser ──► Next.js Client Components (SWR polling)
                │
                ▼
         Next.js API Routes (/app/api/*)
         (proxy layer — API keys never reach the browser)
                │
                ▼
         FastAPI Backend (Railway)
         (FMCSA verification, load search, rate engine, booking)
                │
                ▼
         HappyRobot Platform
         (AI voice agent, call recordings, transcripts)
```

Server Components fetch initial data at request time and pass it as props to Client Components. SWR then takes over for subsequent polling (10s overview, 20s lists, 30s detail pages). All backend credentials are proxied server-side through Next.js API routes.

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** (ships with Node)
- Access to the backend API (FastAPI on Railway)

### 1. Clone the repository

```bash
git clone <repo-url>
cd hr-fde-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file at the project root:

```env
# Required — FastAPI backend
BACKEND_API_URL=https://your-backend.railway.app
BACKEND_API_KEY=your-api-key

# Optional — HappyRobot integration (enables audio playback & extended call data)
HR_API_KEY=your-happyrobot-bearer-token
HR_ORG_ID=your-org-id
HR_USE_CASE_ID=your-use-case-id
```

| Variable          | Required | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| `BACKEND_API_URL` | Yes      | Base URL of the FastAPI backend (no trailing slash)       |
| `BACKEND_API_KEY` | Yes      | API key sent as `x-api-key` header to the backend         |
| `HR_API_KEY`      | No       | HappyRobot Bearer token for call recordings & run details |
| `HR_ORG_ID`       | No       | HappyRobot organization ID                                |
| `HR_USE_CASE_ID`  | No       | HappyRobot use case ID                                    |

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm run start
```

The production server starts on port 3000 by default.

## Running with Docker

### Build the image

```bash
docker build -t carrier-dashboard .
```

### Run the container

```bash
docker run -p 3000:3000 \
  -e BACKEND_API_URL=https://your-backend.railway.app \
  -e BACKEND_API_KEY=your-api-key \
  carrier-dashboard
```

Or use an env file:

```bash
docker run -p 3000:3000 --env-file .env.local carrier-dashboard
```

### Docker Compose (optional)

```yaml
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
```

```bash
docker compose up
```

## Project Structure

```
app/
├── page.tsx                 # Overview (home)
├── calls/                   # Calls list + detail
├── bookings/                # Bookings list
├── loads/                   # Load board + detail
├── analytics/               # Analytics charts
├── settings/                # Agent settings
├── api/                     # Server-side proxy routes
└── globals.css              # Tailwind theme + custom vars

components/
├── layout/                  # Sidebar, topbar, context
├── dashboard/               # Overview KPIs, charts, feeds
├── calls/                   # Call tables, filters, transcript viewer, audio player
├── bookings/                # Booking tables, charts
├── loads/                   # Load tables, cards, map
├── analytics/               # Analytics charts
├── settings/                # Settings form
├── shared/                  # Skeletons, badges
└── ui/                      # shadcn/ui primitives

lib/
├── api.ts                   # Server-side API client
├── swr.ts                   # Client-side SWR hooks
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Color maps, chart config
├── utils.ts                 # Formatting helpers
├── csv.ts                   # CSV export
├── proxy.ts                 # API route proxy helpers
└── happyrobot.ts            # HappyRobot platform client
```

## Available Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start dev server with hot reload  |
| `npm run build` | Create optimized production build |
| `npm run start` | Serve the production build        |
| `npm run lint`  | Run ESLint                        |

## License

Private — internal use only.
