/**
 * Proves the JavaScript signature check agrees with the Python one it
 * replaces, so the Cloudflare port cannot silently start accepting forged
 * payments or rejecting real ones.
 *
 * It asks Python for the expected digest — using hmac/hashlib exactly as
 * server.py does — then asserts the JavaScript produces the same string for
 * every vector, accepts it, and rejects every tampering of it.
 *
 * Run with: npm run test:signature
 */
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { hmacSha256Hex, timingSafeEqual } from "../functions/api/verify-payment.js";

const VECTORS = [
  { secret: "dummysecret", order: "order_MgTsq3rTFVFQQ2", payment: "pay_MgTt0XYZabcdef" },
  { secret: "a", order: "order_1", payment: "pay_1" },
  // Razorpay secrets are alphanumeric, but prove we are byte-identical anyway.
  { secret: "s3cr3t!@#$%^&*()_+-=[]{}|;':\",./<>?", order: "order_X", payment: "pay_Y" },
  { secret: "ünïcødé-sécrèt-🎨", order: "order_ü", payment: "pay_🎨" },
  { secret: "x".repeat(200), order: "order_" + "z".repeat(100), payment: "pay_" + "q".repeat(100) },
  { secret: "trailing space ", order: "order_ a", payment: "pay_ b" },
  { secret: "|pipe|in|secret|", order: "order|withpipe", payment: "pay|withpipe" },
];

const PY = `
import hashlib, hmac, json, sys
for v in json.load(sys.stdin):
    print(hmac.new(v["secret"].encode("utf-8"),
                   (v["order"] + "|" + v["payment"]).encode("utf-8"),
                   hashlib.sha256).hexdigest())
`;

const expected = execFileSync("python3", ["-c", PY], {
  input: JSON.stringify(VECTORS),
  encoding: "utf-8",
}).trim().split("\n");

assert.equal(expected.length, VECTORS.length, "python did not return a digest per vector");

let checks = 0;
for (const [i, v] of VECTORS.entries()) {
  const actual = await hmacSha256Hex(v.secret, `${v.order}|${v.payment}`);

  assert.equal(actual, expected[i], `digest differs from Python for vector ${i}`);
  assert.match(actual, /^[0-9a-f]{64}$/, `vector ${i} is not a 64-char lowercase hex digest`);
  assert.ok(timingSafeEqual(actual, expected[i]), `vector ${i} should verify`);
  checks += 3;

  // Every single-character tampering of a real signature must be rejected.
  for (let pos = 0; pos < actual.length; pos += 1) {
    const flipped =
      actual.slice(0, pos) + (actual[pos] === "0" ? "1" : "0") + actual.slice(pos + 1);
    assert.ok(!timingSafeEqual(actual, flipped), `tampering at ${pos} slipped through`);
    checks += 1;
  }

  // Length games, case games and junk must all be rejected.
  for (const forged of [
    actual.slice(0, -1),
    actual + "0",
    actual.toUpperCase(),
    "",
    " " + actual,
    null,
    undefined,
  ]) {
    assert.ok(!timingSafeEqual(actual, forged), `forgery accepted: ${String(forged).slice(0, 20)}`);
    checks += 1;
  }

  // A different secret must not produce the same digest.
  const wrongSecret = await hmacSha256Hex(v.secret + "x", `${v.order}|${v.payment}`);
  assert.ok(!timingSafeEqual(actual, wrongSecret), `wrong secret verified for vector ${i}`);
  checks += 1;
}

// The "|" separator must actually separate: these two must not collide.
const a = await hmacSha256Hex("k", "order_ab|pay_c");
const b = await hmacSha256Hex("k", "order_a|bpay_c");
assert.notEqual(a, b, "separator is not being applied where Python applies it");
checks += 1;

console.log(`signature port verified against Python — ${checks} assertions across ${VECTORS.length} vectors`);
