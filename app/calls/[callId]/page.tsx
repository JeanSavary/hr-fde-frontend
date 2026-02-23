import { getCallDetail } from "@/lib/api";
import { CallDetailClient } from "@/components/calls/call-detail-client";

interface CallDetailPageProps {
  params: Promise<{ callId: string }>;
}

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { callId } = await params;

  let initialCall = null;
  try {
    initialCall = await getCallDetail(callId);
  } catch {
    // Client component will handle error
  }

  return <CallDetailClient callId={callId} initialCall={initialCall} />;
}
