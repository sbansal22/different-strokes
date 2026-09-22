import { artworks, type Artwork } from "./artworks";

// Cover tiles are page 1 of each PDF, rendered by scripts/build_catalogue_covers.py.
const covers = import.meta.glob<string>("../assets/catalogues/*.webp", {
  eager: true,
  import: "default",
});

export type Catalogue = {
  year: string;
  title: string;
  blurb: string;
  /**
   * Filename under public/catalogues/ once the PDF is committed. Preferred:
   * the site then serves, embeds and downloads it directly.
   */
  file?: string;
  /**
   * Google Drive file id, used while the PDF lives outside the repo. Drive can
   * still be embedded, but the download goes through Google.
   */
  driveId?: string;
  /**
   * Slugs of the works printed in this catalogue, in plate order. Empty until
   * confirmed — the catalogue page shows the PDF alone in the meantime.
   */
  works: string[];
};

// Prefix public/ assets with the Vite base path so PDFs resolve when the site
// is served from a subpath (e.g. GitHub Pages at /<repo-name>/).
const base = import.meta.env.BASE_URL;

export const catalogues: Catalogue[] = [
  {
    year: "2026",
    title: "Catalogue 2026",
    blurb:
      "The year in progress — new consoles, the first of the sculptural forms, and work that moves off the wall.",
    file: "different-strokes-catalogue-2026.pdf",
    works: [],
  },
  {
    year: "2025",
    title: "Catalogue 2025",
    blurb:
      "Functional art comes into its own: painted consoles, a cabinet, and pieces made to be lived with.",
    file: "different-strokes-catalogue-2025.pdf",
    works: [],
  },
];

/** The catalogue's own cover, rendered from page 1 of the PDF. */
export const coverImage = (catalogue: Catalogue): string | null =>
  covers[`../assets/catalogues/${catalogue.year}.webp`] ?? null;

/** URL to render inside the page. */
export const embedUrl = (catalogue: Catalogue): string | null => {
  if (catalogue.file) return `${base}catalogues/${catalogue.file}#view=FitH`;
  if (catalogue.driveId) return `https://drive.google.com/file/d/${catalogue.driveId}/preview`;
  return null;
};

/** URL the download button points at. */
export const downloadUrl = (catalogue: Catalogue): string | null => {
  if (catalogue.file) return `${base}catalogues/${catalogue.file}`;
  if (catalogue.driveId)
    return `https://drive.google.com/uc?export=download&id=${catalogue.driveId}`;
  return null;
};

/** True when the site serves the file itself, so it can use a download attribute. */
export const isLocal = (catalogue: Catalogue): boolean => Boolean(catalogue.file);

export const getCatalogue = (year: string) =>
  catalogues.find((catalogue) => catalogue.year === year);

/** The works printed in a catalogue, resolved from its slug list. */
export const worksInCatalogue = (year: string): Artwork[] => {
  const catalogue = getCatalogue(year);
  if (!catalogue) return [];
  return catalogue.works
    .map((slug) => artworks.find((artwork) => artwork.slug === slug))
    .filter((artwork): artwork is Artwork => Boolean(artwork));
};
