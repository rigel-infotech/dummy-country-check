import stripe from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") || "US";
  const isUS = country === "US";

  try {
    if (isUS) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Course" },
              unit_amount: 1999,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://dummy-country-check-byja.vercel.app/success",
        cancel_url: "https://dummy-country-check-byja.vercel.app/cancel",
      });
      return new Response(
        JSON.stringify({
          gateway: "stripe",
          url: session.url,
        }),
        {
          headers: { "content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      const keyId = process.env.RAZORPAY_KEY_ID!;
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: 1999 * 100,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        return new Response(
          JSON.stringify({ error: "Order create failed", details: errText }),
          { headers: { "content-type": "application/json" }, status: 500 }
        );
      }

      const order = await orderRes.json();
       return new Response(
        JSON.stringify({
          gateway: "razorpay",
          keyId, // needed by checkout.js
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        }),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    } 
  } catch (error: unknown) {
       return new Response(
      JSON.stringify({ error: error || "Unexpected error" }),
      { headers: { "content-type": "application/json" }, status: 500 }
    );
  }
}
