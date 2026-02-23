"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallSummary } from "@/lib/types";
import { OutcomeBadge, SentimentBadge } from "@/components/shared/status-badge";
import { formatDuration, formatLane, formatRelativeTime } from "@/lib/utils";

interface RecentCallsTableProps {
  calls: CallSummary[];
}

export function RecentCallsTable({ calls }: RecentCallsTableProps) {
  return (
    <Card className="">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Calls</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="text-xs">Carrier</TableHead>
            <TableHead className="text-xs">Lane</TableHead>
            <TableHead className="text-xs">Outcome</TableHead>
            <TableHead className="text-xs">Sentiment</TableHead>
            <TableHead className="text-xs text-right">Duration</TableHead>
            <TableHead className="text-xs text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow
              key={call.id}
              className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50"
            >
              <TableCell className="text-sm">
                <Link
                  href={`/calls/${call.call_id}`}
                  className="hover:text-indigo-600"
                >
                  {call.carrier_name ?? "Unknown"}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatLane(call.lane_origin, call.lane_destination)}
              </TableCell>
              <TableCell>
                <OutcomeBadge outcome={call.outcome} />
              </TableCell>
              <TableCell>
                <SentimentBadge sentiment={call.sentiment} />
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {formatDuration(call.duration_seconds)}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {formatRelativeTime(call.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
