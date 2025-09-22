"use client"
import { useEffect, useState, useRef } from "react"
import { Box, Typography, TextField } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import ImageIcon from "@mui/icons-material/Image"
import SendIcon from "@mui/icons-material/Send"
import { supabase } from "@/lib/supabaseClient"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Chat = {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  product?: { title: string }
  buyerName: string
  sellerName: string
  messages?: { content: string; created_at: string }[]
}

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

export default function ChatLayout() {
  const [userId, setUserId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null)

  const dbChannelRef = useRef<RealtimeChannel | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Load user
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    })()
  }, [])

  // Load chats
  useEffect(() => {
    if (!userId) return
    async function loadChats() {
      const { data, error } = await supabase
        .from("chats")
        .select(`
          id,
          buyer_id,
          seller_id,
          product_id,
          product:product_id ( title ),
          buyer:buyer_id ( display_name ),
          seller:seller_id ( display_name ),
          messages (
            id,
            content,
            created_at
          )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("id", { ascending: false })

      if (error) {
        console.error("Error loading chats:", error)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = data.map((chat: any) => ({
        id: chat.id,
        buyer_id: chat.buyer_id,
        seller_id: chat.seller_id,
        product_id: chat.product_id,
        product: chat.product,
        buyerName: chat.buyer?.display_name ?? "Unknown buyer",
        sellerName: chat.seller?.display_name ?? "Unknown seller",
        messages: chat.messages?.sort(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }))
      setChats(normalized)
    }
    loadChats()
  }, [userId])

  // Load messages for active chat
  useEffect(() => {
    if (!activeChatId) return
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Load messages error:", error)
        return
      }
      setMessages(data || [])
    })()
  }, [activeChatId])

  // Load chat meta for active chat
  useEffect(() => {
    if (!activeChatId || !userId) return
    (async () => {
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
        .eq("id", activeChatId)
        .maybeSingle()

      if (error) {
        console.error("Failed to load chat info:", error)
        return
      }
      if (!data) return

      const amIBuyer = data.buyer_id === userId
      setChatMeta({
        amIBuyer,
        productTitle: data.product?.[0]?.title ?? "Unknown product",
        buyerName: data.buyer?.[0].display_name ?? "Unknown buyer",
        sellerName: data.seller?.[0].display_name ?? "Unknown seller",
      })
    })()
  }, [activeChatId, userId])

  // Realtime messages
  useEffect(() => {
    if (!activeChatId) return
    const dbChannel = supabase.channel(`db:chat-${activeChatId}`)
    dbChannel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${activeChatId}` },
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
  }, [activeChatId, userId])

  async function sendMessage() {
    if (!newMessage.trim() || !activeChatId || !userId) return
    const text = newMessage
    setNewMessage("")

    const { data, error } = await supabase
      .from("messages")
      .insert([{ chat_id: activeChatId, sender_id: userId, content: text }])
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
    <Box 
      sx={{ 
        maxWidth: { sm: 1200 },
        mx: { sm: "auto" }, 
        p: { sm: 2 }, 
        display: {sm: "flex" }, 
        color: "black"
      }}>
        
      {/* Left: Chat list */}
      <Box
        sx={{
          width: { xs: "100%", md: "30%" },
          borderRight: { md: "1px solid #ddd" },
          overflowY: "auto",
          display: { xs: activeChatId ? "none" : "block", md: "block" },
        }}
      >
        <Typography variant="h6" sx={{ p: 2, borderBottom: "1px solid black" }}>Chat History</Typography>
        {chats.map((chat) => {
          const lastMsg = chat.messages?.[0]?.content ?? "No messages yet"
          const otherName = userId === chat.buyer_id ? chat.sellerName : chat.buyerName

          return (
            <Box
              key={chat.id}
              sx={{
                p: 2,
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                backgroundColor: chat.id === activeChatId ? "#f5f5f5" : "transparent",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
              onClick={() => setActiveChatId(chat.id)}
            >
              <Typography fontWeight="bold">{otherName}</Typography>
              <Typography>{chat.product?.title ?? "Unknown product"}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {lastMsg}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {/* Right: Active chat */}
      <Box
        sx={{
          flex: 1,
          display: { xs: activeChatId ? "flex" : "none", md: "flex" },
          height: { xs: "93vh", sm: "88vh" },
          flexDirection: "column",
        }}
      >
        {!activeChatId ? (
          <Box sx={{ p: 4, textAlign: "center", color: "gray" }}>
            <Typography>Select a chat to start messaging</Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                justifyContent: "space-between",
                backgroundColor: "black",
                color: "white",
                p: 2,
              }}
            >
              <ArrowBackIosIcon
                sx={{ cursor: "pointer", display: { xs: "block", md: "none" } }}
                onClick={() => setActiveChatId(null)}
              />
              <Box sx={{ textAlign: "center" }}>
                {chatMeta && (
                  <>
                    {chatMeta.amIBuyer ? chatMeta.sellerName : chatMeta.buyerName}
                    {chatMeta.amIBuyer && (
                      <Typography variant="caption">{chatMeta.productTitle}</Typography>
                    )}
                  </>
                )}
              </Box>
              <MoreVertIcon />
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: msg.sender_id === userId ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      border: "1px solid gray",
                      borderRadius: "1rem",
                      p: "0.5rem 1rem",
                      maxWidth: "70%",
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
                alignItems: "center",
                p: 2,
                borderTop: "1px solid #ddd",
              }}
            >
              <AddCircleOutlineIcon sx={{ mr: 1 }} />
              <TextField
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "lightgray",
                    borderRadius: "2rem",
                    px: 2,
                  },
                }}
              />
              <ImageIcon sx={{ mx: 1 }} />
              <SendIcon sx={{ cursor: "pointer" }} onClick={sendMessage} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
