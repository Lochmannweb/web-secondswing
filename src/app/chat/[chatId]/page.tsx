"use client"
import { useEffect, useRef, useState } from "react"
import { Box, TextField, Typography } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import ImageIcon from "@mui/icons-material/Image"
import SendIcon from "@mui/icons-material/Send"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Message = {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

type ChatMeta = {
  amIBuyer: boolean
  productTitle: string
  buyerName: string
  sellerName: string
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null)

  const dbChannelRef = useRef<RealtimeChannel | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Load current user
  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    })()
  }, [])

  // Load chat participants + product
  useEffect(() => {
    if (!chatId || !userId) return
    ;(async () => {
      const { data, error } = await supabase
        .from("chats")
        .select(`
          id,
          buyer_id,
          seller_id,
          product:product_id!inner ( title ),
          buyer:buyer_id!inner ( display_name ),
          seller:seller_id!inner ( display_name )
        `)
        .eq("id", chatId)
        .maybeSingle()

      if (error) {
        console.error("Failed to load chat info:", error)
        return
      }
      if (!data) {
        console.warn("No chat found with id", chatId)
        return
      }

      const amIBuyer = data.buyer_id === userId

      setChatMeta({
        amIBuyer,
        productTitle: data.product?.[0]?.title ?? "Unknown product",
        buyerName: data.buyer?.[0].display_name ?? "Unknown buyer",
        sellerName: data.seller?.[0].display_name ?? "Unknown seller",
      })
    })()
  }, [chatId, userId])

  // Load messages
  useEffect(() => {
    if (!chatId) return
    ;(async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Load messages error:", error)
        return
      }
      setMessages((data || []) as Message[])
    })()
  }, [chatId])

  // Realtime DB messages
  useEffect(() => {
    if (!chatId) return
    const dbChannel = supabase.channel(`db:chat-${chatId}`)
    dbChannel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
      (payload) => {
        const msg = payload.new as Message
        if (msg.sender_id === userId) return
        setMessages((prev) => [...prev, msg])
        scrollToBottomSoon()
      }
    )
    dbChannel.subscribe()
    dbChannelRef.current = dbChannel
    return () => {
      supabase.removeChannel(dbChannel)
      dbChannelRef.current = null
    }
  }, [chatId, userId])

  async function sendMessage() {
    if (!newMessage.trim() || !chatId || !userId) return
    const text = newMessage
    setNewMessage("")

    const { data, error } = await supabase
      .from("messages")
      .insert([{ chat_id: chatId, sender_id: userId, content: text }])
      .select()

    if (error) {
      console.error("Insert error:", error)
      return
    }
    if (data && data.length) {
      setMessages((prev) => [...prev, ...(data as Message[])])
      scrollToBottomSoon()
    }
  }

  function scrollToBottomSoon() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0)
  }

  useEffect(() => {
    scrollToBottomSoon()
  }, [messages.length])

  return (
    <Box >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "black",
          height: "5vh",
          alignItems: "center",
          padding: "2rem 2rem 4rem 2rem",
        }}
      >
        <ArrowBackIosIcon
          sx={{ cursor: "pointer", color: "white" }}
          onClick={() => router.push("/chat")}
        />
        <Box sx={{ textAlign: "center", color: "white" }}>
          {chatMeta && (
            <>
              <Typography color="white">
                {/* {chatMeta.sellerName} */}
                {chatMeta.amIBuyer ? chatMeta.sellerName : chatMeta.buyerName}
              </Typography>
              {chatMeta.amIBuyer && (
                <Typography variant="caption" color="lightgray">
                  {chatMeta.productTitle}
                </Typography>
              )}
            </>
          )}
        </Box>
        <MoreVertIcon sx={{ color: "white" }} />
      </Box>

      {/* Chat container */}
      <Box
        sx={{
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          marginTop: "-2rem",
          backgroundColor: "white",
          zIndex: 10,
          height: "80vh",
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent: msg.sender_id === userId ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <Typography
              sx={{
                border: "1px solid gray",
                borderRadius: "1rem",
                padding: "0.5rem 1rem",
                maxWidth: "70%",
                color: "black",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          position: "absolute",
          bottom: "5rem",
          width: "100%",
          borderTop: "1px solid gray",
          paddingTop: "1rem",
          backgroundColor: "white",
        }}
      >
        <AddCircleOutlineIcon sx={{ color: "black" }} />
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              backgroundColor: "lightgray",
              borderRadius: "3rem",
              padding: "0 1rem",
            },
            width: "60%",
          }}
          placeholder="Type a message..."
        />
        <ImageIcon sx={{ color: "black" }} />
        <SendIcon sx={{ color: "black", cursor: "pointer" }} onClick={sendMessage} />
      </Box>
    </Box>
  )
}
