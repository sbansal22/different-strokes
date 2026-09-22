// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Base path for static hosting (GitHub Pages serves at /<repo-name>/).
// Set VITE_BASE_PATH at build time; defaults to "/" for Lovable hosting and local dev.
const base = process.env["VITE_BASE_PATH"] ?? "/";

// Static deploys (GitHub Actions) set STATIC_BUILD=true: this skips the nitro
// server build entirely so the output is plain HTML/CSS/JS in dist/client.
// Lovable's own builds leave nitro untouched.
const isStaticBuild = process.env["STATIC_BUILD"] === "true";

export default defineConfig({
  vite: {
    base,
  },
  ...(isStaticBuild ? { nitro: false as const } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Prerender every reachable page to static HTML so the site can be served
    // from GitHub Pages without a server.
    prerender: {
      enabled: true,
      crawlLinks: true,
      autoSubfolderIndex: true,
      failOnError: false,
      // crawlLinks follows <a href> too, so a linked PDF gets fetched and its
      // body written back out as a UTF-8 string, corrupting the binary. Skip
      // anything that is a file rather than a page.
      //
      // Query strings are skipped as well: a static host ignores them when
      // resolving a file, so every /contact?work=... prerenders to the same
      // contact/index.html and the last one wins, leaving the plain /contact
      // page pre-filled with whichever work crawled last. The form fills
      // itself in from the URL on the client anyway.
      filter: ({ path }: { path: string }) =>
        !path.includes("?") &&
        !/\.(pdf|zip|docx?|xlsx?|pptx?|png|jpe?g|webp|gif|svg|ico|mp4|mov)$/i.test(
          path,
        ),
    },
  },
});
