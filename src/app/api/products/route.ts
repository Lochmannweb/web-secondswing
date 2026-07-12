import { prisma } from "@/app/lib/prisma";
import { parseProductId, serializeProduct } from "@/app/lib/productSerialize";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type ProductBody = {
  user_id?: string;
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

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    const idsParam = req.nextUrl.searchParams.get("ids");

    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map(parseProductId);

      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(products.map(serializeProduct));
    }

    const products = await prisma.product.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products.map(serializeProduct));
  } catch (error) {
    console.error("GET /api/products fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente produkter" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProductBody;

    if (!body.user_id) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title mangler" }, { status: 400 });
    }

    const data: Prisma.ProductCreateInput = {
      title: body.title.trim(),
      description: body.description ?? null,
      price: body.price ?? null,
      imageUrl: body.image_url ?? null,
      category: body.category ?? "clothing",
      gender: body.gender ?? null,
      color: body.color ?? null,
      size: body.size ?? null,
      stand: body.stand ?? null,
      brand: body.brand ?? null,
      clubType: body.club_type ?? null,
      flex: body.flex ?? null,
      hand: body.hand ?? null,
      dividerCount: body.divider_count ?? null,
      weight: body.weight ?? null,
      sold: body.sold ?? false,
      userId: body.user_id,
    };

    const product = await prisma.product.create({ data });
    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (error) {
    console.error("POST /api/products fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke oprette produkt" }, { status: 500 });
  }
}
