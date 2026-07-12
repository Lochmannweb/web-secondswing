// app/actions.ts
"use server";

import { createImage } from "@/server/images";
import { upsertProfile } from "@/server/profiles";

export async function updateProfile(formData: FormData) {
  const name = formData.get("name");
  const id = formData.get("id");

  if (typeof id === "string" && typeof name === "string") {
    await upsertProfile(id, { display_name: name });
  }
}

export async function uploadChatImage(fileBase64: string, _fileName: string, mimeType: string) {
  try {
    const buffer = Buffer.from(fileBase64, "base64");
    const image = await createImage(mimeType || "image/jpeg", buffer);

    return {
      success: true,
      url: image.url,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ukendt upload fejl";
    return {
      success: false,
      error: msg,
    };
  }
}
