import { createProduct, listProducts, listProductsByUser } from "@/server/products";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");

    if (userId) {
      const products = await listProductsByUser(userId);
      return NextResponse.json(products);
    }

    const products = await listProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente produkter" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const userId = typeof body.user_id === "string" ? body.user_id : null;

    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "title mangler" }, { status: 400 });
    }

    const product = await createProduct({
      user_id: userId,
      title: body.title,
      description: typeof body.description === "string" ? body.description : null,
      price: typeof body.price === "number" ? body.price : null,
      image_url: typeof body.image_url === "string" ? body.image_url : null,
      category: typeof body.category === "string" ? body.category : "clothing",
      gender: typeof body.gender === "string" ? body.gender : null,
      color: typeof body.color === "string" ? body.color : null,
      size: typeof body.size === "string" ? body.size : null,
      stand: typeof body.stand === "string" ? body.stand : null,
      brand: typeof body.brand === "string" ? body.brand : null,
      club_type: typeof body.club_type === "string" ? body.club_type : null,
      flex: typeof body.flex === "string" ? body.flex : null,
      hand: typeof body.hand === "string" ? body.hand : null,
      divider_count: typeof body.divider_count === "number" ? body.divider_count : null,
      weight: typeof body.weight === "string" ? body.weight : null,
      extra_images: Array.isArray(body.extra_images)
        ? body.extra_images.filter(
            (item): item is { image_url: string; position: number } =>
              !!item &&
              typeof item === "object" &&
              typeof (item as { image_url?: string }).image_url === "string" &&
              typeof (item as { position?: number }).position === "number"
          )
        : undefined,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke oprette produkt" }, { status: 500 });
  }
}
