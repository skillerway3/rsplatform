"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Listing = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  price: number;
  game: string;
};

export default function Listings() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("listings")
      .select("id, created_at, title, description, price, game")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setItems(data ?? []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-400">Loading listings...</div>;

  if (error)
    return <div className="p-6 text-red-400 font-semibold">Error: {error}</div>;

  if (!items.length)
    return (
      <div className="p-6 text-gray-400">
        No listings yet. Be the first to create one 🚀
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((l) => (
        <div
          key={l.id}
          className="rounded-2xl border border-gray-800 bg-gray-950 p-5 hover:bg-gray-900 transition"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-gray-200">
              {l.game}
            </span>

            <span className="text-sm font-semibold text-green-400">
              ${l.price}
            </span>
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-100">
            {l.title}
          </h3>

          {l.description && (
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">
              {l.description}
            </p>
          )}

          <div className="mt-4 text-xs text-gray-500">
            {new Date(l.created_at).toLocaleDateString()}
          </div>

          <button className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            View
          </button>
        </div>
      ))}
    </div>
  );
}
