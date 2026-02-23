"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OfferSummary } from "@/lib/types";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

interface RecentOffersTableProps {
  offers: OfferSummary[];
}

export function RecentOffersTable({ offers }: RecentOffersTableProps) {
  return (
    <Card className="shadow-sm">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Offers</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="text-xs">Load</TableHead>
            <TableHead className="text-xs">MC#</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer, index) => (
            <TableRow key={offer.offer_id ?? `offer-${index}`} className="border-gray-100">
              <TableCell className="font-mono text-xs">
                {offer.load_id}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {offer.mc_number ?? "—"}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatCurrency(offer.offer_amount)}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {offer.offer_type}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    offer.status === "accepted" &&
                      "bg-emerald-50 text-emerald-700",
                    offer.status === "rejected" && "bg-rose-50 text-rose-700",
                    offer.status === "pending" && "bg-amber-50 text-amber-700",
                    offer.status === "expired" && "bg-gray-100 text-gray-600",
                  )}
                >
                  {offer.status}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500">
                {formatRelativeTime(offer.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
