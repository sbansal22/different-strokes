#!/usr/bin/env python3
"""Make the artwork documents readable to write in.

These files are where the artwork's words actually live — the pipeline reads
them and builds the site's pages from them. They were written over time and
their formatting drifted: more than half the field headings were plain body
text, indistinguishable from the answers underneath, which makes filling in
the remaining [todo] lines harder than it needs to be.

This restyles them consistently:

  - the title, once, at the top
  - every field heading large, bold and in the studio's clay colour, with
    space above it, so the document scans
  - [todo] lines in red, so what is still outstanding is obvious
  - body text at a comfortable reading size

It changes no words and adds or removes no paragraphs. That matters, because
extract_content.py strips formatting entirely and recognises a heading purely
by the text of its line — so styling is free, but an edited or split line
would quietly change the website.

Run with: npm run docs:format [path ...]
Defaults to content/artworks; pass the archive folder to do that copy too.
"""
import re
import sys
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor

ROOT = Path(__file__).resolve().parent.parent

# Must stay in step with FIELD_HEADINGS in extract_content.py.
FIELD_HEADINGS = {"dimensions", "material", "short description", "one liner",
                  "oneliner", "long description", "status", "discipline",
                  "type", "year"}

TODO = "[todo]"

INK = RGBColor(0x1D, 0x1B, 0x18)      # --ink
CLAY = RGBColor(0x8A, 0x5A, 0x44)     # --clay, the site's accent
FLAG = RGBColor(0xB3, 0x26, 0x1E)     # unmissable red, for [todo]

TITLE_PT = 26
HEADING_PT = 15
BODY_PT = 12
BLANK_PT = 8      # blank separator lines, shrunk so gaps stay even


def normalise(text: str) -> str:
    """The same key extract_content.py builds, so we agree on what a heading is."""
    return re.sub(r"[^a-z ]", "", text.lower()).strip()


def set_blank_height(paragraph, size):
    """Shrink an empty paragraph's line height.

    An empty paragraph still occupies a full line, so a blank line sitting
    above a heading that already has space before it opens a gap twice the
    size of the others. There is no run to style on an empty paragraph, so
    this sets the size on the paragraph mark itself.
    """
    properties = paragraph._p.get_or_add_pPr()
    run_properties = properties.find(qn("w:rPr"))
    if run_properties is None:
        run_properties = properties.makeelement(qn("w:rPr"), {})
        properties.append(run_properties)
    for tag in ("w:sz", "w:szCs"):
        element = run_properties.find(qn(tag))
        if element is None:
            element = run_properties.makeelement(qn(tag), {})
            run_properties.append(element)
        element.set(qn("w:val"), str(int(size * 2)))   # Word counts half-points


def style_runs(paragraph, size, bold, colour):
    for run in paragraph.runs:
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = colour


def format_document(path: Path) -> dict:
    document = Document(path)
    counts = {"title": 0, "headings": 0, "todo": 0, "body": 0}
    seen_title = False

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()
        fmt = paragraph.paragraph_format

        if not text:
            # Keep blank lines as separators, but small, so a blank sitting
            # above a spaced heading does not double the gap.
            set_blank_height(paragraph, BLANK_PT)
            fmt.space_before = Pt(0)
            fmt.space_after = Pt(0)
            fmt.line_spacing = 1
            continue

        if not seen_title:
            seen_title = True
            style_runs(paragraph, TITLE_PT, True, INK)
            fmt.space_before = Pt(0)
            fmt.space_after = Pt(16)
            counts["title"] += 1
            continue

        if normalise(text) in FIELD_HEADINGS:
            style_runs(paragraph, HEADING_PT, True, CLAY)
            fmt.space_before = Pt(20)
            fmt.space_after = Pt(4)
            counts["headings"] += 1
            continue

        if text.lower() == TODO:
            style_runs(paragraph, BODY_PT, True, FLAG)
            fmt.space_before = Pt(0)
            fmt.space_after = Pt(6)
            counts["todo"] += 1
            continue

        style_runs(paragraph, BODY_PT, False, INK)
        fmt.space_before = Pt(0)
        fmt.space_after = Pt(8)
        fmt.line_spacing = 1.15
        counts["body"] += 1

    document.save(path)
    return counts


def main() -> None:
    targets = [Path(a) for a in sys.argv[1:]] or [ROOT / "content" / "artworks"]

    files: list[Path] = []
    for target in targets:
        if not target.exists():
            sys.exit(f"no such path: {target}")
        files.extend(
            p for p in sorted(target.rglob("*.docx"))
            if p.name.lower() == "description.docx" and not p.name.startswith("~$")
        )

    if not files:
        sys.exit("found no Description.docx files to format")

    totals = {"title": 0, "headings": 0, "todo": 0, "body": 0}
    for path in files:
        counts = format_document(path)
        for key in totals:
            totals[key] += counts[key]

    print(f"formatted {len(files)} documents")
    print(f"  {totals['headings']} headings, {totals['body']} body paragraphs")
    print(f"  {totals['todo']} [todo] lines flagged in red")


if __name__ == "__main__":
    main()
