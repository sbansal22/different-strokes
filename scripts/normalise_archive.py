#!/usr/bin/env python3
"""
Rename a photograph archive into the naming convention. Run once.

Folders become <Category>/<slug>, matching the repo, and every photograph
becomes art-<view>[-n][-shadow].<ext>:

    Consoles/perched-edge(home)/console-bg.png
        -> Consoles/the-perched-edge/art-bg.png
    Paintings/the-vintage-noir/Vintage Noir- The Collection No. 3
        -> Paintings/vintage-noir/art-plate-3.jpg

Views are worked out from the current names using the same rules the build
uses, so what the site shows does not change — only the filenames.

  python3 scripts/normalise_archive.py --source ~/Drive/Artwork --dry-run
  python3 scripts/normalise_archive.py --source ~/Drive/Artwork
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_images import classify, collect  # noqa: E402

ARCHIVE_DIR = {
    "Canvas": "Paintings", "Ceramic": "Paintings", "Glass": "Paintings",
    "Soft Pastel": "Paintings", "Console": "Consoles", "Cabinet": "Cabinets",
    "Sculpture": "Scultpures",
}
KEEP_SUFFIX = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff"}
STOPWORDS = {"the", "a", "an", "of", "and"}


def norm(name: str) -> str:
    """Loose form of a folder or slug, for matching names that predate the convention."""
    name = re.sub(r"\(.*?\)", " ", name.lower()).replace("&", " and ")
    tokens = []
    for token in re.sub(r"[^a-z0-9]+", " ", name).split():
        if token in STOPWORDS:
            continue
        if len(token) > 3 and token.endswith("s"):
            token = token[:-1]
        tokens.append(token)
    return " ".join(tokens)


def find_folder(archive: Path, work: dict, wanted: Path) -> Path | None:
    """The work's folder, by its new name or whatever it is still called."""
    if wanted.is_dir():
        return wanted
    keys = {norm(work["slug"]), norm(work["title"])}
    for category in sorted(p for p in archive.iterdir() if p.is_dir()):
        for folder in sorted(p for p in category.iterdir() if p.is_dir()):
            if norm(folder.name) in keys:
                return folder
    return None


def target_name(path: Path, kind: dict, taken: set[str]) -> str:
    suffix = path.suffix.lower()
    if suffix not in KEEP_SUFFIX:
        suffix = ".jpg"          # extensionless JPEGs and CR3 previews
    base = f"art-{kind['view']}"
    if kind["number"]:
        base += f"-{kind['number']}"
    if kind.get("white"):
        base += "-white"
    if kind["shadow"]:
        base += "-shadow"
    name, n = base + suffix, 2
    while name in taken:
        name = f"{base}-{n}{suffix}"
        n += 1
    taken.add(name)
    return name


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--manifest", default="content/manifest.json")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    archive = Path(args.source).expanduser()
    if not archive.is_dir():
        raise SystemExit(f"archive not found: {archive}")

    works = json.loads(Path(args.manifest).read_text(encoding="utf-8"))["works"]
    moved = renamed = 0
    unmatched: list[str] = []

    for work in works:
        wanted = archive / ARCHIVE_DIR.get(work["discipline"] or "", "Other") / work["slug"]
        current = find_folder(archive, work, wanted)
        if current is None:
            unmatched.append(work["title"])
            continue

        print(f"  {work['title']}")
        if current.resolve() != wanted.resolve():
            print(f"      folder: {current.relative_to(archive)}/  ->  {wanted.relative_to(archive)}/")
            if not args.dry_run:
                wanted.parent.mkdir(parents=True, exist_ok=True)
                current.rename(wanted)
            moved += 1
        target_dir = wanted if not args.dry_run else current

        taken: set[str] = set()
        for image in collect(target_dir if target_dir.is_dir() else current):
            source = (target_dir if target_dir.is_dir() else current) / image["path"]
            new = target_name(source, image, taken)
            if source.name == new:
                continue
            print(f"      {image['path']}  ->  {new}")
            if not args.dry_run:
                source.rename(source.with_name(new))
            renamed += 1

    if unmatched:
        print(f"\nno folder found for: {', '.join(unmatched)}")
        print("  (expected for pieces whose originals were never archived)")
    print(f"\n{moved} folders, {renamed} files"
          f"{' would be renamed (dry run)' if args.dry_run else ' renamed'}")
    if not args.dry_run:
        print("Now run:  npm run content -- --source", archive)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
