"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Load } from "@/lib/types";
import { formatCurrency, formatDateTime, formatLane } from "@/lib/utils";
import { EQUIPMENT_CONFIG } from "@/lib/constants";

interface LoadsTableProps {
  loads: Load[];
}

export function LoadsTable({ loads }: LoadsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Load ID</TableHead>
          <TableHead className="text-xs">Lane</TableHead>
          <TableHead className="text-xs">Equipment</TableHead>
          <TableHead className="text-xs">Pickup</TableHead>
          <TableHead className="text-xs text-right">Rate</TableHead>
          <TableHead className="text-xs text-right">$/Mile</TableHead>
          <TableHead className="text-xs text-right">Weight</TableHead>
          <TableHead className="text-xs text-right">Miles</TableHead>
          <TableHead className="text-xs">Commodity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loads.map((load) => (
          <TableRow key={load.load_id} className="border-gray-100">
            <TableCell className="font-mono text-xs">{load.load_id}</TableCell>
            <TableCell className="text-sm">{formatLane(load.origin, load.destination)}</TableCell>
            <TableCell className="text-sm">{EQUIPMENT_CONFIG[load.equipment_type]?.label ?? load.equipment_type}</TableCell>
            <TableCell className="text-sm text-gray-500">{formatDateTime(load.pickup_datetime)}</TableCell>
            <TableCell className="text-right text-sm font-medium">{formatCurrency(load.loadboard_rate)}</TableCell>
            <TableCell className="text-right text-sm text-gray-500">
              {load.miles > 0 ? formatCurrency(load.loadboard_rate / load.miles) : "\u2014"}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500">{load.weight.toLocaleString()} lbs</TableCell>
            <TableCell className="text-right text-sm text-gray-500">{load.miles}</TableCell>
            <TableCell className="text-sm text-gray-500">{load.commodity_type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
