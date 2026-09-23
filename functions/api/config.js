/**
 * GET /api/config — hands the browser the *public* Razorpay key id.
 *
 * Ported from the do_GET branch in server.py. The secret key is never sent
 * here: it is only used server-side, to authenticate the order call in
 * create-order and to sign in verify-payment.
 */
export function onRequestGet({ env }) {
  if (!env.RAZORPAY_KEY_ID) {
    return json(500, { error: "Razorpay is not configured" });
  }
  return json(200, { key_id: env.RAZORPAY_KEY_ID });
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
