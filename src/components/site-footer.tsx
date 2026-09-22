import { Link } from "@tanstack/react-router";
import { site } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="w-full bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-[1.1rem] text-paper">{site.name}</p>
            <p className="mt-2 text-sm text-paper/55">{site.artist}</p>
            <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-paper/45">
              Original paintings, functional art and sculpture, made one piece at a time since{" "}
              {site.since}.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-paper/60">
            <Link to="/works" className="transition-colors hover:text-paper">
              Works
            </Link>
            <Link to="/catalogues" className="transition-colors hover:text-paper">
              Catalogues
            </Link>
            <Link to="/about" className="transition-colors hover:text-paper">
              About
            </Link>
            <Link to="/contact" className="transition-colors hover:text-paper">
              Contact
            </Link>
            <a
              href={`${import.meta.env.BASE_URL}certificate_of_authenticity.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-paper"
            >
              Certificate of authenticity
            </a>
          </div>

          <div className="flex flex-col gap-2 text-sm text-paper/60">
            <a
              href={`mailto:${site.email}`}
              className="break-all transition-colors hover:text-paper"
            >
              {site.email}
            </a>
            <a href={site.phoneHref} className="transition-colors hover:text-paper">
              {site.phone}
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-paper"
            >
              {site.instagramHandle}
            </a>
          </div>
        </div>

        <p className="mt-12 border-t border-paper/10 pt-6 text-xs text-paper/40">
          © {site.name} · {site.artist}
        </p>
      </div>
    </footer>
  );
}
