import { createMessage, createMessages, getMessagesForChat, markChatRead } from "@/server/chats";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const messages = await getMessagesForChat(id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/chats/[id]/messages fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente beskeder" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: chatId } = await context.params;
    const body = (await req.json()) as
      | {
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          image_url?: string | null;
        }
      | {
          messages?: Array<{
            sender_id: string;
            receiver_id: string;
            content?: string;
            image_url?: string | null;
          }>;
        };

    if ("messages" in body && Array.isArray(body.messages)) {
      const created = await createMessages(
        body.messages.map((message) => ({
          chat_id: chatId,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          content: message.content,
          image_url: message.image_url,
        }))
      );
      return NextResponse.json(created, { status: 201 });
    }

    const singleBody = body as {
      sender_id?: string;
      receiver_id?: string;
      content?: string;
      image_url?: string | null;
    };
    const senderId = singleBody.sender_id;
    const receiverId = singleBody.receiver_id;

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "sender_id og receiver_id kræves" }, { status: 400 });
    }

    const message = await createMessage({
      chat_id: chatId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: typeof singleBody.content === "string" ? singleBody.content : "",
      image_url:
        typeof singleBody.image_url === "string"
          ? singleBody.image_url
          : singleBody.image_url ?? null,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/chats/[id]/messages fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke sende besked" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id: chatId } = await context.params;
    const body = (await req.json()) as { user_id?: string };
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    await markChatRead(chatId, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/chats/[id]/messages fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke markere som læst" }, { status: 500 });
  }
}
