import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getPayPalBaseUrl() {
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET env vars");
  }

  const base = getPayPalBaseUrl();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal token error: ${JSON.stringify(data)}`);

  return data.access_token as string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderID = String(body.orderID ?? "");

    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const base = getPayPalBaseUrl();

    const capRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await capRes.json();

    if (!capRes.ok) {
      return NextResponse.json(
        { error: "PayPal capture failed", details: capture },
        { status: 400 }
      );
    }

    return NextResponse.json({ capture });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
