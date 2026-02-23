import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="h-52 w-full rounded" />
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="shadow-sm">
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function SummaryCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="space-y-6 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-3 h-5 w-full" />
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-4 w-full" />
      </Card>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
