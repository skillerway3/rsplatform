"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type OrderRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  status: string;
  created_at: string;
  listing_title?: string;
  listing_price?: number;
};

export default function PurchasesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id,listing_id,buyer_id,status,created_at, listings(title,price)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }

    const formatted =
      data?.map((o: any) => ({
        ...o,
        listing_title: o.listings?.title,
        listing_price: o.listings?.price,
      })) || [];

    setOrders(formatted);
    setLoading(false);
  }

  async function markReceived(orderId: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId)
      .eq("status", "delivered"); // IMPORTANT: only allow if delivered

    if (error) {
      alert(error.message);
      return;
    }

    loadOrders();
  }

  function badge(status: string) {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "bg-yellow-600";
    if (s === "accepted") return "bg-blue-600";
    if (s === "delivered") return "bg-purple-600";
    if (s === "completed") return "bg-green-600";
    if (s === "cancelled") return "bg-red-600";
    return "bg-gray-700";
  }

  if (loading) return <p className="p-6">Loading purchases...</p>;

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
          {orders.map((o) => (
            <div
              key={o.id}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{o.listing_title ?? "Listing"}</p>
                <p className="text-sm text-gray-500">
                  Price: ${Number(o.listing_price ?? 0).toFixed(2)}
                </p>

                <div className="mt-2">
                  <span
                    className={`${badge(
                      o.status
                    )} text-white px-2 py-1 rounded text-xs`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {o.status === "delivered" ? (
                  <button
                    onClick={() => markReceived(o.id)}
                    className="bg-green-600 px-3 py-1 rounded text-white"
                  >
                    Mark Received
                  </button>
                ) : (
                  <span className="text-sm text-gray-500">
                    {o.status === "accepted"
                      ? "Waiting for seller delivery…"
                      : o.status === "pending"
                      ? "Waiting for seller accept…"
                      : o.status === "completed"
                      ? "Done ✅"
                      : o.status === "cancelled"
                      ? "Cancelled"
                      : ""}
                  </span>
                )}

                <Link
                  href={`/listing/${o.listing_id}`}
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
