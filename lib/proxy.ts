import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.BACKEND_API_KEY;

export async function proxyGet(path: string, request: NextRequest): Promise<NextResponse> {
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const url = new URL(path, BACKEND_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function proxyMutate(
  path: string,
  request: NextRequest,
  method: "POST" | "PUT" | "PATCH" | "DELETE"
): Promise<NextResponse> {
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
