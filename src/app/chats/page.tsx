"use client"

import { getSupabaseClient } from "@/app/lib/supabaseClient"
import { Alert, Avatar, Box, Button, CircularProgress, IconButton, List, ListItemButton, TextField, Typography } from "@mui/material"
import ImageIcon from "@mui/icons-material/Image"
import SendIcon from "@mui/icons-material/Send"
import CloseIcon from "@mui/icons-material/Close"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./chats.css"

type ChatRow = {
  id: string
  buyer_id: string
  seller_id: string
  created_at: string
}

type MessageRow = {
  id: string
  chat_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at: string | null
  image_url?: string | null
}

type ProfileRow = {
  id: string
  display_name: string | null
  avatar_url: string | null
}

type ChatPreviewMap = Record<string, { content: string; created_at: string }>

const isSameDay = (a: string, b: string) => {
  const first = new Date(a)
  const second = new Date(b)
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatDateAndTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ChatsPage() {
  const supabase = useMemo(() => getSupabaseClient(), [])
  const searchParams = useSearchParams()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [loginRequired, setLoginRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [chats, setChats] = useState<ChatRow[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [profilesById, setProfilesById] = useState<Record<string, ProfileRow>>({})
  const [latestMessageByChat, setLatestMessageByChat] = useState<ChatPreviewMap>({})
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const sendLockRef = useRef(false)

  const requestedChatId = searchParams.get("chatId")

  const openChat = (chatId: string) => {
    setActiveChatId(chatId)
    router.replace(`/chats?chatId=${chatId}`)
  }

  const goBackToChatList = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    setActiveChatId(null)
    router.replace("/chats")
  }

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true)
      setError(null)

      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData.user

      if (!currentUser) {
        setLoginRequired(true)
        setLoading(false)
        return
      }

      setUserId(currentUser.id)

      const { data: chatRows, error: chatError } = await supabase
        .from("chats")
        .select("id, buyer_id, seller_id, created_at")
        .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })

      if (chatError) {
        setError("Kunne ikke hente samtaler")
        setLoading(false)
        return
      }

      const allChats = chatRows ?? []
      setChats(allChats)

      if (allChats.length > 0) {
        const { data: latestMessages } = await supabase
          .from("messages")
          .select("chat_id, content, created_at")
          .in("chat_id", allChats.map((chat) => chat.id))
          .order("created_at", { ascending: false })

        const latestMap: ChatPreviewMap = {}
        for (const row of latestMessages ?? []) {
          if (!latestMap[row.chat_id]) {
            latestMap[row.chat_id] = {
              content: row.content,
              created_at: row.created_at,
            }
          }
        }

        setLatestMessageByChat(latestMap)
      }

      const partnerIds = Array.from(
        new Set(
          allChats.map((chat) => (chat.buyer_id === currentUser.id ? chat.seller_id : chat.buyer_id))
        )
      )

      if (partnerIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", partnerIds)

        if (profileError) {
          setError("Kunne ikke hente profilnavne")
        }

        if (!profileError && profileRows) {
          const map = profileRows.reduce<Record<string, ProfileRow>>((acc, profile) => {
            acc[profile.id] = profile
            return acc
          }, {})
          setProfilesById(map)
        }
      }

      setLoading(false)
    }

    loadChats()
  }, [supabase])

  useEffect(() => {
    if (!chats.length) {
      setActiveChatId(null)
      return
    }

    if (!requestedChatId) {
      setActiveChatId(null)
      return
    }

    const exists = chats.some((chat) => chat.id === requestedChatId)
    setActiveChatId(exists ? requestedChatId : null)
  }, [chats, requestedChatId])

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) {
        setMessages([])
        return
      }

      setLoadingMessages(true)
      setError(null)

      const { data, error: messagesError } = await supabase
        .from("messages")
        .select("id, chat_id, sender_id, receiver_id, content, created_at, read_at, image_url")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true })

      if (messagesError) {
        setError("Kunne ikke hente beskeder")
        setLoadingMessages(false)
        return
      }

      setMessages(data ?? [])

      if (userId) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("chat_id", activeChatId)
          .eq("receiver_id", userId)
          .is("read_at", null)
      }

      setLoadingMessages(false)
    }

    loadMessages()
  }, [activeChatId, supabase, userId])

  useEffect(() => {
    if (!activeChatId) {
      return
    }

    const channel = supabase
      .channel(`messages-realtime-${activeChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${activeChatId}`,
        },
        async (payload) => {
          const incoming = payload.new as MessageRow

          setMessages((prev) => {
            if (prev.some((message) => message.id === incoming.id)) {
              return prev
            }
            return [...prev, incoming]
          })

          setLatestMessageByChat((prev) => ({
            ...prev,
            [incoming.chat_id]: {
              content: incoming.content,
              created_at: incoming.created_at,
            },
          }))

          if (incoming.receiver_id === userId) {
            await supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", incoming.id)
              .eq("receiver_id", userId)
              .is("read_at", null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChatId, supabase, userId])

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chats]
  )

  const chatsWithHistory = useMemo(
    () => chats.filter((chat) => Boolean(latestMessageByChat[chat.id])),
    [chats, latestMessageByChat]
  )

  const partnerId = useMemo(() => {
    if (!activeChat || !userId) {
      return null
    }

    return activeChat.buyer_id === userId ? activeChat.seller_id : activeChat.buyer_id
  }, [activeChat, userId])

  const partnerName = partnerId ? profilesById[partnerId]?.display_name ?? "Ukendt profil" : ""

  const handleGoogleLogin = async () => {
    const { error: loginError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/chats`,
        queryParams: { prompt: "select_account" },
      },
    })

    if (loginError) {
      setError(loginError.message)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files
    if (files && files.length > 0) {
      const fileList = Array.from(files)
      const nextFiles = [...selectedFiles, ...fileList]
      setSelectedFiles(nextFiles)

      Promise.all(
        fileList.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve((e.target?.result as string) ?? "")
              reader.onerror = () => reject(new Error("Kunne ikke loade preview"))
              reader.readAsDataURL(file)
            })
        )
      )
        .then((newPreviews) => {
          setImagePreviews((prev) => [...prev, ...newPreviews.filter(Boolean)])
        })
        .catch(() => {
          setError("Kunne ikke loade billede-preview")
        })
    }
    event.currentTarget.value = ""
  }

  const removeSelectedImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {
    const content = newMessage.trim()

    if (!content || !activeChat || !userId || sendLockRef.current) {
      return
    }

    const receiverId = activeChat.buyer_id === userId ? activeChat.seller_id : activeChat.buyer_id

    sendLockRef.current = true
    setIsSending(true)
    setError(null)

    const { data: insertedMessage, error: sendError } = await supabase
      .from("messages")
      .insert([
        {
          chat_id: activeChat.id,
          sender_id: userId,
          receiver_id: receiverId,
          content,
        },
      ])
      .select("id, chat_id, sender_id, receiver_id, content, created_at, read_at, image_url")
      .single()

    if (sendError || !insertedMessage) {
      setError(sendError?.message ?? "Kunne ikke sende besked")
      setIsSending(false)
      sendLockRef.current = false
      return
    }

    setMessages((prev) => [...prev, insertedMessage])
    setLatestMessageByChat((prev) => ({
      ...prev,
      [activeChat.id]: {
        content: insertedMessage.content,
        created_at: insertedMessage.created_at,
      },
    }))
    setNewMessage("")
    setIsSending(false)
    sendLockRef.current = false
  }

  const sendImageMessage = async () => {
    if (!selectedFiles.length || !activeChat || !userId || sendLockRef.current) {
      return
    }

    const receiverId = activeChat.buyer_id === userId ? activeChat.seller_id : activeChat.buyer_id

    sendLockRef.current = true
    setIsSending(true)
    setError(null)

    try {
      const preparedMessages: Array<{
        chat_id: string
        sender_id: string
        receiver_id: string
        content: string
        image_url: string
      }> = []

      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}.${fileExt}`

        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileName", fileName)

        const uploadResponse = await fetch("/api/upload-chat-image", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || `Upload fejl: ${uploadResponse.status}`)
        }

        const uploadResult = await uploadResponse.json()

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || "Upload fejl")
        }

        const messageContent =
          index === 0 && newMessage.trim().length > 0 ? newMessage.trim() : ""

        preparedMessages.push({
          chat_id: activeChat.id,
          sender_id: userId,
          receiver_id: receiverId,
          content: messageContent,
          image_url: uploadResult.url,
        })
      }

      const { data: insertResults, error: sendError } = await supabase
        .from("messages")
        .insert(preparedMessages)
        .select("id, chat_id, sender_id, receiver_id, content, created_at, read_at, image_url")

      if (sendError || !insertResults?.length) {
        throw new Error(sendError?.message ?? "Kunne ikke sende billeder")
      }

      setMessages((prev) => [...prev, ...insertResults])
      const newestMessage = insertResults[insertResults.length - 1]
      setLatestMessageByChat((prev) => ({
        ...prev,
        [activeChat.id]: {
          content: newestMessage.content,
          created_at: newestMessage.created_at,
        },
      }))
      setNewMessage("")
      setImagePreviews([])
      setSelectedFiles([])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke sende billede"
      console.error("Send image error:", msg)
      setError(msg)
    } finally {
      setIsSending(false)
      sendLockRef.current = false
    }
  }

  if (loading) {
    return (
      <Box className="chats-page-state">
        <CircularProgress size={22} />
        <Typography>Indlaeser samtaler...</Typography>
      </Box>
    )
  }

  if (loginRequired) {
    return (
      <Box className="chats-page-state">
        <Typography>Log ind for at skrive med andre brugere.</Typography>
        <Button className="chats-login-button" onClick={handleGoogleLogin}>
          Log ind med Google
        </Button>
      </Box>
    )
  }

  return (
    <Box className={`chats-page${activeChat ? " mobile-chat-open" : ""}`}>
      {error && <Alert severity="error" className="chats-alert">{error}</Alert>}

      <Box className="chats-list-panel">
        <Typography className="chats-panel-title">Samtaler</Typography>
        {chatsWithHistory.length === 0 ? (
          <Typography className="chats-empty-copy">Du har ingen samtaler endnu.</Typography>
        ) : (
          <List className="chats-list">
            {chatsWithHistory.map((chat) => {
              const currentPartnerId = userId && chat.buyer_id === userId ? chat.seller_id : chat.buyer_id
              const profile = currentPartnerId ? profilesById[currentPartnerId] : null
              const preview = latestMessageByChat[chat.id]

              return (
                <ListItemButton
                  key={chat.id}
                  className={`chats-list-item${chat.id === activeChatId ? " active" : ""}`}
                  onClick={() => openChat(chat.id)}
                >
                  <Avatar
                    src={profile?.avatar_url ?? undefined}
                    alt={profile?.display_name ?? "Ukendt profil"}
                    className="chats-avatar"
                  />
                  <Box className="chats-list-copy">
                    <Typography className="chats-list-name">{profile?.display_name ?? "Ukendt profil"}</Typography>
                    <Typography className="chats-list-preview">{preview?.content}</Typography>
                  </Box>
                </ListItemButton>
              )
            })}
          </List>
        )}
      </Box>

      <Box className="chats-messages-panel">
        {activeChat ? (
          <>
            <Box className="chats-messages-header">
              <Button className="chats-back-button" onClick={goBackToChatList}>
                ←
              </Button>
              <Typography className="chats-messages-title">Chat med {partnerName}</Typography>
            </Box>

            <Box className="chats-messages-list">
              {loadingMessages ? (
                <Box className="chats-page-state inline">
                  <CircularProgress size={20} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography className="chats-empty-copy">Skriv den forste besked i samtalen.</Typography>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === userId
                  const previousMessage = index > 0 ? messages[index - 1] : null
                  const showDate =
                    !previousMessage || !isSameDay(previousMessage.created_at, message.created_at)

                  return (
                    <Box
                      key={message.id}
                      className={`chats-message-bubble${isOwn ? " mine" : ""}`}
                    >
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt="Billede i besked"
                          style={{
                            maxWidth: "250px",
                            maxHeight: "250px",
                            borderRadius: "8px",
                            marginBottom: message.content && message.content !== "" ? "8px" : "0",
                            display: "block",
                          }}
                        />
                      )}
                      <Typography className="chats-message-content">{message.content}</Typography>
                      <Typography className="chats-message-time">
                        {showDate ? formatDateAndTime(message.created_at) : formatTime(message.created_at)}
                      </Typography>
                    </Box>
                  )
                })
              )}
            </Box>

            <Box className="chats-compose-row">
              {imagePreviews.length > 0 && (
                <Box className="chats-image-preview-list">
                  {imagePreviews.map((preview, index) => (
                    <Box className="chats-image-preview-container" key={`${preview}-${index}`}>
                      <img
                        src={preview}
                        alt={`Billede preview ${index + 1}`}
                        className="chats-image-preview"
                      />
                      <IconButton
                        size="small"
                        className="chats-image-preview-close"
                        onClick={() => removeSelectedImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              {selectedFiles.length === 0 && (
                <IconButton
                  size="small"
                  className="chats-compose-icon"
                  onClick={openFileDialog}
                  title="Vedhæft billede"
                >
                  <ImageIcon fontSize="small" />
                </IconButton>
              )}
              <TextField
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder={selectedFiles.length > 0 ? "Tilføj tekst til billederne..." : "Skriv en besked..."}
                fullWidth
                size="small"
                className="chats-input"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    if (selectedFiles.length > 0) {
                      sendImageMessage()
                    } else {
                      sendMessage()
                    }
                  }
                }}
              />
              <IconButton
                className="chats-send-button"
                onClick={() => {
                  if (selectedFiles.length > 0) {
                    sendImageMessage()
                  } else {
                    sendMessage()
                  }
                }}
                disabled={isSending || (newMessage.trim().length === 0 && selectedFiles.length === 0)}
                size="small"
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box className="chats-page-state">
            <Typography>Vælg en samtale for at se beskeder.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
