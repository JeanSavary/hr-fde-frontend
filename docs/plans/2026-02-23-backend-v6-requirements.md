# Backend V6 Requirements — Dashboard Redesign

**Date**: 2026-02-23
**From**: Frontend team
**For**: Backend coding agent

## Overview

We rebuilt the frontend dashboard (Next.js). The new UI expects additional fields on existing endpoints and one brand new endpoint. All new fields are **optional** on the frontend — it degrades gracefully — but the full experience requires these fields.

The frontend proxies all requests through Next.js API routes to your backend. Auth is via `X-API-Key` header (already working).

---

## Priority Levels

- **P0**: Existing endpoints that need new fields added to their response — highest impact, likely just SQL + serializer changes
- **P1**: New endpoint (`/api/analytics`) — needs new queries but no new tables
- **P2**: Computed/derived fields that may need new columns or tracking

---

## P0: Extend Existing Endpoints

### 1. `GET /api/dashboard/metrics` — Add daily KPIs, funnel, rate intelligence

The frontend currently receives and uses all existing fields. Add these **new fields** to the response:

```jsonc
{
  // ... all existing fields stay the same ...

  // Daily KPIs (filter to today's date)
  "calls_today": 47,              // count of calls created today
  "calls_trend": "+12%",          // % change vs yesterday (string with +/- prefix)
  "booked_today": 18,             // count of bookings created today
  "booked_trend": "+8%",          // % change vs yesterday
  "revenue_today": 42650,         // sum of agreed_rate for today's bookings
  "revenue_trend": "+15%",        // % change vs yesterday
  "conversion_rate": 38.3,        // (booked_today / calls_today) * 100
  "conversion_trend": "+2.1%",    // change vs yesterday
  "pending_transfer": 3,          // count of calls with outcome="transferred_to_ops" today

  // Conversion funnel (today's calls flowing through stages)
  "funnel_data": [
    { "stage": "Inbound Calls", "count": 47, "pct": 100 },
    { "stage": "Authenticated", "count": 41, "pct": 87 },
    { "stage": "Load Matched", "count": 33, "pct": 70 },
    { "stage": "Offer Made", "count": 28, "pct": 60 },
    { "stage": "Negotiated", "count": 22, "pct": 47 },
    { "stage": "Booked", "count": 18, "pct": 38 }
  ],

  // Rate intelligence (aggregated from today's bookings)
  "rate_intelligence": {
    "avg_loadboard": 3200,         // avg loadboard_rate across today's booked loads
    "avg_agreed": 2850,            // avg agreed_rate across today's bookings
    "discount_pct": 10.9,          // ((avg_loadboard - avg_agreed) / avg_loadboard) * 100
    "margin_pct": 14.2             // avg margin across today's bookings
  }
}
```

**How to compute the funnel stages:**
- **Inbound Calls**: total calls today
- **Authenticated**: calls today where outcome != `"invalid_carrier"`
- **Load Matched**: authenticated calls where outcome != `"no_loads_available"`
- **Offer Made**: calls today that have at least 1 associated offer
- **Negotiated**: calls today with `negotiation_rounds >= 1`
- **Booked**: calls today with outcome = `"booked"`

**How to compute trends:**
- Compare today's count vs yesterday's count
- Format as string: `"+12%"` or `"-5%"` (include sign prefix)
- If yesterday had 0 calls, return `null`

---

### 2. `GET /api/booked-loads` — Add lane, equipment, margin, negotiation data

Current response is `BookedLoad[]`. Add these fields to each booking:

```jsonc
{
  // ... existing fields stay the same ...

  "lane_origin": "Chicago, IL",       // origin city from the associated load
  "lane_destination": "Detroit, MI",   // destination city from the associated load
  "equipment_type": "reefer",          // equipment_type from the associated load
  "loadboard_rate": 3200,             // loadboard_rate from the associated load
  "margin": 14.2,                     // ((loadboard_rate - agreed_rate) / loadboard_rate) * 100
  "negotiation_rounds": 2,            // from the associated call record
  "sentiment": "positive",            // from the associated call record
  "booked_at": "2026-02-23T14:30:00Z" // timestamp when booking was confirmed (or use created_at)
}
```

**How to compute:**
- Join bookings → loads (via `load_id`) to get `lane_origin/destination`, `equipment_type`, `loadboard_rate`
- Join bookings → calls (via `call_id`) to get `negotiation_rounds`, `sentiment`
- `margin` = `((loadboard_rate - agreed_rate) / loadboard_rate) * 100`
- `booked_at` can be the booking's `created_at` if no separate timestamp exists

---

### 3. `GET /api/loads` — **New endpoint** (replaces frontend use of `POST /api/loads/search`)

> **Important:** `POST /api/loads/search` is the HappyRobot platform's search endpoint. It is NOT a general-purpose DB query and should not be used by the dashboard. We need a proper `GET /api/loads` endpoint that queries your loads table directly.

Returns a paginated list of all loads with optional filters. The dashboard needs this to show the Load Board page without requiring users to enter a search query first.

**Request:**
```
GET /api/loads?status=available&equipment_type=reefer&page=1&page_size=50&sort=pickup_datetime
```

All query params are optional:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `"available"` | Filter by status: `"available"`, `"matching"`, `"booked"`, or `"all"` |
| `equipment_type` | string | — | Filter by equipment type |
| `origin` | string | — | Filter by origin city (partial match / ILIKE) |
| `destination` | string | — | Filter by destination city (partial match / ILIKE) |
| `urgency` | string | — | Filter by urgency: `"critical"`, `"high"`, `"normal"` |
| `page` | int | 1 | Page number |
| `page_size` | int | 50 | Items per page (max 100) |
| `sort` | string | `"pickup_datetime"` | Sort field |
| `order` | string | `"asc"` | Sort order: `"asc"` or `"desc"` |

**Response:**
```jsonc
{
  "loads": [
    {
      // All existing Load fields from your loads table...
      "load_id": "LD-4821",
      "origin": "Chicago, IL",
      "origin_lat": 41.8781,
      "origin_lng": -87.6298,
      "destination": "Detroit, MI",
      "dest_lat": 42.3314,
      "dest_lng": -83.0458,
      "pickup_datetime": "2026-02-24T08:00:00Z",
      "delivery_datetime": "2026-02-24T18:00:00Z",
      "equipment_type": "reefer",
      "loadboard_rate": 3200,
      "notes": "",
      "weight": 42000,
      "commodity_type": "Frozen Produce",
      "num_of_pieces": 24,
      "miles": 280,
      "dimensions": "48x96",
      "rate_per_mile": 11.43,
      "deadhead_miles": 45,
      "floor_rate": 2800,
      "max_rate": 3500,

      // NEW computed fields:
      "urgency": "critical",        // "critical" | "high" | "normal"
      "pitch_count": 8,             // how many times this load has been offered
      "days_listed": 2,             // days since load was created/imported
      "status": "available"         // "matching" | "available" | "booked"
    }
  ],
  "total": 142,
  "page": 1,
  "page_size": 50
}
```

**How to compute the new fields:**

**`urgency`:**
- `"critical"` if ANY of: pitch_count > 8, days_listed >= 2, commodity is perishable (temp-controlled, seafood, produce), or has "dead-end" in notes
- `"high"` if ANY of: pitch_count > 4, days_listed >= 1, rate_per_mile < market average
- `"normal"` otherwise

**`pitch_count`:**
- `SELECT COUNT(*) FROM offers WHERE load_id = ?`
- Count how many times this load has been pitched to carriers

**`days_listed`:**
- `floor((now - created_at) / 86400)` (or use a `listed_at` timestamp if you have one)

**`status`:**
- `"booked"` if load has an accepted booking
- `"matching"` if load is currently being offered in an active call
- `"available"` otherwise

> **Note:** `POST /api/loads/search` should remain unchanged — it's used by the HappyRobot AI agent during calls and has a different purpose (geo-radius search with origin/destination resolution). The new `GET /api/loads` is for the dashboard UI only.

---

### 4. `GET /api/settings/negotiation` + `PUT /api/settings/negotiation` — Add v6 settings fields

Current response has `target_margin`, `min_margin`, `max_bump_above_loadboard`. Add:

```jsonc
{
  // ... existing fields stay the same ...

  "max_negotiation_rounds": 3,        // integer, 1-5
  "max_offers_per_call": 3,           // integer, 1-5
  "auto_transfer_threshold": 500,     // dollar amount, 100-1000
  "deadhead_warning_miles": 150,      // integer, 50-300
  "floor_rate_protection": true,      // boolean
  "sentiment_escalation": true,       // boolean
  "prioritize_perishables": true,     // boolean
  "agent_greeting": "Thanks for calling, this is your AI carrier sales agent. How can I help you today?",
  "agent_tone": "professional"        // "professional" | "friendly" | "direct"
}
```

**Database changes needed:**
- Add these 9 columns to whatever table stores negotiation settings
- All should have defaults (values shown above) so existing rows don't break
- The `PUT` endpoint should accept and persist all these new fields

**Column types:**
| Field | Type | Default |
|-------|------|---------|
| `max_negotiation_rounds` | integer | 3 |
| `max_offers_per_call` | integer | 3 |
| `auto_transfer_threshold` | integer | 500 |
| `deadhead_warning_miles` | integer | 150 |
| `floor_rate_protection` | boolean | true |
| `sentiment_escalation` | boolean | true |
| `prioritize_perishables` | boolean | true |
| `agent_greeting` | text | (see above) |
| `agent_tone` | varchar(20) | "professional" |

---

## P1: New Endpoint

### 5. `GET /api/analytics` — New analytics endpoint

Brand new endpoint. Returns aggregated analytics data. The frontend currently shows placeholder/default data.

```jsonc
{
  "negotiation_depth": [
    { "round": "1st offer", "pct": 42 },
    { "round": "1 round", "pct": 35 },
    { "round": "2 rounds", "pct": 15 },
    { "round": "3 rounds (max)", "pct": 8 }
  ],
  "carrier_objections": [
    { "reason": "Rate too low", "count": 14, "pct": 33 },
    { "reason": "Deadhead too far", "count": 9, "pct": 21 },
    { "reason": "Timing doesn't work", "count": 8, "pct": 19 },
    { "reason": "Wrong equipment", "count": 6, "pct": 14 },
    { "reason": "Prefer different lane", "count": 5, "pct": 12 }
  ],
  "top_lanes": [
    { "lane": "Chicago → Detroit", "calls": 8, "bookings": 5, "avg_rate": "$2,850" },
    { "lane": "Dallas → Memphis", "calls": 6, "bookings": 3, "avg_rate": "$2,400" },
    { "lane": "Phoenix → LA", "calls": 5, "bookings": 4, "avg_rate": "$1,450" },
    { "lane": "Atlanta → Jacksonville", "calls": 4, "bookings": 2, "avg_rate": "$1,920" },
    { "lane": "Nashville → Charlotte", "calls": 3, "bookings": 2, "avg_rate": "$2,100" }
  ],
  "equipment_demand_supply": [
    { "type": "Dry Van", "demand": 62, "supply": 55 },
    { "type": "Reefer", "demand": 25, "supply": 30 },
    { "type": "Flatbed", "demand": 13, "supply": 15 }
  ]
}
```

**How to compute each section:**

**negotiation_depth** — Distribution of how quickly deals close:
- Query all calls with outcome="booked" in the last 30 days
- Group by `negotiation_rounds`: 0 rounds = "1st offer", 1 round = "1 round", 2 = "2 rounds", 3+ = "3 rounds (max)"
- `pct` = (count in bucket / total booked calls) * 100, rounded to integer

**carrier_objections** — Top reasons carriers decline:
- Query calls with outcome in ("negotiation_failed", "dropped_call") in the last 30 days
- This requires extracting rejection reasons from call transcripts/summaries, OR tracking structured decline reasons
- If you don't have structured objection data, you can derive it from: `no_loads_available` → "No matching loads", `negotiation_failed` → "Rate too low" (most common), etc.
- Or skip this until you have transcript analysis
- `pct` = (count / total objections) * 100

**top_lanes** — Highest volume lanes:
- Query calls from last 30 days, group by `lane_origin + " → " + lane_destination`
- For each lane: count calls, count bookings (outcome="booked"), avg `agreed_rate` (formatted as "$X,XXX")
- Sort by calls descending, limit 5

**equipment_demand_supply** — Equipment type balance:
- `demand`: percentage of loads by equipment type (from current available loads)
- `supply`: percentage of carrier calls by equipment type (from recent calls)
- Group by equipment type, normalize to percentages

---

## P2: Database Schema Changes Summary

### New columns on `negotiation_settings` (or equivalent) table:

```sql
ALTER TABLE negotiation_settings
  ADD COLUMN max_negotiation_rounds INTEGER DEFAULT 3,
  ADD COLUMN max_offers_per_call INTEGER DEFAULT 3,
  ADD COLUMN auto_transfer_threshold INTEGER DEFAULT 500,
  ADD COLUMN deadhead_warning_miles INTEGER DEFAULT 150,
  ADD COLUMN floor_rate_protection BOOLEAN DEFAULT TRUE,
  ADD COLUMN sentiment_escalation BOOLEAN DEFAULT TRUE,
  ADD COLUMN prioritize_perishables BOOLEAN DEFAULT TRUE,
  ADD COLUMN agent_greeting TEXT DEFAULT 'Thanks for calling, this is your AI carrier sales agent. How can I help you today?',
  ADD COLUMN agent_tone VARCHAR(20) DEFAULT 'professional';
```

### Potential new columns on `loads` table (if not derivable from joins):

```sql
-- Only needed if you can't compute these from joins
ALTER TABLE loads
  ADD COLUMN urgency VARCHAR(10) DEFAULT 'normal',
  ADD COLUMN pitch_count INTEGER DEFAULT 0,
  ADD COLUMN days_listed INTEGER DEFAULT 0,
  ADD COLUMN status VARCHAR(10) DEFAULT 'available';
```

Alternatively, `pitch_count` and `days_listed` can be computed at query time:
- `pitch_count` = `SELECT COUNT(*) FROM offers WHERE load_id = ?`
- `days_listed` = `EXTRACT(DAY FROM NOW() - created_at)` (or similar)
- `urgency` can be computed in the API layer based on the rules above

---

## Existing Endpoints Reference (No Changes Needed)

These are working fine — no changes required:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/metrics` | GET | Dashboard metrics (extend with P0 fields above) |
| `/api/calls` | GET | Paginated call list (no changes) |
| `/api/calls/{callId}` | GET | Call detail with transcript (no changes) |
| `/api/booked-loads` | GET | Bookings list (extend with P0 fields above) |
| `/api/loads` | GET | **New** — paginated load list for dashboard (P0 #3 above) |
| `/api/loads/search` | POST | HappyRobot AI agent load search — **do NOT modify**, used by AI agent during calls |
| `/api/loads/{loadId}` | GET | Single load detail (no changes) |
| `/api/settings/negotiation` | GET/PUT | Settings (extend with P0 fields above) |
| `/health` | GET | Health check (no changes) |

---

## Type Reference

For exact TypeScript types the frontend expects, see: `lib/types.ts` in the frontend repo. Key enums:

```
CallOutcome: "booked" | "negotiation_failed" | "no_loads_available" | "invalid_carrier" | "carrier_thinking" | "transferred_to_ops" | "dropped_call"
Sentiment: "positive" | "neutral" | "frustrated" | "aggressive" | "confused"
EquipmentType: "dry_van" | "reefer" | "flatbed" | "step_deck" | "power_only"
LoadUrgency: "critical" | "high" | "normal"
LoadStatus: "matching" | "available" | "booked"
AgentTone: "professional" | "friendly" | "direct"
```

---

## Implementation Order (Suggested)

1. **Settings** (P0 #4) — Just add columns + update serializer. Fastest win.
2. **Booked loads** (P0 #2) — Add JOINs to existing query. Medium effort.
3. **Loads list** (P0 #3) — New `GET /api/loads` endpoint with pagination + computed fields. Medium effort. **Do NOT modify `POST /api/loads/search`** — that's HappyRobot's endpoint.
4. **Dashboard metrics** (P0 #1) — Most new fields, but all derivable from existing data. Higher effort.
5. **Analytics endpoint** (P1 #5) — New endpoint with aggregation queries. Highest effort.
