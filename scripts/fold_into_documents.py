#!/usr/bin/env python3
"""
One-time: move everything out of work.json and into the Word documents.

Each piece kept two files — the artist's Description.docx and a work.json
holding whatever the document did not say. Two places to look, and two places
to edit. This writes those facts into the document as ordinary headings and
deletes work.json, leaving one file per piece.

Pieces with no document at all get one written for them, with [todo] where
nothing is known.

  python3 scripts/fold_into_documents.py --dry-run
  python3 scripts/fold_into_documents.py
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_content import parse_description  # noqa: E402

TEMPLATE_ORDER = ["Dimensions", "Material", "Discipline", "Status", "Year",
                  "Short Description", "One liner", "Long Description"]


def paragraphs(lines: list[str]) -> str:
    def esc(t: str) -> str:
        return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    return "".join(
        f'<w:p><w:r><w:t xml:space="preserve">{esc(line)}</w:t></w:r></w:p>'
        for line in lines
    )


def append_lines(docx: Path, lines: list[str]) -> None:
    """Add paragraphs to the end of a .docx, leaving everything else alone."""
    with zipfile.ZipFile(docx) as zin:
        items = {i.filename: zin.read(i.filename) for i in zin.infolist()}
        order = [i.filename for i in zin.infolist()]
    xml = items["word/document.xml"].decode("utf-8")
    body_end = xml.rindex("</w:body>")
    # Keep the trailing sectPr (page setup) after the new paragraphs.
    sect = re.search(r"(<w:sectPr\b.*?</w:sectPr>)\s*$", xml[:body_end], re.S)
    insert_at = sect.start(1) if sect else body_end
    items["word/document.xml"] = (xml[:insert_at] + paragraphs(lines)
                                  + xml[insert_at:]).encode("utf-8")
    with zipfile.ZipFile(docx, "w", zipfile.ZIP_DEFLATED) as zout:
        for name in order:
            zout.writestr(name, items[name])


def create_document(template: Path, docx: Path, lines: list[str]) -> None:
    with zipfile.ZipFile(template) as zin:
        items = {i.filename: zin.read(i.filename) for i in zin.infolist()}
        order = [i.filename for i in zin.infolist()]
    xml = items["word/document.xml"].decode("utf-8")
    head = xml[: xml.index("<w:body>") + len("<w:body>")]
    items["word/document.xml"] = (head + paragraphs(lines)
                                  + "</w:body></w:document>").encode("utf-8")
    docx.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(docx, "w", zipfile.ZIP_DEFLATED) as zout:
        for name in order:
            zout.writestr(name, items[name])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--artworks", default="content/artworks")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    root = Path(args.artworks)
    template = next(root.glob("*/Description.docx"))

    appended = created = 0
    for folder in sorted(p for p in root.iterdir() if p.is_dir()):
        record_path = folder / "work.json"
        if not record_path.exists():
            continue
        record = json.loads(record_path.read_text(encoding="utf-8"))
        docx = folder / "Description.docx"

        if docx.exists():
            stated = parse_description(docx)
            lines: list[str] = []
            for field, key in (("Discipline", "discipline"), ("Status", "status"),
                               ("Short Description", "blurb")):
                value = record.get(key)
                if value and not stated.get("blurb" if key == "blurb" else key):
                    lines += [field, str(value)]
            if lines:
                print(f"  {folder.name}: + {', '.join(lines[::2])}")
                if not args.dry_run:
                    append_lines(docx, lines)
                appended += 1
        else:
            lines = [record["title"]]
            for field, key in (("Dimensions", None), ("Material", None),
                               ("Discipline", "discipline"), ("Status", "status"),
                               ("Short Description", "blurb"),
                               ("One liner", None), ("Long Description", None)):
                lines += [field, str(record.get(key) or "[todo]") if key else field and "[todo]"]
            # rebuild cleanly: heading then value
            lines = [record["title"]]
            for field, value in (("Dimensions", None), ("Material", None),
                                 ("Discipline", record.get("discipline")),
                                 ("Status", record.get("status")),
                                 ("Short Description", record.get("blurb")),
                                 ("One liner", None), ("Long Description", None)):
                lines += [field, str(value) if value else "[todo]"]
            print(f"  {folder.name}: writing a new document")
            if not args.dry_run:
                create_document(template, docx, lines)
            created += 1

        if not args.dry_run:
            record_path.unlink()

    print(f"\n{appended} documents extended, {created} written, "
          f"{appended + created} work.json removed"
          f"{' (dry run, nothing changed)' if args.dry_run else ''}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
