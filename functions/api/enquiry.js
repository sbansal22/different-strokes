/**
 * POST /api/enquiry — sends the contact form on to the studio's inbox.
 *
 * Replaces Formspree, whose free plan stopped at 50 enquiries a month and
 * put a third party between a buyer's message and the artist. This sends
 * straight from the site, from the studio's own domain, via Resend.
 *
 * The enquirer's address goes in Reply-To rather than From, so replying in
 * Gmail reaches the buyer, while the message itself is sent by a domain we
 * are allowed to send as. Putting the buyer's address in From would be
 * forgery and mail providers treat it as such.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

const MAX = { name: 200, email: 320, message: 8000, work: 200 };

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO || !env.ENQUIRY_FROM) {
    return json(500, { error: "Enquiries are not configured" });
  }

  const data = await readBody(request);
  if (!data) return json(400, { error: "Could not read that form" });

  // The honeypot is hidden from people and invisible to screen readers, so
  // anything in it came from a bot. Answer as though it worked: telling a
  // bot it failed only teaches it to try again differently.
  if ((data._gotcha || "").trim()) return json(200, { ok: true });

  const name = clean(data.name, MAX.name);
  const email = clean(data.email, MAX.email);
  const message = clean(data.message, MAX.message);
  const work = clean(data.work, MAX.work);

  if (!name || !email || !message) {
    return json(400, { error: "Please fill in your name, email and message" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "That email address does not look right" });
  }

  const subject = work
    ? `Enquiry about "${work}" — different-strokes.in`
    : `Enquiry from different-strokes.in`;

  let response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM,
        to: [env.ENQUIRY_TO],
        reply_to: email,
        subject,
        text: [
          `From: ${name} <${email}>`,
          work ? `Work: ${work}` : null,
          "",
          message,
        ].filter((line) => line !== null).join("\n"),
      }),
    });
  } catch {
    return json(502, { error: "Could not send that just now. Please try again." });
  }

  if (!response.ok) {
    return json(502, { error: "Could not send that just now. Please try again." });
  }

  return json(200, { ok: true });
}

/** Accepts either a form post or JSON, so the page can send whichever. */
async function readBody(request) {
  const type = request.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) return await request.json();
    const form = await request.formData();
    return Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  } catch {
    return null;
  }
}

function clean(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
