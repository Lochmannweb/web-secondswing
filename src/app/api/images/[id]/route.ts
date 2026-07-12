import { getImageById } from "@/server/images";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const image = await getImageById(id);

    if (!image) {
      return NextResponse.json({ error: "Billede ikke fundet" }, { status: 404 });
    }

    return new NextResponse(image.data, {
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/images/[id] fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente billede" }, { status: 500 });
  }
}
