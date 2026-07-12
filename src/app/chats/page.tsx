"use client";

import {
  getChatInbox,
  getMessages,
  getProductsByUser,
  markChatRead,
  sendMessage as sendChatMessage,
  sendMessages,
} from "@/app/lib/chatsApi";
import { getProfilesBatch } from "@/app/lib/profilesApi";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  TextField,
  useMediaQuery,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./chats.css";

type ChatRow = {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  chat_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  image_url?: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type PartnerProduct = {
  id: string;
  title: string | null;
  price: number | null;
  image_url: string | null;
};

type ChatPreviewMap = Record<string, { content: string; created_at: string }>;
type UnreadCountMap = Record<string, number>;

const isSameDay = (a: string, b: string) => {
  const first = new Date(a);
  const second = new Date(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleString("da-DK", { hour: "2-digit", minute: "2-digit" });

const formatDateAndTime = (dateString: string) =>
  new Date(dateString).toLocaleString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatRelativeTime = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Nu";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} t`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return formatTime(dateString);
};

function upgradeGoogleAvatar(url: string) {
  return url.replace(/=s\d+-c$/, "=s512-c");
}

export default function ChatsPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:767px)");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingPartnerProducts, setLoadingPartnerProducts] = useState(false);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfileRow>>({});
  const [latestMessageByChat, setLatestMessageByChat] = useState<ChatPreviewMap>({});
  const [unreadByChat, setUnreadByChat] = useState<UnreadCountMap>({});
  const [partnerProducts, setPartnerProducts] = useState<PartnerProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sendLockRef = useRef(false);

  useEffect(() => {
    document.body.classList.add("chats-route");
    return () => document.body.classList.remove("chats-route");
  }, []);

  const requestedChatId = searchParams.get("chatId");

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    router.replace(`/chats?chatId=${chatId}`);
  };

  const goBackToChatList = () => {
    setActiveChatId(null);
    router.replace("/chats");
  };

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;

      if (!currentUser) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }

      setUserId(currentUser.id);

      const inbox = await getChatInbox(currentUser.id);
      const allChats = inbox.chats;
      setChats(allChats);

      const latestMap: ChatPreviewMap = {};
      for (const preview of inbox.previews) {
        latestMap[preview.chat_id] = {
          content: preview.content,
          created_at: preview.created_at,
        };
      }
      setLatestMessageByChat(latestMap);
      setUnreadByChat(inbox.unread_by_chat);

      const partnerIds = Array.from(
        new Set(
          allChats
            .map((chat) =>
              chat.buyer_id === currentUser.id ? chat.seller_id : chat.buyer_id
            )
            .filter((id): id is string => Boolean(id))
        )
      );

      if (partnerIds.length > 0) {
        try {
          const profileRows = await getProfilesBatch(partnerIds);
          const map = profileRows.reduce<Record<string, ProfileRow>>((acc, profile) => {
            acc[profile.id] = {
              id: profile.id,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
            };
            return acc;
          }, {});
          setProfilesById(map);
        } catch {
          setError("Kunne ikke hente profilnavne");
        }
      }

      setLoading(false);
    };

    loadChats();
  }, [supabase]);

  useEffect(() => {
    if (!chats.length) {
      setActiveChatId(null);
      return;
    }

    if (requestedChatId) {
      const exists = chats.some((chat) => chat.id === requestedChatId);
      setActiveChatId(exists ? requestedChatId : null);
      return;
    }

    const chatsWithMessages = chats.filter((chat) =>
      Boolean(latestMessageByChat[chat.id])
    );

    if (!isMobile && chatsWithMessages.length > 0) {
      const firstChatId = chatsWithMessages[0].id;
      setActiveChatId(firstChatId);
      router.replace(`/chats?chatId=${firstChatId}`);
      return;
    }

    setActiveChatId(null);
  }, [chats, requestedChatId, isMobile, latestMessageByChat, router]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      setError(null);

      try {
        const data = await getMessages(activeChatId);
        setMessages(data);

        if (userId) {
          await markChatRead(activeChatId, userId);
          setUnreadByChat((prev) => ({ ...prev, [activeChatId]: 0 }));
        }
      } catch {
        setError("Kunne ikke hente beskeder");
      }

      setLoadingMessages(false);
    };

    loadMessages();
  }, [activeChatId, supabase, userId]);

  useEffect(() => {
    if (!activeChatId) return;

    const pollMessages = async () => {
      try {
        const data = await getMessages(activeChatId);
        setMessages((prev) => {
          if (prev.length === data.length && prev.at(-1)?.id === data.at(-1)?.id) {
            return prev;
          }
          return data;
        });

        if (data.length > 0) {
          const latest = data[data.length - 1];
          setLatestMessageByChat((prev) => ({
            ...prev,
            [activeChatId]: { content: latest.content, created_at: latest.created_at },
          }));
        }

        if (userId) {
          await markChatRead(activeChatId, userId);
        }
      } catch {
        // Ignorer polling-fejl
      }
    };

    const intervalId = window.setInterval(pollMessages, 4000);
    return () => window.clearInterval(intervalId);
  }, [activeChatId, userId]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chats]
  );

  const chatsWithHistory = useMemo(
    () => chats.filter((chat) => Boolean(latestMessageByChat[chat.id])),
    [chats, latestMessageByChat]
  );

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chatsWithHistory;

    return chatsWithHistory.filter((chat) => {
      const currentPartnerId =
        userId && chat.buyer_id === userId ? chat.seller_id : chat.buyer_id;
      const profile = currentPartnerId ? profilesById[currentPartnerId] : null;
      const preview = latestMessageByChat[chat.id];
      const name = profile?.display_name?.toLowerCase() ?? "";
      const content = preview?.content.toLowerCase() ?? "";
      return name.includes(query) || content.includes(query);
    });
  }, [chatsWithHistory, latestMessageByChat, profilesById, searchQuery, userId]);

  const partnerId = useMemo(() => {
    if (!activeChat || !userId) return null;
    return activeChat.buyer_id === userId ? activeChat.seller_id : activeChat.buyer_id;
  }, [activeChat, userId]);

  const partnerProfile = partnerId ? profilesById[partnerId] : null;
  const partnerName = partnerProfile?.display_name ?? "Ukendt profil";
  const partnerRole =
    activeChat && partnerId
      ? partnerId === activeChat.seller_id
        ? "Sælger"
        : "Køber"
      : "";

  useEffect(() => {
    const loadPartnerProducts = async () => {
      if (!partnerId) {
        setPartnerProducts([]);
        return;
      }

      setLoadingPartnerProducts(true);

      try {
        const data = await getProductsByUser(partnerId);
        setPartnerProducts(
          data
            .filter((product) => !product.sold)
            .slice(0, 6)
            .map((product) => ({
              id: product.id,
              title: product.title,
              price: product.price,
              image_url: product.image_url,
            }))
        );
      } catch {
        setPartnerProducts([]);
      }

      setLoadingPartnerProducts(false);
    };

    loadPartnerProducts();
  }, [partnerId, supabase]);

  useEffect(() => {
    if (!loadingMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMessages]);

  const handleGoogleLogin = async () => {
    const { error: loginError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/chats`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (loginError) setError(loginError.message);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...fileList]);

      Promise.all(
        fileList.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve((e.target?.result as string) ?? "");
              reader.onerror = () => reject(new Error("Kunne ikke loade preview"));
              reader.readAsDataURL(file);
            })
        )
      )
        .then((newPreviews) => {
          setImagePreviews((prev) => [...prev, ...newPreviews.filter(Boolean)]);
        })
        .catch(() => setError("Kunne ikke loade billede-preview"));
    }
    event.currentTarget.value = "";
  };

  const removeSelectedImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !activeChat || !userId || sendLockRef.current) return;

    const receiverId =
      activeChat.buyer_id === userId ? activeChat.seller_id : activeChat.buyer_id;

    if (!receiverId) {
      setError("Kunne ikke finde modtager for samtalen");
      return;
    }

    sendLockRef.current = true;
    setIsSending(true);
    setError(null);

    try {
      const insertedMessage = await sendChatMessage({
        chatId: activeChat.id,
        senderId: userId,
        receiverId,
        content,
      });

      setMessages((prev) => [...prev, insertedMessage]);
      setLatestMessageByChat((prev) => ({
        ...prev,
        [activeChat.id]: { content: insertedMessage.content, created_at: insertedMessage.created_at },
      }));
      setNewMessage("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Kunne ikke sende besked");
    }

    setIsSending(false);
    sendLockRef.current = false;
  };

  const sendImageMessage = async () => {
    if (!selectedFiles.length || !activeChat || !userId || sendLockRef.current) return;

    const receiverId =
      activeChat.buyer_id === userId ? activeChat.seller_id : activeChat.buyer_id;

    if (!receiverId) {
      setError("Kunne ikke finde modtager for samtalen");
      return;
    }

    sendLockRef.current = true;
    setIsSending(true);
    setError(null);

    try {
      const preparedMessages: Array<{
        chat_id: string;
        sender_id: string;
        receiver_id: string;
        content: string;
        image_url: string;
      }> = [];

      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}.${fileExt}`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", fileName);

        const uploadResponse = await fetch("/api/upload-chat-image", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || `Upload fejl: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || "Upload fejl");
        }

        preparedMessages.push({
          chat_id: activeChat.id,
          sender_id: userId,
          receiver_id: receiverId,
          content: index === 0 && newMessage.trim().length > 0 ? newMessage.trim() : "",
          image_url: uploadResult.url,
        });
      }

      const insertResults = await sendMessages(
        activeChat.id,
        preparedMessages.map((message) => ({
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          content: message.content,
          image_url: message.image_url,
        }))
      );

      if (!insertResults.length) {
        throw new Error("Kunne ikke sende billeder");
      }

      setMessages((prev) => [...prev, ...insertResults]);
      const newestMessage = insertResults[insertResults.length - 1];
      setLatestMessageByChat((prev) => ({
        ...prev,
        [activeChat.id]: { content: newestMessage.content, created_at: newestMessage.created_at },
      }));
      setNewMessage("");
      setImagePreviews([]);
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke sende billede");
    } finally {
      setIsSending(false);
      sendLockRef.current = false;
    }
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) sendImageMessage();
    else sendMessage();
  };

  if (loading) {
    return (
      <Box className="chats-page">
        <Box className="chats-workspace chats-workspace--state">
          <Box className="chats-page-state">
            <CircularProgress size={22} />
            <span>Indlæser samtaler...</span>
          </Box>
        </Box>
      </Box>
    );
  }

  if (loginRequired) {
    return (
      <Box className="chats-page">
        <Box className="chats-workspace chats-workspace--state">
          <Box className="chats-page-state">
            <span>Log ind for at skrive med andre brugere.</span>
            <Button className="chats-login-button" onClick={handleGoogleLogin}>
              Log ind med Google
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={`chats-page${activeChat && isMobile ? " mobile-chat-open" : ""}`}>
      {error ? (
        <Alert severity="error" className="chats-alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box className="chats-workspace">
      <aside className="chats-sidebar">
        <Box className="chats-sidebar-header">
          <p className="chats-sidebar-kicker">Beskeder</p>
          <TextField
            className="chats-search"
            placeholder="Søg samtale..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "var(--color-text-muted)" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {filteredChats.length === 0 ? (
          <p className="chats-empty-copy">Du har ingen samtaler endnu.</p>
        ) : (
          <List className="chats-list" disablePadding>
            {filteredChats.map((chat) => {
              const currentPartnerId =
                userId && chat.buyer_id === userId ? chat.seller_id : chat.buyer_id;
              const profile = currentPartnerId ? profilesById[currentPartnerId] : null;
              const preview = latestMessageByChat[chat.id];
              const unread = unreadByChat[chat.id] ?? 0;

              return (
                <ListItemButton
                  key={chat.id}
                  className={`chats-list-item${chat.id === activeChatId ? " active" : ""}`}
                  onClick={() => openChat(chat.id)}
                >
                  <Avatar
                    src={
                      profile?.avatar_url
                        ? upgradeGoogleAvatar(profile.avatar_url)
                        : undefined
                    }
                    alt={profile?.display_name ?? "Ukendt profil"}
                    className="chats-avatar"
                  />
                  <Box className="chats-list-copy">
                    <Box className="chats-list-top">
                      <span className="chats-list-name">{profile?.display_name ?? "Ukendt"}</span>
                      <span className="chats-list-time">
                        {preview ? formatRelativeTime(preview.created_at) : ""}
                      </span>
                    </Box>
                    <Box className="chats-list-top">
                      <span className="chats-list-preview">
                        {preview?.content || "Ingen beskeder endnu"}
                      </span>
                      {unread > 0 ? <span className="chats-unread-badge">{unread}</span> : null}
                    </Box>
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </aside>

      <main className="chats-main">
        {activeChat ? (
          <>
            <Box className="chats-main-header">
              <Button className="chats-back-button" onClick={goBackToChatList}>
                ←
              </Button>
              <Avatar
                src={
                  partnerProfile?.avatar_url
                    ? upgradeGoogleAvatar(partnerProfile.avatar_url)
                    : undefined
                }
                alt={partnerName}
                className="chats-main-avatar"
              />
              <Box className="chats-main-title-wrap">
                <p className="chats-main-title">{partnerName}</p>
                <p className="chats-main-status">{partnerRole}</p>
              </Box>
            </Box>

            <Box className="chats-messages-list">
              {loadingMessages ? (
                <Box className="chats-page-state inline">
                  <CircularProgress size={20} />
                </Box>
              ) : messages.length === 0 ? (
                <p className="chats-empty-copy">Skriv den første besked i samtalen.</p>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === userId;
                  const previousMessage = index > 0 ? messages[index - 1] : null;
                  const showDate =
                    !previousMessage ||
                    !isSameDay(previousMessage.created_at, message.created_at);
                  const senderProfile = profilesById[message.sender_id];

                  return (
                    <Box
                      key={message.id}
                      className={`chats-message-row${isOwn ? " mine" : " theirs"}`}
                    >
                      <Avatar
                        src={
                          senderProfile?.avatar_url
                            ? upgradeGoogleAvatar(senderProfile.avatar_url)
                            : undefined
                        }
                        alt=""
                        className="chats-message-avatar"
                      />
                      <Box className={`chats-message-bubble${isOwn ? " mine" : " theirs"}`}>
                        {message.image_url ? (
                          <img
                            src={message.image_url}
                            alt="Billede i besked"
                            className="chats-message-image"
                          />
                        ) : null}
                        {message.content ? (
                          <span className="chats-message-content">{message.content}</span>
                        ) : null}
                        <span className="chats-message-time">
                          {showDate
                            ? formatDateAndTime(message.created_at)
                            : formatTime(message.created_at)}
                        </span>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box className="chats-compose-wrap">
              {imagePreviews.length > 0 ? (
                <Box className="chats-image-preview-list">
                  {imagePreviews.map((preview, index) => (
                    <Box className="chats-image-preview-container" key={`${preview}-${index}`}>
                      <img src={preview} alt={`Preview ${index + 1}`} className="chats-image-preview" />
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
              ) : null}

              <Box className="chats-compose-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                {selectedFiles.length === 0 ? (
                  <IconButton
                    size="small"
                    className="chats-compose-icon"
                    onClick={openFileDialog}
                    title="Vedhæft billede"
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                ) : null}
                <TextField
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder={
                    selectedFiles.length > 0
                      ? "Tilføj tekst til billederne..."
                      : "Skriv en besked..."
                  }
                  fullWidth
                  size="small"
                  className="chats-input"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <IconButton
                  className="chats-send-button"
                  onClick={handleSend}
                  disabled={
                    isSending || (newMessage.trim().length === 0 && selectedFiles.length === 0)
                  }
                  size="small"
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box className="chats-main-empty">Vælg en samtale for at se beskeder.</Box>
        )}
      </main>

      <aside className="chats-info-panel">
        {activeChat && partnerId ? (
          <>
            <Box className="chats-info-profile">
              <Avatar
                src={
                  partnerProfile?.avatar_url
                    ? upgradeGoogleAvatar(partnerProfile.avatar_url)
                    : undefined
                }
                alt={partnerName}
                className="chats-info-avatar"
              />
              <h2 className="chats-info-name">{partnerName}</h2>
              <p className="chats-info-role">{partnerRole}</p>
            </Box>

            <Box className="chats-info-scroll">
              <Box className="chats-info-section">
                <p className="chats-info-section-title">
                  {partnerRole === "Sælger" ? "Sælgers annoncer" : "Personens annoncer"}
                </p>

                {loadingPartnerProducts ? (
                  <Box className="chats-page-state inline">
                    <CircularProgress size={18} />
                  </Box>
                ) : partnerProducts.length === 0 ? (
                  <p className="chats-empty-copy">Ingen aktive annoncer.</p>
                ) : (
                  <Box className="chats-info-products">
                    {partnerProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="chats-info-product"
                      >
                        <Box className="chats-info-product-image">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.title ?? "Produkt"}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          ) : null}
                        </Box>
                        <p className="chats-info-product-name">{product.title}</p>
                        <p className="chats-info-product-price">
                          {product.price != null ? `${product.price} kr` : "—"}
                        </p>
                      </Link>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box className="chats-info-empty">
            Vælg en samtale for at se oplysninger om personen og deres annoncer.
          </Box>
        )}
      </aside>
      </Box>
    </Box>
  );
}
