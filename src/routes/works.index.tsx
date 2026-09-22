import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { canonical } from "@/data/site";
import { ArtworkCard } from "@/components/artwork-card";
import { artworks, categories } from "@/data/artworks";

// Deliberately no .default() here. A default would be written into the URL
// during hydration, so the prerendered /works and the hydrated /works?... would
// disagree and React would throw away the server HTML. "all" is applied below.
const searchSchema = z.object({
  category: fallback(z.string(), "all").optional(),
  type: fallback(z.string(), "all").optional(),
  availability: z.enum(["available", "sold"]).optional().catch(undefined),
});

export const Route = createFileRoute("/works/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Works — Paintings, Functional Art & Sculpture" },
      {
        name: "description",
        content:
          "Original paintings on canvas, pastel, stained glass and ceramic, alongside functional art — consoles and cabinets — and carved sculpture.",
      },
      { property: "og:title", content: "Works — Paintings, Functional Art & Sculpture" },
      {
        property: "og:description",
        content:
          "Original paintings, functional art and sculpture, each with dimensions, medium and availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: canonical("/works") },
    ],
    links: [{ rel: "canonical", href: canonical("/works") }],
  }),
  component: WorksIndex,
});

function WorksIndex() {
  const search = Route.useSearch();
  const category = search.category ?? "all";
  const type = search.type ?? "all";
  const activeCategory = categories.some((c) => c.slug === category) ? category : "all";

  const inCategory =
    activeCategory === "all" ? artworks : artworks.filter((a) => a.category === activeCategory);

  const disciplines = [
    ...new Set(inCategory.map((a) => a.discipline).filter((d): d is string => Boolean(d))),
  ];
  const activeType = disciplines.includes(type) ? type : "all";
  const byType =
    activeType === "all" ? inCategory : inCategory.filter((a) => a.discipline === activeType);

  // A piece whose availability was never recorded belongs under neither
  // filter, so it shows only when no availability is chosen.
  const availability = search.availability;
  const pieces = availability
    ? byType.filter((a) =>
        availability === "sold" ? a.status === "Sold" : a.status === "Available",
      )
    : byType;

  const counts = {
    all: byType.length,
    available: byType.filter((a) => a.status === "Available").length,
    sold: byType.filter((a) => a.status === "Sold").length,
  };

  const groups =
    activeCategory === "all"
      ? categories.map((c) => ({
          key: c.slug,
          label: c.label,
          blurb: c.blurb,
          items: pieces.filter((a) => a.category === c.slug),
        }))
      : [
          ...disciplines
            .filter((d) => activeType === "all" || d === activeType)
            .map((d) => ({
              key: d,
              label: d,
              blurb: "",
              items: pieces.filter((a) => a.discipline === d),
            })),
          ...(activeType === "all"
            ? [
                {
                  key: "unsorted",
                  label: "Other",
                  blurb: "",
                  items: pieces.filter((a) => !a.discipline),
                },
              ]
            : []),
        ];

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? "border-ink bg-ink text-paper"
        : "border-line text-stone hover:border-ink/40 hover:text-ink"
    }`;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:px-10 sm:pt-24">
          <div className="art-fade">
            <p className="eyebrow">The collection</p>
            <h1 className="mt-5 max-w-[20ch] text-4xl leading-none text-balance text-ink sm:text-5xl">
              Paintings, functional art and sculpture.
            </h1>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-stone">
              Each work is original and unique — no prints, no editions. Open any piece to see it
              from several angles, along with its exact dimensions and medium.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            <Link
              to="/works"
              search={availability ? { availability } : {}}
              className={chip(activeCategory === "all")}
            >
              All work
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/works"
                search={{ category: c.slug, ...(availability ? { availability } : {}) }}
                className={chip(activeCategory === c.slug)}
              >
                {c.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
            <span className="eyebrow">Availability</span>
            {(
              [
                ["all", "All", counts.all],
                ["available", "Available", counts.available],
                ["sold", "Sold", counts.sold],
              ] as const
            ).map(([key, label, count]) => {
              const active = (availability ?? "all") === key;
              return (
                <Link
                  key={key}
                  to="/works"
                  search={{
                    ...(activeCategory === "all" ? {} : { category: activeCategory }),
                    ...(activeType === "all" ? {} : { type: activeType }),
                    ...(key === "all" ? {} : { availability: key }),
                  }}
                  className={
                    active
                      ? "text-ink underline underline-offset-4"
                      : "text-stone transition-colors hover:text-ink"
                  }
                >
                  {label} <span className="text-stone/60">{count}</span>
                </Link>
              );
            })}
          </div>

          {activeCategory !== "all" && disciplines.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
              <span className="eyebrow">Medium</span>
              <Link
                to="/works"
                search={{
                  category: activeCategory,
                  ...(availability ? { availability } : {}),
                }}
                className={
                  activeType === "all"
                    ? "text-ink underline underline-offset-4"
                    : "text-stone transition-colors hover:text-ink"
                }
              >
                All
              </Link>
              {disciplines.map((d) => (
                <Link
                  key={d}
                  to="/works"
                  search={{
                    category: activeCategory,
                    type: d,
                    ...(availability ? { availability } : {}),
                  }}
                  className={
                    activeType === d
                      ? "text-ink underline underline-offset-4"
                      : "text-stone transition-colors hover:text-ink"
                  }
                >
                  {d}
                </Link>
              ))}
            </div>
          )}
        </section>

        {groups
          .filter((group) => group.items.length > 0)
          .map((group, index) => (
            <section
              key={group.key}
              className={index % 2 === 0 ? "w-full bg-linen" : "w-full bg-paper"}
            >
              <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
                <div className="mb-12 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <h2 className="font-display text-2xl text-ink">{group.label}</h2>
                    {group.blurb && <p className="mt-1 text-sm text-stone">{group.blurb}</p>}
                  </div>
                  <span className="text-xs text-stone">
                    {group.items.length} {group.items.length === 1 ? "work" : "works"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((artwork) => (
                    <ArtworkCard key={artwork.slug} artwork={artwork} />
                  ))}
                </div>
              </div>
            </section>
          ))}
      </main>

      <SiteFooter />
    </div>
  );
}
