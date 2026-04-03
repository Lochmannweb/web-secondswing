// app/actions.ts
"use server";

import { supabaseServer } from "./lib/supabaseServer";

export async function updateProfile(formData: FormData) {
  const supabase = supabaseServer();

  await supabase
    .from("profiles")
    .update({ name: formData.get("name") });
}

export async function uploadChatImage(fileBase64: string, fileName: string, mimeType: string) {
  try {
    const supabase = supabaseServer();

    // Convert base64 to buffer
    const buffer = Buffer.from(fileBase64, 'base64')

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
      })

    if (uploadError) {
      throw new Error(`Server upload fejl: ${uploadError.message}`)
    }

    const { data: publicUrl } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl.publicUrl,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ukendt upload fejl"
    return {
      success: false,
      error: msg,
    }
  }
}
