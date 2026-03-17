import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT for PayPal server calls

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

    const amount = String(body.amount ?? "");
    const currency = String(body.currency ?? "USD");

    const amountNumber = Number(amount);
    if (!amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const base = getPayPalBaseUrl();

    const createRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amountNumber.toFixed(2),
            },
          },
        ],
      }),
    });

    const order = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json(
        { error: "PayPal create order failed", details: order },
        { status: 400 }
      );
    }

    const orderID = order?.id;
    if (!orderID) {
      return NextResponse.json(
        { error: "PayPal did not return an order id", details: order },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderID });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
