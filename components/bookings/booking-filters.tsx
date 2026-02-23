"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EQUIPMENT_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { useCallback, useState, useRef } from "react";

export interface BookingFilters {
  equipment_type?: string;
  sentiment?: string;
  carrier?: string;
}

interface BookingFiltersProps {
  onFilterChange: (filters: Partial<BookingFilters>) => void;
}

export function BookingFilters({ onFilterChange }: BookingFiltersProps) {
  const [carrier, setCarrier] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleCarrierChange = useCallback(
    (value: string) => {
      setCarrier(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange({ carrier: value || undefined });
      }, 300);
    },
    [onFilterChange],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        onValueChange={(v) =>
          onFilterChange({ equipment_type: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-44 bg-white">
          <SelectValue placeholder="All Equipment" />
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

      <Select
        onValueChange={(v) =>
          onFilterChange({ sentiment: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-44 bg-white">
          <SelectValue placeholder="All Sentiments" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">All Sentiments</SelectItem>
          {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Search carrier..."
        value={carrier}
        onChange={(e) => handleCarrierChange(e.target.value)}
        className="w-44 bg-white"
      />
    </div>
  );
}
