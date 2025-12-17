// app/actions.ts
"use server";

import { supabaseServer } from "./lib/supabaseServer";

export async function updateProfile(formData: FormData) {
  const supabase = supabaseServer();

  await supabase
    .from("profiles")
    .update({ name: formData.get("name") });
}
