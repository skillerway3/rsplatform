"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ListingRelation =
  | {
      title: string | null;
      price: number | null;
    }
  | Array<{
      title: string | null;
      price: number | null;
    }>
  | null;

type OrderQueryRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  status: string;
  created_at: string;
  listings: ListingRelation;
};

type OrderRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  status: string;
  created_at: string;
  listing_title?: string;
  listing_price?: number;
};

function getListingData(listings: ListingRelation): {
  title?: string;
  price?: number;
} {
  if (!listings) {
    return {};
  }

  const listing = Array.isArray(listings) ? listings[0] : listings;

  return {
    title: listing?.title ?? undefined,
    price: listing?.price ?? undefined,
  };
}

export default function PurchasesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders(): Promise<void> {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id,listing_id,buyer_id,status,created_at,listings(title,price)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }

    const formatted: OrderRow[] =
      ((data ?? []) as OrderQueryRow[]).map((order) => {
        const listingData = getListingData(order.listings);

        return {
          id: order.id,
          listing_id: order.listing_id,
          buyer_id: order.buyer_id,
          status: order.status,
          created_at: order.created_at,
          listing_title: listingData.title,
          listing_price: listingData.price,
        };
      });

    setOrders(formatted);
    setLoading(false);
  }

  async function markReceived(orderId: string): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId)
      .eq("status", "delivered");

    if (error) {
      alert(error.message);
      return;
    }

    await loadOrders();
  }

  function badge(status: string): string {
    const normalizedStatus = (status || "").toLowerCase();

    if (normalizedStatus === "pending") return "bg-yellow-600";
    if (normalizedStatus === "accepted") return "bg-blue-600";
    if (normalizedStatus === "delivered") return "bg-purple-600";
    if (normalizedStatus === "completed") return "bg-green-600";
    if (normalizedStatus === "cancelled") return "bg-red-600";

    return "bg-gray-700";
  }

  if (loading) {
    return <p className="p-6">Loading purchases...</p>;
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Purchases</h1>

        <Link href="/browse" className="text-blue-500">
          ← Browse
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-400">No purchases yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {order.listing_title ?? "Listing"}
                </p>

                <p className="text-sm text-gray-500">
                  Price: ${Number(order.listing_price ?? 0).toFixed(2)}
                </p>

                <div className="mt-2">
                  <span
                    className={`${badge(
                      order.status
                    )} text-white px-2 py-1 rounded text-xs`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === "delivered" ? (
                  <button
                    onClick={() => {
                      void markReceived(order.id);
                    }}
                    className="bg-green-600 px-3 py-1 rounded text-white"
                  >
                    Mark Received
                  </button>
                ) : (
                  <span className="text-sm text-gray-500">
                    {order.status === "accepted"
                      ? "Waiting for seller delivery…"
                      : order.status === "pending"
                      ? "Waiting for seller accept…"
                      : order.status === "completed"
                      ? "Done ✅"
                      : order.status === "cancelled"
                      ? "Cancelled"
                      : ""}
                  </span>
                )}

                <Link
                  href={`/listing/${order.listing_id}`}
                  className="bg-gray-800 px-3 py-1 rounded text-white"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}