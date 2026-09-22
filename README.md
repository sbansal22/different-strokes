# Different Strokes

The studio site for Simpy Bansal — www.different-strokes.in

## How this repo is laid out

    src/  content/  scripts/     the source — how the site is built
    dist/client/                 the actual website, and the only thing served
    server.py                    the server Render runs

`server.py` serves **`dist/client` only**. The source, the content documents
and `.git` are never reachable over the web.

Render does not build the site. **You build it here and commit the result**, so
after changing anything run:

    npm run content      # only if you changed a description or a photograph
    npm run build
    git add -A && git commit && git push

`npm run build` writes `dist/client`, and pushing it is what puts it live.

See **`scripts/README.md`** for adding or changing an artwork — that is the
file you want day to day.

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
