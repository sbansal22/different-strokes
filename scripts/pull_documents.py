#!/usr/bin/env python3
"""
Bring each piece's description in from wherever you edited it.

`--source` is the one place your work lives: a folder per piece, holding its
photographs and its Description.docx. This copies each description into
content/artworks/<slug>/, because that is what Cloudflare builds the site
from — it builds from GitHub and cannot see your laptop.

It only ever reads from the source. Nothing is written back to it.

A folder counts as a piece when it holds a Description.docx, and the folder's
name is the piece's slug, so it can sit at any depth — Paintings/the-tree/,
or just the-tree/. Folders starting with "_" (the template) are skipped.

Run as the first step of `npm run content -- --source <folder>`.
"""

from __future__ import annotations

import argparse
import filecmp
import os
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTWORKS = ROOT / "content" / "artworks"
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def find_documents(source: Path) -> tuple[dict[str, Path], list[str]]:
    """Every Description.docx in the source, keyed by the folder it sits in."""
    found: dict[str, list[Path]] = {}
    for path in source.rglob("*"):
        if not path.is_file() or path.name.lower() != "description.docx":
            continue
        if path.name.startswith("~$"):               # Word's lock file
            continue
        if any(part.startswith(("_", ".")) for part in path.relative_to(source).parts):
            continue
        found.setdefault(path.parent.name, []).append(path)

    problems = []
    unique: dict[str, Path] = {}
    for name, paths in found.items():
        if len(paths) > 1:
            listed = "\n      ".join(str(p.relative_to(source)) for p in paths)
            problems.append(f"'{name}' appears more than once — keep one:\n      {listed}")
        else:
            unique[name] = paths[0]
    return unique, problems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    args = ap.parse_args()

    source = Path(args.source).expanduser()
    if not source.is_dir():
        sys.exit(f"no such folder: {source}")

    documents, problems = find_documents(source)
    if problems:
        # Refuse rather than guess which copy is the real one.
        print("Two pieces share a folder name, so it is unclear which to use:\n",
              file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1

    updated, added, skipped = [], [], []
    for name, document in sorted(documents.items()):
        target = ARTWORKS / name / "Description.docx"

        if not target.exists():
            if not SLUG.match(name):
                skipped.append(name)
                continue
            target.parent.mkdir(parents=True)
            shutil.copy2(document, target)
            added.append(name)
            continue

        if not filecmp.cmp(document, target, shallow=False):
            shutil.copy2(document, target)
            updated.append(name)

    unchanged = len(documents) - len(updated) - len(added) - len(skipped)
    print(f"  {len(updated)} descriptions updated, {len(added)} new, "
          f"{unchanged} unchanged", file=sys.stderr)
    for name in added:
        print(f"  + new piece: {name}", file=sys.stderr)
    for name in skipped:
        suggestion = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        print(f"  ! skipped '{name}': a new piece's folder must be lower-case "
              f"with hyphens, e.g. '{suggestion}'", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
