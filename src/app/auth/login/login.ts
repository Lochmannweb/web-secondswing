"use server"

import { createClient } from "@/server/supabaseServer";


export async function loginWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return true;
}
