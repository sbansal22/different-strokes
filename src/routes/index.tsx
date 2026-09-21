import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArtworkCard } from "@/components/artwork-card";
import { artworks } from "@/data/artworks";
import { site, studioHero, artistPortrait, canonical } from "@/data/site";

// The three pieces that lead the homepage, in order, and the one given the
// larger in-focus treatment below them. Change these slugs to reshuffle the
// front page — no other edit needed.
const FEATURED = ["the-floating-lotus", "blooming-symphony", "the-core"] as const;
const SPOTLIGHT = "blooming-symphony";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Different Strokes — Original Art by Simpy Bansal" },
      {
        name: "description",
        content:
          "Paintings, functional art and sculpture by Simpy Bansal. Browse the collection, see dimensions and materials, and enquire about a piece or a commission.",
      },
      { property: "og:title", content: "Different Strokes — Original Art by Simpy Bansal" },
      {
        property: "og:description",
        content:
          "Canvas, ceramic, stained glass, painted furniture and sculpture — made one piece at a time since 2001.",
      },
      { property: "og:url", content: canonical("/") },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: Home,
});

function Home() {
  // Pieces that are fully documented and well photographed.
  const complete = artworks.filter(
    (artwork) => artwork.images.length > 0 && artwork.description && artwork.dimensions,
  );
  const featured = FEATURED.map((slug) => complete.find((artwork) => artwork.slug === slug)).filter(
    (artwork): artwork is (typeof complete)[number] => Boolean(artwork),
  );
  const spotlight =
    complete.find((artwork) => artwork.slug === SPOTLIGHT) ??
    complete.find((artwork) => artwork.images.length > 2) ??
    complete[0]!;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="w-full bg-paper">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="art-fade order-2 lg:order-1 lg:col-span-5">
                <p className="eyebrow">
                  {site.name} · since {site.since}
                </p>
                <h1 className="mt-6 max-w-[24ch] text-4xl leading-none text-balance text-ink sm:text-5xl xl:text-6xl">
                  Colour, texture, and work made to be lived with.
                </h1>
                <p className="mt-7 max-w-[46ch] text-base leading-relaxed text-pretty text-stone sm:text-lg">
                  I'm {site.artist}. For two decades I've worked in stained glass, ceramic, canvas
                  and gold leaf — and lately in three dimensions, on consoles, cabinets and carved
                  forms. Every piece is original, made by hand, and carries a story.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-5">
                  <Link
                    to="/works"
                    className="inline-flex items-center rounded-xs bg-ink px-6 py-2.5 text-sm text-paper ring-1 ring-ink/20 transition-colors hover:bg-ink/90"
                  >
                    View the works
                  </Link>
                  <Link to="/about" className="text-sm text-ink transition-colors hover:text-clay">
                    About the artist
                  </Link>
                </div>
              </div>
              <div className="art-fade-2 order-1 lg:order-2 lg:col-span-7">
                <img
                  src={studioHero}
                  alt="Work by Simpy Bansal hanging above a console in a lived-in room"
                  width={1988}
                  height={2000}
                  className="aspect-4/3 w-full rounded-sm object-cover"
                />
                <p className="mt-3 text-xs text-stone/80">
                  Work finds its place in the room it lives in
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured works */}
        <section className="w-full bg-linen">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="eyebrow">Selected works</p>
                <h2 className="mt-3 max-w-[40ch] text-3xl text-balance text-ink">
                  A few pieces to begin with
                </h2>
              </div>
              <Link
                to="/works"
                className="hidden text-sm text-stone transition-colors hover:text-ink sm:inline"
              >
                All works →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((artwork, i) => (
                <ArtworkCard
                  key={artwork.slug}
                  artwork={artwork}
                  className={i === 0 ? "art-fade-2" : "art-fade-3"}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Spotlight piece */}
        <section className="w-full bg-paper">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Link
                  to="/works/$slug"
                  params={{ slug: spotlight.slug }}
                  className="group block"
                  aria-label={`See ${spotlight.title}`}
                >
                  <img
                    src={spotlight.images[0]!.src}
                    alt={spotlight.images[0]!.alt}
                    loading="lazy"
                    width={spotlight.images[0]!.width}
                    height={spotlight.images[0]!.height}
                    className="aspect-5/4 w-full rounded-sm object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                  />
                </Link>
                {spotlight.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {spotlight.images.slice(1, 4).map((image) => (
                      <Link
                        key={image.src}
                        to="/works/$slug"
                        params={{ slug: spotlight.slug }}
                        className="block"
                        aria-label={`${spotlight.title} — ${image.caption.toLowerCase()}`}
                      >
                        <img
                          src={image.thumb}
                          alt={image.alt}
                          loading="lazy"
                          width={image.width}
                          height={image.height}
                          className="aspect-square w-full rounded-xs object-contain opacity-90 transition-opacity hover:opacity-100"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-5">
                <p className="eyebrow">In focus</p>
                <h2 className="mt-4 max-w-[30ch] text-3xl leading-tight text-balance text-ink sm:text-4xl">
                  {spotlight.title}
                </h2>
                <p className="mt-3 text-sm text-stone">
                  {[spotlight.medium, spotlight.dimensions].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-pretty text-ink/80">
                  {spotlight.description}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to="/contact"
                    search={{ work: spotlight.title }}
                    className="inline-flex items-center rounded-xs bg-clay px-6 py-2.5 text-sm text-paper ring-1 ring-clay/20 transition-colors hover:bg-clay/90"
                  >
                    Enquire about this work
                  </Link>
                  <Link
                    to="/works/$slug"
                    params={{ slug: spotlight.slug }}
                    className="text-sm text-stone transition-colors hover:text-ink"
                  >
                    View all angles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About tease */}
        <section className="w-full bg-linen">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-14">
              <div className="md:col-span-4">
                <img
                  src={artistPortrait}
                  alt={`${site.artist}, the artist behind ${site.name}`}
                  loading="lazy"
                  width={1187}
                  height={1400}
                  className="aspect-4/5 w-full rounded-sm object-cover"
                />
              </div>
              <div className="md:col-span-8">
                <p className="eyebrow">About the artist</p>
                <h2 className="mt-4 max-w-[38ch] text-3xl leading-tight text-balance text-ink sm:text-4xl">
                  Different Strokes opened its doors in 2001.
                </h2>
                <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-stone">
                  Two decades of stained glass, Tanjore art and painting — and a studio practice
                  that has since moved into texture, sculpture and functional form. Every piece
                  remains deeply personal.
                </p>
                <Link
                  to="/about"
                  className="mt-8 inline-block text-sm text-ink transition-colors hover:text-clay"
                >
                  Read the full note →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
