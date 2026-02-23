import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
const user = {
  name: "Carlos Becker",
  initials: "CB",
  role: "Operations Manager",
  email: "c.becker@acmelogistics.com",
  avatar: null,
};

const kpi = {
  callsToday: 47,
  callsTrend: "+12%",
  booked: 18,
  bookedTrend: "+8%",
  revenue: 42650,
  revenueTrend: "+15%",
  conversion: 38.3,
  conversionTrend: "+2.1%",
  pending: 3,
};

const funnelData = [
  { stage: "Inbound Calls", count: 47, pct: 100 },
  { stage: "Authenticated", count: 41, pct: 87 },
  { stage: "Load Matched", count: 33, pct: 70 },
  { stage: "Offer Made", count: 28, pct: 60 },
  { stage: "Negotiated", count: 22, pct: 47 },
  { stage: "Booked", count: 18, pct: 38 },
];

const outcomeData = [
  { label: "Booked", count: 18, color: "#34d399" },
  { label: "Transferred", count: 3, color: "#6366f1" },
  { label: "No Match", count: 8, color: "#94a3b8" },
  { label: "Auth Failed", count: 6, color: "#f0913b" },
  { label: "Declined", count: 9, color: "#f25c54" },
  { label: "Hung Up", count: 3, color: "#cbd5e1" },
];

const sentimentData = [
  { label: "Positive", pct: 52, color: "#34d399" },
  { label: "Neutral", pct: 31, color: "#94a3b8" },
  { label: "Negative", pct: 17, color: "#f25c54" },
];

const calls = [
  {
    id: "C-1047",
    carrier: "Swift Hauling LLC",
    mc: "MC-882451",
    time: "2 min ago",
    status: "live",
    sentiment: "neutral",
    lane: "Dallas → Memphis",
    equipment: "Dry Van",
    rate: null,
    outcome: "Negotiating",
    loadId: "LD-2041",
  },
  {
    id: "C-1046",
    carrier: "Midwest Express",
    mc: "MC-331209",
    time: "8 min ago",
    status: "booked",
    sentiment: "positive",
    lane: "Chicago → Detroit",
    equipment: "Reefer",
    rate: "$2,850",
    outcome: "Booked",
    loadId: "LD-2038",
  },
  {
    id: "C-1045",
    carrier: "TrueNorth Transport",
    mc: "MC-119384",
    time: "14 min ago",
    status: "transferred",
    sentiment: "neutral",
    lane: "Atlanta → Jacksonville",
    equipment: "Flatbed",
    rate: "$1,920",
    outcome: "Transferred",
    loadId: "LD-2035",
  },
  {
    id: "C-1044",
    carrier: "Pinnacle Freight",
    mc: "MC-554721",
    time: "22 min ago",
    status: "declined",
    sentiment: "negative",
    lane: "Houston → El Paso",
    equipment: "Dry Van",
    rate: "—",
    outcome: "Declined",
    loadId: "LD-2033",
  },
  {
    id: "C-1043",
    carrier: "Redline Carriers",
    mc: "MC-667102",
    time: "31 min ago",
    status: "booked",
    sentiment: "positive",
    lane: "Phoenix → LA",
    equipment: "Reefer",
    rate: "$1,450",
    outcome: "Booked",
    loadId: "LD-2030",
  },
  {
    id: "C-1042",
    carrier: "Atlas Moving Co",
    mc: "MC-223890",
    time: "38 min ago",
    status: "no_match",
    sentiment: "neutral",
    lane: "Denver → SLC",
    equipment: "Flatbed",
    rate: "—",
    outcome: "No Match",
    loadId: null,
  },
  {
    id: "C-1041",
    carrier: "Blue Ridge Trucking",
    mc: "MC-990134",
    time: "45 min ago",
    status: "booked",
    sentiment: "positive",
    lane: "Nashville → Charlotte",
    equipment: "Dry Van",
    rate: "$2,100",
    outcome: "Booked",
    loadId: "LD-2028",
  },
  {
    id: "C-1040",
    carrier: "Horizon Logistics",
    mc: "MC-445512",
    time: "52 min ago",
    status: "auth_failed",
    sentiment: "negative",
    lane: "—",
    equipment: "—",
    rate: "—",
    outcome: "Auth Failed",
    loadId: null,
  },
];

const bookings = [
  {
    id: "BK-401",
    loadId: "LD-2038",
    carrier: "Midwest Express",
    mc: "MC-331209",
    lane: "Chicago → Detroit",
    equipment: "Reefer",
    loadboardRate: 3100,
    agreedRate: 2850,
    margin: 14.2,
    bookedAt: "10:32 AM",
    sentiment: "positive",
    negotiationRounds: 1,
  },
  {
    id: "BK-400",
    loadId: "LD-2030",
    carrier: "Redline Carriers",
    mc: "MC-667102",
    lane: "Phoenix → LA",
    equipment: "Reefer",
    loadboardRate: 1600,
    agreedRate: 1450,
    margin: 12.8,
    bookedAt: "10:01 AM",
    sentiment: "positive",
    negotiationRounds: 2,
  },
  {
    id: "BK-399",
    loadId: "LD-2028",
    carrier: "Blue Ridge Trucking",
    mc: "MC-990134",
    lane: "Nashville → Charlotte",
    equipment: "Dry Van",
    loadboardRate: 2300,
    agreedRate: 2100,
    margin: 15.1,
    bookedAt: "9:47 AM",
    sentiment: "positive",
    negotiationRounds: 1,
  },
  {
    id: "BK-398",
    loadId: "LD-2025",
    carrier: "Summit Freight",
    mc: "MC-443201",
    lane: "Dallas → Houston",
    equipment: "Dry Van",
    loadboardRate: 950,
    agreedRate: 870,
    margin: 13.5,
    bookedAt: "9:21 AM",
    sentiment: "neutral",
    negotiationRounds: 2,
  },
  {
    id: "BK-397",
    loadId: "LD-2022",
    carrier: "Pacific Route Inc",
    mc: "MC-772910",
    lane: "Seattle → Portland",
    equipment: "Flatbed",
    loadboardRate: 780,
    agreedRate: 720,
    margin: 11.9,
    bookedAt: "9:08 AM",
    sentiment: "positive",
    negotiationRounds: 1,
  },
  {
    id: "BK-396",
    loadId: "LD-2019",
    carrier: "Lone Star Trucking",
    mc: "MC-551002",
    lane: "Memphis → Atlanta",
    equipment: "Dry Van",
    loadboardRate: 1850,
    agreedRate: 1700,
    margin: 14.8,
    bookedAt: "8:44 AM",
    sentiment: "neutral",
    negotiationRounds: 3,
  },
];

const loads = [
  {
    id: "LD-2041",
    origin: "Dallas, TX",
    destination: "Memphis, TN",
    pickup: "Feb 24, 6:00 AM",
    delivery: "Feb 24, 6:00 PM",
    equipment: "Dry Van",
    rate: 2400,
    weight: "38,000 lbs",
    commodity: "Electronics",
    miles: 452,
    pieces: 24,
    dims: '48×40×48"',
    notes: "Dock appointment required. No tail-gate.",
    status: "matching",
    daysListed: 0,
    pitchCount: 2,
    urgency: "high",
    origin_lat: 32.78,
    origin_lng: -96.8,
    dest_lat: 35.15,
    dest_lng: -90.05,
  },
  {
    id: "LD-2039",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup: "Feb 24, 8:00 AM",
    delivery: "Feb 24, 4:00 PM",
    equipment: "Reefer",
    rate: 1800,
    weight: "42,000 lbs",
    commodity: "Produce (temp 34°F)",
    miles: 370,
    pieces: 18,
    dims: '48×40×60"',
    notes: "Temperature-controlled. Continuous reefer monitoring required.",
    status: "available",
    daysListed: 1,
    pitchCount: 5,
    urgency: "critical",
    origin_lat: 34.05,
    origin_lng: -118.24,
    dest_lat: 33.45,
    dest_lng: -112.07,
  },
  {
    id: "LD-2037",
    origin: "Atlanta, GA",
    destination: "Jacksonville, FL",
    pickup: "Feb 25, 7:00 AM",
    delivery: "Feb 25, 3:00 PM",
    equipment: "Flatbed",
    rate: 1950,
    weight: "35,000 lbs",
    commodity: "Steel Beams",
    miles: 346,
    pieces: 8,
    dims: "20ft lengths",
    notes: "Oversized. Requires tarps and straps.",
    status: "available",
    daysListed: 2,
    pitchCount: 8,
    urgency: "critical",
    origin_lat: 33.75,
    origin_lng: -84.39,
    dest_lat: 30.33,
    dest_lng: -81.66,
  },
  {
    id: "LD-2036",
    origin: "Chicago, IL",
    destination: "Indianapolis, IN",
    pickup: "Feb 25, 10:00 AM",
    delivery: "Feb 25, 4:00 PM",
    equipment: "Dry Van",
    rate: 950,
    weight: "28,000 lbs",
    commodity: "Auto Parts",
    miles: 181,
    pieces: 40,
    dims: '36×36×36"',
    notes: "Standard dock delivery.",
    status: "available",
    daysListed: 0,
    pitchCount: 1,
    urgency: "normal",
    origin_lat: 41.88,
    origin_lng: -87.63,
    dest_lat: 39.77,
    dest_lng: -86.16,
  },
  {
    id: "LD-2034",
    origin: "Houston, TX",
    destination: "El Paso, TX",
    pickup: "Feb 26, 6:00 AM",
    delivery: "Feb 26, 8:00 PM",
    equipment: "Dry Van",
    rate: 2200,
    weight: "44,000 lbs",
    commodity: "Building Materials",
    miles: 747,
    pieces: 30,
    dims: '48×40×48"',
    notes: "Dead-end destination. High deadhead expected.",
    status: "available",
    daysListed: 3,
    pitchCount: 12,
    urgency: "critical",
    origin_lat: 29.76,
    origin_lng: -95.37,
    dest_lat: 31.76,
    dest_lng: -106.44,
  },
  {
    id: "LD-2032",
    origin: "Seattle, WA",
    destination: "San Francisco, CA",
    pickup: "Feb 26, 9:00 AM",
    delivery: "Feb 27, 12:00 PM",
    equipment: "Reefer",
    rate: 3200,
    weight: "40,000 lbs",
    commodity: "Seafood (temp 28°F)",
    miles: 807,
    pieces: 14,
    dims: '48×40×48"',
    notes: "High-value perishable. Priority load.",
    status: "available",
    daysListed: 1,
    pitchCount: 3,
    urgency: "high",
    origin_lat: 47.61,
    origin_lng: -122.33,
    dest_lat: 37.77,
    dest_lng: -122.42,
  },
  {
    id: "LD-2029",
    origin: "Denver, CO",
    destination: "Salt Lake City, UT",
    pickup: "Feb 27, 7:00 AM",
    delivery: "Feb 27, 5:00 PM",
    equipment: "Flatbed",
    rate: 1650,
    weight: "32,000 lbs",
    commodity: "Lumber",
    miles: 525,
    pieces: 12,
    dims: "Various",
    notes: "Chains required for mountain pass.",
    status: "available",
    daysListed: 2,
    pitchCount: 6,
    urgency: "high",
    origin_lat: 39.74,
    origin_lng: -104.99,
    dest_lat: 40.76,
    dest_lng: -111.89,
  },
  {
    id: "LD-2026",
    origin: "Miami, FL",
    destination: "Tampa, FL",
    pickup: "Feb 27, 11:00 AM",
    delivery: "Feb 27, 5:00 PM",
    equipment: "Dry Van",
    rate: 680,
    weight: "22,000 lbs",
    commodity: "Retail Goods",
    miles: 280,
    pieces: 50,
    dims: '24×24×24"',
    notes: "Multi-stop. 2 delivery points.",
    status: "available",
    daysListed: 0,
    pitchCount: 0,
    urgency: "normal",
    origin_lat: 25.76,
    origin_lng: -80.19,
    dest_lat: 27.95,
    dest_lng: -82.46,
  },
];

const defaultSettings = {
  targetMargin: 15,
  minMargin: 5,
  maxBumpAboveLoadboard: 3,
  maxNegotiationRounds: 3,
  maxOffersPerCall: 3,
  autoTransferThreshold: 500,
  deadheadWarningMiles: 150,
  floorRateProtection: true,
  sentimentEscalation: true,
  prioritizePerishables: true,
  agentGreeting:
    "Thanks for calling Acme Logistics, this is your AI carrier sales agent. How can I help you today?",
  agentTone: "professional",
};

/* ═══════════════════════════════════════════
   TINY COMPONENTS
   ═══════════════════════════════════════════ */
const Dot = ({ status }) => {
  const c =
    {
      live: "#34d399",
      booked: "#6366f1",
      transferred: "#f0913b",
      declined: "#f25c54",
      no_match: "#94a3b8",
      auth_failed: "#f0913b",
      matching: "#6366f1",
      available: "#34d399",
      critical: "#f25c54",
      high: "#f0913b",
      normal: "#94a3b8",
    }[status] || "#94a3b8";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: c,
        animation:
          status === "live" ? "pulse 1.5s ease-in-out infinite" : "none",
        boxShadow: status === "live" ? `0 0 0 3px ${c}22` : "none",
        flexShrink: 0,
      }}
    />
  );
};

const Badge = ({ children, color = "#94a3b8", bg = "#f1f5f9" }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 500,
      padding: "2px 8px",
      borderRadius: 99,
      backgroundColor: bg,
      color,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const SentBadge = ({ s }) => {
  const m = {
    positive: { bg: "#e6fbf0", c: "#1a9a5c", border: "#b4ecd1" },
    neutral: { bg: "#f0f1f4", c: "#5c6170", border: "#d8dae0" },
    negative: { bg: "#fde8e8", c: "#c93c3c", border: "#f5c4c4" },
  }[s] || { bg: "#f0f1f4", c: "#5c6170", border: "#d8dae0" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        backgroundColor: m.bg,
        color: m.c,
        border: `1px solid ${m.border}`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
};

const UrgencyBadge = ({ u }) => {
  const m =
    {
      critical: { bg: "#fde8e8", c: "#c93c3c", border: "#f5c4c4" },
      high: { bg: "#fef3e2", c: "#b86e14", border: "#f5d9a8" },
      normal: { bg: "#f0f1f4", c: "#64748b", border: "#d8dae0" },
    }[u] || {};
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 99,
        backgroundColor: m.bg,
        color: m.c,
        border: `1px solid ${m.border}`,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        textTransform: "capitalize",
      }}
    >
      {u}
    </span>
  );
};

const EquipBadge = ({ type }) => {
  const m = {
    "Dry Van": { bg: "#eef0ff", c: "#4f56a6", border: "#cdd1f0" },
    Reefer: { bg: "#e6f7fb", c: "#1a7f8f", border: "#b4e3ec" },
    Flatbed: { bg: "#f3eefc", c: "#7c5cb8", border: "#d6c9f0" },
  }[type] || { bg: "#f0f1f4", c: "#5c6170", border: "#d8dae0" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        backgroundColor: m.bg,
        color: m.c,
        border: `1px solid ${m.border}`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </span>
  );
};

// SVG Icons
const Icons = {
  overview: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  calls: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  bookings: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  loads: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  analytics: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  settings: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  back: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  pin: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="10" r="3" />
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 0 0-16 0c0 3 2.7 7 8 11.7z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   LEAFLET MAP COMPONENT
   ═══════════════════════════════════════════ */
function LeafletMap({
  originLat,
  originLng,
  destLat,
  destLng,
  originLabel,
  destLabel,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapRef.current || !window.L) return;

      // Destroy previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = window.L;
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Minimal grayscale tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
        },
      ).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Attribution bottom-left
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution(
          '© <a href="https://www.openstreetmap.org/">OSM</a> · <a href="https://carto.com/">CARTO</a>',
        )
        .addTo(map);

      // Custom icon factory
      const makeIcon = (color, label) =>
        L.divIcon({
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
          html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;font-family:'DM Sans',sans-serif;box-shadow:0 2px 8px ${color}44;transform:rotate(-45deg);"><span style="transform:rotate(45deg)">${label}</span></div>`,
        });

      const originMarker = L.marker([originLat, originLng], {
        icon: makeIcon("#6366f1", "A"),
      }).addTo(map);
      const destMarker = L.marker([destLat, destLng], {
        icon: makeIcon("#34d399", "B"),
      }).addTo(map);

      originMarker.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;font-size:13px;"><strong>Pickup</strong><br/>${originLabel}</div>`,
      );
      destMarker.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;font-size:13px;"><strong>Delivery</strong><br/>${destLabel}</div>`,
      );

      // Draw route line with curve
      const midLat = (originLat + destLat) / 2;
      const midLng = (originLng + destLng) / 2;
      const offset = Math.abs(originLng - destLng) * 0.15;
      const curvedMidLat = midLat + offset * 0.5;

      // Create a smooth curve with intermediate points
      const points = [];
      for (let t = 0; t <= 1; t += 0.02) {
        const lat =
          (1 - t) * (1 - t) * originLat +
          2 * (1 - t) * t * curvedMidLat +
          t * t * destLat;
        const lng =
          (1 - t) * (1 - t) * originLng +
          2 * (1 - t) * t * midLng +
          t * t * destLng;
        points.push([lat, lng]);
      }

      L.polyline(points, {
        color: "#6366f1",
        weight: 3,
        opacity: 0.7,
        dashArray: "8 6",
        lineCap: "round",
      }).addTo(map);

      // Also draw a thin solid shadow line
      L.polyline(points, {
        color: "#6366f1",
        weight: 1.5,
        opacity: 0.15,
      }).addTo(map);

      // Fit bounds with padding
      const bounds = L.latLngBounds([
        [originLat, originLng],
        [destLat, destLng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60] });
    };

    // Load Leaflet JS if not loaded
    if (!window.L) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => setTimeout(initMap, 50);
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 50);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [originLat, originLng, destLat, destLng, originLabel, destLabel]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("overview");
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [savedToast, setSavedToast] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const accent = "#6366f1";

  const navigate = (p) => {
    setPage(p);
    setSelectedCall(null);
    setSelectedLoad(null);
  };

  const saveSettings = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  // ── Load Detail Page ──
  if (selectedLoad) {
    const L = selectedLoad;
    return (
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          color: "#1e1e1e",
        }}
      >
        <style>{globalStyles}</style>
        <div
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid #eaeaea",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setSelectedLoad(null)}
            className="icon-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#888",
            }}
          >
            {Icons.back} Back to Loads
          </button>
          <span style={{ color: "#ddd" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{L.id}</span>
          <UrgencyBadge u={L.urgency} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            height: "calc(100vh - 61px)",
          }}
        >
          {/* Map Area */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            <LeafletMap
              originLat={L.origin_lat}
              originLng={L.origin_lng}
              destLat={L.dest_lat}
              destLng={L.dest_lng}
              originLabel={L.origin}
              destLabel={L.destination}
            />
            {/* Floating route info overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 24px",
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 12,
                border: "1px solid #e8e8e8",
                display: "flex",
                gap: 24,
                fontSize: 13,
                zIndex: 1000,
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#6366f1",
                  }}
                />
                <span style={{ color: "#999" }}>{L.origin.split(",")[0]}</span>
              </div>
              <div style={{ color: "#ddd" }}>→</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#34d399",
                  }}
                />
                <span style={{ color: "#999" }}>
                  {L.destination.split(",")[0]}
                </span>
              </div>
              <div style={{ width: 1, backgroundColor: "#e8e8e8" }} />
              <div>
                <span style={{ color: "#999" }}>Distance </span>
                <strong>{L.miles} mi</strong>
              </div>
              <div>
                <span style={{ color: "#999" }}>Rate/mi </span>
                <strong style={{ color: accent }}>
                  ${(L.rate / L.miles).toFixed(2)}
                </strong>
              </div>
              <div>
                <span style={{ color: "#999" }}>Equipment </span>
                <strong>{L.equipment}</strong>
              </div>
            </div>
          </div>
          {/* Detail Panel */}
          <div
            style={{
              backgroundColor: "#fff",
              borderLeft: "1px solid #eaeaea",
              overflowY: "auto",
              padding: 0,
            }}
          >
            <div style={{ padding: "24px 24px 16px" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                Load Details
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'DM Mono', monospace",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                ${L.rate.toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 400, color: "#999" }}>
                  loadboard rate
                </span>
              </div>
            </div>
            <div style={{ padding: "0 24px" }}>
              {/* urgency + status header */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <UrgencyBadge u={L.urgency} />
                <Badge
                  color={L.pitchCount > 8 ? "#e03e3e" : "#64748b"}
                  bg={L.pitchCount > 8 ? "#fff0f0" : "#f1f5f9"}
                >
                  Pitched {L.pitchCount}×
                </Badge>
                <Badge color="#64748b" bg="#f1f5f9">
                  {L.daysListed}d listed
                </Badge>
              </div>
              {/* Data rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["Origin", L.origin, Icons.pin],
                  ["Destination", L.destination, Icons.pin],
                  ["Pickup", L.pickup],
                  ["Delivery", L.delivery],
                  ["Equipment", L.equipment],
                  ["Weight", L.weight],
                  ["Commodity", L.commodity],
                  ["Pieces", L.pieces],
                  ["Dimensions", L.dims],
                  ["Miles", `${L.miles} mi`],
                  ["Rate per Mile", `$${(L.rate / L.miles).toFixed(2)}`],
                ].map(([label, val, icon], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#999",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {icon}
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        textAlign: "right",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
              {/* Notes */}
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  backgroundColor: "#fafafa",
                  borderRadius: 8,
                  border: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  Notes
                </div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                  {L.notes}
                </div>
              </div>
              {/* Risk indicators for important loads */}
              {L.urgency === "critical" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    backgroundColor: "#fff0f0",
                    borderRadius: 8,
                    border: "1px solid #fdd8d8",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#e03e3e",
                      marginBottom: 4,
                    }}
                  >
                    ⚠ Needs Attention
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#b52828", lineHeight: 1.5 }}
                  >
                    {L.pitchCount > 8
                      ? "Pitched 8+ times without booking — consider adjusting rate. "
                      : ""}
                    {L.daysListed >= 2
                      ? "Listed for 2+ days — aging load risk. "
                      : ""}
                    {L.commodity.includes("temp") ||
                    L.commodity.includes("Seafood") ||
                    L.commodity.includes("Produce")
                      ? "Perishable commodity — time-sensitive. "
                      : ""}
                    {L.notes.includes("Dead-end")
                      ? "Dead-end destination — expect carrier resistance on rate. "
                      : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: Icons.overview },
    { id: "calls", label: "Calls", icon: Icons.calls },
    { id: "bookings", label: "Bookings", icon: Icons.bookings },
    { id: "loads", label: "Loads", icon: Icons.loads },
    { id: "analytics", label: "Analytics", icon: Icons.analytics },
  ];

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
        color: "#1e1e1e",
        display: "flex",
      }}
    >
      <style>{globalStyles}</style>

      {/* ═══ SIDEBAR ═══ */}
      <aside
        style={{
          width: sidebarCollapsed ? 64 : 220,
          minWidth: sidebarCollapsed ? 64 : 220,
          height: "100vh",
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          borderRight: "1px solid #eaeaea",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease, min-width 0.25s ease",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: sidebarCollapsed ? "20px 16px" : "20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: 8,
              background: "#1e1e1e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
            }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            A
          </div>
          {!sidebarCollapsed && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                Acme Logistics
              </div>
              <div
                style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}
              >
                Carrier Sales AI
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                backgroundColor: page === n.id ? "#f5f5f5" : "transparent",
                color: page === n.id ? "#1e1e1e" : "#888",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: page === n.id ? 600 : 400,
                transition: "all 0.15s",
                width: "100%",
              }}
            >
              {n.icon}
              {!sidebarCollapsed && <span>{n.label}</span>}
              {!sidebarCollapsed && n.id === "calls" && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontWeight: 600,
                    backgroundColor: "#eafbf4",
                    color: "#087f5b",
                    padding: "2px 6px",
                    borderRadius: 99,
                  }}
                >
                  1 live
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom: Settings + User */}
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px 8px" }}>
          <button
            onClick={() => navigate("settings")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: sidebarCollapsed ? "10px 0" : "10px 12px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              width: "100%",
              backgroundColor: page === "settings" ? "#f5f5f5" : "transparent",
              color: page === "settings" ? "#1e1e1e" : "#888",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: page === "settings" ? 600 : 400,
            }}
          >
            {Icons.settings}
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </div>

        {/* User */}
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            padding: sidebarCollapsed ? "12px 8px" : "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            CB
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}
              >
                {user.name}
              </div>
              <div
                style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}
              >
                {user.role}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main
        style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}
      >
        {/* Top bar */}
        <header
          style={{
            padding: "16px 32px",
            borderBottom: "1px solid #eaeaea",
            backgroundColor: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {page === "overview" && "Overview"}
              {page === "calls" && "Calls"}
              {page === "bookings" && "Bookings"}
              {page === "loads" && "Load Board"}
              {page === "analytics" && "Analytics"}
              {page === "settings" && "Settings"}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
              {page === "overview" &&
                "Today's carrier sales performance at a glance"}
              {page === "calls" && `${calls.length} calls today · 1 live`}
              {page === "bookings" && `${bookings.length} loads booked today`}
              {page === "loads" && `${loads.length} loads available`}
              {page === "analytics" &&
                "Negotiation & lane performance insights"}
              {page === "settings" &&
                "AI agent negotiation parameters & behavior"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                backgroundColor: "#eafbf4",
                color: "#087f5b",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <Dot status="live" /> Agent Online
            </div>
          </div>
        </header>

        <div style={{ padding: "24px 32px", maxWidth: 1280 }}>
          {/* ═══════ OVERVIEW ═══════ */}
          {page === "overview" && (
            <>
              {/* KPI */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    l: "Calls Today",
                    v: kpi.callsToday,
                    t: kpi.callsTrend,
                    f: (v) => v,
                  },
                  {
                    l: "Loads Booked",
                    v: kpi.booked,
                    t: kpi.bookedTrend,
                    f: (v) => v,
                  },
                  {
                    l: "Revenue Locked",
                    v: kpi.revenue,
                    t: kpi.revenueTrend,
                    f: (v) => `$${(v / 1000).toFixed(1)}k`,
                  },
                  {
                    l: "Conversion",
                    v: kpi.conversion,
                    t: kpi.conversionTrend,
                    f: (v) => `${v}%`,
                  },
                  {
                    l: "Pending Transfer",
                    v: kpi.pending,
                    t: null,
                    f: (v) => v,
                    alert: true,
                  },
                ].map((k, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      borderColor: k.alert ? "#f0913b" : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#999",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {k.l}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 700,
                          fontFamily: "'DM Mono', monospace",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {k.f(k.v)}
                      </span>
                      {k.t && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: k.t.startsWith("+") ? "#34d399" : "#f25c54",
                          }}
                        >
                          {k.t}
                        </span>
                      )}
                      {k.alert && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#f0913b",
                            padding: "2px 6px",
                            background: "#fef5e8",
                            borderRadius: 4,
                          }}
                        >
                          ACTION
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Funnel + Feed */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div className="card" style={{ animationDelay: "0.25s" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}
                  >
                    Conversion Funnel
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {funnelData.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 90,
                            fontSize: 11,
                            color: "#777",
                            fontWeight: 500,
                            textAlign: "right",
                          }}
                        >
                          {f.stage}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 22,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 5,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${f.pct}%`,
                              height: "100%",
                              backgroundColor:
                                i === funnelData.length - 1
                                  ? accent
                                  : `rgba(99,102,241,${0.15 + i * 0.15})`,
                              borderRadius: 5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              paddingRight: 6,
                              transition: "width 0.6s ease",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: i >= 3 ? "#fff" : accent,
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {f.count}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            width: 30,
                            fontSize: 10,
                            color: "#bbb",
                            fontFamily: "'DM Mono', monospace",
                            textAlign: "right",
                          }}
                        >
                          {f.pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="card"
                  style={{
                    animationDelay: "0.3s",
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "16px 20px 8px",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Live Call Feed</span>
                    <span
                      style={{ fontSize: 11, color: "#ccc", fontWeight: 400 }}
                    >
                      Just now
                    </span>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {calls.slice(0, 6).map((c, i) => (
                      <div
                        key={c.id}
                        className="row-hover"
                        onClick={() => {
                          setSelectedCall(c);
                          setPage("calls");
                        }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "8px 1fr auto",
                          gap: 10,
                          alignItems: "center",
                          padding: "10px 20px",
                          borderTop: "1px solid #f5f5f5",
                          cursor: "pointer",
                          animation: `slideIn 0.3s ease ${i * 0.04}s both`,
                        }}
                      >
                        <Dot status={c.status} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>
                            {c.carrier}
                          </div>
                          <div style={{ fontSize: 11, color: "#bbb" }}>
                            {c.mc} · {c.lane}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: "'DM Mono', monospace",
                              color: c.rate ? accent : "#ddd",
                            }}
                          >
                            {c.rate || "—"}
                          </div>
                          <div style={{ fontSize: 10, color: "#ccc" }}>
                            {c.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bottom row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 14,
                }}
              >
                <div className="card" style={{ animationDelay: "0.4s" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}
                  >
                    Call Outcomes
                  </div>
                  {outcomeData.map((o, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: o.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1, fontSize: 12, color: "#666" }}>
                        {o.label}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {o.count}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      height: 5,
                      borderRadius: 3,
                      overflow: "hidden",
                      marginTop: 12,
                    }}
                  >
                    {outcomeData.map((o, i) => (
                      <div
                        key={i}
                        style={{ flex: o.count, backgroundColor: o.color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="card" style={{ animationDelay: "0.45s" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}
                  >
                    Carrier Sentiment
                  </div>
                  {sentimentData.map((s, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#666" }}>
                          {s.label}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {s.pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${s.pct}%`,
                            height: "100%",
                            backgroundColor: s.color,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ animationDelay: "0.5s" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}
                  >
                    Rate Intelligence
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bbb",
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        Avg Loadboard
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        $2,380
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bbb",
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        Avg Agreed
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          fontFamily: "'DM Mono', monospace",
                          color: accent,
                        }}
                      >
                        $2,185
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      paddingTop: 10,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bbb",
                          textTransform: "uppercase",
                        }}
                      >
                        Discount
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        8.2%
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bbb",
                          textTransform: "uppercase",
                        }}
                      >
                        Margin
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                          color: "#34d399",
                        }}
                      >
                        14.8%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════ CALLS ═══════ */}
          {page === "calls" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: selectedCall ? "1fr 380px" : "1fr",
                gap: 16,
              }}
            >
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    All Calls{" "}
                    <span style={{ color: "#bbb", fontWeight: 400 }}>
                      ({calls.length})
                    </span>
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["All", "Booked", "Declined", "Flagged"].map((f) => (
                      <button
                        key={f}
                        className="filter-btn"
                        data-active={f === "All" ? "true" : "false"}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {[
                        "",
                        "Carrier",
                        "MC #",
                        "Lane",
                        "Equip.",
                        "Rate",
                        "Sentiment",
                        "Time",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 14px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#bbb",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map((c, i) => (
                      <tr
                        key={c.id}
                        className="row-hover"
                        onClick={() => setSelectedCall(c)}
                        style={{
                          borderBottom: "1px solid #f8f8f8",
                          backgroundColor:
                            selectedCall?.id === c.id
                              ? "#f8f7ff"
                              : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "10px 14px" }}>
                          <Dot status={c.status} />
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                          {c.carrier}
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            fontFamily: "'DM Mono', monospace",
                            color: "#999",
                            fontSize: 11,
                          }}
                        >
                          {c.mc}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#666" }}>
                          {c.lane}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <EquipBadge type={c.equipment} />
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 600,
                          }}
                        >
                          {c.rate || "—"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <SentBadge s={c.sentiment} />
                        </td>
                        <td style={{ padding: "10px 14px", color: "#ccc" }}>
                          {c.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedCall && (
                <CallDetail
                  call={selectedCall}
                  onClose={() => setSelectedCall(null)}
                  accent={accent}
                />
              )}
            </div>
          )}

          {/* ═══════ BOOKINGS ═══════ */}
          {page === "bookings" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {[
                  { l: "Total Booked", v: bookings.length, f: (v) => v },
                  {
                    l: "Total Revenue",
                    v: bookings.reduce((s, b) => s + b.agreedRate, 0),
                    f: (v) => `$${(v / 1000).toFixed(1)}k`,
                  },
                  {
                    l: "Avg Margin",
                    v: (
                      bookings.reduce((s, b) => s + b.margin, 0) /
                      bookings.length
                    ).toFixed(1),
                    f: (v) => `${v}%`,
                  },
                  {
                    l: "Avg Rounds",
                    v: (
                      bookings.reduce((s, b) => s + b.negotiationRounds, 0) /
                      bookings.length
                    ).toFixed(1),
                    f: (v) => v,
                  },
                ].map((k, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#999",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {k.l}
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {k.f(k.v)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Today's Bookings
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {[
                        "ID",
                        "Load",
                        "Carrier",
                        "Lane",
                        "Equip.",
                        "Loadboard",
                        "Agreed",
                        "Margin",
                        "Rounds",
                        "Sentiment",
                        "Booked",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#bbb",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr
                        key={b.id}
                        className="row-hover"
                        style={{
                          borderBottom: "1px solid #f8f8f8",
                          cursor: "default",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "'DM Mono', monospace",
                            color: "#999",
                            fontSize: 11,
                          }}
                        >
                          {b.id}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 11,
                            color: accent,
                            fontWeight: 500,
                          }}
                        >
                          {b.loadId}
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                          {b.carrier}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#666" }}>
                          {b.lane}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <EquipBadge type={b.equipment} />
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "'DM Mono', monospace",
                            color: "#999",
                          }}
                        >
                          ${b.loadboardRate.toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 600,
                          }}
                        >
                          ${b.agreedRate.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontWeight: 600,
                              color:
                                b.margin >= 15
                                  ? "#34d399"
                                  : b.margin >= 10
                                    ? "#f0913b"
                                    : "#f25c54",
                            }}
                          >
                            {b.margin}%
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "'DM Mono', monospace",
                            textAlign: "center",
                          }}
                        >
                          {b.negotiationRounds}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <SentBadge s={b.sentiment} />
                        </td>
                        <td style={{ padding: "10px 12px", color: "#999" }}>
                          {b.bookedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Margin distribution mini chart */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginTop: 14,
                }}
              >
                <div className="card">
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}
                  >
                    Margin Distribution
                  </div>
                  {bookings.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 70,
                          fontSize: 11,
                          color: "#999",
                          textAlign: "right",
                        }}
                      >
                        {b.lane.split(" → ")[0]}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 16,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 4,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: `${(b.margin / 20) * 100}%`,
                            height: "100%",
                            backgroundColor:
                              b.margin >= 15
                                ? "#34d399"
                                : b.margin >= 10
                                  ? accent
                                  : "#f0913b",
                            borderRadius: 4,
                            transition: "width 0.6s ease",
                          }}
                        />
                        {/* min line */}
                        <div
                          style={{
                            position: "absolute",
                            left: `${(5 / 20) * 100}%`,
                            top: 0,
                            width: 1.5,
                            height: "100%",
                            backgroundColor: "#f25c54",
                            opacity: 0.4,
                          }}
                        />
                        {/* target line */}
                        <div
                          style={{
                            position: "absolute",
                            left: `${(15 / 20) * 100}%`,
                            top: 0,
                            width: 1.5,
                            height: "100%",
                            backgroundColor: "#34d399",
                            opacity: 0.4,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          width: 36,
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                          color: b.margin >= 15 ? "#34d399" : "#f0913b",
                        }}
                      >
                        {b.margin}%
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 10,
                      fontSize: 10,
                      color: "#bbb",
                    }}
                  >
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 2,
                          backgroundColor: "#f25c54",
                          marginRight: 4,
                          borderRadius: 1,
                          opacity: 0.5,
                        }}
                      />
                      Min 5%
                    </span>
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 2,
                          backgroundColor: "#34d399",
                          marginRight: 4,
                          borderRadius: 1,
                          opacity: 0.5,
                        }}
                      />
                      Target 15%
                    </span>
                  </div>
                </div>
                <div className="card">
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}
                  >
                    Revenue by Equipment
                  </div>
                  {["Reefer", "Dry Van", "Flatbed"].map((eq, i) => {
                    const eqBookings = bookings.filter(
                      (b) => b.equipment === eq,
                    );
                    const rev = eqBookings.reduce(
                      (s, b) => s + b.agreedRate,
                      0,
                    );
                    const total = bookings.reduce(
                      (s, b) => s + b.agreedRate,
                      0,
                    );
                    return (
                      <div key={eq} style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 500 }}>
                            {eq}{" "}
                            <span style={{ color: "#bbb", fontWeight: 400 }}>
                              ({eqBookings.length} loads)
                            </span>
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            ${(rev / 1000).toFixed(1)}k
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(rev / total) * 100}%`,
                              height: "100%",
                              backgroundColor: [accent, "#34d399", "#f0913b"][
                                i
                              ],
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══════ LOADS ═══════ */}
          {page === "loads" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {[
                  { l: "Available Loads", v: loads.length },
                  {
                    l: "Critical Priority",
                    v: loads.filter((l) => l.urgency === "critical").length,
                    alert: true,
                  },
                  {
                    l: "Avg Rate/Mile",
                    v: `$${(loads.reduce((s, l) => s + l.rate / l.miles, 0) / loads.length).toFixed(2)}`,
                  },
                  {
                    l: "Avg Pitch Count",
                    v: (
                      loads.reduce((s, l) => s + l.pitchCount, 0) / loads.length
                    ).toFixed(1),
                  },
                ].map((k, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      borderColor: k.alert ? "#f25c54" : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#999",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {k.l}
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {k.v}
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    Available Loads{" "}
                    <span
                      style={{
                        fontSize: 11,
                        color: "#bbb",
                        fontWeight: 400,
                        marginLeft: 4,
                      }}
                    >
                      sorted by priority
                    </span>
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["All", "Critical", "Reefer", "Dry Van", "Flatbed"].map(
                      (f) => (
                        <button
                          key={f}
                          className="filter-btn"
                          data-active={f === "All" ? "true" : "false"}
                        >
                          {f}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {[
                        "Priority",
                        "Load ID",
                        "Lane",
                        "Equip.",
                        "Rate",
                        "$/mi",
                        "Pickup",
                        "Weight",
                        "Pitched",
                        "Listed",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#bbb",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...loads]
                      .sort((a, b) => {
                        const urgOrder = { critical: 0, high: 1, normal: 2 };
                        return (
                          (urgOrder[a.urgency] ?? 2) -
                          (urgOrder[b.urgency] ?? 2)
                        );
                      })
                      .map((l, i) => (
                        <tr
                          key={l.id}
                          className="row-hover"
                          onClick={() => setSelectedLoad(l)}
                          style={{
                            borderBottom:
                              l.urgency === "critical"
                                ? "1px solid #f5c4c4"
                                : "1px solid #f8f8f8",
                            backgroundColor:
                              l.urgency === "critical"
                                ? "#fff5f5"
                                : "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <td style={{ padding: "10px 12px" }}>
                            <UrgencyBadge u={l.urgency} />
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontFamily: "'DM Mono', monospace",
                              fontWeight: 600,
                              color: accent,
                            }}
                          >
                            {l.id}
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                            {l.origin.split(",")[0]} →{" "}
                            {l.destination.split(",")[0]}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <EquipBadge type={l.equipment} />
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontFamily: "'DM Mono', monospace",
                              fontWeight: 600,
                            }}
                          >
                            ${l.rate.toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontFamily: "'DM Mono', monospace",
                              color: "#888",
                            }}
                          >
                            ${(l.rate / l.miles).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#666",
                              fontSize: 11,
                            }}
                          >
                            {l.pickup}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#888",
                              fontSize: 11,
                            }}
                          >
                            {l.weight}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontWeight: 600,
                                color:
                                  l.pitchCount > 8
                                    ? "#f25c54"
                                    : l.pitchCount > 4
                                      ? "#f0913b"
                                      : "#888",
                              }}
                            >
                              {l.pitchCount}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#999" }}>
                            {l.daysListed}d
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ═══════ ANALYTICS ═══════ */}
          {page === "analytics" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div className="card">
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}
                >
                  Negotiation Depth
                </div>
                {[
                  { r: "1st offer", pct: 42 },
                  { r: "1 round", pct: 35 },
                  { r: "2 rounds", pct: 15 },
                  { r: "3 rounds (max)", pct: 8 },
                ].map((n, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 90,
                        fontSize: 11,
                        color: "#777",
                        textAlign: "right",
                      }}
                    >
                      {n.r}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 24,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 5,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${n.pct}%`,
                          height: "100%",
                          backgroundColor:
                            i === 0
                              ? accent
                              : `rgba(99,102,241,${0.7 - i * 0.15})`,
                          borderRadius: 5,
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#fff",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {n.pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    backgroundColor: "#fafafa",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  <strong style={{ color: "#1e1e1e" }}>
                    77% close within 1 round
                  </strong>{" "}
                  — pricing is well-calibrated.
                </div>
              </div>
              <div className="card">
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}
                >
                  Top Carrier Objections
                </div>
                {[
                  { r: "Rate too low", c: 14, p: 33 },
                  { r: "Deadhead too far", c: 9, p: 21 },
                  { r: "Timing doesn't work", c: 8, p: 19 },
                  { r: "Wrong equipment", c: 6, p: 14 },
                  { r: "Prefer different lane", c: 5, p: 12 },
                ].map((o, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#bbb",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{o.r}</div>
                      <div
                        style={{
                          height: 3,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 2,
                          marginTop: 3,
                        }}
                      >
                        <div
                          style={{
                            width: `${o.p}%`,
                            height: "100%",
                            backgroundColor: "rgba(99,102,241,0.65)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "#999",
                      }}
                    >
                      {o.c}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}
                >
                  Top Lanes by Volume
                </div>
                {[
                  { l: "Chicago → Detroit", c: 8, b: 5, r: "$2,850" },
                  { l: "Dallas → Memphis", c: 6, b: 3, r: "$2,400" },
                  { l: "Phoenix → LA", c: 5, b: 4, r: "$1,450" },
                  { l: "Atlanta → Jacksonville", c: 4, b: 2, r: "$1,920" },
                  { l: "Nashville → Charlotte", c: 3, b: 2, r: "$2,100" },
                ].map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 50px 50px 60px",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 6,
                      backgroundColor: i === 0 ? "#f8f7ff" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{l.l}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#999",
                        textAlign: "center",
                      }}
                    >
                      {l.c} calls
                    </span>
                    <span style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "1px 5px",
                          borderRadius: 3,
                          backgroundColor:
                            l.b / l.c > 0.5 ? "#eafbf4" : "#fff0f0",
                          color: l.b / l.c > 0.5 ? "#087f5b" : "#b52828",
                        }}
                      >
                        {Math.round((l.b / l.c) * 100)}%
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'DM Mono', monospace",
                        textAlign: "right",
                      }}
                    >
                      {l.r}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}
                >
                  Equipment Demand vs. Inventory
                </div>
                {[
                  { t: "Dry Van", d: 62, s: 55 },
                  { t: "Reefer", d: 25, s: 30 },
                  { t: "Flatbed", d: 13, s: 15 },
                ].map((e, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {e.t}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: e.d > e.s ? "#f25c54" : "#34d399",
                        }}
                      >
                        {e.d > e.s ? "Under-supplied" : "Balanced"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#ccc",
                            marginBottom: 2,
                            textTransform: "uppercase",
                          }}
                        >
                          Demand
                        </div>
                        <div
                          style={{
                            height: 6,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 3,
                          }}
                        >
                          <div
                            style={{
                              width: `${e.d}%`,
                              height: "100%",
                              backgroundColor: accent,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#ccc",
                            marginBottom: 2,
                            textTransform: "uppercase",
                          }}
                        >
                          Supply
                        </div>
                        <div
                          style={{
                            height: 6,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 3,
                          }}
                        >
                          <div
                            style={{
                              width: `${e.s}%`,
                              height: "100%",
                              backgroundColor: "#34d399",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ SETTINGS ═══════ */}
          {page === "settings" && (
            <>
              {savedToast && (
                <div
                  style={{
                    position: "fixed",
                    top: 20,
                    right: 32,
                    padding: "10px 20px",
                    backgroundColor: "#34d399",
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    zIndex: 999,
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  Settings saved successfully
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {/* Pricing & Margins */}
                <div className="card">
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    Pricing & Margins
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#999", marginBottom: 20 }}
                  >
                    Controls how the AI agent negotiates rates with carriers
                  </div>
                  {[
                    {
                      key: "targetMargin",
                      label: "Target Margin",
                      desc: "Ideal margin the agent aims for on every deal",
                      unit: "%",
                      min: 5,
                      max: 30,
                    },
                    {
                      key: "minMargin",
                      label: "Minimum Margin",
                      desc: "Absolute floor — agent will never go below this",
                      unit: "%",
                      min: 1,
                      max: 20,
                    },
                    {
                      key: "maxBumpAboveLoadboard",
                      label: "Max Bump Above Loadboard",
                      desc: "How much above loadboard rate the agent can offer",
                      unit: "%",
                      min: 0,
                      max: 15,
                    },
                  ].map((s, i) => (
                    <div key={s.key} style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: 11, color: "#bbb" }}>
                            {s.desc}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor: "#f5f5f5",
                            padding: "4px 10px",
                            borderRadius: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              fontFamily: "'DM Mono', monospace",
                              minWidth: 32,
                              textAlign: "right",
                            }}
                          >
                            {settings[s.key]}
                          </span>
                          <span style={{ fontSize: 12, color: "#999" }}>
                            {s.unit}
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={1}
                        value={settings[s.key]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [s.key]: Number(e.target.value),
                          })
                        }
                        className="slider"
                      />
                    </div>
                  ))}
                </div>

                {/* Negotiation Behavior */}
                <div className="card">
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    Negotiation Behavior
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#999", marginBottom: 20 }}
                  >
                    Rules governing how the AI conducts negotiations
                  </div>
                  {[
                    {
                      key: "maxNegotiationRounds",
                      label: "Max Negotiation Rounds",
                      desc: "Rounds before the agent stops negotiating",
                      min: 1,
                      max: 5,
                    },
                    {
                      key: "maxOffersPerCall",
                      label: "Max Offers Per Call",
                      desc: "Different loads to pitch in a single call",
                      min: 1,
                      max: 5,
                    },
                    {
                      key: "autoTransferThreshold",
                      label: "Auto-Transfer Threshold",
                      desc: "Rate gap ($) that triggers transfer to human rep",
                      unit: "$",
                      min: 100,
                      max: 1000,
                      step: 50,
                    },
                    {
                      key: "deadheadWarningMiles",
                      label: "Deadhead Warning",
                      desc: "Miles of deadhead before agent acknowledges carrier concern",
                      unit: "mi",
                      min: 50,
                      max: 300,
                      step: 10,
                    },
                  ].map((s, i) => (
                    <div key={s.key} style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: 11, color: "#bbb" }}>
                            {s.desc}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor: "#f5f5f5",
                            padding: "4px 10px",
                            borderRadius: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              fontFamily: "'DM Mono', monospace",
                              minWidth: 32,
                              textAlign: "right",
                            }}
                          >
                            {settings[s.key]}
                          </span>
                          <span style={{ fontSize: 12, color: "#999" }}>
                            {s.unit || ""}
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step || 1}
                        value={settings[s.key]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [s.key]: Number(e.target.value),
                          })
                        }
                        className="slider"
                      />
                    </div>
                  ))}
                </div>

                {/* Smart Features */}
                <div className="card">
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    Smart Features
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#999", marginBottom: 20 }}
                  >
                    Toggle intelligent behaviors for the AI agent
                  </div>
                  {[
                    {
                      key: "floorRateProtection",
                      label: "Floor Rate Protection",
                      desc: "Prevent agent from accepting rates below minimum margin",
                    },
                    {
                      key: "sentimentEscalation",
                      label: "Sentiment Escalation",
                      desc: "Auto-transfer to human when carrier sentiment turns very negative",
                    },
                    {
                      key: "prioritizePerishables",
                      label: "Prioritize Perishables",
                      desc: "Pitch temperature-controlled loads first when urgency is high",
                    },
                  ].map((s, i) => (
                    <div
                      key={s.key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: i < 2 ? "1px solid #f5f5f5" : "none",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#bbb" }}>
                          {s.desc}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            [s.key]: !settings[s.key],
                          })
                        }
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: settings[s.key] ? accent : "#e0e0e0",
                          position: "relative",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            position: "absolute",
                            top: 3,
                            left: settings[s.key] ? 23 : 3,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Agent Personality */}
                <div className="card">
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    Agent Voice & Greeting
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#999", marginBottom: 20 }}
                  >
                    Customize how the AI agent sounds and introduces itself
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}
                    >
                      Tone
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["professional", "friendly", "direct"].map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setSettings({ ...settings, agentTone: t })
                          }
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: `1.5px solid ${settings.agentTone === t ? accent : "#e0e0e0"}`,
                            backgroundColor:
                              settings.agentTone === t ? "#f5f3ff" : "#fff",
                            color: settings.agentTone === t ? accent : "#888",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textTransform: "capitalize",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}
                    >
                      Opening Greeting
                    </div>
                    <textarea
                      value={settings.agentGreeting}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          agentGreeting: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        height: 80,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        fontSize: 13,
                        fontFamily: "inherit",
                        color: "#333",
                        resize: "vertical",
                        lineHeight: 1.5,
                        outline: "none",
                      }}
                    />
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                      This is the first thing carriers hear when they call in.
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 16,
                  gap: 8,
                }}
              >
                <button
                  onClick={() => setSettings(defaultSettings)}
                  style={{
                    padding: "10px 24px",
                    fontSize: 13,
                    fontWeight: 500,
                    backgroundColor: "#fff",
                    color: "#888",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={saveSettings}
                  style={{
                    padding: "10px 32px",
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: "#1e1e1e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Save Settings
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ═══ Call Detail Sidebar Component ═══ */
function CallDetail({ call, onClose, accent }) {
  return (
    <div
      className="card"
      style={{
        position: "sticky",
        top: 80,
        alignSelf: "start",
        animation: "slideIn 0.3s ease-out",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{call.carrier}</div>
          <div
            style={{
              fontSize: 11,
              color: "#bbb",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {call.mc}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#ccc",
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          padding: "10px 14px",
          backgroundColor: "#eefcf5",
          borderRadius: 8,
          borderLeft: "3px solid #34d399",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#087f5b",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 2,
          }}
        >
          FMCSA Verified
        </div>
        <div style={{ fontSize: 11, color: "#0d7a56" }}>
          Authorized · Insurance Active
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          ["Lane", call.lane],
          ["Equipment", call.equipment],
          ["Outcome", call.outcome],
          ["Rate", call.rate || "—"],
        ].map(([l, v], i) => (
          <div key={i}>
            <div
              style={{
                fontSize: 10,
                color: "#bbb",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 1,
              }}
            >
              {l}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            color: "#bbb",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Sentiment
        </div>
        <SentBadge s={call.sentiment} />
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            color: "#bbb",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Negotiation Timeline
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            paddingLeft: 10,
            borderLeft: "2px solid #f0f0f0",
          }}
        >
          {[
            { s: "Load pitched", d: `${call.equipment} · ${call.lane}` },
            {
              s: "Initial offer",
              d: `${call.rate || "$2,400"} (loadboard rate)`,
            },
            { s: "Counter offer", d: "Carrier requested higher rate" },
            {
              s: call.outcome === "Booked" ? "Accepted" : call.outcome,
              d:
                call.outcome === "Booked"
                  ? `Carrier accepted at ${call.rate}`
                  : "Call ended",
            },
          ].map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: -15,
                  top: 3,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: i === 3 ? accent : "#ddd",
                }}
              />
              <div style={{ paddingLeft: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#444" }}>
                  {s.s}
                </div>
                <div style={{ fontSize: 10, color: "#999" }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
        <button
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: "#1e1e1e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Transcript
        </button>
        <button
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: "#fff",
            color: "#1e1e1e",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Recording
        </button>
      </div>
    </div>
  );
}

/* ═══ Global Styles ═══ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
  .card { background: #fff; border: 1px solid #e8e8e8; border-radius: 10px; padding: 20px; animation: fadeIn 0.35s ease-out both; }
  .card:hover { border-color: #d4d4d4; transition: border-color 0.2s; }
  .row-hover { transition: background-color 0.12s; }
  .row-hover:hover { background-color: #fafafa !important; }
  .filter-btn { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 6px; border: 1px solid #e8e8e8; cursor: pointer; transition: all 0.15s; }
  .filter-btn[data-active="true"] { background: #1e1e1e; color: #fff; border-color: #1e1e1e; }
  .filter-btn[data-active="false"] { background: #fff; color: #999; }
  .filter-btn:hover { border-color: #bbb; }
  .icon-btn { background: none; border: none; cursor: pointer; font-family: inherit; transition: color 0.15s; }
  .icon-btn:hover { color: #333 !important; }
  .slider { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: #e8e8e8; outline: none; }
  .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }
`;
