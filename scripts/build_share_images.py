#!/usr/bin/env python3
"""
Build the images that appear when a link is shared.

WhatsApp, Instagram DMs, Facebook and X all read og:image. Without one a
shared link is a blank grey box, which matters most for an artist whose
audience arrives through Instagram.

Each work gets a 1200x630 JPEG: its cover, letterboxed on the site's linen
background so nothing is cropped. Plus one default for the pages that are not
a single work.

Output goes to public/og/, so the URLs are stable and absolute — scrapers do
not run JavaScript and will not follow a hashed asset.

Usage:
  python3 scripts/build_share_images.py
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = 300_000_000

WIDTH, HEIGHT = 1200, 630
PADDING = 36
QUALITY = 82
# --color-linen from styles.css, the site's own off-white.
LINEN = (240, 235, 226)


def card(source: Path, out: Path) -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), LINEN)
    art = Image.open(source).convert("RGB")

    box = (WIDTH - PADDING * 2, HEIGHT - PADDING * 2)
    scale = min(box[0] / art.width, box[1] / art.height)
    art = art.resize((max(1, round(art.width * scale)),
                      max(1, round(art.height * scale))), Image.LANCZOS)

    canvas.paste(art, ((WIDTH - art.width) // 2, (HEIGHT - art.height) // 2))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", default="content/images.json")
    ap.add_argument("--assets", default="src/assets/works")
    ap.add_argument("--hero", default="src/assets/studio-hero.webp")
    ap.add_argument("--out", default="public/og")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    index = json.loads(Path(args.images).read_text(encoding="utf-8"))
    assets, out_dir = Path(args.assets), Path(args.out)

    built = 0
    for slug, entries in index.items():
        if not entries:
            continue
        source = assets / entries[0]["full"]
        out = out_dir / f"{slug}.jpg"
        if out.exists() and not args.force and out.stat().st_mtime >= source.stat().st_mtime:
            continue
        if not source.exists():
            print(f"  ! missing {source}", file=sys.stderr)
            continue
        card(source, out)
        built += 1

    default = out_dir / "default.jpg"
    if args.force or not default.exists():
        card(Path(args.hero), default)
        built += 1

    live = set(index) | {"default"}
    for stale in sorted(out_dir.glob("*.jpg")):
        if stale.stem not in live:
            stale.unlink()
            print(f"  removed {stale.name} (no longer a work)", file=sys.stderr)

    total = len(list(out_dir.glob("*.jpg")))
    size = sum(f.stat().st_size for f in out_dir.glob("*.jpg"))
    print(f"  {built} built, {total} share images, {size/1e6:.1f} MB total",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
