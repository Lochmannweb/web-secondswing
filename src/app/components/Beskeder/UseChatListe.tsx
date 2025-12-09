// // app/components/Beskeder/useChatList.ts
// "use client";

// import { useEffect, useState } from "react";
// import { getSupabaseClient } from "@/app/lib/supabaseClient";

// export function useChatList(currentUserId: string) {
//   const supabase = getSupabaseClient();
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [chats, setChats] = useState<any[]>([]);

//   useEffect(() => {
//     if (!currentUserId) return;

//     const load = async () => {
//       const { data: chatRows, error } = await supabase
//         .from("chats")
//         .select("*")
//         .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("Hent chats fejl:", error);
//         return;
//       }

//       const enriched = await Promise.all(
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         (chatRows || []).map(async (chat: any) => {
//           const otherUserId = chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id;
//           const { data: profile } = await supabase
//             .from("profiles")
//             .select("*")
//             .eq("id", otherUserId)
//             .single();

//           const { data: lastMessage } = await supabase
//             .from("messages")
//             .select("*")
//             .eq("chat_id", chat.id)
//             .order("created_at", { ascending: false })
//             .limit(1)
//             .maybeSingle();

//           return {
//             ...chat,
//             otherUser: profile || { id: otherUserId },
//             lastMessage: lastMessage || null,
//           };
//         })
//       );

//       setChats(enriched);
//     };

//     load();

//     // realtime: opdater liste når chats ændres (insert/update)
//     const channel = supabase
//       .channel("public:chats")
//       .on("postgres_changes", { event: "*", schema: "public", table: "chats" }, () => load())
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [currentUserId, supabase]);

//   return chats;
// }

