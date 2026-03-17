"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SellPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [game, setGame] = useState("OSRS");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      const user = authData.user;
      if (!user) {
        setMsg("You must be logged in to create a listing.");
        setLoading(false);
        return;
      }

      const priceNumber = Number(price);

      if (!title.trim()) {
        setMsg("Title is required.");
        setLoading(false);
        return;
      }

      if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
        setMsg("Price must be a number greater than 0.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        price: priceNumber,
        game,
        status: "active",
      });

      if (error) throw error;

      setMsg("✅ Listing created!");
      setTitle("");
      setDescription("");
      setPrice("");
      setGame("OSRS");

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
        Create a Listing
      </h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. OSRS Fire Cape Service"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What exactly does the buyer get? Requirements?"
            rows={5}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Price (USD) *</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 25"
              inputMode="decimal"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Game</span>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              style={inputStyle}
            >
              <option value="OSRS">OSRS</option>
              <option value="RS3">RS3</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #222",
            background: loading ? "#ddd" : "#111",
            color: loading ? "#333" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
            marginTop: 6,
          }}
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>

        {msg ? <div style={{ marginTop: 6, fontWeight: 600 }}>{msg}</div> : null}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  outline: "none",
};
