#!/usr/bin/env python3
"""
Render the first page of each catalogue PDF into a cover thumbnail.

The catalogue list needs a tile per year. Rather than hand-cropping one, take
page 1 of the PDF itself — which is the catalogue's own cover.

Writes src/assets/catalogues/<year>.webp.

Usage:
  python3 scripts/build_catalogue_covers.py
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = 300_000_000

WIDTH = 900          # generous for a tile shown at ~112px, sharp on retina
RENDER_DPI = 150
QUALITY = 82


def year_of(pdf: Path) -> str | None:
    match = re.search(r"(20\d{2})", pdf.stem)
    return match.group(1) if match else None


def render_first_page(pdf: Path, out: Path) -> tuple[int, int]:
    with tempfile.TemporaryDirectory() as tmp:
        prefix = Path(tmp) / "page"
        subprocess.run(
            ["pdftoppm", "-f", "1", "-l", "1", "-r", str(RENDER_DPI),
             "-png", str(pdf), str(prefix)],
            check=True, capture_output=True,
        )
        rendered = sorted(Path(tmp).glob("page*.png"))
        if not rendered:
            raise RuntimeError(f"pdftoppm produced nothing for {pdf}")
        image = Image.open(rendered[0]).convert("RGB")

    if image.width > WIDTH:
        scale = WIDTH / image.width
        image = image.resize((WIDTH, round(image.height * scale)), Image.LANCZOS)

    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out, "WEBP", quality=QUALITY, method=5)
    return image.size


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdfs", default="public/catalogues")
    ap.add_argument("--out", default="src/assets/catalogues")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    pdfs = sorted(Path(args.pdfs).glob("*.pdf"))
    if not pdfs:
        print(f"no PDFs in {args.pdfs} — nothing to do", file=sys.stderr)
        return 0

    for pdf in pdfs:
        year = year_of(pdf)
        if not year:
            print(f"  ! cannot read a year from {pdf.name}, skipping", file=sys.stderr)
            continue
        out = Path(args.out) / f"{year}.webp"
        if out.exists() and not args.force and out.stat().st_mtime >= pdf.stat().st_mtime:
            print(f"  {year}: up to date", file=sys.stderr)
            continue
        size = render_first_page(pdf, out)
        print(f"  {year}: {out} {size[0]}x{size[1]} "
              f"{out.stat().st_size // 1024}KB", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
