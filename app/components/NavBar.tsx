"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function isUnread(c: ConversationRow, uid: string) {
  if (!c.last_message_at) return false;
  if (c.last_message_by === uid) return false;

  const last = new Date(c.last_message_at).getTime();

  const readAt =
    c.buyer_id === uid ? c.buyer_last_read_at : c.seller_last_read_at;

  if (!readAt) return true;
  return last > new Date(readAt).getTime();
}

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const uid = useMemo(() => user?.id as string | undefined, [user]);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user ?? null);
    if (!user?.id) setUnreadCount(0);
  }

  async function loadUnread(uid: string) {
    // ✅ fast: only fetch small set of columns
    // ✅ limit: don’t fetch huge amounts
    const { data, error } = await supabase
      .from("conversations")
      .select(
        "id,buyer_id,seller_id,last_message_at,last_message_by,buyer_last_read_at,seller_last_read_at"
      )
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(200);

    if (error) {
      console.error("loadUnread error:", error);
      return;
    }

    const rows = (data ?? []) as ConversationRow[];
    let count = 0;
    for (const c of rows) if (isUnread(c, uid)) count++;
    setUnreadCount(count);
  }

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // When logged in, load unread once, and then refresh on conversation updates
  useEffect(() => {
    if (!uid) return;

    loadUnread(uid);

    const channel = supabase
      .channel(`nav_unread:${uid}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        () => loadUnread(uid)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => loadUnread(uid)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid]);

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
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
            <Link href="/login">
              <button className="px-3 py-2 md:px-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                Login
              </button>
            </Link>

            <Link href="/register">
              <button className="px-3 py-2 md:px-4 bg-green-600 rounded-lg hover:bg-green-700 transition">
                Register
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <span className="hidden md:inline text-sm text-gray-300">
              {user.email}
            </span>

            <button
              onClick={logout}
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
