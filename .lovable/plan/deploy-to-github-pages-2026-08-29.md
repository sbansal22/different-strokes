# Deploy to GitHub Pages

Your site is a TanStack Start app — GitHub Pages can only serve static files, so we'll configure the app to prerender every page to plain HTML/CSS/JS, then deploy via GitHub Actions. Your site is all content (no login/database), so a fully static export works.

## What I'll set up (in the code)

1. **Static prerendering** — configure the build to output static HTML for all routes:
   - `/` (home), `/about`, `/contact`, `/works`, `/works/:slug`, `/catalogues`, `/catalogues/:year`
   - WebP images and catalogue PDFs copied into the static output
2. **Base path support** — GitHub Pages serves your site at `https://<user>.github.io/<repo-name>/`, so the app must know its base path. I'll make it configurable via an env var so it works both locally and on Pages.
3. **SPA fallback** — add the standard `404.html` copy trick so refreshing a deep link (e.g. `/works/the-north-window`) doesn't 404 on GitHub Pages.
4. **GitHub Actions workflow** (`.github/workflows/deploy.yml`) — on every push to `main`: install deps, build static output, upload to GitHub Pages.

## What YOU need to do (in order)

1. **Connect this project to GitHub** — in Lovable: Plus menu → GitHub → Connect project → authorize the GitHub App → pick your account → create the repository (e.g. `art-portfolio`). Your code gets pushed there.
2. **Enable Pages in the repo** — on GitHub: repo → Settings → Pages → Source: select **"GitHub Actions"** (not "Deploy from a branch").
3. **Push** — the workflow runs automatically and publishes. First run takes ~2–3 minutes.
4. **Visit** `https://<your-username>.github.io/art-portfolio/` — share that link or connect a custom domain in the same Pages settings (recommended for selling art — e.g. `rishitbansal.com`).

## Caveats

- Every content change needs a push to GitHub (editing in Lovable, then syncing) and a ~2 min rebuild. Lovable's own **Publish** button is instant — GitHub Pages is the "own my hosting" option.
- The contact form needs a backend to actually send inquiries; on pure static hosting I'd wire it to a free form service (e.g. Formspree) — say the word and I'll add it.
- Base path: if you later use a custom domain at root, the base path config is already handled.

## Technical details

- Prerender via TanStack Start's static/prerender config in `vite.config.ts` (or the `app.config`-equivalent in this template); output to `dist/` with assets.
- `VITE_BASE_PATH` (default `/art-portfolio/`) injected at build time; router `basepath` + asset URLs respect it.
- Workflow: `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages` — no third-party actions, no secrets needed.
