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

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("id,title,price")
      .eq("user_id", user.id);

    if (listingsError) {
      console.log("listingsError:", listingsError.message);
      setLoading(false);
      return;
    }

    const listingIds = (listings || []).map((l: any) => l.id);

    if (listingIds.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id,listing_id,buyer_id,status,created_at")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.log("ordersError:", ordersError.message);
      setLoading(false);
      return;
    }

    const listingMap = new Map<string, { title: string; price: number }>();
    (listings || []).forEach((l: any) => {
      listingMap.set(l.id, { title: l.title, price: l.price });
    });

    const merged: OrderRow[] = (ordersData || []).map((o: any) => {
      const info = listingMap.get(o.listing_id);
      return {
        ...o,
        listing_title: info?.title,
        listing_price: info?.price,
      };
    });

    setOrders(merged);
    setLoading(false);
  }

  async function setOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

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

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/dashboard/my-listings" className="text-blue-500">
          ← Back to My Listings
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-400">No orders yet.</p>
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
                    {o.status || "pending"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Buyer ID: {o.buyer_id}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap justify-end">
                {o.status === "pending" && (
                  <>
                    <button
                      onClick={() => setOrderStatus(o.id, "accepted")}
                      className="bg-blue-600 px-3 py-1 rounded text-white"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => setOrderStatus(o.id, "cancelled")}
                      className="bg-red-600 px-3 py-1 rounded text-white"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {o.status === "accepted" && (
                  <>
                    <button
                      onClick={() => setOrderStatus(o.id, "delivered")}
                      className="bg-purple-600 px-3 py-1 rounded text-white"
                    >
                      Mark Delivered
                    </button>

                    <button
                      onClick={() => setOrderStatus(o.id, "cancelled")}
                      className="bg-red-600 px-3 py-1 rounded text-white"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {o.status === "delivered" && (
                  <>
                    <span className="text-sm text-gray-500">
                      Waiting for buyer…
                    </span>
                    <button
                      onClick={() => setOrderStatus(o.id, "cancelled")}
                      className="bg-red-600 px-3 py-1 rounded text-white"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {(o.status === "completed" || o.status === "cancelled") && (
                  <button
                    onClick={() => setOrderStatus(o.id, "pending")}
                    className="bg-gray-700 px-3 py-1 rounded text-white"
                  >
                    Reopen
                  </button>
                )}

                <Link
                  href={`/listing/${o.listing_id}`}
                  className="bg-gray-800 px-3 py-1 rounded text-white"
                >
                  View Listing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
