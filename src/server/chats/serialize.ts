export type ChatDto = {
  id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
};

export type MessageDto = {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  image_url: string | null;
};

type ChatRecord = {
  id: string;
  buyerId: string;
  sellerId: string;
  createdAt: Date;
};

type MessageRecord = {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
  imageUrl: string | null;
};

export function serializeChat(chat: ChatRecord): ChatDto {
  return {
    id: chat.id,
    buyer_id: chat.buyerId,
    seller_id: chat.sellerId,
    created_at: chat.createdAt.toISOString(),
  };
}

export function serializeMessage(message: MessageRecord): MessageDto {
  return {
    id: message.id,
    chat_id: message.chatId,
    sender_id: message.senderId,
    receiver_id: message.receiverId,
    content: message.content,
    created_at: message.createdAt.toISOString(),
    read_at: message.readAt?.toISOString() ?? null,
    image_url: message.imageUrl,
  };
}

export type ChatPreviewDto = {
  chat_id: string;
  content: string;
  created_at: string;
};

export type ChatInboxDto = {
  chats: ChatDto[];
  previews: ChatPreviewDto[];
  unread_by_chat: Record<string, number>;
};
