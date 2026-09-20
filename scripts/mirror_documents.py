#!/usr/bin/env python3
"""
Copy each piece's document out to its folder in the photograph archive.

The repo holds the description documents and is the only thing the site is
built from. Keeping a copy beside the originals is useful — the archive folder
then holds everything about a piece — but a copy that is edited goes stale
silently, which is confusing and easy to miss.

So the archive copies are refreshed on every run and are read-only in
practice: edit the one in content/artworks/, never the one in the archive.

Run as part of `npm run content` whenever an archive is attached.
"""

from __future__ import annotations

import argparse
import filecmp
import json
import os
import shutil
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=os.environ.get("DS_ARTWORK_ARCHIVE"))
    ap.add_argument("--manifest", default="content/manifest.json")
    ap.add_argument("--artworks", default="content/artworks")
    args = ap.parse_args()

    if not args.source:
        return 0
    archive = Path(args.source).expanduser()
    if not archive.is_dir():
        return 0

    works = json.loads(Path(args.manifest).read_text(encoding="utf-8"))["works"]
    copied = fresh = 0
    for work in works:
        source = Path(args.artworks) / work["slug"] / "Description.docx"
        folder = archive / work["archiveFolder"]
        if not source.exists() or not folder.is_dir():
            continue
        target = folder / "Description.docx"
        if target.exists() and filecmp.cmp(source, target, shallow=False):
            fresh += 1
            continue
        shutil.copy2(source, target)
        print(f"  {work['slug']}: document refreshed in the archive", file=sys.stderr)
        copied += 1

    # The template is a folder to copy, so it belongs beside the artwork too.
    template = Path(args.artworks).parent / "_new-artwork-template"
    if template.is_dir():
        destination = archive / template.name
        destination.mkdir(exist_ok=True)
        for item in template.iterdir():
            if item.is_file():
                shutil.copy2(item, destination / item.name)

    print(f"  {copied} refreshed, {fresh} already matching", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
