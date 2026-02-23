"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useLoad } from "@/lib/swr";
import { LoadDetail } from "@/components/loads/load-detail";

export default function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: load, error, isLoading } = useLoad(id);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading load...</div>
      </div>
    );
  }

  if (error || !load) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <div className="text-sm text-red-500">Load not found.</div>
      </div>
    );
  }

  return <LoadDetail load={load} onBack={() => router.push("/loads")} />;
}
