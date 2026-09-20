import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  catalogues,
  getCatalogue,
  worksInCatalogue,
  embedUrl,
  downloadUrl,
  isLocal,
} from "@/data/catalogues";

export const Route = createFileRoute("/catalogues/$year")({
  loader: ({ params }) => {
    const catalogue = getCatalogue(params.year);
    if (!catalogue) throw notFound();
    return { catalogue, works: worksInCatalogue(params.year) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Catalogue not found — Different Strokes" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { catalogue, works } = loaderData;
    const title = `${catalogue.title} — Different Strokes`;
    return {
      meta: [
        { title },
        { name: "description", content: catalogue.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: catalogue.blurb },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(works.length ? [] : []),
      ],
    };
  },
  notFoundComponent: CatalogueNotFound,
  component: CataloguePage,
});

function CatalogueNotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-32 sm:px-10">
        <h1 className="font-display text-3xl text-ink">Catalogue not found</h1>
        <p className="mt-4 text-stone">
          That year isn't in the archive yet.{" "}
          <Link to="/catalogues" className="text-ink underline underline-offset-4">
            See all catalogues
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function CataloguePage() {
  const { catalogue, works } = Route.useLoaderData();
  const embed = embedUrl(catalogue);
  const download = downloadUrl(catalogue);
  const local = isLocal(catalogue);
  const index = catalogues.findIndex((c) => c.year === catalogue.year);
  const previous = catalogues[index + 1];
  const next = catalogues[index - 1];

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-14 pb-12 sm:px-10 sm:pt-20">
          <Link to="/catalogues" className="text-sm text-stone transition-colors hover:text-ink">
            ← All catalogues
          </Link>
          <div className="mt-8 flex flex-col gap-8 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{works.length > 0 ? `${works.length} plates` : "Catalogue"}</p>
              <h1 className="mt-4 font-display text-5xl leading-none text-ink sm:text-6xl">
                {catalogue.year}
              </h1>
              <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-pretty text-stone">
                {catalogue.blurb}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {download && (
                <a
                  href={download}
                  {...(local
                    ? { download: true }
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex w-fit items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-85"
                >
                  Download {catalogue.year} PDF
                </a>
              )}
            </div>
          </div>
        </section>

        {embed && (
          <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
            <div className="overflow-hidden rounded-sm border border-line bg-linen">
              <iframe
                src={embed}
                title={`${catalogue.title} PDF`}
                allow="autoplay"
                className="h-[75vh] w-full"
              />
            </div>
          </section>
        )}

        {works.length === 0 ? (
          <section className="mx-auto max-w-6xl px-6 pb-32 sm:px-10">
            <p className="text-stone">
              The full catalogue is in the PDF above. Individual plates are being added to the site.
            </p>
          </section>
        ) : (
          <section className="w-full bg-linen">
            <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
              <ol className="space-y-24">
                {works.map((work, i) => {
                  const plate = work.images[0];
                  if (!plate) return null;
                  return (
                    <li
                      key={work.slug}
                      className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-14"
                    >
                      <Link
                        to="/works/$slug"
                        params={{ slug: work.slug }}
                        className="block overflow-hidden rounded-sm bg-paper outline-1 -outline-offset-1 outline-ink/5"
                      >
                        <img
                          src={plate.thumb}
                          alt={plate.alt}
                          loading="lazy"
                          width={1024}
                          height={1280}
                          className="aspect-4/5 w-full object-cover"
                        />
                      </Link>
                      <div>
                        <p className="eyebrow">Plate {String(i + 1).padStart(2, "0")}</p>
                        <h2 className="mt-4 font-display text-2xl text-ink">{work.title}</h2>
                        <p className="mt-2 text-sm text-stone">
                          {[work.medium, work.dimensions].filter(Boolean).join(" · ")}
                        </p>
                        <p className="mt-5 text-sm leading-relaxed text-pretty text-stone">
                          {work.description}
                        </p>
                        <p className="mt-5 text-xs tracking-[0.12em] uppercase text-clay">
                          {work.status}
                        </p>
                        <Link
                          to="/works/$slug"
                          params={{ slug: work.slug }}
                          className="mt-6 inline-block border-b border-ink/30 pb-0.5 text-sm text-ink transition-colors hover:border-ink"
                        >
                          See this piece
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
          <div className="flex items-center justify-between gap-6 text-sm">
            {previous ? (
              <Link
                to="/catalogues/$year"
                params={{ year: previous.year }}
                className="text-stone transition-colors hover:text-ink"
              >
                ← {previous.year}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to="/catalogues/$year"
                params={{ year: next.year }}
                className="text-stone transition-colors hover:text-ink"
              >
                {next.year} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
