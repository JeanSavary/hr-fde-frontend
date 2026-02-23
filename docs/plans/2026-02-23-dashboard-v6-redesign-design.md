# Dashboard V6 Redesign Design

**Date**: 2026-02-23
**Status**: Approved

## Summary

Rebuild the dashboard from a single-file mock (`dashboard_v6.jsx`) into the existing Next.js 16 project structure. Translates all inline styles to Tailwind + shadcn/ui. Adds react-leaflet for load detail maps. Graceful degradation for missing backend data.

## Decisions

- **Styling**: Convert all inline styles to Tailwind classes, use existing shadcn/ui components
- **Maps**: Add react-leaflet for load detail page
- **Call detail UX**: Sidebar preview on calls list + keep existing detail page with transcript/audio
- **Data gaps**: Optional types, graceful degradation with fallbacks

## Type System Changes

### Extended Types (all new fields optional)

**DashboardMetrics**: Add `calls_today`, `calls_trend`, `booked_today`, `booked_trend`, `revenue_today`, `revenue_trend`, `conversion_rate`, `conversion_trend`, `pending_transfer`, `funnel_data[]`, `rate_intelligence`

**BookedLoad**: Add `carrier_name`, `lane`, `equipment`, `loadboard_rate`, `margin`, `negotiation_rounds`, `sentiment`, `booked_at`

**Load**: Add `urgency`, `pitch_count`, `days_listed`, `status`, `origin_lat/lng`, `dest_lat/lng`, `pieces`, `dims`, `notes`

**NegotiationSettings**: Add `max_negotiation_rounds`, `max_offers_per_call`, `auto_transfer_threshold`, `deadhead_warning_miles`, `floor_rate_protection`, `sentiment_escalation`, `prioritize_perishables`, `agent_greeting`, `agent_tone`

### New Types

**AnalyticsData**: `negotiation_depth[]`, `carrier_objections[]`, `top_lanes[]`, `equipment_demand_supply[]`

## Component Breakdown

### Overview (`/`)
- Rewrite `kpi-cards.tsx` — 5 cards with trends
- New `conversion-funnel.tsx` — horizontal bar funnel
- New `live-call-feed.tsx` — compact call list with status dots
- Update `outcome-chart.tsx` — horizontal stacked bar
- Update `sentiment-chart.tsx` — progress bars
- New `rate-intelligence.tsx` — rate comparison card

### Calls (`/calls`)
- Update `calls-table.tsx` — status dots, equipment badges
- Update `call-filters.tsx` — filter pill style
- New `call-sidebar.tsx` — inline detail with FMCSA, timeline

### Bookings (`/bookings`)
- Rewrite `bookings-summary.tsx` — 4 KPI cards
- Rewrite `bookings-table.tsx` — full table with margin, rounds, sentiment
- New `margin-distribution.tsx` — per-booking margin bars
- New `revenue-by-equipment.tsx` — equipment breakdown

### Loads (`/loads`)
- Update `load-filters.tsx` — urgency/equipment quick filters
- Rewrite `loads-table.tsx` — priority-sorted, urgency badges
- New `load-detail.tsx` — detail page with Leaflet map

### Analytics (`/analytics`) — NEW
- New `page.tsx` — analytics route
- New `negotiation-depth.tsx`
- New `carrier-objections.tsx`
- New `top-lanes.tsx`
- New `equipment-demand.tsx`

### Settings (`/settings`)
- Rewrite `negotiation-form.tsx` — 4 sections: Pricing, Behavior, Features, Voice

### Layout
- Add "Analytics" to sidebar nav

## Data Fetching

- Existing SWR hooks handle expanded response shapes
- New `useAnalytics()` hook + `/api/analytics/route.ts`
- All new fields optional in types for graceful degradation

## Backend Data Gaps

### P1 (Core experience)
- Dashboard: `calls_today`, `booked_today`, `revenue_today`, `conversion_rate`, `pending_transfer`
- Bookings: `carrier_name`, `lane`, `equipment`, `loadboard_rate`, `margin`, `negotiation_rounds`, `sentiment`, `booked_at`
- Loads: `urgency`, `pitch_count`, `days_listed`, lat/lng coords
- Settings: All new fields

### P2 (Enhanced)
- Dashboard: trends, funnel_data, rate_intelligence
- Loads: `pieces`, `dims`, `notes`
- Analytics: entire endpoint
