import { deleteProduct, getProductById, replaceProductImages, updateProduct } from "@/server/products";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Produkt ikke fundet" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente produkt" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown>;

    const product = await updateProduct(id, {
      title: typeof body.title === "string" ? body.title : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      price: typeof body.price === "number" ? body.price : undefined,
      image_url: typeof body.image_url === "string" ? body.image_url : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      gender: typeof body.gender === "string" ? body.gender : undefined,
      color: typeof body.color === "string" ? body.color : undefined,
      size: typeof body.size === "string" ? body.size : undefined,
      stand: typeof body.stand === "string" ? body.stand : undefined,
      brand: typeof body.brand === "string" ? body.brand : undefined,
      club_type: typeof body.club_type === "string" ? body.club_type : undefined,
      flex: typeof body.flex === "string" ? body.flex : undefined,
      hand: typeof body.hand === "string" ? body.hand : undefined,
      divider_count: typeof body.divider_count === "number" ? body.divider_count : undefined,
      weight: typeof body.weight === "string" ? body.weight : undefined,
      sold: typeof body.sold === "boolean" ? body.sold : undefined,
    });

    if (Array.isArray(body.image_urls)) {
      const urls = body.image_urls.filter((url): url is string => typeof url === "string");
      await replaceProductImages(id, urls);
    }

    const refreshed = await getProductById(id);
    return NextResponse.json(refreshed ?? product);
  } catch (error) {
    console.error("PATCH /api/products/[id] fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke opdatere produkt" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke slette produkt" }, { status: 500 });
  }
}
