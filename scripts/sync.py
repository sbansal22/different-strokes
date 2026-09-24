#!/usr/bin/env python3
"""
Rebuild the site from your work. One command.

    npm run content -- --source <folder>   # pull edits and photos, rebuild
    npm run content                        # rebuild from what the repo holds

--source is wherever your work lives: a folder per piece with its photographs
and its Description.docx. It is only ever read. Nothing is written back to it.

The repo keeps its own copy of each description because Cloudflare builds the
site from GitHub and cannot see your laptop — so without --source, the command
rebuilds from those copies and leaves the images as committed.

Runs, in order:
  1. pull_documents.py          source descriptions -> content/artworks/
  2. extract_content.py         content/artworks/ -> manifest, gap list
  3. build_images.py            source photographs -> WebP
  4. build_catalogue_covers.py  catalogue PDFs -> cover tiles
  5. gen_artworks.py            manifest + images -> src/data/artworks.ts
  6. build_share_images.py      covers -> link-preview cards
  7. build_sitemap.py           everything -> sitemap.xml
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
                    help="where your work lives; read only, never written to")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    force = ["--force"] if args.force else []
    image_args = ["--source", str(Path(args.source).expanduser())] if args.source else []

    if args.source:
        run("pull_documents.py", "--source", str(Path(args.source).expanduser()))
    run("extract_content.py")
    run("build_images.py", *image_args, *force)
    run("build_catalogue_covers.py", *force)
    run("gen_artworks.py")
    run("build_share_images.py", *force)
    run("build_sitemap.py")

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
        print("  (no --source given: rebuilt from the repo, images left as committed)", file=sys.stderr)
    print("\nNext: npm run dev to check it, then commit.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
