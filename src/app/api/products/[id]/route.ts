import { prisma } from "@/app/lib/prisma";
import { parseProductId, serializeProduct } from "@/app/lib/productSerialize";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

type ProductPatchBody = {
  title?: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  category?: string;
  gender?: string | null;
  color?: string | null;
  size?: string | null;
  stand?: string | null;
  brand?: string | null;
  club_type?: string | null;
  flex?: string | null;
  hand?: string | null;
  divider_count?: number | null;
  weight?: string | null;
  sold?: boolean;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseProductId(id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produkt ikke fundet" }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error("GET /api/products/[id] fejlede:", error);
    const message = error instanceof Error ? error.message : "Kunne ikke hente produkt";
    const status = message === "Ugyldigt produkt-id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseProductId(id);
    const body = (await req.json()) as ProductPatchBody;

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = body.price;
    if (body.image_url !== undefined) data.imageUrl = body.image_url;
    if (body.category !== undefined) data.category = body.category;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.color !== undefined) data.color = body.color;
    if (body.size !== undefined) data.size = body.size;
    if (body.stand !== undefined) data.stand = body.stand;
    if (body.brand !== undefined) data.brand = body.brand;
    if (body.club_type !== undefined) data.clubType = body.club_type;
    if (body.flex !== undefined) data.flex = body.flex;
    if (body.hand !== undefined) data.hand = body.hand;
    if (body.divider_count !== undefined) data.dividerCount = body.divider_count;
    if (body.weight !== undefined) data.weight = body.weight;
    if (body.sold !== undefined) data.sold = body.sold;

    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error("PATCH /api/products/[id] fejlede:", error);
    const message = error instanceof Error ? error.message : "Kunne ikke opdatere produkt";
    const status = message === "Ugyldigt produkt-id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseProductId(id);
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] fejlede:", error);
    const message = error instanceof Error ? error.message : "Kunne ikke slette produkt";
    const status = message === "Ugyldigt produkt-id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
