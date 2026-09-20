import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site, artistPortrait, studioHero, canonical } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Simpy Bansal, Different Strokes" },
      {
        name: "description",
        content:
          "Simpy Bansal opened Different Strokes in 2001. Two decades of stained glass and Tanjore art, and a studio practice that has since moved into 3D, texture and functional form.",
      },
      { property: "og:title", content: "About — Simpy Bansal, Different Strokes" },
      {
        property: "og:description",
        content:
          "From stained glass and Tanjore art to layered, sculptural work made to be lived with.",
      },
      { property: "og:url", content: canonical("/about") },
    ],
    links: [{ rel: "canonical", href: canonical("/about") }],
  }),
  component: About,
});

// Drawn from the artist's own account of the practice.
const chapters = [
  {
    step: "2001",
    title: "Opening the doors",
    body: "Different Strokes began as a personal space to share original work — not chasing headlines, simply painting what I felt, saw and imagined, on canvas, on glass, and in gold leaf.",
  },
  {
    step: "Roots",
    title: "Stained glass and Tanjore",
    body: "Stained glass taught me how light changes a room. Tanjore carried a sacred weight in its detail and gold. Together they gave me discipline, and reverence for the whole process rather than only the finished piece.",
  },
  {
    step: "2020",
    title: "Back to the studio",
    body: "After twenty years I moved from running a gallery to full studio practice. Space to rest, reflect, and return to the work with fresh energy — and to start building in three dimensions.",
  },
];

function About() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:px-10 sm:pt-24 sm:pb-28">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
            <div className="art-fade md:col-span-5">
              <img
                src={artistPortrait}
                alt={`${site.artist}, the artist behind ${site.name}`}
                width={1187}
                height={1400}
                className="aspect-4/5 w-full rounded-sm object-cover outline-1 -outline-offset-1 outline-ink/5"
              />
            </div>
            <div className="art-fade-2 md:col-span-7">
              <p className="eyebrow">About the artist</p>
              <h1 className="mt-5 max-w-[22ch] text-4xl leading-none text-balance text-ink sm:text-5xl">
                Two decades of creative journey, and beyond.
              </h1>
              <div className="mt-7 max-w-[54ch] space-y-5 text-base leading-relaxed text-pretty text-stone">
                <p>
                  In 2001, I opened the doors to Different Strokes as a personal space where I could
                  share my art with the world. It began humbly, with a simple goal: to create and
                  sell my own original paintings. I wasn't chasing fame or headlines — I simply
                  wanted to express what I felt, saw, and imagined, on canvas, on glass, and in gold
                  leaf.
                </p>
                <p>
                  My earliest years were rooted in two traditional forms: stained glass painting and
                  Tanjore art. Stained glass captivated me with the way light interacted with
                  colour, transforming the mood of a space, while Tanjore art carried a sacred
                  gravitas through its intricate details, gold embellishments, and deep spiritual
                  symbolism. Together, these practices instilled a sense of discipline and reverence
                  — not just for the finished piece, but for the entire process of creation.
                </p>
                <p>
                  For nearly two decades, I poured myself into this work. My art found homes in
                  personal collections, sacred spaces, gifts, and living rooms. I may not have had a
                  big name in the art world, but those who discovered my work appreciated it for its
                  sincerity, richness, and soul. And that, for me, was more than enough.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-linen">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <p className="eyebrow">The journey</p>
            <h2 className="mt-4 max-w-[30ch] text-3xl text-balance text-ink sm:text-4xl">
              From glass and gold leaf to work you can live with.
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
              {chapters.map((item) => (
                <div key={item.step} className="border-t border-line pt-6">
                  <span className="font-display text-2xl text-clay">{item.step}</span>
                  <h3 className="mt-3 text-xl text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-pretty text-stone">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <h2 className="max-w-[20ch] text-3xl leading-tight text-balance text-ink sm:text-4xl">
                Where the work is going
              </h2>
            </div>
            <div className="md:col-span-7">
              <div className="max-w-[54ch] space-y-5 text-base leading-relaxed text-pretty text-stone">
                <p>
                  Now back in the studio, my work has evolved beyond traditional formats into a more
                  experimental, three-dimensional style that blends surfaces, textures and forms to
                  build depth. I use layered textures, found materials, sculptural elements and
                  vivid colours to bring dimensionality to my work. Some pieces stand alone, while
                  others become integrated into the spaces they inhabit. All remain deeply personal
                  — extensions of thought, emotion and exploration.
                </p>
                <p>
                  One constant throughout this journey has been my commitment to honest, soulful
                  expression. I want my work to resonate — not just visually, but emotionally. I
                  want people to pause, reflect, and feel. What truly excites me now is the idea of
                  art as an immersive, functional experience. I've begun painting on architectural
                  elements and everyday objects, transforming them into expressive works of art.
                </p>
                <p>
                  Running my gallery taught me that you don't need a grand platform to create
                  meaningful work. What matters most is intention, persistence, and remaining true
                  to the voice that led you to art in the first place. I'm building a new body of
                  work that brings together the precision of my past with the boldness of my
                  present, and exploring collaborations with interior designers, architects and
                  other creatives who share my interest in integrating art into lived environments.
                </p>
                <p>
                  My journey continues — with new materials, new forms, and a heart just as
                  passionate as it was in 2001.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 sm:pb-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <img
                src={studioHero}
                alt="Work by Simpy Bansal hanging above a console in a lived-in room"
                loading="lazy"
                width={1988}
                height={2000}
                className="aspect-4/3 w-full rounded-sm object-cover outline-1 -outline-offset-1 outline-ink/5"
              />
            </div>
            <div className="lg:col-span-5">
              <h2 className="max-w-[24ch] text-3xl leading-tight text-balance text-ink sm:text-4xl">
                Commissions and questions
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-pretty text-stone">
                If you'd like to talk about a commission for a particular wall or room, or you have
                a question about a piece you've seen here, write to me directly.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-xs bg-ink px-6 py-2.5 text-sm text-paper ring-1 ring-ink/20 transition-colors hover:bg-ink/90"
                >
                  Get in touch
                </Link>
                <Link
                  to="/works"
                  className="inline-flex items-center py-2.5 text-sm text-stone transition-colors hover:text-ink"
                >
                  Browse the works
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
