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
