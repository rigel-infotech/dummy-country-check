// app/page.tsx (Client Component for demo button)
"use client";
import { useState } from "react";

export default function PayDemo() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const pay = async () => {
    setLoading(true);
    setLog("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (data.gateway === "stripe") {
        // Redirect to Stripe-hosted Checkout page URL
        // Docs: redirect customers to the Checkout Session’s URL
        window.location.href = data.url;
        return;
      }

      if (data.gateway === "razorpay") {
        // Ensure Razorpay script is loaded
        if (!(window).Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve();
            s.onerror = reject;
            document.body.appendChild(s);
          });
        }

        const options = {
          key: data.keyId, // publishable key
          amount: data.amount,
          currency: data.currency,
          name: "Course",
          description: "One-time purchase",
          order_id: data.orderId, // required
          handler: async function () {
            // TODO: POST response.razorpay_payment_id / _order_id / _signature to your server to verify signature
            // Docs recommend server-side verification of the Razorpay signature
            alert("Payment completed (demo), verify on server!");
          },
          prefill: { name: "Demo User", email: "demo@example.com" },
          theme: { color: "#3399cc" },
        };

        const rzp = new (window).Razorpay(options);
        rzp.open();
        return;
      }

      setLog("Unknown gateway");
    } catch (e) { 
      setLog("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
<main className="p-6 flex flex-col items-start gap-4">
  <h1 className="text-xl font-semibold">
    US → Stripe, others → Razorpay
  </h1>

  <button
    onClick={pay}
    disabled={loading}
    className={`
      relative px-6 py-3 rounded-lg text-white font-medium
      bg-blue-600 hover:bg-blue-700 transition-all duration-200
      disabled:bg-gray-400 disabled:cursor-not-allowed
      flex items-center gap-2
    `}
  >
    {loading && (
      <span
        className="
          h-4 w-4 border-2 border-white border-t-transparent 
          rounded-full animate-spin
        "
      ></span>
    )}
    {loading ? "Processing..." : "Pay now"}
  </button>

  {log ? <pre className="text-red-600 text-sm">{log}</pre> : null}
</main>

  );
}
