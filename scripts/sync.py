#!/usr/bin/env python3
"""
Rebuild all site content. One command.

    npm run content                       # text and pages, from the repo alone
    npm run content -- --source <archive> # also re-derive images from originals

Everything the site serves is committed, so the first form works with nothing
attached. The archive of original photographs is only needed when you change,
add or re-crop a photo.

Runs, in order:
  1. extract_content.py         content/artworks/ -> manifest, gap list
  2. build_images.py            originals -> WebP  (skipped without an archive)
  3. build_catalogue_covers.py  catalogue PDFs -> cover tiles
  4. gen_artworks.py            manifest + images -> src/data/artworks.ts
  5. build_share_images.py      covers -> link-preview cards
  6. build_sitemap.py           everything -> sitemap.xml
  7. mirror_documents.py        refreshes the archive's copy of each document
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def run(script: str, *args: str) -> None:
    print(f"\n→ {script}", file=sys.stderr)
    result = subprocess.run([sys.executable, str(HERE / script), *args], cwd=ROOT)
    if result.returncode != 0:
        raise SystemExit(f"{script} failed with exit code {result.returncode}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=os.environ.get("DS_ARTWORK_ARCHIVE"),
                    help="archive of original photographs; omit to keep committed images")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    force = ["--force"] if args.force else []
    image_args = ["--source", str(Path(args.source).expanduser())] if args.source else []

    run("extract_content.py")
    run("build_images.py", *image_args, *force)
    run("build_catalogue_covers.py", *force)
    run("gen_artworks.py")
    run("build_share_images.py", *force)
    run("build_sitemap.py")
    if args.source:
        run("mirror_documents.py", "--source", str(Path(args.source).expanduser()))

    works = json.loads((ROOT / "content/manifest.json").read_text())["works"]
    images = json.loads((ROOT / "content/images.json").read_text())
    incomplete = [w for w in works
                  if not (w["dimensions"] and w["medium"] and w["description"])]
    unphotographed = [w for w in works if not images.get(w["slug"])]

    print(f"\n✓ {len(works)} works", file=sys.stderr)
    if incomplete:
        print(f"  {len(incomplete)} missing dimensions, material or a description "
              f"— see content/GAPS.md", file=sys.stderr)
    if unphotographed:
        print(f"  {len(unphotographed)} with no photography: "
              f"{', '.join(w['title'] for w in unphotographed)}", file=sys.stderr)
    if not args.source:
        print("  (no archive attached — images left as committed)", file=sys.stderr)
    print("\nNext: npm run dev to check it, then commit.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
