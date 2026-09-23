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

## Who has to be involved

Two things are not in this repo's control, and both sit with Sparsh:

- **The GitHub repository.** Connecting Cloudflare Pages to it needs whoever
  owns the repo to authorise Cloudflare's GitHub app. A collaborator cannot do
  this.
- **The domain.** `different-strokes.in` is a root domain, so Cloudflare has to
  run its DNS, which means changing the nameservers at the registrar. That is
  the registrar account holder's job.

Because the domain needs him anyway, the Git route costs almost nothing extra
over the alternative below, and is the better setup.

## Two ways to create the project

**Git integration (preferred).** Cloudflare rebuilds the site on every push.
Nothing has to be built by hand and the committed copy can never drift.
Requires the repo authorisation above.

In the Cloudflare dashboard: Workers & Pages, Create, Pages, Connect to Git,
then pick the repository. Build settings are framework preset None, build
command `npm run build:static`, output directory `dist/client`, root directory
empty.

**Direct upload (fallback).** Build on a laptop and push the result up with
`npx wrangler pages deploy dist/client`, run from the repo root so the
`functions/` directory goes with it. Needs no repo access from anyone.

Be careful with this one: Cloudflare does not allow a direct-upload project to
be converted to Git integration later. Switching means a new project, a new
`.pages.dev` address and pointing the domain again. It is fine for a throwaway
project used to prove the site works; think twice before the real one is
created this way.

## The Razorpay keys

Whichever route, the two keys go in the dashboard under Settings, Variables and
Secrets, for the Production environment: `RAZORPAY_KEY_ID` and
`RAZORPAY_KEY_SECRET`, with Encrypt turned on for the secret.

Copy them from Render, not from Razorpay. Razorpay shows the key secret once,
at the moment it is created, and never again — Render holds the working copy.
Putting them in Cloudflare does not remove them from Render; both can run on
the same pair, which is what makes the rollback real.

Use the **test** pair first. Test and live are separate pairs in Razorpay.

## Test on .pages.dev before touching the domain

Use Razorpay's **test** keys for this, not the live ones. Open the contact page
on the `.pages.dev` address and make a payment with one of Razorpay's test
cards. You are checking three things: that the pages load with no loading
screen, that the Razorpay window opens, and that the payment comes back
verified rather than as an error.

Once that works, swap the environment variables to the live keys and redeploy.

## Moving the domain

`different-strokes.in` is a root domain, so Cloudflare has to run its DNS.
This is the only step that can take the site down if it goes wrong, so do it
deliberately, and not late at night.

1. Add `different-strokes.in` as a site in Cloudflare. It will read the
   existing DNS records from your registrar and show you a list.
2. **Check that list before continuing.** Any MX records for email on this
   domain have to come across too, or mail stops arriving. If the list looks
   short or is missing something you recognise, stop and compare it against
   the registrar before going further.
3. Change the nameservers at the registrar to the two Cloudflare gives you.
   This takes anywhere from a few minutes to a few hours to take effect.
4. In the Pages project, under **Custom domains**, add `different-strokes.in`
   and `www.different-strokes.in`.

## If something goes wrong

Leave the Render service running for a week or two afterwards. It costs
nothing on the free plan and it is a working copy of the site. To go back,
point the DNS records for the domain at Render again — the site returns, cold
start and all, and nothing has been lost.

## What this does not change

`server.py` still runs the site the way it always did, and `npm run content`
and the rest of the scripts are untouched. See `scripts/README.md` for adding
and updating artwork.
