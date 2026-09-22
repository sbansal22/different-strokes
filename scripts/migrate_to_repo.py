#!/usr/bin/env python3
"""
One-time migration: move the content into the repo.

Until now the pipeline read from ~/Downloads and from the old different-strokes
site, so the repo could not rebuild itself once either went away. This copies
the description documents in and freezes the handful of facts that only the old
site recorded (sold status, medium, the original titles), leaving the repo
self-sufficient.

Afterwards, only photographs live outside the repo, and only when you want to
re-derive images.

    content/artworks/<slug>/Description.docx   the text, editable in Word
    content/artworks/<slug>/work.json          category, and the old-site facts

Run once:
  python3 scripts/migrate_to_repo.py --source ~/Downloads
"""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

CATEGORY_FOLDER = {
    "paintings": "Paintings",
    "functional-art": "Consoles",
    "sculpture": "Scultpures",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="~/Downloads")
    ap.add_argument("--manifest", default="content/manifest.json")
    ap.add_argument("--out", default="content/artworks")
    args = ap.parse_args()

    source = Path(args.source).expanduser()
    out_root = Path(args.out)
    works = json.loads(Path(args.manifest).read_text(encoding="utf-8"))["works"]

    copied = 0
    for work in works:
        slug = work["slug"]
        folder = out_root / slug
        folder.mkdir(parents=True, exist_ok=True)

        if work.get("sourceFolder"):
            src_dir = source / work["sourceFolder"]
            docx = next(
                (p for p in src_dir.iterdir() if p.name.lower() == "description.docx"),
                None,
            ) if src_dir.is_dir() else None
            if docx:
                shutil.copy2(docx, folder / "Description.docx")
                copied += 1

        # Everything the document does not state, recorded once so the old site
        # is never needed again.
        record = {
            "title": work["title"],
            "category": work["category"],
            "discipline": work["discipline"],
            "status": work["status"],
            "blurb": work["blurb"],
        }
        if work.get("sourceFolder"):
            record["archiveFolder"] = work["sourceFolder"]
        if work.get("oldImage"):
            record["legacyImage"] = work["oldImage"]

        (folder / "work.json").write_text(
            json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )

    print(f"{len(works)} works written to {out_root}, {copied} description documents copied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
