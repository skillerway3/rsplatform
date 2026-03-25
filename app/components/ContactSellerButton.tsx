"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  listingId: string;
  sellerId: string;
};

export default function ContactSellerButton({ listingId, sellerId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);

    // 1) must be logged in
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const me = userData.user?.id;

    if (userErr || !me) {
      setLoading(false);
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    // 2) prevent chatting yourself
    if (me === sellerId) {
      setLoading(false);
      alert("You are the seller of this listing.");
      return;
    }

    // 3) find existing conversation (if already created)
    const { data: existing, error: findErr } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .or(`and(buyer_id.eq.${me},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${me})`)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error(findErr);
      setLoading(false);
      alert("Failed to check existing conversation. See console.");
      return;
    }

    if (existing?.id) {
      setLoading(false);
      router.push(`/chat/${existing.id}`);
      return;
    }

    // 4) create new conversation
    const { data: created, error: createErr } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: me,
        seller_id: sellerId,
      })
      .select("id")
      .single();

    if (createErr) {
      console.error(createErr);
      setLoading(false);
      alert("Failed to create conversation (RLS?). See console.");
      return;
    }

    setLoading(false);
    router.push(`/chat/${created.id}`);
  }

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
    >
      {loading ? "Opening..." : "Contact Seller"}
    </button>
  );
}
