"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatList } from "../HentSamtaler/page";


interface ChatListProps {
  currentUserId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectChat: (chat: any ) => void;
  activeChatId?: string
}

export default function ChatList({ currentUserId, onSelectChat, activeChatId }: ChatListProps) {
  const chats = useChatList(currentUserId);  
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Tjek skærmstørrelse → mobil?
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (chat: any) => {
    if (isMobile) {
      // 👉 Send brugeren videre til chatten
      router.push(`/chat/product/${chat.product_id}?chatId=${chat.id}`);
    } else {
      // 👉 Desktop: skift kun højre panel
      onSelectChat(chat);
    }
  };



  return (
    <Box p={"1rem"}>
      <h3>Dine beskeder</h3>
      {chats.length === 0 && <p>Ingen chats endnu.</p>}

      {chats.map((chat) => {
        const other = chat.otherUser;
        const isActive = chat.id === activeChatId;
        return (
          <Box 
            key={chat.id} 
            onClick={() => handleClick(chat)} 
            // onClick={() => router.push(`/chat/${chat.id}`)}
            sx={{ 
              padding: "1rem", 
              width: "100%",
              background: isActive ? "transparent" : "transparent", 
              cursor: "pointer", 
              borderBottom: "1px solid #1e1e1eff" 
          }}>
            <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <Box width={"20%"} height={"auto"} borderRadius={"50%"} >
                {other?.avatar_url ? <Image src={other.avatar_url} alt="img" width={100} height={100} style={{ width: "100%", height: "100%", borderRadius: 20 }} /> : null}
              </Box>

              <Box>
                <p style={{ fontWeight: 600 }}>{other?.full_name ?? other?.id}</p>
                <p style={{ opacity: 0.7, fontSize: 13 }}>{chat.lastMessage ? chat.lastMessage.content : "Ingen beskeder endnu"}</p>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
