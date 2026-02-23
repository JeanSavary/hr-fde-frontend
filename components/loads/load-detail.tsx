"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Load } from "@/lib/types";
import { UrgencyBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const LeafletMap = dynamic(
  () => import("./leaflet-map").then((m) => ({ default: m.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
        Loading map...
      </div>
    ),
  },
);

interface LoadDetailProps {
  load: Load;
  onBack: () => void;
}

export function LoadDetail({ load, onBack }: LoadDetailProps) {
  const ratePerMile = load.miles > 0 ? load.loadboard_rate / load.miles : 0;

  const rows: [string, string][] = [
    ["Origin", load.origin],
    ["Destination", load.destination],
    ["Pickup", formatDatetime(load.pickup_datetime)],
    ["Delivery", formatDatetime(load.delivery_datetime)],
    ["Equipment", EQUIPMENT_CONFIG[load.equipment_type]?.label ?? load.equipment_type],
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Loads
        </Button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-semibold text-gray-900">
          {load.load_id}
        </span>
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
          <div className="absolute bottom-10 left-1/2 z-[1000] flex w-[clamp(400px,60%,720px)] -translate-x-1/2 justify-center gap-6 rounded-xl border border-gray-200 bg-white/95 px-8 py-3 text-sm shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-gray-400">{load.origin.split(",")[0]}</span>
            </div>
            <span className="text-gray-300">&rarr;</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-gray-400">
                {load.destination.split(",")[0]}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400">Distance </span>
              <strong>{load.miles} mi</strong>
            </div>
            <div>
              <span className="text-gray-400">Rate/miles </span>
              <strong className="text-indigo-600">
                {formatCurrency(ratePerMile)}
              </strong>
            </div>
          </div>
        </div>
        {/* Detail Panel */}
        <div className="overflow-y-auto border-l border-gray-200 bg-white">
          <div className="px-6 pt-6">
            <div className="text-[11px] uppercase tracking-widest text-gray-400">
              Load Details
            </div>
            <div className="flex items-baseline gap-2 font-mono text-2xl font-bold">
              {formatCurrency(load.loadboard_rate)}
              <span className="text-sm font-normal text-gray-400">
                loadboard rate
              </span>
            </div>
          </div>
          <div className="px-6 pt-4">
            <div className="mb-5 flex gap-2">
              {load.urgency && <UrgencyBadge urgency={load.urgency} />}
              {load.pitch_count != null && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${load.pitch_count > 8 ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"}`}
                >
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
              <div
                key={label}
                className="flex items-center justify-between border-b border-gray-50 py-2.5"
              >
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-[13px] font-medium text-gray-900">
                  {val}
                </span>
              </div>
            ))}
            {load.notes && (
              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Notes
                </div>
                <div className="text-[13px] leading-relaxed text-gray-600">
                  {load.notes}
                </div>
              </div>
            )}
            {load.urgency === "critical" && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <div className="mb-1 text-xs font-semibold text-rose-600">
                  Needs Attention
                </div>
                <div className="text-xs leading-relaxed text-rose-500">
                  {(load.pitch_count ?? 0) > 8 &&
                    "Pitched 8+ times without booking — consider adjusting rate. "}
                  {(load.days_listed ?? 0) >= 2 &&
                    "Listed for 2+ days — aging load risk. "}
                  {(load.commodity_type.includes("temp") ||
                    load.commodity_type.includes("Seafood") ||
                    load.commodity_type.includes("Produce")) &&
                    "Perishable commodity — time-sensitive. "}
                  {load.notes?.includes("Dead-end") &&
                    "Dead-end destination — expect carrier resistance. "}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
