import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getArtwork, adjacentArtworks } from "@/data/artworks";
import { site, shareImage, canonical, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT } from "@/data/site";

const TBC = "To be confirmed";

export const Route = createFileRoute("/works/$slug")({
  loader: ({ params }) => {
    const artwork = getArtwork(params.slug);
    if (!artwork) throw notFound();
    return { artwork, ...adjacentArtworks(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Work not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { artwork } = loaderData;
    const parts = [artwork.title, artwork.medium, artwork.dimensions].filter(Boolean);
    const title = `${parts.join(" — ")} · Different Strokes`;
    const summary = (artwork.blurb ?? artwork.description ?? artwork.title).slice(0, 155);
    const url = canonical(`/works/${artwork.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: summary },
        { property: "og:title", content: title },
        { property: "og:description", content: summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: shareImage(artwork.slug) },
        { property: "og:image:width", content: SHARE_IMAGE_WIDTH },
        { property: "og:image:height", content: SHARE_IMAGE_HEIGHT },
        {
          property: "og:image:alt",
          content: `${artwork.title} by ${site.artist}`,
        },
        { name: "twitter:image", content: shareImage(artwork.slug) },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: WorkNotFound,
  component: WorkDetail,
});

function WorkNotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-32 sm:px-10">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-5 text-4xl text-ink">This piece isn't in the collection.</h1>
        <Link
          to="/works"
          className="mt-8 inline-block text-sm text-ink transition-colors hover:text-clay"
        >
          Back to all works →
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function Lightbox({
  image,
  onClose,
}: {
  image: { src: string; alt: string; caption: string };
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Stop the page behind scrolling while the overlay is open.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center bg-ink/95 p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-5 text-2xl leading-none text-paper/70 transition-colors hover:text-paper"
      >
        ×
      </button>
      <img
        src={image.src}
        alt={image.alt}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[88vh] max-w-full cursor-default object-contain"
      />
      <p className="mt-4 text-xs text-paper/60">{image.caption}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-6 py-3 text-sm">
      <dt className="text-stone">{label}</dt>
      <dd className={value ? "text-right text-ink" : "text-right text-stone/60 italic"}>
        {value ?? TBC}
      </dd>
    </div>
  );
}

function WorkDetail() {
  const { artwork, previous, next } = Route.useLoaderData();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = artwork.images[activeIndex] ?? artwork.images[0];
  const closeZoom = useCallback(() => setZoomed(false), []);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
          <Link to="/works" className="text-sm text-stone transition-colors hover:text-ink">
            ← All works
          </Link>

          <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="art-fade lg:col-span-7">
              {active ? (
                <>
                  <button
                    type="button"
                    onClick={() => setZoomed(true)}
                    aria-label={`Zoom in on ${artwork.title}`}
                    className="block w-full cursor-zoom-in"
                  >
                    <img
                      key={active.src}
                      src={active.src}
                      alt={active.alt}
                      width={active.width}
                      height={active.height}
                      className="art-fade max-h-[75vh] w-full rounded-sm object-contain"
                    />
                  </button>
                  <p className="mt-3 flex items-center justify-between gap-4 text-xs text-stone/80">
                    <span>{active.caption}</span>
                    <span className="text-stone/60">Click to enlarge</span>
                  </p>
                </>
              ) : (
                <div className="flex aspect-4/5 w-full items-center justify-center rounded-sm bg-linen">
                  <p className="max-w-[24ch] text-center text-sm text-stone">
                    This piece is being photographed.
                  </p>
                </div>
              )}

              {artwork.images.length > 1 && (
                <div className="mt-5 grid grid-cols-4 gap-4 sm:grid-cols-6">
                  {artwork.images.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`View ${image.caption}`}
                      aria-current={index === activeIndex}
                      className={`overflow-hidden rounded-xs transition-opacity ${
                        index === activeIndex
                          ? "opacity-100 ring-1 ring-clay"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image.thumb}
                        alt={image.alt}
                        loading="lazy"
                        width={image.width}
                        height={image.height}
                        className="aspect-4/5 w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="art-fade-2 lg:col-span-5 lg:sticky lg:top-10">
              {artwork.discipline && <p className="eyebrow">{artwork.discipline}</p>}
              <h1 className="mt-4 max-w-[24ch] text-4xl leading-tight text-balance text-ink sm:text-5xl">
                {artwork.title}
              </h1>

              {artwork.oneLiner && (
                <p className="mt-5 max-w-[40ch] font-display text-lg leading-snug text-pretty text-clay">
                  {artwork.oneLiner}
                </p>
              )}

              {artwork.description ? (
                <div className="mt-6 max-w-[44ch] space-y-4 text-base leading-relaxed text-pretty text-ink/80">
                  {artwork.description.split("\n\n").map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              ) : artwork.blurb ? (
                <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-pretty text-ink/80">
                  {artwork.blurb}
                </p>
              ) : null}

              <dl className="mt-8 divide-y divide-line/70 border-t border-line">
                <SpecRow label="Dimensions" value={artwork.dimensions} />
                <SpecRow label="Material" value={artwork.medium} />
                {artwork.year && <SpecRow label="Year" value={artwork.year} />}
                <SpecRow label="Availability" value={artwork.status} />
              </dl>

              {artwork.status === "Sold" ? (
                <p className="mt-8 text-sm text-stone">
                  This piece has found a home. Write to me about a commission in the same spirit.
                </p>
              ) : (
                <p className="mt-8 text-sm leading-relaxed text-stone">
                  An original, one of a kind. Price on request — write and I'll answer with
                  everything you need, including delivery.
                </p>
              )}

              {!artwork.description && (
                <p className="mt-4 text-sm leading-relaxed text-stone/80 italic">
                  I'm still writing the note that goes with this piece. Ask me about it in the
                  meantime.
                </p>
              )}

              <div className="mt-6">
                <Link
                  to="/contact"
                  search={{ work: artwork.title }}
                  className="inline-flex items-center rounded-xs bg-clay px-6 py-2.5 text-sm text-paper ring-1 ring-clay/20 transition-colors hover:bg-clay/90"
                >
                  {artwork.status === "Sold"
                    ? "Enquire about a commission"
                    : "Enquire about this work"}
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-stone/70">
                Every work leaves the studio with a signed{" "}
                <a
                  href={`${import.meta.env.BASE_URL}certificate_of_authenticity.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-ink"
                >
                  certificate of authenticity
                </a>
                .
              </p>
            </div>
          </div>
        </section>
        {(previous || next) && (
          <nav
            aria-label="More works"
            className="mx-auto max-w-6xl border-t border-line px-6 py-10 sm:px-10"
          >
            <div className="flex items-stretch justify-between gap-6">
              {previous ? (
                <Link
                  to="/works/$slug"
                  params={{ slug: previous.slug }}
                  className="group max-w-[45%] text-sm"
                >
                  <span className="text-stone transition-colors group-hover:text-ink">
                    ← Previous
                  </span>
                  <span className="mt-1 block font-display text-lg text-ink">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to="/works/$slug"
                  params={{ slug: next.slug }}
                  className="group max-w-[45%] text-right text-sm"
                >
                  <span className="text-stone transition-colors group-hover:text-ink">Next →</span>
                  <span className="mt-1 block font-display text-lg text-ink">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </nav>
        )}
      </main>

      <SiteFooter />

      {zoomed && active && <Lightbox image={active} onClose={closeZoom} />}
    </div>
  );
}
