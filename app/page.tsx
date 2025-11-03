import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") || "IN";

  const currency = country === "IN" ? "INR" : "USD";
  return (
    <main style={{ padding: 24 }}>
      <h1>Geo test (Vercel)</h1>
      <p>Country code : {country}</p>
      <p>Currency : {currency}</p>
    </main>
  );
}
