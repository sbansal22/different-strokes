import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { canonical } from "@/data/site";
import { catalogues, worksInCatalogue, downloadUrl, isLocal, coverImage } from "@/data/catalogues";

export const Route = createFileRoute("/catalogues/")({
  head: () => ({
    meta: [
      { title: "Catalogues — A Year-by-Year Record of the Studio" },
      {
        name: "description",
        content:
          "Browse the yearly catalogues of paintings, functional art and sculpture online, or download each year as a PDF.",
      },
      { property: "og:title", content: "Catalogues — Year by Year" },
      {
        property: "og:description",
        content: "Every year of work, viewable online or downloadable as a PDF catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: canonical("/catalogues") },
    ],
    links: [{ rel: "canonical", href: canonical("/catalogues") }],
  }),
  component: CataloguesIndex,
});

function CataloguesIndex() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 sm:px-10 sm:pt-24">
          <div className="art-fade">
            <p className="eyebrow">Archive</p>
            <h1 className="mt-5 max-w-[20ch] text-4xl leading-none text-balance text-ink sm:text-5xl">
              A catalogue for every year.
            </h1>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-stone">
              Each year is gathered into a catalogue with full plates, dimensions and notes on the
              work. Open one here, or take the PDF with you.
            </p>
          </div>
        </section>

        <section className="w-full bg-linen">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
            <ul className="divide-y divide-line border-y border-line">
              {catalogues.map((catalogue) => {
                const works = worksInCatalogue(catalogue.year);
                const download = downloadUrl(catalogue);
                const cover = coverImage(catalogue);
                return (
                  <li
                    key={catalogue.year}
                    className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:gap-10"
                  >
                    <Link
                      to="/catalogues/$year"
                      params={{ year: catalogue.year }}
                      className="block w-28 shrink-0 overflow-hidden rounded-sm"
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={`Cover of the ${catalogue.year} catalogue`}
                          loading="lazy"
                          width={900}
                          height={1273}
                          className="w-full object-contain"
                        />
                      ) : (
                        <div className="aspect-4/5 w-full" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-4">
                        <h2 className="font-display text-2xl text-ink">{catalogue.title}</h2>
                        {works.length > 0 && (
                          <span className="text-xs text-stone">
                            {works.length} {works.length === 1 ? "plate" : "plates"}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-pretty text-stone">
                        {catalogue.blurb}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-6 text-sm">
                      <Link
                        to="/catalogues/$year"
                        params={{ year: catalogue.year }}
                        className="border-b border-ink/30 pb-0.5 text-ink transition-colors hover:border-ink"
                      >
                        View online
                      </Link>
                      {download && (
                        <a
                          href={download}
                          {...(isLocal(catalogue)
                            ? { download: true }
                            : { target: "_blank", rel: "noopener noreferrer" })}
                          className="border-b border-transparent pb-0.5 text-stone transition-colors hover:border-ink/30 hover:text-ink"
                        >
                          Download PDF
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
