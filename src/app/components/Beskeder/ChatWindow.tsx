"use client";

import { useState } from "react";
import { useChat } from "./UseChat";
import { Box } from "@mui/material";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  otherUser?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatWindowProps {
  currentUserId: string;
  chat: Chat | null;
  onUpdateChat?: (chat: Chat) => void;
}

export default function ChatWindow({ currentUserId, chat, onUpdateChat }: ChatWindowProps) {
  const { messages, send } = useChat(currentUserId, chat);
  const [text, setText] = useState("");
  const [newChatUserId, setNewChatUserId] = useState("");

  // Viser UI til at starte en ny chat, hvis der ikke findes en
  if (!chat) {
    return (
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>Start en ny samtale</div>

        <input
          value={newChatUserId}
          onChange={(e) => setNewChatUserId(e.target.value)}
          placeholder="Bruger-ID på den person du vil skrive til…"
          style={{ padding: 8 }}
        />

        <button
          onClick={async () => {
            if (!newChatUserId) return;

            const res = await fetch("/api/chats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                buyer_id: currentUserId,
                seller_id: newChatUserId,
                product_id: null,
              }),
            });

            const createdChat = await res.json();
            onUpdateChat?.(createdChat);
          }}
        >
          Start chat
        </button>
      </div>
    );
  }

  return (
    <Box width={"100%"} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: 12, borderBottom: "1px solid #333" }}>
        <strong>
          {chat.otherUser?.full_name ?? (chat.buyer_id === currentUserId ? "Sælger" : "Køber")}
        </strong>

        <div style={{ opacity: 0.7 }}>Produkt: {chat.product_id ?? "Ingen"}</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {messages.map((m: Message) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <b>{m.sender_id === currentUserId ? "Dig" : "Dem"}:</b> {m.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: 12, borderTop: "1px solid #333", display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: 8 }}
          placeholder="Skriv besked…"
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            send(text);
            setText("");
          }}
        >
          Send
        </button>
      </div>
    </Box>
  );
}
