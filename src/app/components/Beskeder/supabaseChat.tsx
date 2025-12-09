import { getSupabaseClient } from "@/app/lib/supabaseClient";

const supabase = getSupabaseClient();


export async function sendMessage(receiverId: string, text: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,  
    receiver_id: receiverId,
    content: text
  });

  if (error) console.error(error);
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function subscribeToMessages(userId: string, onMessage: (msg: any) => void) {
  const channel = supabase
    .channel("msgs:" + userId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
