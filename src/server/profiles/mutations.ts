import { getSupabaseAdmin, ensureProfile } from "@/server/profiles/queries";
import { serializeProfileFromRow } from "@/server/profiles/serialize";

type ProfileUpdate = {
  display_name?: string;
  avatar_url?: string | null;
};

export async function upsertProfile(id: string, updates: ProfileUpdate) {
  await ensureProfile(id);

  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.display_name !== undefined) {
    payload.display_name = updates.display_name;
  }

  if (updates.avatar_url !== undefined) {
    payload.avatar_url = updates.avatar_url;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Kunne ikke opdatere profil");
  }

  return serializeProfileFromRow(data);
}
