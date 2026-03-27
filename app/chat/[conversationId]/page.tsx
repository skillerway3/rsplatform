"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";


type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  last_message_by: string | null;
  buyer_last_read_at: string | null;
  seller_last_read_at: string | null;
};

// ✅ Only update viewer’s read column (no refetch)
async function markConversationReadLite(convo: Conversation, userId: string) {
  if (!convo.last_message_at) return;

  const patch: Partial<Conversation> = {};
  if (convo.buyer_id === userId) patch.buyer_last_read_at = new Date().toISOString();
  if (convo.seller_id === userId) patch.seller_last_read_at = new Date().toISOString();

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase.from("conversations").update(patch).eq("id", convo.id);
  if (error) console.error("markConversationRead failed:", error);
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [convo, setConvo] = useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ throttle read updates (prevents spam on mobile)
  const readTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scheduleMarkRead = (c: Conversation, uid: string) => {
    if (readTimerRef.current) return;
    readTimerRef.current = setTimeout(async () => {
      readTimerRef.current = null;
      await markConversationReadLite(c, uid);
    }, 800);
  };

  const canSend = useMemo(() => !!userId && !!conversationId, [userId, conversationId]);

  // 1) get current user (no need for onAuthStateChange here)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUserId(data.user?.id ?? null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Load conversation + last 60 messages (faster + less DOM)
  useEffect(() => {
    if (!conversationId) return;

    (async () => {
      setLoading(true);

      const { data: convoRow, error: convoErr } = await supabase
        .from("conversations")
        .select(
          "id,buyer_id,seller_id,last_message_at,last_message_by,buyer_last_read_at,seller_last_read_at"
        )
        .eq("id", conversationId)
        .single();

      if (convoErr) console.error("conversation fetch error:", convoErr);
      setConvo((convoRow as Conversation) ?? null);

      const { data: msgs, error: msgErr } = await supabase
        .from("messages")
        .select("id,conversation_id,sender_id,content,created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(60);

      if (msgErr) console.error("messages fetch error:", msgErr);

      const ordered = (msgs as Message[] | null)?.slice().reverse() ?? [];
      setMessages(ordered);

      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 0);
    })();
  }, [conversationId]);

  // 3) Mark read once after load
  useEffect(() => {
    if (!userId || !convo) return;
    scheduleMarkRead(convo, userId);
  }, [userId, convo]);

  // 4) realtime subscription (no refetch, keep list capped)
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            const next = [...prev, newMsg];

            // ✅ keep last 120 in UI max (mobile performance)
            if (next.length > 120) next.splice(0, next.length - 120);

            return next;
          });

          setConvo((prev) => {
            if (!prev) return prev;
            const updated: Conversation = {
              ...prev,
              last_message_at: newMsg.created_at,
              last_message_by: newMsg.sender_id,
            };

            // ✅ if we are currently viewing the chat, mark read (throttled)
            if (userId) scheduleMarkRead(updated, userId);

            return updated;
          });

          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (readTimerRef.current) {
        clearTimeout(readTimerRef.current);
        readTimerRef.current = null;
      }
    };
  }, [conversationId, userId]);

  async function sendMessage() {
    if (!canSend) {
      alert("You must be logged in");
      return;
    }

    const content = text.trim();
    if (!content) return;

    setText("");

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({
  conversation_id: conversationId,
  sender_id: userId!,
  content,
})

      .select("id,conversation_id,sender_id,content,created_at")
      .single();

    if (error) {
      console.error(error);
      alert("Message failed to send. Check console.");
      return;
    }

    // Add instantly (realtime will also deliver it, dedupe by id)
    setMessages((prev) => {
      if (prev.some((m) => m.id === (inserted as Message).id)) return prev;
      const next = [...prev, inserted as Message];
      if (next.length > 120) next.splice(0, next.length - 120);
      return next;
    });

    // Update conversation summary (fast)
    const { error: upErr } = await supabase
      .from("conversations")
      .update({
        last_message_at: (inserted as Message).created_at,
        last_message_by: userId!,

      })
      .eq("id", conversationId);

    if (upErr) console.error("conversation last_message update failed:", upErr);

    setConvo((prev) => {
  if (!prev) return prev;

  const uid = userId;
  const updated: Conversation = {
    ...prev,
    last_message_at: (inserted as Message).created_at,
    last_message_by: uid,
  };

  if (uid) scheduleMarkRead(updated, uid);
  return updated;
});


    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-950">
        <div className="border-b border-gray-800 px-4 py-3">
          <h1 className="text-lg font-semibold">Chat</h1>
          <p className="text-sm text-gray-400 break-all">Conversation: {conversationId}</p>
        </div>

        <div className="h-[60vh] overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400">No messages yet.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className="mt-1 text-[11px] text-gray-400">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-800 p-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-800 bg-black text-white px-3 py-2 text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
