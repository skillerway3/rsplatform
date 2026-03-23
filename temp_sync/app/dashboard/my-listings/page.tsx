"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Listing = {
  id: string;
  title: string;
  price: number;
  status: string | null;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadListings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("id,title,price,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("loadListings error:", error.message);
    }

    setListings(data || []);
    setLoading(false);
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.log("setStatus error:", error.message);
      alert("Failed to update status.");
      return;
    }

    loadListings();
  }

  async function deleteListing(id: string) {
    const ok = confirm("Delete this listing?");
    if (!ok) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) {
      console.log("deleteListing error:", error.message);
      alert("Failed to delete.");
      return;
    }

    loadListings();
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Listings</h1>

      {listings.length === 0 && (
        <p className="text-gray-400">You have no listings yet.</p>
      )}

      <div className="grid gap-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{listing.title}</p>
              <p>${listing.price}</p>
              <p className="text-sm text-gray-500">
                Status: {listing.status ?? "active"}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={() => setStatus(listing.id, "active")}
                className="bg-blue-600 px-3 py-1 rounded text-white"
              >
                Active
              </button>

              <button
                onClick={() => setStatus(listing.id, "paused")}
                className="bg-yellow-600 px-3 py-1 rounded text-white"
              >
                Pause
              </button>

              <button
                onClick={() => setStatus(listing.id, "sold")}
                className="bg-green-600 px-3 py-1 rounded text-white"
              >
                Sold
              </button>

              <Link
                href={`/dashboard/my-listings/${listing.id}`}
                className="bg-gray-700 px-3 py-1 rounded text-white"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteListing(listing.id)}
                className="bg-red-600 px-3 py-1 rounded text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
