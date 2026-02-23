"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Overview",
    subtitle: "Today's carrier sales performance at a glance",
  },
  "/calls": { title: "Calls", subtitle: "Calls today" },
  "/bookings": { title: "Bookings", subtitle: "Loads booked today" },
  "/loads": { title: "Load Board", subtitle: "Loads available" },
  "/analytics": {
    title: "Analytics",
    subtitle: "Negotiation & lane performance insights",
  },
  "/settings": {
    title: "Settings",
    subtitle: "AI agent negotiation parameters & behavior",
  },
};

function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // Match sub-paths like /calls/123
  for (const [path, meta] of Object.entries(PAGE_META)) {
    if (path !== "/" && pathname.startsWith(path)) return meta;
  }
  return { title: "Dashboard", subtitle: "" };
}

export function Topbar() {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

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
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      {/* Left: Page title + subtitle */}
      <div>
        <h1 className="text-[17px] font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>

      {/* Right: Agent status + refresh */}
      <div className="flex items-center gap-3">
        {/* Agent Online badge */}
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <span
            className={`h-2 w-2 rounded-full ${
              healthy === null
                ? "bg-gray-300"
                : healthy
                  ? "bg-emerald-500"
                  : "bg-red-500"
            }`}
          />
          <span>{healthy === false ? "Agent Offline" : "Agent Online"}</span>
        </div>

        {/* Refresh info */}
        <span className="text-[11px] text-gray-400">
          {secondsAgo < 5 ? "Just now" : `${secondsAgo}s ago`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkHealth}
          className="h-8 w-8 p-0 hover:cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      </div>
    </header>
  );
}
