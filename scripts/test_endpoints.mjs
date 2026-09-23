/**
 * Exercises the three payment endpoints the way the browser will, with
 * Razorpay's own API stubbed out, so every branch server.py had is checked
 * without spending a real transaction.
 *
 * Run with: npm run test:endpoints
 */
import assert from "node:assert/strict";
import { onRequestGet as config } from "../functions/api/config.js";
import { onRequestPost as createOrder } from "../functions/api/create-order.js";
import {
  onRequestPost as verifyPayment,
  hmacSha256Hex,
} from "../functions/api/verify-payment.js";

const ENV = { RAZORPAY_KEY_ID: "rzp_test_abc123", RAZORPAY_KEY_SECRET: "topsecret" };

const post = (body) =>
  new Request("https://example.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

async function read(response) {
  return { status: response.status, body: await response.json() };
}

/** Swaps in a fake Razorpay for one call and reports what it was sent. */
async function withRazorpay(reply, run) {
  const real = globalThis.fetch;
  let seen = null;
  globalThis.fetch = async (url, init) => {
    seen = { url, init };
    if (reply instanceof Error) throw reply;
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  };
  try {
    return { result: await run(), seen };
  } finally {
    globalThis.fetch = real;
  }
}

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

console.log("/api/config");
await check("returns the public key id", async () => {
  assert.deepEqual(await read(config({ env: ENV })), {
    status: 200,
    body: { key_id: "rzp_test_abc123" },
  });
});
await check("never leaks the secret", async () => {
  const response = await config({ env: ENV }).text();
  assert.ok(!response.includes("topsecret"), "the secret key was sent to the browser");
});
await check("refuses when unconfigured", async () => {
  assert.equal((await read(config({ env: {} }))).status, 500);
});

console.log("/api/create-order");
const TOO_SMALL = "Amount must be an integer of at least 100 paise";
for (const [label, amount] of [
  ["rejects 99 paise", 99],
  ["rejects zero", 0],
  ["rejects negatives", -5000],
  ["rejects decimals", 500.5],
  ["rejects strings", "50000"],
  ["rejects booleans", true],
  ["rejects null", null],
  ["rejects missing", undefined],
  ["rejects NaN", Number.NaN],
]) {
  await check(label, async () => {
    const { result } = await withRazorpay({ status: 200, body: {} }, () =>
      createOrder({ request: post({ amount }), env: ENV }),
    );
    const { status, body } = await read(result);
    assert.equal(status, 400, `${label}: expected 400, got ${status}`);
    assert.equal(body.error, TOO_SMALL);
  });
}
await check("rejects a malformed body", async () => {
  const { result } = await withRazorpay({ status: 200, body: {} }, () =>
    createOrder({ request: post("not json at all"), env: ENV }),
  );
  assert.equal((await read(result)).status, 400);
});
await check("accepts exactly 100 paise", async () => {
  const { result } = await withRazorpay(
    { status: 200, body: { id: "order_1", amount: 100, currency: "INR" } },
    () => createOrder({ request: post({ amount: 100 }), env: ENV }),
  );
  assert.equal((await read(result)).status, 200);
});
await check("sends Razorpay the right call", async () => {
  const { result, seen } = await withRazorpay(
    { status: 200, body: { id: "order_abc", amount: 50000, currency: "INR" } },
    () => createOrder({ request: post({ amount: 50000 }), env: ENV }),
  );
  assert.equal(seen.url, "https://api.razorpay.com/v1/orders");
  assert.equal(seen.init.method, "POST");

  const [scheme, credentials] = seen.init.headers.Authorization.split(" ");
  assert.equal(scheme, "Basic");
  assert.equal(
    Buffer.from(credentials, "base64").toString("utf-8"),
    "rzp_test_abc123:topsecret",
    "basic auth is not the key id and secret",
  );

  const sent = JSON.parse(seen.init.body);
  assert.equal(sent.amount, 50000);
  assert.equal(sent.currency, "INR");
  assert.match(sent.receipt, /^different-strokes-[0-9a-f]{12}$/);

  assert.deepEqual(await read(result), {
    status: 200,
    body: { order_id: "order_abc", amount: 50000, currency: "INR" },
  });
});
await check("uses a fresh receipt each time", async () => {
  const receipts = new Set();
  for (let i = 0; i < 25; i += 1) {
    const { seen } = await withRazorpay(
      { status: 200, body: { id: "order_1", amount: 100, currency: "INR" } },
      () => createOrder({ request: post({ amount: 100 }), env: ENV }),
    );
    receipts.add(JSON.parse(seen.init.body).receipt);
  }
  assert.equal(receipts.size, 25, "receipts repeated");
});
await check("surfaces bad credentials as 401", async () => {
  const { result } = await withRazorpay(
    { status: 401, body: { error: { description: "Authentication failed" } } },
    () => createOrder({ request: post({ amount: 50000 }), env: ENV }),
  );
  const { status, body } = await read(result);
  assert.equal(status, 401);
  assert.equal(body.error, "Razorpay authentication failed");
});
await check("surfaces a rejected order as 500", async () => {
  const { result } = await withRazorpay(
    { status: 400, body: { error: { description: "amount is invalid" } } },
    () => createOrder({ request: post({ amount: 50000 }), env: ENV }),
  );
  const { status, body } = await read(result);
  assert.equal(status, 500);
  assert.equal(body.error, "Razorpay rejected the order request");
});
await check("survives Razorpay being unreachable", async () => {
  const { result } = await withRazorpay(new Error("network down"), () =>
    createOrder({ request: post({ amount: 50000 }), env: ENV }),
  );
  const { status, body } = await read(result);
  assert.equal(status, 500);
  assert.equal(body.error, "Unable to create Razorpay order");
});
await check("refuses when unconfigured", async () => {
  const response = await createOrder({ request: post({ amount: 50000 }), env: {} });
  assert.equal((await read(response)).status, 500);
});

console.log("/api/verify-payment");
const ORDER = "order_MgTsq3rTFVFQQ2";
const PAYMENT = "pay_MgTt0XYZabcdef";
const GOOD = await hmacSha256Hex(ENV.RAZORPAY_KEY_SECRET, `${ORDER}|${PAYMENT}`);

await check("accepts a genuine signature", async () => {
  const response = await verifyPayment({
    request: post({
      razorpay_order_id: ORDER,
      razorpay_payment_id: PAYMENT,
      razorpay_signature: GOOD,
    }),
    env: ENV,
  });
  assert.deepEqual(await read(response), {
    status: 200,
    body: { success: true, message: "Payment verified successfully" },
  });
});
await check("rejects a forged signature", async () => {
  const response = await verifyPayment({
    request: post({
      razorpay_order_id: ORDER,
      razorpay_payment_id: PAYMENT,
      razorpay_signature: "0".repeat(64),
    }),
    env: ENV,
  });
  const { status, body } = await read(response);
  assert.equal(status, 400);
  assert.equal(body.error, "Payment signature verification failed");
});
await check("rejects a signature for a different payment", async () => {
  const response = await verifyPayment({
    request: post({
      razorpay_order_id: ORDER,
      razorpay_payment_id: "pay_somethingelse",
      razorpay_signature: GOOD,
    }),
    env: ENV,
  });
  assert.equal((await read(response)).status, 400);
});
for (const missing of [
  "razorpay_order_id",
  "razorpay_payment_id",
  "razorpay_signature",
]) {
  await check(`rejects a body without ${missing}`, async () => {
    const payload = {
      razorpay_order_id: ORDER,
      razorpay_payment_id: PAYMENT,
      razorpay_signature: GOOD,
    };
    delete payload[missing];
    const response = await verifyPayment({ request: post(payload), env: ENV });
    const { status, body } = await read(response);
    assert.equal(status, 400);
    assert.equal(body.error, "Missing payment verification fields");
  });
}
await check("rejects an empty body", async () => {
  const response = await verifyPayment({ request: post("{}"), env: ENV });
  assert.equal((await read(response)).status, 400);
});
await check("refuses when unconfigured", async () => {
  const response = await verifyPayment({ request: post({}), env: {} });
  assert.equal((await read(response)).status, 500);
});

console.log(`\n${passed} endpoint checks passed`);
