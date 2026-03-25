"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;

  last_message_at: string | null;
  last_message_by: string | null;

  buyer_last_read_at: string | null;
  seller_last_read_at: string | null;
};

type ListingTitleRow = { id: string; title: string | null };

export default function InboxPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [listingTitles, setListingTitles] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  async function loadInbox(uid: string) {
    setLoading(true);

    // 1) fetch conversations (FAST) — no join, LIMIT
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        "id,listing_id,buyer_id,seller_id,created_at,last_message_at,last_message_by,buyer_last_read_at,seller_last_read_at"
      )
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) console.error("Inbox conversations error:", error);

    const rows = (conversations as Conversation[]) ?? [];
    setConvos(rows);

    // 2) fetch listing titles in ONE batch (FAST)
    const listingIds = Array.from(new Set(rows.map((c) => c.listing_id).filter(Boolean)));

    if (listingIds.length === 0) {
      setListingTitles({});
      setLoading(false);
      return;
    }

    const { data: titles, error: tErr } = await supabase
      .from("listings")
      .select("id,title")
      .in("id", listingIds);

    if (tErr) console.error("Listing titles error:", tErr);

    const map: Record<string, string | null> = {};
    (titles as ListingTitleRow[] | null)?.forEach((r) => {
      map[r.id] = r.title ?? null;
    });

    setListingTitles(map);
    setLoading(false);
  }

  useEffect(() => {
    let alive = true;

    // A) initial check
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;

      if (!alive) return;

      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      await loadInbox(uid);
    })();

    // B) IMPORTANT: listen for login/logout and refresh inbox
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        setConvos([]);
        setListingTitles({});
        setLoading(false);
        return;
      }

      await loadInbox(uid);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="mt-4 text-gray-400">Loading inbox...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <p className="mt-2 text-gray-400">Please log in to see your messages.</p>
        <Link className="text-blue-400 underline" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Inbox</h1>

      {convos.length === 0 ? (
        <p className="mt-4 text-gray-400">No conversations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {convos.map((c) => {
            const otherPerson = c.buyer_id === userId ? c.seller_id : c.buyer_id;
            const lastAt = c.last_message_at ?? c.created_at;

            const isSeller = userId === c.seller_id;
            const lastRead = isSeller ? c.seller_last_read_at : c.buyer_last_read_at;

            const hasNew =
              !!c.last_message_by &&
              c.last_message_by !== userId &&
              (!lastRead || new Date(lastAt) > new Date(lastRead));

            const title = listingTitles[c.listing_id] ?? null;

            return (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block rounded-xl border border-gray-800 bg-gray-950 p-4 hover:bg-gray-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400">Listing</p>
                    <p className="font-semibold truncate">{title ?? c.listing_id}</p>
                    <p className="mt-1 text-xs text-gray-500 break-all">With: {otherPerson}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">{new Date(lastAt).toLocaleString()}</p>
                    {hasNew && <p className="mt-1 text-xs text-green-400">New message</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
