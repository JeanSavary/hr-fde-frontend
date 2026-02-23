const HR_BASE_URL = "https://platform.happyrobot.ai/api/v2";
const HR_API_KEY = process.env.HR_API_KEY;

async function fetchHR<T>(path: string): Promise<T | null> {
  if (!HR_API_KEY) return null;

  const res = await fetch(`${HR_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${HR_API_KEY}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function getHRRunDetail(runId: string) {
  return fetchHR<Record<string, unknown>>(`/runs/${runId}`);
}

export async function getHRRecordings(runId: string) {
  return fetchHR<Array<{ session_id: string; url: string }>>(`/runs/${runId}/recordings`);
}

export function isHRConfigured(): boolean {
  return !!HR_API_KEY;
}
