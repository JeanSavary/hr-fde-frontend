import { NextRequest } from "next/server";
import { proxyGet, proxyMutate } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet("/api/loads/search", request);
}

export async function POST(request: NextRequest) {
  return proxyMutate("/api/loads/search", request, "POST");
}
