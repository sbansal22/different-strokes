/**
 * POST /api/verify-payment — checks that a completed payment really came
 * from Razorpay and was not forged by the browser.
 *
 * Ported from RequestHandler.verify_payment in server.py. Razorpay signs
 * "<order_id>|<payment_id>" with the key secret using HMAC-SHA256 and sends
 * the hex digest back through the browser. Recomputing it server-side and
 * comparing is the whole of the check — this is the one piece of the site
 * where being wrong costs money, so it is also the piece covered by
 * scripts/test_signature.mjs, which asserts byte-for-byte agreement with the
 * Python implementation it replaces.
 */
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_SECRET) {
    return json(500, { error: "Razorpay is not configured" });
  }

  const data = await readJson(request);
  const required = ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"];
  if (!data || typeof data !== "object" || required.some((field) => !data[field])) {
    return json(400, { error: "Missing payment verification fields" });
  }

  const expected = await hmacSha256Hex(
    env.RAZORPAY_KEY_SECRET,
    `${data.razorpay_order_id}|${data.razorpay_payment_id}`,
  );

  if (!timingSafeEqual(expected, data.razorpay_signature)) {
    return json(400, { error: "Payment signature verification failed" });
  }

  return json(200, { success: true, message: "Payment verified successfully" });
}

/** The exact equivalent of hmac.new(secret, message, sha256).hexdigest(). */
export async function hmacSha256Hex(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * The equivalent of hmac.compare_digest: compares every character before
 * answering, so the time taken does not leak how much of a guess was right.
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
