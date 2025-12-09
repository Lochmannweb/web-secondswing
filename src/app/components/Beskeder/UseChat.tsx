"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/app/lib/supabaseClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useChat(currentUserId: string, chat: any) {
  const supabase = getSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!chat?.id) {
      setMessages([]);
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
    };

    load();

    // realtime: nye beskeder for denne chat
    const chan = supabase
      .channel(`public:messages:chat=${chat.id}`)
      .on( // denne sender beskeder afsted med det samme
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chat.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chan);
    };
  }, [chat?.id, supabase]);




  // send besked
  const send = async (content: string) => {
    if (!chat?.id || !content?.trim()) return;

    // bestem modtager: hvis currentUser == buyer => receiver = seller, ellers buyer
    const receiverId = currentUserId === chat.buyer_id ? chat.seller_id : chat.buyer_id;

    const { error } = await supabase
      .from("messages")
      .insert({
        chat_id: chat.id,
        sender_id: currentUserId,
        receiver_id: receiverId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Kunne ikke sende besked:", error);
      return;
    }

    // update chat's updated_at (so list sorts by recency)
    await supabase.from("chats").update({ /* nothing necessary if you use updated_at trigger, else: */ }).eq("id", chat.id);
  };

  return { messages, send };
}






