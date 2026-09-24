# Deploying the site

The site is hosted on Cloudflare Pages. Render is still set up and still works,
and nothing here removes it, so if anything goes wrong you can point the domain
back at Render and be live again in minutes.

## How it fits together

The site is thirty-nine pages of plain HTML, built ahead of time and committed
to the repo under `dist/client`. Cloudflare serves those files straight from
its own network, close to whoever is asking, with no server to start up. That
is the whole reason for moving: Render ran a Python process that had to wake
from sleep before it could hand over a file, which is what put the loading page
in front of visitors.

Three things still need a server, and only three: handing the browser the
public Razorpay key, opening an order, and checking the signature on a
completed payment. Those live in `functions/api/` and Cloudflare runs each one
only when it is called. `public/_routes.json` is what tells Cloudflare that
nothing else should ever reach them, which keeps ordinary page views on the
free, unmetered path.

The endpoints are a port of the ones in `server.py`, which Sparsh wrote. The
Python is deliberately left in place, unchanged. Both versions answer with the
same JSON and the same status codes, so the browser cannot tell them apart.

## Before you deploy anything

Run the tests:

    npm test

This does two things. It asks Python for the signature digest of a set of
payments, using the same `hmac` and `hashlib` calls `server.py` makes, then
checks the JavaScript produces exactly the same digest — and that it rejects
every single-character alteration of a real signature. Then it runs all three
endpoints with Razorpay stubbed out, covering every rejection the Python
version had: amounts under a rupee, decimals, strings, missing fields, forged
signatures, bad credentials, and Razorpay being down.

If that passes, the port is sound. If it fails, do not deploy.

To run the whole site locally, exactly as Cloudflare will:

    npm run build
    npm run pages:dev

## Where this got to

The Pages project exists and builds from this repo on every push to `main`:
build command `npm run build:static`, output `dist/client`. The Razorpay key
id and secret are stored as encrypted secrets in the Cloudflare dashboard,
not here.

Verified on `different-strokes.pages.dev`: every page serves, unknown URLs
404, and all three payment endpoints answer correctly against the live
Razorpay account — `/api/config` returns the key id, `/api/create-order`
creates a real order, `/api/verify-payment` rejects a forged signature. The
one thing not yet proven is a completed payment, because a card attempt
failed inside Razorpay at the tokenisation step, which is suspected to be
because `.pages.dev` is not the registered domain.

The domain has been added to Cloudflare and its nameservers changed at
GoDaddy from `ns69`/`ns70.domaincontrol.com` to `adrian.ns.cloudflare.com`
and `matt.ns.cloudflare.com`. GoDaddy still owns the registration; only DNS
moved. What remains is attaching the domain to the Pages project, then
retrying a card payment on the real domain.

## What the domain carried

Worth knowing if this ever has to be undone. Before the move,
`different-strokes.in` had exactly three records: an A record on the apex to
`216.24.57.1` (Render), a CNAME on `www` to
`different-strokes-um3k.onrender.com`, and a TXT record
`v=spf1 include:_spf.google.com ~all`. No MX records and no DMARC, so no
email depends on this domain. Cloudflare imported all three.

## The Razorpay keys

The two keys go in the Cloudflare dashboard under Settings, Variables and
Secrets, as Secrets with Encrypt turned on — `RAZORPAY_KEY_ID` and
`RAZORPAY_KEY_SECRET`. Because this repo has a wrangler.toml, Cloudflare will
only accept secrets there, not plain variables, which suits us.

Copy them from Render rather than Razorpay: Razorpay shows the key secret
once, at creation, and never again. Putting them in Cloudflare does not
remove them from Render, so both can run at once — which is what keeps the
rollback real.

Secrets only reach the site on a *new* deployment. After adding or changing
them, redeploy from Deployments, Manage deployment, Retry deployment.

## Test on .pages.dev before touching the domain

Use Razorpay's **test** keys for this, not the live ones. Open the contact page
on the `.pages.dev` address and make a payment with one of Razorpay's test
cards. You are checking three things: that the pages load with no loading
screen, that the Razorpay window opens, and that the payment comes back
verified rather than as an error.

Once that works, swap the environment variables to the live keys and redeploy.

## Moving the domain

`different-strokes.in` is a root domain, so Cloudflare has to answer its DNS.
GoDaddy can point `www` anywhere by name, but a root domain can only be given
a fixed IP address, and Cloudflare Pages does not have one to give — the site
is served from whichever of their locations is nearest the visitor. Only
Cloudflare's own DNS can express that, which is why the nameservers move.
The registration stays at GoDaddy.

Before switching nameservers, check DNSSEC is off at the registrar. If it is
on and the nameservers change, the domain stops resolving entirely. That is
the one way this step genuinely breaks things.

The switch itself is invisible, because Cloudflare imported the records still
pointing at Render. The cutover is the next step: in the Pages project, under
Custom domains, add `different-strokes.in` and `www.different-strokes.in`.
That replaces the two Render records and takes effect in seconds.

## If something goes wrong

Leave the Render service running for a week or two afterwards. It costs
nothing on the free plan and it is a working copy of the site. To go back,
point the DNS records for the domain at Render again — the site returns, cold
start and all, and nothing has been lost.

## What this does not change

`server.py` still runs the site the way it always did, and `npm run content`
and the rest of the scripts are untouched. See `scripts/README.md` for adding
and updating artwork.
