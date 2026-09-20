#!/usr/bin/env python3
"""
Shrink a print-ready catalogue PDF to a web-sized one.

The catalogues come out of Adobe at 300ppi CMYK for print, which is 80 MB+ for
a 50-page book. That is bad for the repo and worse for a visitor on mobile
data. This downsamples to 150ppi and converts to sRGB, which is
indistinguishable on screen — text stays vector and is untouched.

Usage:
  python3 scripts/compress_catalogue.py ~/Downloads/catalogue2026.pdf \
      public/catalogues/different-strokes-catalogue-2026.pdf
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

DPI = 150
JPEG_QUALITY = 88


def compress(src: Path, dst: Path, dpi: int, quality: int) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.7",
            "-dNOPAUSE", "-dQUIET", "-dBATCH",
            "-dDownsampleColorImages=true",
            "-dColorImageDownsampleType=/Bicubic",
            f"-dColorImageResolution={dpi}",
            "-dDownsampleGrayImages=true",
            "-dGrayImageDownsampleType=/Bicubic",
            f"-dGrayImageResolution={dpi}",
            "-dAutoFilterColorImages=false",
            "-dColorImageFilter=/DCTEncode",
            f"-dJPEGQ={quality}",
            "-sColorConversionStrategy=RGB",
            "-dProcessColorModel=/DeviceRGB",
            f"-sOutputFile={dst}",
            str(src),
        ],
        check=True,
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", type=Path)
    ap.add_argument("destination", type=Path)
    ap.add_argument("--dpi", type=int, default=DPI)
    ap.add_argument("--quality", type=int, default=JPEG_QUALITY)
    args = ap.parse_args()

    if not shutil.which("gs"):
        print("ghostscript (gs) is not installed", file=sys.stderr)
        return 1
    if not args.source.exists():
        print(f"no such file: {args.source}", file=sys.stderr)
        return 1

    before = args.source.stat().st_size
    compress(args.source, args.destination, args.dpi, args.quality)
    after = args.destination.stat().st_size

    print(f"{args.source.name}: {before/1e6:.1f} MB -> {after/1e6:.1f} MB "
          f"({before/after:.1f}x smaller) at {args.dpi}ppi")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
