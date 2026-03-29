"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ConversationRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  last_message_by: string | null;
  buyer_last_read_at: string | null;
  seller_last_read_at: string | null;
};

function isUnread(conversation: ConversationRow, uid: string): boolean {
  if (!conversation.last_message_at) return false;
  if (conversation.last_message_by === uid) return false;

  const lastMessageTime = new Date(conversation.last_message_at).getTime();
  const readAt =
    conversation.buyer_id === uid
      ? conversation.buyer_last_read_at
      : conversation.seller_last_read_at;

  if (!readAt) return true;

  return lastMessageTime > new Date(readAt).getTime();
}

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const uid = useMemo(() => user?.id, [user]);

  async function checkUser(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user ?? null);

    if (!user?.id) {
      setUnreadCount(0);
    }
  }

  async function loadUnread(currentUid: string): Promise<void> {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        "id,buyer_id,seller_id,last_message_at,last_message_by,buyer_last_read_at,seller_last_read_at"
      )
      .or(`buyer_id.eq.${currentUid},seller_id.eq.${currentUid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(200);

    if (error) {
      console.error("loadUnread error:", error);
      return;
    }

    const rows: ConversationRow[] = (data ?? []) as ConversationRow[];
    let count = 0;

    for (const conversation of rows) {
      if (isUnread(conversation, currentUid)) {
        count++;
      }
    }

    setUnreadCount(count);
  }

  useEffect(() => {
    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!uid) return;

    void loadUnread(uid);

    const channel = supabase
      .channel(`nav_unread:${uid}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        () => {
          void loadUnread(uid);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          void loadUnread(uid);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid]);

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <nav className="border-b border-gray-800 px-6 md:px-8 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-500">
        RSPlatform
      </Link>

      <div className="flex gap-4 md:gap-6 items-center text-sm md:text-base">
        <Link href="/" className="hover:text-blue-400">
          Home
        </Link>

        <Link href="/browse" className="hover:text-blue-400">
          Browse
        </Link>

        <Link href="/sell" className="hover:text-blue-400">
          Sell
        </Link>

        <Link href="/dashboard/my-listings" className="hover:text-blue-400">
          Dashboard
        </Link>

        <Link href="/inbox" className="hover:text-blue-400 flex items-center gap-2">
          Messages
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link href="/support" className="hover:text-blue-400">
          Support
        </Link>

        {!user ? (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-3 py-2 md:px-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-3 py-2 md:px-4 bg-green-600 rounded-lg hover:bg-green-700 transition"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <span className="hidden md:inline text-sm text-gray-300">
              {user.email}
            </span>

            <button
              onClick={() => {
                void logout();
              }}
              className="px-3 py-2 md:px-4 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}