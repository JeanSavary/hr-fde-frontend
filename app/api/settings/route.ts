import { NextRequest } from "next/server";
import { proxyGet, proxyMutate } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/settings/negotiation", request);
}

export async function PUT(request: NextRequest) {
  return proxyMutate("/api/settings/negotiation", request, "PUT");
}
