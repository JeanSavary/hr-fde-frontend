"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OUTCOME_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { useCallback, useState, useRef } from "react";

interface CallFiltersProps {
  onFilterChange: (filters: {
    outcome?: string;
    sentiment?: string;
    mc_number?: string;
  }) => void;
}

export function CallFilters({ onFilterChange }: CallFiltersProps) {
  const [mcNumber, setMcNumber] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleMcChange = useCallback(
    (value: string) => {
      setMcNumber(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange({ mc_number: value || undefined });
      }, 300);
    },
    [onFilterChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        onValueChange={(v) =>
          onFilterChange({ outcome: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Outcomes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Outcomes</SelectItem>
          {Object.entries(OUTCOME_CONFIG).map(([key, config]) => (
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
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Sentiments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiments</SelectItem>
          {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="MC Number..."
        value={mcNumber}
        onChange={(e) => handleMcChange(e.target.value)}
        className="w-44"
      />
    </div>
  );
}
