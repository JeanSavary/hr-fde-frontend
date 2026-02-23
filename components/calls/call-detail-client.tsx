"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallDetail } from "@/lib/types";
import { useCallDetail } from "@/lib/swr";
import { CallMetadata } from "./call-metadata";
import { TranscriptViewer } from "./transcript-viewer";

interface CallDetailClientProps {
  callId: string;
  initialCall: CallDetail | null;
}

export function CallDetailClient({ callId, initialCall }: CallDetailClientProps) {
  const { data: call, error } = useCallDetail(callId);
  const displayCall = call ?? initialCall;

  if (error && !displayCall) {
    return (
      <div className="space-y-4">
        <Link href="/calls">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back to Calls</Button>
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Failed to load call details.</div>
      </div>
    );
  }

  if (!displayCall) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/calls">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Call &mdash; {displayCall.carrier_name ?? displayCall.call_id.slice(0, 8)}
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2"><CallMetadata call={displayCall} /></div>
        <div className="lg:col-span-3"><TranscriptViewer transcript={displayCall.transcript} /></div>
      </div>
    </div>
  );
}
