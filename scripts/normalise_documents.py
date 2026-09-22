#!/usr/bin/env python3
"""
Give every description document the same set of headings.

The documents grew up at different times, so some are missing headings
entirely — no Year anywhere, no One liner in a dozen of them. A missing
heading is invisible: there is nothing in the file to prompt Simpy to fill it
in. This adds any that are absent, with [todo] as the value, so every document
reads the same and every gap is something you can see.

Existing content is never touched; headings are only ever added.

  python3 scripts/normalise_documents.py --dry-run
  python3 scripts/normalise_documents.py
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_content import docx_text  # noqa: E402
from fold_into_documents import append_lines  # noqa: E402

# Every document should carry all of these, in this order.
HEADINGS = ["Dimensions", "Material", "Discipline", "Status", "Year",
            "Short Description", "One liner", "Long Description"]
ALIASES = {"One liner": {"one liner", "oneliner"}, "Discipline": {"discipline", "type"}}

# Values to write rather than [todo], where the fact is already known from
# elsewhere in the pipeline and belongs in the document instead.
KNOWN = {
    # Its medium was carried in DISCIPLINE_OVERRIDES because the document
    # never stated it. The document should say so itself.
    "a-gentle-touch": {"Discipline": "Canvas"},
}


def existing(docx: Path) -> set[str]:
    lines = [re.sub(r"[^a-z ]", "", line.lower()).strip()
             for line in docx_text(docx).split("\n")]
    found = set()
    for heading in HEADINGS:
        names = ALIASES.get(heading, {heading.lower()})
        if any(name in lines for name in names):
            found.add(heading)
    return found


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--artworks", default="content/artworks")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    touched = added = 0
    for docx in sorted(Path(args.artworks).glob("*/Description.docx")):
        slug = docx.parent.name
        have = existing(docx)
        missing = [h for h in HEADINGS if h not in have]
        if not missing:
            continue

        lines: list[str] = []
        for heading in missing:
            lines += [heading, KNOWN.get(slug, {}).get(heading, "[todo]")]
        marked = [f"{h}={KNOWN.get(slug, {}).get(h, '[todo]')}" for h in missing]
        print(f"  {slug}: + {', '.join(marked)}")
        if not args.dry_run:
            append_lines(docx, lines)
        touched += 1
        added += len(missing)

    print(f"\n{added} headings added across {touched} documents"
          f"{' (dry run, nothing changed)' if args.dry_run else ''}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
