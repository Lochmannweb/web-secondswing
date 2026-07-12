export type ChatDto = {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  product_id: string | null;
  created_at: string;
};

export type MessageDto = {
  id: string;
  chat_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  image_url: string | null;
};

type ChatRecord = {
  id: string;
  buyerId: string | null;
  sellerId: string | null;
  productId: bigint | null;
  createdAt: Date;
};

type MessageRecord = {
  id: string;
  chatId: string | null;
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
    product_id: chat.productId?.toString() ?? null,
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
