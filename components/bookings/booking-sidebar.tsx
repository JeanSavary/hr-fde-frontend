"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { BookedLoad } from "@/lib/types";
import {
  SentimentBadge,
  EquipmentBadge,
} from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime, formatLane, cn } from "@/lib/utils";

interface BookingSidebarProps {
  booking: BookedLoad;
  onClose: () => void;
}

export function BookingSidebar({ booking, onClose }: BookingSidebarProps) {
  const b = booking;
  const hasLoadboard = b.loadboard_rate != null && b.loadboard_rate > 0;
  const savings = hasLoadboard ? b.loadboard_rate! - b.agreed_rate : null;

  return (
    <Card className="sticky top-20 w-[380px] shrink-0 self-start overflow-hidden animate-in slide-in-from-right-4 py-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <div className="text-[15px] font-semibold text-gray-900">
            {b.carrier_name ?? "Unknown"}
          </div>
          <div className="font-mono text-[11px] text-gray-400">
            MC-{b.mc_number}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pb-4 space-y-4">
        {/* Rate comparison */}
        <div>
          <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Rate Summary
          </div>
          <div className="rounded-lg bg-gray-50 p-3 space-y-2">
            {hasLoadboard && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Loadboard</span>
                <span className="font-mono text-gray-500 line-through">
                  {formatCurrency(b.loadboard_rate!)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Agreed rate</span>
              <span className="font-mono font-bold text-gray-900">
                {formatCurrency(b.agreed_rate)}
              </span>
            </div>
            {b.margin != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Margin</span>
                <span
                  className={cn(
                    "font-mono font-semibold",
                    b.margin >= 15
                      ? "text-emerald-500"
                      : b.margin >= 10
                        ? "text-amber-500"
                        : "text-rose-500",
                  )}
                >
                  {b.margin.toFixed(1)}%
                </span>
              </div>
            )}
            {savings != null && savings > 0 && (
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                <span className="font-medium text-emerald-600">
                  Saved vs. loadboard
                </span>
                <span className="font-mono font-semibold text-emerald-600">
                  {formatCurrency(savings)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetaItem
            label="Lane"
            value={formatLane(
              b.lane_origin ?? null,
              b.lane_destination ?? null,
            )}
          />
          <MetaItem label="Equipment">
            {b.equipment_type ? (
              <EquipmentBadge type={b.equipment_type} />
            ) : (
              <span className="text-[13px] text-gray-400">&mdash;</span>
            )}
          </MetaItem>
          <MetaItem
            label="Pickup"
            value={
              b.agreed_pickup_datetime
                ? formatDateTime(b.agreed_pickup_datetime)
                : "\u2014"
            }
          />
          <MetaItem
            label="Booked"
            value={formatDateTime(b.booked_at ?? b.created_at)}
          />
          {b.negotiation_rounds != null && (
            <MetaItem
              label="Rounds"
              value={`${b.negotiation_rounds} round${b.negotiation_rounds !== 1 ? "s" : ""}`}
            />
          )}
          {b.sentiment && (
            <MetaItem label="Sentiment">
              <SentimentBadge sentiment={b.sentiment} />
            </MetaItem>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-2 pt-1">
          {b.call_id && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="group w-full justify-between hover:bg-transparent"
            >
              <Link href={`/calls/${b.call_id}`}>
                View Call Detail
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="default"
            size="sm"
            className="group w-full justify-between text-white bg-gray-800 hover:bg-gray-800 font-heading font-semibold"
          >
            <Link href={`/loads/${b.load_id}`}>
              View Load Detail
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MetaItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </div>
      <div className="mt-0.5">
        {children ?? (
          <div className="text-[13px] font-semibold text-gray-900">{value}</div>
        )}
      </div>
    </div>
  );
}
