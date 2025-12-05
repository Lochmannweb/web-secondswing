"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box } from "@mui/material"

type Message = {
  id: string
  from_user: string
  to_user: string
  content: string
  created_at: string
}

interface ChatHistoryProps {
  currentUserId: string
  otherUserId: string
  socket: WebSocket | null
}

export default function ChatHistory({
  currentUserId,
  otherUserId,
  socket,
}: ChatHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = getSupabaseClient()

  // Hent historik fra DB
  useEffect(() => {
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(from_user.eq.${currentUserId},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Fejl ved hentning af historik:", error)
        return
      }

      setMessages(data as Message[])
    }

    loadHistory()
  }, [currentUserId, otherUserId, supabase])

  // Lyt til websocket for nye beskeder
  useEffect(() => {
    if (!socket) return
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.from && data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            from_user: data.from,
            to_user: currentUserId,
            content: data.content,
            created_at: new Date().toISOString(),
          },
        ])
      }
    }
  }, [socket, currentUserId])

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        p: 2,
        mb: 2,
        height: "300px",
        overflowY: "auto",
      }}
    >
      {messages.map((m) => (
        <p
          key={m.id}
          style={{ color: m.from_user === currentUserId ? "blue" : "black" }}
        >
          <b>{m.from_user === currentUserId ? "Dig" : "Dem"}:</b> {m.content}
        </p>
      ))}
    </Box>
  )
}
