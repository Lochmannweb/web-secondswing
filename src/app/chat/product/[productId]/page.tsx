"use client"
import { useEffect, useState } from "react"
import { Box, TextField, Typography } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import ImageIcon from "@mui/icons-material/Image"
import SendIcon from "@mui/icons-material/Send"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Message = {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ChatPage() {
  const { productId } = useParams<{ productId: string }>() // ✅ correct params
  const [buyerId, setBuyerId] = useState<string | null>(null)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  // 1. Load buyer + seller from product
  useEffect(() => {
    async function loadIds() {
      // buyer (logged-in user)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setBuyerId(user.id)

      if (!productId) return

      // lookup product → sellerId
      const { data: product, error } = await supabase
        .from("products")
        .select("user_id")
        .eq("id", productId)
        .single()

      if (error) {
        console.error("Product lookup error:", error)
        return
      }

      setSellerId(product.user_id)
    }

    loadIds()
  }, [productId])

  // 2. Create or load chat
  useEffect(() => {
    if (!buyerId || !sellerId || !productId) return

    async function initChat() {
      const { data, error } = await supabase
        .from("chats")
        .upsert(
          { buyer_id: buyerId, seller_id: sellerId, product_id: productId },
          { onConflict: "buyer_id,seller_id,product_id" }
        )
        .select()
        .single()

      if (error) {
        console.error("Chat upsert error:", error)
        return
      }

      setChatId(data.id)
      loadMessages(data.id)
    }

    initChat()
  }, [buyerId, sellerId, productId])

  // 3. Load old messages
  async function loadMessages(chatId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Load messages error:", error)
      return
    }

    if (data) setMessages(data as Message[])
  }

  // 4. Realtime subscription
  useEffect(() => {
    if (!chatId) return

    const channel = supabase
      .channel("chat-" + chatId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => setMessages((msgs) => [...msgs, payload.new as Message])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  // 5. Send a message
  async function sendMessage() {
    if (!newMessage.trim() || !chatId || !buyerId) return

    const { data, error } = await supabase
      .from("messages")
      .insert([{ chat_id: chatId, sender_id: buyerId, content: newMessage }])
      .select()

    if (error) {
      console.error("Insert error:", error)
    } else {
      setMessages((prev) => [...prev, ...(data as Message[])])
      setNewMessage("")
    }
  }

  return (
    <Box>
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
        <ArrowBackIosIcon />
        <Typography color="white">Chat with seller</Typography>
        <MoreVertIcon />
      </Box>

      {/* Chat container */}
      <Box
        sx={{
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          marginTop: "-2rem",
          backgroundColor: "white",
          zIndex: 10,
          height: "90vh",
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent:
                msg.sender_id === buyerId ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <Typography
              sx={{
                border:
                  msg.sender_id === buyerId ? "1px solid gray" : "1px solid gray",
                borderRadius: "1rem",
                padding: "0.5rem 1rem",
                maxWidth: "60%",
                color: "black"
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        ))}
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
              padding: "0 0.5rem",
            },
            width: "60%",
          }}
          placeholder="Skriv en besked..."
        />
        <ImageIcon sx={{ color: "black" }} />
        <SendIcon
          sx={{ color: "black", cursor: "pointer" }}
          onClick={sendMessage}
        />
      </Box>
    </Box>
  )
}
