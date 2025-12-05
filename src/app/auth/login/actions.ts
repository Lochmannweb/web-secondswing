"use server";

import { getSupabaseBrowser } from "@/app/lib/supabaseBrowser";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await getSupabaseBrowser();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  return { data, error };
}