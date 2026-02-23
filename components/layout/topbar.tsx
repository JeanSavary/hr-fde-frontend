"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

export function Topbar() {
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
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className={`h-2 w-2 rounded-full ${
              healthy === null ? "bg-gray-300" : healthy ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span>
            {secondsAgo < 5 ? "Just now" : `${secondsAgo}s ago`}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={checkHealth}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
