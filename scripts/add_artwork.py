#!/usr/bin/env python3
"""
Add a new piece from a folder anywhere on disk.

Make a folder holding the photographs and a Description.docx, then:

    python3 scripts/add_artwork.py ~/Desktop/the-new-console

The description is copied into the repo, the originals are filed into the
photograph archive, and the folder you started with becomes disposable.

The category is taken from the document's Discipline line, or given with
--discipline. Run `npm run content` afterwards to build the page.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_content import parse_description  # noqa: E402
from fold_into_documents import append_lines  # noqa: E402

# Site category, and the archive folder the originals are filed under. The
# spelling of "Scultpures" is the one the archive already uses.
DISCIPLINES = {
    "Canvas": ("paintings", "Paintings"),
    "Ceramic": ("paintings", "Paintings"),
    "Glass": ("paintings", "Paintings"),
    "Soft Pastel": ("paintings", "Paintings"),
    "Console": ("functional-art", "Consoles"),
    "Cabinet": ("functional-art", "Cabinets"),
    "Sculpture": ("sculpture", "Scultpures"),
}


def slugify(title: str) -> str:
    slug = title.lower().replace("&", " and ")
    slug = re.sub(r"['’]", "", slug)
    return re.sub(r"[^a-z0-9]+", "-", slug).strip("-")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", type=Path, help="folder holding the photos and Description.docx")
    ap.add_argument("--discipline", choices=sorted(DISCIPLINES),
                    help="overrides the document's Discipline line")
    ap.add_argument("--archive", default=os.environ.get("DS_ARTWORK_ARCHIVE"),
                    help="where originals are kept; or set DS_ARTWORK_ARCHIVE")
    ap.add_argument("--artworks", default="content/artworks")
    args = ap.parse_args()

    folder = args.folder.expanduser()
    if not folder.is_dir():
        return fail(f"no such folder: {folder}")
    if not args.archive:
        return fail("no photograph archive set.\n"
                    "  Set it once:  export DS_ARTWORK_ARCHIVE=~/'Google Drive/Different Strokes/Artwork'\n"
                    "  or pass --archive <path>")

    archive = Path(args.archive).expanduser()
    if not archive.is_dir():
        return fail(f"archive not found: {archive}")

    docx = next((p for p in folder.iterdir() if p.name.lower() == "description.docx"), None)
    if not docx:
        return fail(f"no Description.docx in {folder}\n"
                    "  Copy one from content/artworks/the-core/ as a template.")

    meta = parse_description(docx)
    title = str(meta.get("title") or "").strip()
    if not title:
        return fail("the document has no title on its first line")

    discipline = args.discipline or meta.get("discipline")
    if discipline not in DISCIPLINES:
        return fail(f"unknown discipline {discipline!r}.\n"
                    f"  Add a Discipline line to the document, or pass --discipline.\n"
                    f"  One of: {', '.join(sorted(DISCIPLINES))}")

    category, archive_dir = DISCIPLINES[discipline]
    slug = slugify(title)

    target = Path(args.artworks) / slug
    if target.exists():
        return fail(f"{slug} already exists at {target}. Edit it there instead.")

    # File the originals, so the folder you started with is disposable.
    destination = archive / archive_dir / slug
    if destination.exists():
        return fail(f"the archive already holds {destination}")
    shutil.copytree(folder, destination)

    target.mkdir(parents=True)
    shutil.copy2(docx, target / "Description.docx")

    # The document is the only record. If it did not name its own discipline,
    # write the one given on the command line into it so it stays self-describing.
    if not meta.get("discipline"):
        append_lines(docx_copy := target / "Description.docx", ["Discipline", discipline])
        del docx_copy

    photos = [p for p in destination.rglob("*")
              if p.is_file() and p.suffix.lower() not in {".docx", ".pdf"}]
    print(f"Added {title}")
    print(f"  document      {target}/Description.docx")
    print(f"  originals     {destination}  ({len(photos)} files)")
    print(f"  category      {category} / {discipline}")
    print()
    print(f"Now run:  npm run content -- --source '{archive}'")
    print(f"Then {folder} can be deleted.")
    return 0


def fail(message: str) -> int:
    print(message, file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
