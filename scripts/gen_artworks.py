#!/usr/bin/env python3
"""
Generate src/data/artworks.ts from content/manifest.json + content/images.json.

Run this after extract_content.py and build_images.py. Adding a new piece is
then: drop a folder into the source directory, rerun all three scripts.

Usage:
  python3 scripts/gen_artworks.py
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ARTIST = "Simpy Bansal"

CATEGORIES = [
    ("paintings", "Paintings",
     "Canvas, ceramic, stained glass and soft pastel."),
    ("functional-art", "Functional Art",
     "Consoles and cabinets, painted and built to be lived with."),
    ("sculpture", "Sculpture",
     "Carved and modelled forms that hold a space."),
]

# Nav bucket only, never shown as a claim about the work. Where the medium is
# not recorded anywhere, the material line still reads "to be confirmed".
DISCIPLINE_OVERRIDES = {
    "a-gentle-touch": "Canvas",
}

DISCIPLINE_ORDER = ["Canvas", "Ceramic", "Glass", "Soft Pastel",
                    "Console", "Cabinet", "Sculpture"]


def clean_dimensions(value: str | None) -> str | None:
    """Tidy spacing and separators without reordering the artist's own labels."""
    if not value:
        return None
    out = " ".join(value.split())
    # The source mixes straight and curly inch marks; settle on one.
    out = out.replace('"', "\u201d").replace("\u2033", "\u201d")
    out = re.sub(r"\s*[x×X]\s*", " × ", out)
    out = re.sub(r'\s*(["”″])\s*', r"\1 ", out)
    out = re.sub(r"\s+", " ", out).strip(" ×")
    return out


def ts(value) -> str:
    """Render a Python value as a TypeScript literal."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    if "\n" in text:
        body = text.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        return "`" + body + "`"
    body = text.replace("\\", "\\\\").replace('"', '\\"')
    return '"' + body + '"'


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default="content/manifest.json")
    ap.add_argument("--images", default="content/images.json")
    ap.add_argument("--out", default="src/data/artworks.ts")
    args = ap.parse_args()

    works = json.loads(Path(args.manifest).read_text(encoding="utf-8"))["works"]
    images = json.loads(Path(args.images).read_text(encoding="utf-8"))

    def sort_key(w):
        cat = [c[0] for c in CATEGORIES].index(w["category"])
        disc = w["discipline"] or ""
        order = DISCIPLINE_ORDER.index(disc) if disc in DISCIPLINE_ORDER else 99
        return (cat, order, w["title"])

    works = sorted(works, key=sort_key)

    lines: list[str] = []
    add = lines.append

    add("// GENERATED FILE — do not edit by hand.")
    add("// Source: content/manifest.json + content/images.json")
    add("// Regenerate: python3 scripts/gen_artworks.py")
    add("")
    add("// Vite resolves every processed image at build time, so each file gets a")
    add("// content hash and missing files fail the build rather than 404 in production.")
    add('const files = import.meta.glob<string>("../assets/works/**/*.webp", {')
    add("  eager: true,")
    add('  import: "default",')
    add("});")
    add("")
    add("const asset = (path: string): string => {")
    add('  const resolved = files[`../assets/works/${path}`];')
    add("  if (!resolved) {")
    add("    throw new Error(`Missing artwork image: ${path}`);")
    add("  }")
    add("  return resolved;")
    add("};")
    add("")
    add("export type ArtworkImage = {")
    add("  src: string;")
    add("  thumb: string;")
    add("  alt: string;")
    add("  caption: string;")
    add("  width: number;")
    add("  height: number;")
    add("};")
    add("")
    add("const im = (")
    add("  base: string,")
    add("  caption: string,")
    add("  alt: string,")
    add("  width: number,")
    add("  height: number,")
    add("): ArtworkImage => ({")
    add("  src: asset(`${base}.webp`),")
    add("  thumb: asset(`${base}.thumb.webp`),")
    add("  alt,")
    add("  caption,")
    add("  width,")
    add("  height,")
    add("});")
    add("")
    add("export const categories = [")
    for slug, label, blurb in CATEGORIES:
        add("  {")
        add(f"    slug: {ts(slug)},")
        add(f"    label: {ts(label)},")
        add(f"    blurb: {ts(blurb)},")
        add("  },")
    add("] as const;")
    add("")
    add('export type CategorySlug = (typeof categories)[number]["slug"];')
    add("")
    add('export type ArtworkStatus = "Available" | "Sold" | "On request";')
    add("")
    add("export type Artwork = {")
    add("  slug: string;")
    add("  title: string;")
    add("  category: CategorySlug;")
    add("  /** Medium bucket used for navigation; null when not yet recorded. */")
    add("  discipline: string | null;")
    add("  /** Fields left null are genuinely unrecorded and render as to-be-confirmed. */")
    add("  year: string | null;")
    add("  medium: string | null;")
    add("  dimensions: string | null;")
    add("  status: ArtworkStatus | null;")
    add("  blurb: string | null;")
    add("  oneLiner: string | null;")
    add("  description: string | null;")
    add("  images: ArtworkImage[];")
    add("};")
    add("")
    add("export const artworks: Artwork[] = [")

    stats = {"works": 0, "images": 0, "todo": 0}

    for work in works:
        slug = work["slug"]
        discipline = work["discipline"] or DISCIPLINE_OVERRIDES.get(slug)
        entries = images.get(slug) or []
        stats["works"] += 1
        stats["images"] += len(entries)
        if not (work["dimensions"] and work["medium"] and work["description"]):
            stats["todo"] += 1

        add("  {")
        add(f"    slug: {ts(slug)},")
        add(f"    title: {ts(work['title'])},")
        add(f"    category: {ts(work['category'])},")
        add(f"    discipline: {ts(discipline)},")
        add(f"    year: {ts(work.get('year'))},")
        add(f"    medium: {ts(work['medium'])},")
        add(f"    dimensions: {ts(clean_dimensions(work['dimensions']))},")
        add(f"    status: {ts(work['status'])},")
        add(f"    blurb: {ts(work['blurb'])},")
        add(f"    oneLiner: {ts(work['oneLiner'])},")
        add(f"    description: {ts(work['description'])},")

        if not entries:
            add("    images: [],")
        else:
            add("    images: [")
            for entry in entries:
                base = entry["full"][: -len(".webp")]
                caption = entry["caption"]
                descriptor = discipline.lower() if discipline else work["category"].replace("-", " ")
                alt = f"{work['title']}, {descriptor} by {ARTIST} — {caption.lower()}"
                add(f"      im({ts(base)}, {ts(caption)}, {ts(alt)}, "
                    f"{entry['width']}, {entry['height']}),")
            add("    ],")
        add("  },")

    add("];")
    add("")
    add("export const getCategory = (slug: string) =>")
    add("  categories.find((category) => category.slug === slug);")
    add("")
    add("export const artworksByCategory = (slug: string) =>")
    add("  artworks.filter((artwork) => artwork.category === slug);")
    add("")
    add("/** Medium filters for a category, skipping works with no medium recorded. */")
    add("export const disciplinesIn = (slug: string) => [")
    add("  ...new Set(")
    add("    artworksByCategory(slug)")
    add("      .map((artwork) => artwork.discipline)")
    add("      .filter((discipline): discipline is string => Boolean(discipline)),")
    add("  ),")
    add("];")
    add("")
    add("/** The pieces either side of this one, for detail-page navigation. */")
    add("export const adjacentArtworks = (slug: string) => {")
    add("  const index = artworks.findIndex((artwork) => artwork.slug === slug);")
    add("  if (index === -1) return { previous: undefined, next: undefined };")
    add("  return {")
    add("    previous: artworks[index - 1],")
    add("    next: artworks[index + 1],")
    add("  };")
    add("};")
    add("")
    add("export const getArtwork = (slug: string) =>")
    add("  artworks.find((artwork) => artwork.slug === slug);")
    add("")

    out = Path(args.out)
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"{out}: {stats['works']} works, {stats['images']} images, "
          f"{stats['todo']} with unrecorded fields")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
