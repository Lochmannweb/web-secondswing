"use client"

import { useEffect, useRef, useState } from "react"
import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Box } from "@mui/material"

type Message = {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

interface ChatProps {
    productId: string;
    userId: string
}

export default function Chat({ productId, userId }: ChatProps) {
  const supabase = getSupabaseClient()

  const [chatId, setChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // ---------------------------------------------------
  // 1. Find eller opret chat mellem køber og sælger
  // ---------------------------------------------------
  useEffect(() => {
    async function fetchOrCreateChat() {
      // Find chat for dette produkt med enten buyer_id eller seller_id = userId
      const { data: chat } = await supabase
        .from("chats")
        .select("*")
        .eq("product_id", productId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .single()

      if (chat) {
        setChatId(chat.id)
        return
      }

      // Opret chat hvis den ikke findes
      const { data: newChat, error } = await supabase
        .from("chats")
        .insert({
          product_id: productId,
          buyer_id: userId, // køberen er den der åbner chatten
        })
        .select()
        .single()

      if (error) {
        console.error("Kan ikke oprette chat:", error)
        return
      }

      setChatId(newChat.id)
    }

    fetchOrCreateChat()
  }, [productId, userId, supabase])

  // ---------------------------------------------------
  // 2. Load beskeder for chat
  // ---------------------------------------------------
  useEffect(() => {
    if (!chatId) return

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

      if (error) console.error(error)
      if (data) {
        setMessages(data)
        scrollToBottom()
      }
    }

    loadMessages()
  }, [chatId, supabase])

  // ---------------------------------------------------
  // Scroll
  // ---------------------------------------------------
  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  // ---------------------------------------------------
  // 3. Realtime
  // ---------------------------------------------------
  useEffect(() => {
    if (!chatId) return

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, supabase])

  // ---------------------------------------------------
  // 4. Send besked
  // ---------------------------------------------------
  async function send() {
    if (!input.trim() || !chatId) return

    setInput("")

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: userId,
      content: input.trim(),
    })

    if (error) console.error("Send error:", error)
  }

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  return (
    <Box pt={"5rem"} className="w-full h-full flex flex-col bg-black border border-gray-700 rounded-xl">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-white">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] p-2 rounded-lg text-sm ${
              m.sender_id === userId ? "ml-auto bg-blue-600" : "bg-gray-700"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[#111] flex gap-2 border-t border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv en besked…"
          className="flex-1 bg-black border border-gray-600 rounded-full px-4 py-2 text-white"
        />
        <button
          onClick={send}
          className="bg-blue-600 px-4 py-2 rounded-full text-white"
        >
          Send
        </button>
      </div>
    </Box>
  )
}
