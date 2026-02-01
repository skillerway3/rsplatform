"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg("Logged in successfully ✅");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#050a12",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 20,
          color: "white",
        }}
      >
        <h1 style={{ margin: "0 0 14px", textAlign: "center" }}>Login</h1>

        <label style={{ display: "block", marginBottom: 6, opacity: 0.9 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Email"
          style={inputStyle}
        />

        <label style={{ display: "block", margin: "12px 0 6px", opacity: 0.9 }}>
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          placeholder="Password"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 14,
            height: 44,
            borderRadius: 10,
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {msg && (
          <p style={{ marginTop: 12, color: "#93c5fd", fontSize: 14, textAlign: "center" }}>
            {msg}
          </p>
        )}
        {err && (
          <p style={{ marginTop: 12, color: "#fca5a5", fontSize: 14, textAlign: "center" }}>
            {err}
          </p>
        )}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  padding: "0 12px",
  color: "white",
  outline: "none",
};
