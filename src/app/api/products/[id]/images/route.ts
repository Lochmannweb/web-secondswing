import { listProductImages, replaceProductImages } from "@/server/productImages";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const images = await listProductImages(id);
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET /api/products/[id]/images fejlede:", error);
    const message = error instanceof Error ? error.message : "Kunne ikke hente billeder";
    const status = message === "Ugyldigt produkt-id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      images?: Array<{ image_url: string; position: number }>;
    };

    const images = await replaceProductImages(id, body.images ?? []);
    return NextResponse.json(images);
  } catch (error) {
    console.error("PUT /api/products/[id]/images fejlede:", error);
    const message = error instanceof Error ? error.message : "Kunne ikke gemme billeder";
    const status = message === "Ugyldigt produkt-id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
