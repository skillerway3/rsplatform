import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
    // 1) Authenticate user with normal client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Use admin client for privileged writes
    const adminClient = getSupabaseAdmin();

    const body = await req.json().catch(() => ({}));
    const orderID = String(body.orderID ?? "");

    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    // Check if this order has already been processed
    const { data: existingTx } = await adminClient
      .from('wallet_transactions')
      .select('id')
      .eq('external_id', orderID)
      .single();

    if (existingTx) {
      return NextResponse.json({ error: "Order already processed" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const base = getPayPalBaseUrl();

    // Capture the order
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

    // Verify capture status and amount
    const purchaseUnit = capture.purchase_units?.[0];
    const captureStatus = purchaseUnit?.payments?.captures?.[0]?.status;
    const captureAmount = purchaseUnit?.payments?.captures?.[0]?.amount?.value;

    if (captureStatus !== "COMPLETED") {
      return NextResponse.json({ error: "Capture not completed", status: captureStatus }, { status: 400 });
    }

    const amount = Number(captureAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid capture amount" }, { status: 400 });
    }

    // 3) Update user balance and log transaction (Atomic via RPC)
    const { error: rpcErr } = await adminClient.rpc('process_wallet_deposit', {
      p_user_id: user.id,
      p_amount: amount,
      p_external_id: orderID,
      p_description: `Deposit via PayPal (Order: ${orderID})`,
      p_metadata: { paypal_capture: capture }
    });

    if (rpcErr) throw rpcErr;

    // Fetch new balance to return to client
    const { data: profile } = await adminClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ success: true, capture, newBalance: profile?.balance || 0 });
  } catch (err: any) {
    console.error('PayPal capture error:', err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
