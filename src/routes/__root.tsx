import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { site, shareImage, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT } from "@/data/site";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Different Strokes — Simpy Bansal" },
      {
        name: "description",
        content:
          "Original paintings, functional art and sculpture by Simpy Bansal, made one piece at a time and available directly from the studio.",
      },
      { name: "author", content: "Simpy Bansal" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: "en_IN" },
      { property: "og:image", content: shareImage() },
      { property: "og:image:width", content: SHARE_IMAGE_WIDTH },
      { property: "og:image:height", content: SHARE_IMAGE_HEIGHT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: shareImage() },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Inter:wght@400;500;600&display=swap",
      },
      // The "ds" monogram from the studio logo. Rebuild with `npm run icons`.
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/icon.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * The previous site was a single page, so every link anyone has shared or
 * bookmarked is an anchor on "/". A hash never reaches the server, so these
 * can only be translated in the browser, once, on first load.
 */
const LEGACY_HASHES: Record<string, { to: string; search?: Record<string, string> }> = {
  "#home": { to: "/" },
  "#about": { to: "/about" },
  "#catalogues": { to: "/catalogues" },
  "#contact": { to: "/contact" },
  "#sculptures": { to: "/works", search: { category: "sculpture" } },
  "#painting-canvas": { to: "/works", search: { category: "paintings", type: "Canvas" } },
  "#painting-ceramic": { to: "/works", search: { category: "paintings", type: "Ceramic" } },
  "#painting-glass": { to: "/works", search: { category: "paintings", type: "Glass" } },
  "#painting-soft-pastel": {
    to: "/works",
    search: { category: "paintings", type: "Soft Pastel" },
  },
  "#functional-cabinet": {
    to: "/works",
    search: { category: "functional-art", type: "Cabinet" },
  },
  "#functional-console": {
    to: "/works",
    search: { category: "functional-art", type: "Console" },
  },
};

function LegacyHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const target = LEGACY_HASHES[window.location.hash.toLowerCase()];
    if (!target) return;
    // Drop the hash first so a back navigation does not bounce again.
    window.history.replaceState(null, "", window.location.pathname);
    void router.navigate({ to: target.to, search: target.search ?? {}, replace: true });
  }, [router]);

  return null;
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LegacyHashRedirect />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
