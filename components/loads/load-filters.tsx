"use client";

import { useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadFiltersProps {
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export function LoadFilters({ onFilterChange }: LoadFiltersProps) {
  const originTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const debouncedOrigin = useCallback(
    (value: string) => {
      if (originTimer.current) clearTimeout(originTimer.current);
      originTimer.current = setTimeout(() => {
        onFilterChange({ origin: value || undefined });
      }, 400);
    },
    [onFilterChange],
  );

  const debouncedDest = useCallback(
    (value: string) => {
      if (destTimer.current) clearTimeout(destTimer.current);
      destTimer.current = setTimeout(() => {
        onFilterChange({ destination: value || undefined });
      }, 400);
    },
    [onFilterChange],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Origin city (required)..."
        className="w-48 bg-white"
        onChange={(e) => debouncedOrigin(e.target.value)}
      />
      <Input
        placeholder="Destination..."
        className="w-48 bg-white"
        onChange={(e) => debouncedDest(e.target.value)}
      />
      <Select
        defaultValue="dry_van"
        onValueChange={(v) =>
          onFilterChange({ equipment_type: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Equipment" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">All Equipment</SelectItem>
          {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
