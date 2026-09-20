import { Link } from "@tanstack/react-router";
import { site } from "@/data/site";

const links = [
  { to: "/works", label: "Works" },
  { to: "/catalogues", label: "Catalogues" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="w-full bg-paper">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-y-3 py-7">
          <Link to="/" className="group flex flex-col leading-none">
            <span className="font-display text-[1.15rem] font-medium tracking-[0.02em] text-ink">
              {site.name}
            </span>
            <span className="mt-1 text-[0.7rem] tracking-[0.18em] text-stone uppercase">
              {site.artist}
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-stone sm:gap-9">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-ink"
                activeProps={{ className: "text-ink" }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden transition-colors hover:text-ink sm:inline"
            >
              Instagram
            </a>
          </div>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="h-px w-full bg-line" />
      </div>
    </header>
  );
}
