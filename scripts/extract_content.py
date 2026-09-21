#!/usr/bin/env python3
"""
Read the artwork content held in the repo into one manifest.

Every piece is one file: content/artworks/<slug>/Description.docx, the
artist's own document, editable in Word. Nothing else describes a piece, and
nothing outside the repo is needed.

Photographs are handled separately by build_images.py, which only needs the
archive when you want to re-derive them.

Writes content/manifest.json and content/GAPS.md.

Usage:
  python3 scripts/extract_content.py
"""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path

# Six standard headings, plus four optional ones a piece can use to state
# things the old site would otherwise have been the only source for.
FIELD_HEADINGS = ["dimensions", "material", "short description",
                  "one liner", "oneliner", "long description",
                  "status", "discipline", "type", "year"]

TODO = "[todo]"

# Titles where the artist's document is scrappier than the name already in use.
TITLE_OVERRIDES = {
    "rhythm of colors": "Rhythm of Color",
    "feathers of colors": "Feathers of Color",
}

VALID_STATUS = {"available": "Available", "sold": "Sold",
                "on request": "On request", "enquire": "On request"}

# A discipline implies both its category and where its originals are filed.
CATEGORY_OF = {
    "Canvas": "paintings", "Ceramic": "paintings", "Glass": "paintings",
    "Soft Pastel": "paintings", "Console": "functional-art",
    "Cabinet": "functional-art", "Sculpture": "sculpture",
}

ARCHIVE_OF = {
    "Canvas": "Paintings", "Ceramic": "Paintings", "Glass": "Paintings",
    "Soft Pastel": "Paintings", "Console": "Consoles", "Cabinet": "Cabinets",
    "Sculpture": "Scultpures",
}

# Every document states its own discipline now; this is kept as an escape
# hatch if one ever cannot.
DISCIPLINE_OVERRIDES: dict[str, str] = {}


# --------------------------------------------------------------------------
# the document
# --------------------------------------------------------------------------
def docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")
    xml = re.sub(r"</w:p\s*>", "\n", xml)
    xml = re.sub(r"<w:tab[^>]*/>", "\t", xml)
    text = re.sub(r"<[^>]+>", "", xml)
    for entity, char in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                         ("&quot;", '"'), ("&apos;", "'")):
        text = text.replace(entity, char)
    return text


def parse_description(path: Path) -> dict:
    lines = [line.strip() for line in docx_text(path).split("\n")]
    lines = [line for line in lines if line]
    if not lines:
        return {}

    out: dict[str, object] = {"title": lines[0]}
    buckets: dict[str, list[str]] = {}
    current: str | None = None

    for line in lines[1:]:
        key = re.sub(r"[^a-z ]", "", line.lower()).strip()
        if key in FIELD_HEADINGS:
            current = "one liner" if key in ("one liner", "oneliner") else key
            current = "discipline" if current == "type" else current
            buckets.setdefault(current, [])
            continue
        if current:
            buckets[current].append(line)

    def take(field: str, join: str = " ") -> str | None:
        # A [todo] line means "not filled in yet", wherever it sits — a
        # heading can legitimately appear twice, one empty and one answered.
        lines = [ln for ln in (buckets.get(field) or []) if ln.strip().lower() != TODO]
        body = join.join(lines).strip()
        return body or None

    out["dimensions"] = clean_dimensions(take("dimensions"))
    out["material"] = take("material")
    out["blurb"] = take("short description")
    out["oneLiner"] = take("one liner")
    out["description"] = take("long description", join="\n\n")
    out["status"] = VALID_STATUS.get((take("status") or "").lower()) or None
    out["discipline"] = take("discipline")

    year = take("year")
    match = re.search(r"(19|20)\d{2}", year) if year else None
    out["year"] = match.group(0) if match else None

    # Descriptions often open by restating the title or the whole short
    # description, with no full stop, which reads as a run-on on the page.
    desc = out.get("description")
    if isinstance(desc, str):
        repeats = [str(out.get("title") or ""), str(out.get("blurb") or "")]
        for _ in range(2):
            first, _sep, rest = desc.partition("\n\n")
            if rest and any(
                r and first.strip().rstrip(".").lower() == r.strip().rstrip(".").lower()
                for r in repeats
            ):
                desc = rest.strip()
        out["description"] = desc

    return out


def clean_dimensions(value: str | None) -> str | None:
    """Tidy spacing and separators without reordering the artist's own labels."""
    if not value:
        return None
    out = " ".join(value.split())
    out = out.replace('"', "”").replace("″", "”")
    out = re.sub(r"\s*[x×X]\s*", " × ", out)
    out = re.sub(r'\s*([”])\s*', r"\1 ", out)
    return re.sub(r"\s+", " ", out).strip(" ×")


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--artworks", default="content/artworks")
    ap.add_argument("--out", default="content")
    args = ap.parse_args()

    root = Path(args.artworks)
    if not root.is_dir():
        raise SystemExit(f"no artwork content at {root}")

    works = []
    for folder in sorted(p for p in root.iterdir() if p.is_dir()):
        docx = folder / "Description.docx"
        if not docx.exists():
            raise SystemExit(f"{folder}: no Description.docx")
        meta = parse_description(docx)

        title = TITLE_OVERRIDES.get(
            str(meta.get("title") or "").strip().lower(), str(meta.get("title") or "").strip()
        )
        if not title:
            raise SystemExit(f"{folder.name}: the document has no title on its first line")

        discipline = meta.get("discipline") or DISCIPLINE_OVERRIDES.get(folder.name)
        category = CATEGORY_OF.get(discipline or "")
        if not category:
            raise SystemExit(
                f"{folder.name}: no Discipline line in its Description.docx, so "
                f"there is no category. One of: {', '.join(CATEGORY_OF)}."
            )

        works.append({
            "slug": folder.name,
            "title": title,
            "category": category,
            "discipline": discipline,
            "status": meta.get("status"),
            "year": meta.get("year"),
            "dimensions": meta.get("dimensions"),
            "medium": meta.get("material"),
            "blurb": meta.get("blurb"),
            "oneLiner": meta.get("oneLiner"),
            "description": meta.get("description"),
            "archiveFolder": f"{ARCHIVE_OF[discipline]}/{folder.name}",
        })

    order = {"paintings": 0, "functional-art": 1, "sculpture": 2}
    works.sort(key=lambda w: (order.get(w["category"], 9), w["discipline"] or "zz", w["title"]))

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "manifest.json").write_text(
        json.dumps({"count": len(works), "works": works}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    write_gaps(out_dir / "GAPS.md", works, out_dir / "images.json")
    print(f"content/manifest.json: {len(works)} works")
    return 0


def write_gaps(path: Path, works: list[dict], images_path: Path) -> None:
    images = {}
    if images_path.exists():
        images = json.loads(images_path.read_text(encoding="utf-8"))

    def missing(work: dict) -> list[str]:
        gaps = []
        if not work["dimensions"]:
            gaps.append("dimensions")
        if not work["medium"]:
            gaps.append("material")
        if not work["description"]:
            gaps.append("long description")
        if not work["oneLiner"]:
            gaps.append("one-liner")
        if not images.get(work["slug"]):
            gaps.append("photography")
        if not work["status"]:
            gaps.append("sold/available")
        return gaps

    rows = [(w, missing(w)) for w in works]
    incomplete = [(w, g) for w, g in rows if g]

    lines = [
        "# Content gaps",
        "",
        f"{len(incomplete)} of {len(works)} works need something before they are complete.",
        "Everything else is ready to publish.",
        "",
        "Edit the piece's `Description.docx` in `content/artworks/<slug>/`, then run",
        "`npm run content`.",
        "",
        "| Work | Category | Missing |",
        "| --- | --- | --- |",
    ]
    for work, gaps in incomplete:
        lines.append(f"| {work['title']} | {work['discipline'] or '?'} | {', '.join(gaps)} |")

    seen = defaultdict(list)
    for work in works:
        if work["dimensions"]:
            seen[(work["dimensions"].strip(), (work["medium"] or "").strip())].append(work["title"])
    dupes = {k: v for k, v in seen.items() if len(v) > 1}
    if dupes:
        lines += ["", "## Worth double-checking", "",
                  "These works share identical dimensions *and* material, which can",
                  "happen when a description is copied from another piece.", ""]
        for (dims, medium), titles in dupes.items():
            lines.append(f"- {', '.join(titles)} — all recorded as {dims}, {medium}")

    no_year = [w["title"] for w in works if not w.get("year")]
    if no_year:
        lines += ["", "## Years not recorded", "",
                  f"{len(no_year)} of {len(works)} works give no year. Add a `Year` line to",
                  "any Description.docx and it will appear on the piece's page.", ""]

    lines += ["", "## Fill these in", "",
              "One line per work. Dimensions as width x height x depth in inches.", ""]
    for work, gaps in incomplete:
        if "dimensions" in gaps or "material" in gaps:
            lines.append(f"- **{work['title']}**")
            if "dimensions" in gaps:
                lines.append("    - Dimensions: ")
            if "material" in gaps:
                lines.append("    - Material: ")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
