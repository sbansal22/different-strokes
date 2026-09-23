#!/usr/bin/env python3
"""Rebuild the site icons from the Different Strokes logo.

The favicon is the "ds" monogram, cropped out of the full logo the studio
already uses. The old site had the same mark, but only ever at 48px, which
looks soft on a modern screen; this crops it from the high-resolution
original instead and writes every size a browser might ask for.

The mark sits on the site's own paper colour rather than pure white, and the
ink matches the body text, so the tab looks like it belongs to the site. It
is deliberately opaque: a transparent icon disappears against a dark tab
strip, and iOS fills transparency with black.

Source:  public/images/different_strokes_logo_with_name.jpg
Writes:  public/favicon.ico, public/icon.png, public/apple-touch-icon.png

Run with: npm run icons
"""
import pathlib
import sys

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "images" / "different_strokes_logo_with_name.jpg"

# The site's palette, from src/styles.css, converted from oklch.
PAPER = (245, 241, 233)   # --paper, oklch(0.958 0.011 84.5)
INK = (29, 27, 24)        # --ink,   oklch(0.222 0.007 74.6)

ICO_SIZES = [16, 32, 48, 64, 128, 256]
PADDING = 0.16  # breathing room around the glyph, as a fraction of its size


def monogram_band(grey: np.ndarray) -> tuple[int, int]:
    """The rows holding the monogram: the logo's first band of ink.

    The logo is the "ds" mark above and the DIFFERENT STROKES wordmark below,
    separated by a clear horizontal gap.
    """
    rows = (grey < 128).any(axis=1)
    bands, start = [], None
    for i, inked in enumerate(rows):
        if inked and start is None:
            start = i
        elif not inked and start is not None:
            bands.append((start, i))
            start = None
    if start is not None:
        bands.append((start, len(rows)))
    if not bands:
        sys.exit(f"no ink found in {SOURCE}")
    return bands[0]


def find_monogram(grey: np.ndarray, band: tuple[int, int]) -> tuple[int, int, int, int]:
    """Locate the "ds" glyph within its band, ignoring the long swash."""
    ink = grey < 128
    top, bottom = band

    # Within that band, the swash is a thin horizontal line running most of
    # the width while the glyph is tall. Keep only the tall columns.
    band = ink[top:bottom]
    column_heights = band.sum(axis=0)
    tall = np.where(column_heights > (bottom - top) * 0.25)[0]
    if tall.size == 0:
        sys.exit("could not separate the monogram from the swash")
    left, right = int(tall.min()), int(tall.max())

    glyph_rows = np.where(band[:, left : right + 1].any(axis=1))[0]
    return left, top + int(glyph_rows.min()), right, top + int(glyph_rows.max())


def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"missing {SOURCE.relative_to(ROOT)}")

    original = Image.open(SOURCE).convert("RGB")
    grey = np.array(original.convert("L"))
    band = monogram_band(grey)
    left, top, right, bottom = find_monogram(grey, band)

    # Blank everything outside the monogram's own band first. Without this,
    # any padding much above 0.16 reaches far enough down to catch the top of
    # the wordmark, and a smear of lettering appears under the mark.
    isolated = np.array(original).copy()
    isolated[: band[0]] = 255
    isolated[band[1] :] = 255

    # A square frame centred on the glyph. The swash runs off the left and
    # right edges, which is how the original icon looked too.
    side = int(max(right - left, bottom - top) * (1 + PADDING * 2))
    centre_x, centre_y = (left + right) // 2, (top + bottom) // 2
    crop = Image.fromarray(isolated).crop((
        centre_x - side // 2,
        centre_y - side // 2,
        centre_x + side // 2,
        centre_y + side // 2,
    ))

    # Recolour: the scan is black on white, we want ink on paper. Use the
    # scan's darkness as the blend so the curves keep their smooth edges.
    darkness = (255 - np.array(crop).astype(np.float32).mean(axis=2)) / 255.0
    blend = darkness[..., None]
    pixels = np.array(PAPER, np.float32) * (1 - blend) + np.array(INK, np.float32) * blend
    mark = Image.fromarray(pixels.round().astype(np.uint8), "RGB")

    master = mark.resize((512, 512), Image.LANCZOS)
    master.save(ROOT / "public" / "icon.png")
    master.resize((180, 180), Image.LANCZOS).save(ROOT / "public" / "apple-touch-icon.png")
    master.save(
        ROOT / "public" / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
    )

    print(f"monogram at {left},{top}-{right},{bottom} of {original.size[0]}x{original.size[1]};"
          f" wordmark masked from row {band[1]}")
    for name in ("favicon.ico", "icon.png", "apple-touch-icon.png"):
        path = ROOT / "public" / name
        print(f"  wrote public/{name} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
