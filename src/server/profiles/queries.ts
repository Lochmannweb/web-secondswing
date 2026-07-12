import { createClient } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  display_name: string | null;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin env vars");
  }

  return createClient(url, key);
}

export async function getProfilesByIds(ids: string[]): Promise<ProfileRow[]> {
  if (!ids.length) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);

  if (error) {
    console.error("getProfilesByIds fejlede:", error.message);
    return [];
  }

  return data ?? [];
}
