import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site, canonical } from "@/data/site";
import { PaymentForm } from "@/components/payment-form";

const searchSchema = z.object({
  work: z.string().optional(),
});

export const Route = createFileRoute("/contact")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Contact — Enquiries and Commissions · Different Strokes" },
      {
        name: "description",
        content:
          "Write about acquiring a painting, commissioning a new piece, or arranging a private studio viewing. Every note is answered personally.",
      },
      { property: "og:title", content: "Contact — Different Strokes" },
      {
        property: "og:description",
        content:
          "Write about acquiring a painting, commissioning a new piece, or arranging a private studio viewing.",
      },
      { property: "og:url", content: canonical("/contact") },
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
  }),
  component: Contact,
});

// The studio's existing Formspree form, carried over from the previous site.
// Our own endpoint, in functions/api/enquiry.js. Was Formspree, whose free
// plan stopped at 50 enquiries a month and sat between a buyer and the reply.
const ENQUIRY_ENDPOINT = "/api/enquiry";

type FormStatus = "idle" | "sending" | "error";

function Contact() {
  const { work } = Route.useSearch();
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");

    try {
      const response = await fetch(ENQUIRY_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) throw new Error(`Enquiry failed: ${response.status}`);

      setSent(true);
      setStatus("idle");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:px-10 sm:pt-24 sm:pb-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="art-fade md:col-span-5">
              <p className="eyebrow">Contact</p>
              <h1 className="mt-5 max-w-[20ch] text-4xl leading-none text-balance text-ink sm:text-5xl">
                Enquiries, commissions, and viewings
              </h1>
              <p className="mt-7 max-w-[42ch] text-base leading-relaxed text-pretty text-stone">
                For a piece you have seen, a commission, or a conversation about work for a
                particular space — write below, or reach me directly. I answer every note myself.
              </p>

              <dl className="mt-12 divide-y divide-line/70 border-t border-line">
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-stone">Email</dt>
                  <dd className="text-ink">
                    <a href={`mailto:${site.email}`} className="hover:text-clay">
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-stone">Phone</dt>
                  <dd className="text-ink">
                    <a href={site.phoneHref} className="hover:text-clay">
                      {site.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-stone">Instagram</dt>
                  <dd className="text-ink">
                    <a
                      href={site.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-clay"
                    >
                      {site.instagramHandle}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-12 border-t border-line pt-6">
                <p className="eyebrow">Acquiring a piece</p>
                <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-pretty text-stone">
                  Every work is an original and one of a kind — there are no prints or editions.
                  Prices are given on request, because size, framing and delivery differ so much
                  from piece to piece. Tell me which work you have in mind and where it would go,
                  and I'll come back with everything, including what shipping would involve.
                </p>
                <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-pretty text-stone">
                  Commissions are welcome, and so are conversations that start with a room rather
                  than a piece. Each work ships with a signed{" "}
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

                <PaymentForm />
              </div>
            </div>

            <div className="art-fade-2 md:col-span-7">
              {sent ? (
                <div className="border-t border-line pt-10">
                  <h2 className="font-display text-3xl text-ink">Thank you.</h2>
                  <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-stone">
                    Your note has arrived. I'll write back personally, usually within a few days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-8 text-sm text-ink transition-colors hover:text-clay"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
                  {work && <input type="hidden" name="work" value={work} />}
                  {/* Honeypot — invisible to humans, catches spam bots */}
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <label className="block">
                    <span className="text-xs tracking-[0.12em] text-stone uppercase">Name</span>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-ink outline-none placeholder:text-stone/60 focus:border-ink"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs tracking-[0.12em] text-stone uppercase">Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-ink outline-none placeholder:text-stone/60 focus:border-ink"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs tracking-[0.12em] text-stone uppercase">Message</span>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      defaultValue={work ? `I'd like to enquire about "${work}". ` : undefined}
                      placeholder="Which work, or what you'd like to discuss"
                      className="mt-2 w-full resize-none border-b border-line bg-transparent py-2.5 text-ink outline-none placeholder:text-stone/60 focus:border-ink"
                    />
                  </label>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex items-center rounded-xs bg-ink px-7 py-2.5 text-sm text-paper ring-1 ring-ink/20 transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "sending" ? "Sending…" : "Send enquiry"}
                    </button>
                    {status === "error" && (
                      <p className="mt-4 text-sm text-clay" role="alert">
                        Something went wrong sending your note. Please try again, or write directly
                        to {site.email}.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
