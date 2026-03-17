"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [status, setStatus] = useState<string>("active");

  useEffect(() => {
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadListing() {
    setLoading(true);

    const { data, error } = await supabase
      .from("listings")
      .select("id,title,price,status")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.log("loadListing error:", error?.message);
      setLoading(false);
      return;
    }

    setTitle(data.title ?? "");
    setPrice(String(data.price ?? ""));
    setStatus(data.status ?? "active");
    setLoading(false);
  }

  async function saveChanges() {
    setSaving(true);

    const priceNumber = Number(price);
    if (!title.trim() || Number.isNaN(priceNumber)) {
      alert("Please enter a title and a valid price.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("listings")
      .update({
        title: title.trim(),
        price: priceNumber,
        status,
      })
      .eq("id", id);

    if (error) {
      console.log("saveChanges error:", error.message);
      alert("Failed to save changes.");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/dashboard/my-listings");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Listing</h1>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm">Title</span>
          <input
            className="mt-1 w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm">Price</span>
          <input
            className="mt-1 w-full border rounded p-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm">Status</span>
          <select
            className="mt-1 w-full border rounded p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">active</option>
            <option value="sold">sold</option>
            <option value="paused">paused</option>
          </select>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/dashboard/my-listings")}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={saveChanges}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </main>
  );
}
