import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serializeProfileFromRow } from "@/server/profiles/serialize";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url?: string | null;
};

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin env vars");
  }

  return createClient(url, key);
}

export async function ensureProfile(id: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("profiles").select("id").eq("id", id).maybeSingle();

  if (data) return;

  await supabase.from("profiles").insert({ id });
}

export async function getProfileById(id: string) {
  await ensureProfile(id);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();

  if (error || !data) return null;

  return serializeProfileFromRow(data);
}

export async function getProfilesByIds(ids: string[]) {
  if (!ids.length) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, updated_at, created_at")
    .in("id", ids);

  if (error) {
    console.error("getProfilesByIds fejlede:", error.message);
    return [];
  }

  return (data ?? []).map(serializeProfileFromRow);
}

export async function searchProfiles(query: string, excludeUserId?: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = getSupabaseAdmin();
  let request = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, updated_at, created_at")
    .ilike("display_name", `%${trimmed}%`)
    .limit(6);

  if (excludeUserId) {
    request = request.neq("id", excludeUserId);
  }

  const { data, error } = await request;

  if (error) {
    console.error("searchProfiles fejlede:", error.message);
    return [];
  }

  return (data ?? []).map(serializeProfileFromRow);
}
