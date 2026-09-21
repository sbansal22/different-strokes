# Different Strokes

The studio site for Simpy Bansal — www.different-strokes.in.

Built with TanStack Start and prerendered to static HTML, deployed to GitHub
Pages by `.github/workflows/deploy.yml` on every push to `main`.

Artwork content is generated from the description documents in
`content/artworks/` and the photograph archive. See **`scripts/README.md`** for
how to add or change a piece — that is the file you want.

```
npm install        # or bun install
npm run dev        # preview
npm run content    # rebuild artwork data after editing a document or photo
```

## Local checkout server

The site uses Razorpay Standard Web Checkout through `server.py`. The server
keeps `RAZORPAY_KEY_SECRET` on the backend, creates orders, and verifies payment
signatures.

1. Install Python 3.9+ and create a virtual environment: `python3 -m venv .venv`
2. Install dependencies: `.venv/bin/pip install -r requirements.txt`
3. Add Razorpay test credentials to `.env`.
4. Start the site: `.venv/bin/python server.py`
5. Open `http://127.0.0.1:8000`, go to **Request a Quote**, and use **Make a Payment**.

The current credentials are test-mode credentials. Configure a deployed server
or serverless functions before using this checkout in production; GitHub Pages
cannot run the backend endpoints by itself.
