import { createImage } from "@/server/images";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Ingen fil valgt" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await createImage(file.type || "image/jpeg", buffer);

    return NextResponse.json({ success: true, url: image.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload fejl";
    console.error("API upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
