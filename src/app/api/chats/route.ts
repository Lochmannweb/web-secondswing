import { findOrCreateChat, getChatInbox } from "@/server/chats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    const inbox = await getChatInbox(userId);
    return NextResponse.json(inbox);
  } catch (error) {
    console.error("GET /api/chats fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente samtaler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { buyer_id?: string; seller_id?: string };
    const buyerId = body.buyer_id;
    const sellerId = body.seller_id;

    if (!buyerId || !sellerId) {
      return NextResponse.json({ error: "buyer_id og seller_id kræves" }, { status: 400 });
    }

    const chat = await findOrCreateChat(buyerId, sellerId);
    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("POST /api/chats fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke oprette samtale" }, { status: 500 });
  }
}
