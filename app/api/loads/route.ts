import { NextRequest } from "next/server";
import { proxyMutate } from "@/lib/proxy";

export async function POST(request: NextRequest) {
  return proxyMutate("/api/loads/search", request, "POST");
}
