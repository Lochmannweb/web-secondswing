"use client"

import React, { useState } from 'react'
import { Box, Button, Input } from '@mui/material'
import { useChat } from '../components/Beskeder/UseChat';

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
}

export default function Beskeder({ currentUserId, chat }: ChatWindowProps) {
    const { messages, send } = useChat(currentUserId, chat);
    const [text, setText] = useState("");

  return (
    // mobil verison
    <Box pt={{ xs: "4rem" }} color={"white"} width={{ xs: "90%" }} m={"auto"} sx={{ display: { xs: "flex", sm: "" }, flexDirection: "column", height: "100%" }}>
        {/* Messages */}
        <Box style={{ flex: 1, overflowY: "auto", padding: 12, color: "white" }}>
          {messages.map((m: Message) => (
            <div key={m.id} style={{ marginBottom: 10 }}>
              <b>{m.sender_id === currentUserId ? "Dig" : "Dem"}:</b> {m.content}
            </div>
          ))}
        </Box>

        <Box sx={{ backgroundColor: "#0e0e0eff", display: "flex", position: "absolute", bottom: "2rem", width: "90%" }}>
            <Input
              sx={{
                  color: "white"
              }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ flex: 1, padding: 8 }}
              placeholder="Skriv besked…"
            />
            <Button
              onClick={() => {
                if (!text.trim()) return;
                send(text);
                setText("");
              }}
            >
              Send
            </Button>
        </Box>
    </Box>


    // desktop version

  )
}
