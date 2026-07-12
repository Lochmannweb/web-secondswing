import type { ProfileDto } from "@/server/profiles";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Request fejlede");
  }
  return payload;
}

export async function getProfile(id: string): Promise<ProfileDto> {
  const response = await fetch(`/api/profiles/${id}`, { cache: "no-store" });
  return parseJson<ProfileDto>(response);
}

export async function updateProfile(
  id: string,
  updates: { display_name?: string; avatar_url?: string | null }
): Promise<ProfileDto> {
  const response = await fetch(`/api/profiles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return parseJson<ProfileDto>(response);
}

export async function getProfilesBatch(ids: string[]): Promise<ProfileDto[]> {
  const response = await fetch("/api/profiles/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return parseJson<ProfileDto[]>(response);
}

export async function searchProfiles(query: string, excludeUserId?: string) {
  const params = new URLSearchParams({ q: query });
  if (excludeUserId) params.set("exclude", excludeUserId);

  const response = await fetch(`/api/profiles/search?${params.toString()}`, {
    cache: "no-store",
  });
  return parseJson<ProfileDto[]>(response);
}
