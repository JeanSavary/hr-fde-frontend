"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadFiltersProps {
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export function LoadFilters({ onFilterChange }: LoadFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select onValueChange={(v) => onFilterChange({ equipment_type: v === "all" ? undefined : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Equipment" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Equipment</SelectItem>
          {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>{config.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input placeholder="Origin..." className="w-36" onChange={(e) => onFilterChange({ origin: e.target.value || undefined })} />
      <Input placeholder="Destination..." className="w-36" onChange={(e) => onFilterChange({ destination: e.target.value || undefined })} />
    </div>
  );
}
