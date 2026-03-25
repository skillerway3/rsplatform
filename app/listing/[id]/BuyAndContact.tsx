"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContactSellerButton from "@/app/components/ContactSellerButton";

export default function BuyAndContact({
  listingId,
  sellerId,
}: {
  listingId: string;
  sellerId: string | null;
}) {
  const router = useRouter();
  const [buyLoading, setBuyLoading] = useState(false);

  async function createOrder() {
    setBuyLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      router.push("/login");
      setBuyLoading(false);
      return;
    }

    const { error } = await supabase.from("orders").insert({
      listing_id: listingId,
      buyer_id: user.id,
      status: "pending",
    });

    if (error) {
      alert(error.message);
      setBuyLoading(false);
      return;
    }

    alert("Order created! (Pending)");
    setBuyLoading(false);
  }

  return (
    <>
      <button
        onClick={createOrder}
        disabled={buyLoading}
        className="mt-8 w-full bg-green-600 hover:bg-green-500 rounded-lg py-3 font-semibold disabled:opacity-60"
      >
        {buyLoading ? "Creating order..." : "Request Order"}
      </button>

      <div className="mt-4">
        {sellerId ? (
          <ContactSellerButton listingId={listingId} sellerId={sellerId} />
        ) : (
          <p className="text-sm text-red-400">
            Seller not found on this listing (missing user_id).
          </p>
        )}
      </div>
    </>
  );
}
