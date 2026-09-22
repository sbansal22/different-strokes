#!/usr/bin/env python3
"""
Write public/sitemap.xml from the generated content.

The site goes from one URL to thirty-odd overnight, so hand-maintaining this
would rot immediately. Every work page, catalogue year and static route is
listed, derived from the same manifest the site is built from.

Usage:
  python3 scripts/build_sitemap.py
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

# Rough guidance for crawlers: the collection changes most often.
STATIC_ROUTES = [
    ("/", "1.0"),
    ("/works", "0.9"),
    ("/catalogues", "0.6"),
    ("/about", "0.5"),
    ("/contact", "0.5"),
]


def site_url(site_ts: Path) -> str:
    """Read the canonical origin out of src/data/site.ts, the single source."""
    match = re.search(r'url:\s*"([^"]+)"', site_ts.read_text(encoding="utf-8"))
    if not match:
        raise SystemExit(f"could not find a url in {site_ts}")
    return match.group(1).rstrip("/")


def catalogue_years(catalogues_ts: Path) -> list[str]:
    return re.findall(r'year:\s*"(\d{4})"', catalogues_ts.read_text(encoding="utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default="content/manifest.json")
    ap.add_argument("--site", default="src/data/site.ts")
    ap.add_argument("--catalogues", default="src/data/catalogues.ts")
    ap.add_argument("--out", default="public/sitemap.xml")
    args = ap.parse_args()

    origin = site_url(Path(args.site))
    today = date.today().isoformat()

    urls: list[tuple[str, str]] = list(STATIC_ROUTES)
    urls += [(f"/catalogues/{year}", "0.5")
             for year in catalogue_years(Path(args.catalogues))]

    works = json.loads(Path(args.manifest).read_text(encoding="utf-8"))["works"]
    urls += [(f"/works/{work['slug']}", "0.8") for work in works]

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, priority in urls:
        lines += ["  <url>",
                  f"    <loc>{escape(origin + path)}</loc>",
                  f"    <lastmod>{today}</lastmod>",
                  f"    <priority>{priority}</priority>",
                  "  </url>"]
    lines.append("</urlset>")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"  {out}: {len(urls)} URLs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
