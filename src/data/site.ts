import artistPortrait from "@/assets/artist-portrait.webp";
import studioHero from "@/assets/studio-hero.webp";
import logo from "@/assets/logo.webp";

export { artistPortrait, studioHero, logo };

/** Everything about the studio that appears in more than one place. */
export const site = {
  name: "Different Strokes",
  artist: "Simpy Bansal",
  since: 2001,
  tagline: "Artist @ Different Strokes",
  email: "differentstrokes2001@gmail.com",
  phone: "+91 98996-95607",
  phoneHref: "tel:+919899695607",
  instagram: "https://www.instagram.com/differentstrokes2001/",
  instagramHandle: "@differentstrokes2001",
  domain: "www.different-strokes.in",
  url: "https://www.different-strokes.in",
} as const;

/**
 * Absolute URL of a page's share image. Link previews are fetched by scrapers
 * that do not run JavaScript and do not resolve relative paths, so these live
 * in public/og/ under a stable name and are always fully qualified.
 * Built by scripts/build_share_images.py.
 */
export const shareImage = (slug?: string): string => `${site.url}/og/${slug ?? "default"}.jpg`;

export const SHARE_IMAGE_WIDTH = "1200";
export const SHARE_IMAGE_HEIGHT = "630";

/** Absolute URL for a route, for og:url and canonical links. */
export const canonical = (path: string): string =>
  `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
