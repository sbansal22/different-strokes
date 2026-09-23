/**
 * POST /api/create-order — opens a Razorpay order for the given amount.
 *
 * Ported from RequestHandler.create_order in server.py. The Python version
 * used the razorpay SDK; there is no SDK here, but the SDK only wraps one
 * HTTP call with basic auth, so this makes that call directly. The validation
 * rule, the currency, the receipt format and every error message are kept
 * identical, so the browser cannot tell the two apart.
 */
const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json(500, { error: "Razorpay is not configured" });
  }

  const data = await readJson(request);
  const amount = data && typeof data === "object" ? data.amount : null;

  // server.py rejected booleans explicitly because Python's bool is an int.
  // JavaScript has no such trap, but the check is kept so the intent is
  // visible to whoever reads this next to the original.
  if (typeof amount === "boolean" || !Number.isInteger(amount) || amount < 100) {
    return json(400, { error: "Amount must be an integer of at least 100 paise" });
  }

  let response;
  let order;
  try {
    response = await fetch(RAZORPAY_ORDERS_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `different-strokes-${randomHex(6)}`,
      }),
    });
    order = await response.json();
  } catch {
    return json(500, { error: "Unable to create Razorpay order" });
  }

  // server.py sniffed the SDK's exception text for "auth" or "credential".
  // Razorpay answers bad keys with a 401, which is the same thing said plainly.
  if (response.status === 401) {
    return json(401, { error: "Razorpay authentication failed" });
  }
  if (!response.ok || !order || !order.id) {
    return json(500, { error: "Razorpay rejected the order request" });
  }

  return json(200, {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
