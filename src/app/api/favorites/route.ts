import {
  addFavorite,
  listFavoriteProductIds,
  listFavoriteProducts,
  removeFavorite,
} from "@/server/favorites";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    const withProducts = req.nextUrl.searchParams.get("with_products") === "1";

    if (withProducts) {
      const products = await listFavoriteProducts(userId);
      return NextResponse.json(products);
    }

    const productIds = await listFavoriteProductIds(userId);
    return NextResponse.json(productIds);
  } catch (error) {
    console.error("GET /api/favorites fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente favoritter" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { user_id?: string; product_id?: string };
    const userId = body.user_id;
    const productId = body.product_id;

    if (!userId || !productId) {
      return NextResponse.json({ error: "user_id og product_id kræves" }, { status: 400 });
    }

    await addFavorite(userId, productId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/favorites fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke gemme favorit" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    const productId = req.nextUrl.searchParams.get("product_id");

    if (!userId || !productId) {
      return NextResponse.json({ error: "user_id og product_id kræves" }, { status: 400 });
    }

    await removeFavorite(userId, productId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/favorites fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke fjerne favorit" }, { status: 500 });
  }
}
