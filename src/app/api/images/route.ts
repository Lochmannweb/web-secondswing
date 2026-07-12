import { createImage } from "@/server/images";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Ingen fil valgt" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Kun billedfiler er tilladt" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await createImage(file.type, buffer);

    return NextResponse.json({ id: image.id, url: image.url }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload fejlede";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
