/**
 * Exercises the enquiry endpoint with Resend stubbed out, so every branch is
 * checked without sending mail or spending the daily allowance.
 *
 * Run with: npm run test:enquiry
 */
import assert from "node:assert/strict";
import { onRequestPost as enquiry } from "../functions/api/enquiry.js";

const ENV = {
  RESEND_API_KEY: "re_test_key",
  ENQUIRY_TO: "studio@example.test",
  ENQUIRY_FROM: "Different Strokes <enquiries@different-strokes.in>",
};

const post = (body, json = true) =>
  new Request("https://example.test/api/enquiry", {
    method: "POST",
    headers: json ? { "Content-Type": "application/json" } : undefined,
    body: json ? JSON.stringify(body) : body,
  });

/** Swaps in a fake Resend for one call and reports what it was sent. */
async function withResend(reply, run) {
  const real = globalThis.fetch;
  let seen = null;
  globalThis.fetch = async (url, init) => {
    seen = { url, init, body: init?.body ? JSON.parse(init.body) : null };
    if (reply instanceof Error) throw reply;
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
  };
  try {
    return { response: await run(), seen };
  } finally {
    globalThis.fetch = real;
  }
}

const read = async (r) => ({ status: r.status, body: await r.json() });
const ok = { status: 200, body: { id: "abc" } };

let passed = 0;
const check = async (name, fn) => { await fn(); passed += 1; console.log(`  ok  ${name}`); };

const VALID = { name: "Jane Doe", email: "jane@example.com", message: "Is The Tree still available?" };

await check("sends a well-formed enquiry", async () => {
  const { response, seen } = await withResend(ok, () => enquiry({ request: post(VALID), env: ENV }));
  assert.deepEqual(await read(response), { status: 200, body: { ok: true } });

  assert.equal(seen.url, "https://api.resend.com/emails");
  assert.equal(seen.init.headers.Authorization, "Bearer re_test_key");
  assert.equal(seen.body.from, ENV.ENQUIRY_FROM);
  assert.deepEqual(seen.body.to, [ENV.ENQUIRY_TO]);
  // The buyer's address must be Reply-To, never From — putting it in From is
  // forgery and gets the mail filed as spam or rejected outright.
  assert.equal(seen.body.reply_to, VALID.email);
  assert.ok(seen.body.text.includes(VALID.message), "message body not included");
  assert.ok(seen.body.text.includes(VALID.email), "sender address not included");
});

await check("names the work in the subject when given one", async () => {
  const { seen } = await withResend(ok, () =>
    enquiry({ request: post({ ...VALID, work: "The Tree" }), env: ENV }));
  assert.match(seen.body.subject, /The Tree/);
  assert.ok(seen.body.text.includes("Work: The Tree"));
});

await check("falls back to a generic subject without one", async () => {
  const { seen } = await withResend(ok, () => enquiry({ request: post(VALID), env: ENV }));
  assert.match(seen.body.subject, /Enquiry from/);
  assert.ok(!seen.body.text.includes("Work:"));
});

await check("accepts a plain form post as well as JSON", async () => {
  const form = new FormData();
  for (const [k, v] of Object.entries(VALID)) form.append(k, v);
  const { response, seen } = await withResend(ok, () =>
    enquiry({ request: post(form, false), env: ENV }));
  assert.equal((await read(response)).status, 200);
  assert.equal(seen.body.reply_to, VALID.email);
});

await check("silently swallows anything that fills the honeypot", async () => {
  let called = false;
  const real = globalThis.fetch;
  globalThis.fetch = async () => { called = true; return new Response("{}", { status: 200 }); };
  try {
    const response = await enquiry({ request: post({ ...VALID, _gotcha: "bot" }), env: ENV });
    // Answers as though it worked, but sends nothing: telling a bot it failed
    // only teaches it to try again differently.
    assert.deepEqual(await read(response), { status: 200, body: { ok: true } });
    assert.equal(called, false, "a honeypot submission was actually sent");
  } finally { globalThis.fetch = real; }
});

for (const [label, body] of [
  ["rejects a missing name", { ...VALID, name: "" }],
  ["rejects a missing email", { ...VALID, email: "" }],
  ["rejects a missing message", { ...VALID, message: "" }],
  ["rejects whitespace-only input", { name: " ", email: " ", message: " " }],
]) {
  await check(label, async () => {
    const { response } = await withResend(ok, () => enquiry({ request: post(body), env: ENV }));
    assert.equal((await read(response)).status, 400);
  });
}

for (const bad of ["notanemail", "no@domain", "@example.com", "a b@example.com", "a@b"]) {
  await check(`rejects the address ${JSON.stringify(bad)}`, async () => {
    const { response } = await withResend(ok, () =>
      enquiry({ request: post({ ...VALID, email: bad }), env: ENV }));
    assert.equal((await read(response)).status, 400);
  });
}

await check("truncates an enormous message rather than forwarding it whole", async () => {
  const { seen } = await withResend(ok, () =>
    enquiry({ request: post({ ...VALID, message: "x".repeat(50000) }), env: ENV }));
  assert.ok(seen.body.text.length < 12000, "message was not capped");
});

await check("reports a Resend failure without claiming success", async () => {
  const { response } = await withResend({ status: 422, body: { message: "bad" } }, () =>
    enquiry({ request: post(VALID), env: ENV }));
  const { status, body } = await read(response);
  assert.equal(status, 502);
  assert.ok(body.error);
});

await check("survives Resend being unreachable", async () => {
  const { response } = await withResend(new Error("network down"), () =>
    enquiry({ request: post(VALID), env: ENV }));
  assert.equal((await read(response)).status, 502);
});

await check("refuses when unconfigured", async () => {
  const response = await enquiry({ request: post(VALID), env: {} });
  assert.equal((await read(response)).status, 500);
});

await check("never leaks the API key to the browser", async () => {
  const { response } = await withResend(ok, () => enquiry({ request: post(VALID), env: ENV }));
  assert.ok(!(await response.text()).includes("re_test_key"));
});

console.log(`\n${passed} enquiry checks passed`);
