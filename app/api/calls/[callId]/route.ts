import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.BACKEND_API_KEY;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  const { callId } = await params;
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = await fetch(`${BACKEND_URL}/api/calls/${callId}`, {
    headers: { "X-API-Key": API_KEY },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
