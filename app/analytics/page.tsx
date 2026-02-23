"use client";

import { useAnalytics } from "@/lib/swr";
import { NegotiationDepth } from "@/components/analytics/negotiation-depth";
import { CarrierObjections } from "@/components/analytics/carrier-objections";
import { TopLanesAnalytics } from "@/components/analytics/top-lanes-analytics";
import { EquipmentDemandSupply } from "@/components/analytics/equipment-demand-supply";
import { ChartsSkeleton } from "@/components/shared/skeletons";

export default function AnalyticsPage() {
  const { data, error, isLoading } = useAnalytics();

  return (
    <div className="space-y-5">
      {error && !data ? (
        // If analytics endpoint doesn't exist yet, show with default data
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <NegotiationDepth />
          <CarrierObjections />
          <TopLanesAnalytics />
          <EquipmentDemandSupply />
        </div>
      ) : isLoading && !data ? (
        <ChartsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <NegotiationDepth data={data?.negotiation_depth} />
          <CarrierObjections data={data?.carrier_objections} />
          <TopLanesAnalytics data={data?.top_lanes} />
          <EquipmentDemandSupply data={data?.equipment_demand_supply} />
        </div>
      )}
    </div>
  );
}
