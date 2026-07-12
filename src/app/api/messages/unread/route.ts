import { getUnreadMessageCount } from "@/server/chats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    const count = await getUnreadMessageCount(userId);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/messages/unread fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente ulæste beskeder" }, { status: 500 });
  }
}
