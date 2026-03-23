"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalButton({
  listingId,
  amount,
  buyerId,
}: {
  listingId: string;
  amount: number;
  buyerId: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="text-sm text-red-400">
        Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID
      </div>
    );
  }

  if (!buyerId) {
    return (
      <div className="text-sm text-red-400">
        You must be logged in to complete payment.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        components: "buttons",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listingId,
              amount: amount.toFixed(2),
              currency: "USD",
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            console.error("create-order failed:", res.status, data);
            throw new Error(data?.error || "create-order failed");
          }

          if (!data?.orderID) {
            console.error("create-order missing orderID:", data);
            throw new Error("Missing orderID");
          }

          return data.orderID as string;
        }}
        onApprove={async (data) => {
          const orderID = data.orderID;

          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderID,
              listingId,
              buyerId,
            }),
          });

          const out = await res.json();

          if (!res.ok) {
            console.error("capture-order failed:", res.status, out);
            throw new Error(out?.error || "capture-order failed");
          }

          console.log("✅ Captured:", out.capture);
          console.log("✅ Order saved:", out.order);
          alert("Payment captured and order saved!");
        }}
      />
    </PayPalScriptProvider>
  );
}