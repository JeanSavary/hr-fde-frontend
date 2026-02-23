import { getDashboardMetrics } from "@/lib/api";
import { OverviewClient } from "@/components/dashboard/overview-client";

export default async function OverviewPage() {
  let initialMetrics = null;
  try {
    initialMetrics = await getDashboardMetrics();
  } catch {
    // Will show error state in client component
  }

  return <OverviewClient initialMetrics={initialMetrics} />;
}
