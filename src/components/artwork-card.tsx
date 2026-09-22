import { Link } from "@tanstack/react-router";
import type { Artwork } from "@/data/artworks";

export function ArtworkCard({ artwork, className = "" }: { artwork: Artwork; className?: string }) {
  const cover = artwork.images[0];
  // Dimensions are the useful second line; the medium sits beside the title.
  const detail = artwork.dimensions ?? "Dimensions to be confirmed";

  return (
    <Link to="/works/$slug" params={{ slug: artwork.slug }} className={`group block ${className}`}>
      <div className="w-full overflow-hidden rounded-sm">
        {cover ? (
          <img
            src={cover.thumb}
            alt={cover.alt}
            loading="lazy"
            width={cover.width}
            height={cover.height}
            className="aspect-4/5 w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-4/5 w-full items-center justify-center">
            <span className="text-xs text-stone/70">Photography to come</span>
          </div>
        )}
      </div>
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg font-normal text-ink">{artwork.title}</h3>
          {artwork.discipline && (
            <span className="text-xs whitespace-nowrap text-stone">{artwork.discipline}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone">
          {detail}
          {artwork.status === "Sold" && <span className="text-stone/70"> · Sold</span>}
        </p>
      </div>
    </Link>
  );
}
