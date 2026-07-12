import { isFavorite } from "@/server/favorites";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    const productId = req.nextUrl.searchParams.get("product_id");

    if (!userId || !productId) {
      return NextResponse.json({ error: "user_id og product_id kræves" }, { status: 400 });
    }

    const favorite = await isFavorite(userId, productId);
    return NextResponse.json({ is_favorite: favorite });
  } catch (error) {
    console.error("GET /api/favorites/check fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke tjekke favorit" }, { status: 500 });
  }
}
