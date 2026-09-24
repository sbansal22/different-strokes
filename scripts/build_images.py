#!/usr/bin/env python3
"""
Turn original photographs into the web-sized WebP the site serves.

The originals are an archive, not part of the repo: 574 MB for the shots in
use. So this only does work for pieces whose archive folder it can actually
reach. Everything else keeps the images already committed, which means the
site rebuilds perfectly with no archive attached at all.

    src/assets/works/<slug>/<nn>-<role>.webp        full view, 2000px
    src/assets/works/<slug>/<nn>-<role>.thumb.webp  grid and thumbnails, 800px

Writes content/images.json, which the artworks.ts generator consumes.

Usage:
  python3 scripts/build_images.py                          # repo only
  python3 scripts/build_images.py --source ~/Drive/Artwork  # re-derive
"""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = 300_000_000

FULL_EDGE, THUMB_EDGE = 2000, 800
FULL_QUALITY, THUMB_QUALITY = 82, 78

# --------------------------------------------------------------------------
# The naming convention
#
# Every photograph is named art-<view>[-shadow].<ext>. The view decides what a
# shot is used for and where it appears; nothing else about the filename
# matters, and the same names are used in every folder.
#
#   art-bg           the piece in a room            cover, "In the room"
#   art-front        straight on, filling the frame "Full view"
#   art-back         the other side                 "Back view"
#   art-left         from the left                  "Left view"
#   art-right                                       "Right view"
#   art-top          from above                     "Top view"
#   art-side                                        "Side view"
#   art-white        cut out on white, no angle     "On white"
#   art-detail-1     a close-up, numbered           "Detail"
#   art-plate-1      one piece of a collection      "No. 1"
#
# Two optional treatments, in this order: -white for a cut-out of that view,
# -shadow for a drop shadow. So art-back-white-shadow.jpg is the back of the
# piece, cut out on white, with a shadow. Where a shot and its shadow twin
# both exist, the shadow one is used.
# --------------------------------------------------------------------------
VIEWS = ["bg", "front", "white", "back", "left", "right",
         "left-back", "right-back", "left-front", "right-front",
         "top", "side", "detail", "plate"]

# Order down the detail page.
GALLERY_ORDER = {v: i for i, v in enumerate(VIEWS)}
# Which shot fronts the grid card: the piece in a room, else straight on.
COVER_ORDER = {"bg": 0, "front": 1, "white": 2, "detail": 3, "plate": 4,
               "back": 5, "left": 6, "right": 7,
               "left-front": 8, "right-front": 9, "left-back": 10, "right-back": 11,
               "top": 12, "side": 13}

CAPTIONS = {"bg": "In the room", "front": "Full view", "white": "On white",
            "back": "Back view", "left": "Left view", "right": "Right view",
            "left-back": "Back left view", "right-back": "Back right view",
            "left-front": "Front left view", "right-front": "Front right view",
            "top": "Top view", "side": "Side view", "detail": "Detail"}

ART = re.compile(r"^art-((?:left|right)-(?:back|front)|(?:back|front)-(?:left|right)"
                 r"|bg|front|back|left|right|top|side|white|detail|plate)"
                 r"(?:-(\d+))?(-white)?(-shadow)?$", re.I)

# Names used before the convention existed. Kept so an archive that has not
# been renamed still builds; scripts/normalise_archive.py renames one.
# Order matters: a direction beats "white", because console-white-bg-back is a
# back view cut out on white, not a background shot.
LEGACY = [
    (re.compile(r"nametag", re.I), None),
    (re.compile(r"\bno\.?\s*\d+\b", re.I), "plate"),
    (re.compile(r"left.?back|back.?left", re.I), "left-back"),
    (re.compile(r"right.?back|back.?right", re.I), "right-back"),
    (re.compile(r"left.?front|front.?left", re.I), "left-front"),
    (re.compile(r"right.?front|front.?right", re.I), "right-front"),
    (re.compile(r"front", re.I), "front"),
    (re.compile(r"back", re.I), "back"),
    (re.compile(r"left", re.I), "left"),
    (re.compile(r"right", re.I), "right"),
    (re.compile(r"\btop\b|-top", re.I), "top"),
    (re.compile(r"side", re.I), "side"),
    (re.compile(r"white", re.I), "white"),
    (re.compile(r"-bg|bg\(|_bg|\bbg\b", re.I), "bg"),
    (re.compile(r"painting-only|console-only|photo", re.I), "front"),
]

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff", ""}
SKIP_DIRS = {"assembly pictures"}

# When the automatic cover is wrong. Value is a source filename fragment.
COVER_OVERRIDES: dict[str, str] = {}


# --------------------------------------------------------------------------
# reading the originals
# --------------------------------------------------------------------------
def stem_of(path: str) -> str:
    """Filename without a real image extension (a plate numbered 'No. 1' is not one)."""
    name = Path(path).name
    suffix = Path(name).suffix.lower()
    return name[: -len(suffix)] if suffix in IMAGE_EXTS and suffix else name


def normalise_view(view: str) -> str:
    """'back-left' and 'left-back' are the same angle; store it one way."""
    parts = view.lower().split("-")
    if len(parts) == 2 and parts[0] in ("back", "front"):
        parts.reverse()
    return "-".join(parts)


def classify(path: str) -> dict | None:
    """Read a filename as {view, number, shadow}, or None to leave it out."""
    stem = stem_of(path)
    match = ART.match(stem)
    if match:
        view, number, white, shadow = match.groups()
        return {"view": normalise_view(view), "number": int(number) if number else None,
                "white": bool(white), "shadow": bool(shadow)}

    if Path(stem).name.lower().startswith("art-"):
        print(f"  ! {path}: not a recognised name, so guessing from its words. "
              f"See the naming list in scripts/README.md.", file=sys.stderr)

    for pattern, view in LEGACY:
        if pattern.search(stem):
            if view is None:
                return None
            number = (re.search(r"\bno\.?\s*(\d+)\b", stem, re.I)
                      or re.search(r"-(\d+)$", stem))
            return {"view": view, "number": int(number.group(1)) if number else None,
                    "white": view != "white" and bool(re.search(r"white", stem, re.I)),
                    "shadow": bool(re.search(r"shadow", stem, re.I))}
    return {"view": "detail", "number": None,
            "white": bool(re.search(r"white", stem, re.I)),
            "shadow": bool(re.search(r"shadow", stem, re.I))}


def collect(folder: Path) -> list[dict]:
    found = []
    for path in sorted(folder.rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        parts = [p.strip().lower() for p in path.relative_to(folder).parts]
        if any(p in SKIP_DIRS for p in parts):
            continue
        suffix = path.suffix.lower()
        if suffix in {".docx", ".pdf", ".doc", ".txt"}:
            continue
        if suffix not in IMAGE_EXTS and not re.fullmatch(r"\.\s*\d+", suffix):
            continue
        kind = classify(str(path.relative_to(folder)))
        if kind is None:
            continue
        found.append({"path": str(path.relative_to(folder)), **kind})
    return found


def embedded_jpeg(path: Path) -> Image.Image | None:
    """Largest JPEG inside a Canon CR3 raw."""
    data = path.read_bytes()
    best, best_px, i = None, 0, 0
    while True:
        i = data.find(b"\xff\xd8\xff", i)
        if i < 0:
            break
        j = data.find(b"\xff\xd9", i + 3)
        if j < 0:
            break
        try:
            im = Image.open(io.BytesIO(data[i:j + 2]))
            im.load()
            if im.width * im.height > best_px:
                best, best_px = im, im.width * im.height
        except Exception:
            pass
        i = j + 2
    return best


# A camera records which way up it was held as a tag, rather than turning the
# pixels. A WebP is shown exactly as stored, so unless the turn is applied here
# a portrait photograph comes out lying on its side.
RAW_TURN = {2: Image.Transpose.FLIP_LEFT_RIGHT, 3: Image.Transpose.ROTATE_180,
            4: Image.Transpose.FLIP_TOP_BOTTOM, 5: Image.Transpose.TRANSPOSE,
            6: Image.Transpose.ROTATE_270, 7: Image.Transpose.TRANSVERSE,
            8: Image.Transpose.ROTATE_90}


def raw_orientation(path: Path) -> int:
    """The orientation a CR3 records in its own metadata. Its preview lacks it."""
    head = path.open("rb").read(400_000)
    for marker in (b"II*\x00", b"MM\x00*"):
        i = head.find(marker)
        if i >= 0:
            exif = Image.Exif()
            exif.load(head[i:i + 65536])
            return exif.get(0x0112) or 1
    return 1


def load_image(path: Path) -> Image.Image | None:
    try:
        header = path.open("rb").read(16)
    except OSError:
        return None
    if header[4:8] == b"ftyp":
        im = embedded_jpeg(path)
        if im is None:
            return None
        # The preview inside a raw normally carries no orientation of its own,
        # and the raw's metadata does. Use the preview's if it has one, so a
        # camera that does tag it is not turned twice.
        if (im.getexif().get(0x0112) or 1) != 1:
            return ImageOps.exif_transpose(im)
        turn = RAW_TURN.get(raw_orientation(path))
        return im.transpose(turn) if turn else im
    try:
        im = Image.open(path)
        im.load()
        return ImageOps.exif_transpose(im)
    except Exception:
        pass
    # A corrupt ancillary chunk (a bad eXIf CRC) makes Pillow reject an
    # otherwise good file. ImageMagick is lenient.
    tmp = Path(tempfile.gettempdir()) / f"ds-recover-{os.getpid()}.png"
    try:
        subprocess.run(["convert", str(path), "-auto-orient", str(tmp)], check=True,
                       capture_output=True, timeout=120)
        im = Image.open(tmp)
        im.load()
        return im
    except Exception:
        return None
    finally:
        tmp.unlink(missing_ok=True)


# --------------------------------------------------------------------------
# choosing and writing
# --------------------------------------------------------------------------
def dedupe(images: list[dict]) -> list[dict]:
    """
    A shot and its drop-shadow twin are the same view; keep the shadow.

    Twinning is by filename, not by view: art-front and art-front-shadow are
    one photograph in two treatments, while two details or two plates are
    different photographs that both happen to share a view.
    """
    groups: dict[str, dict] = {}
    for img in images:
        key = re.sub(r"[-_ ]+", "", re.sub(r"[-_ ]?shadow", "", stem_of(img["path"]).lower()))
        keep = groups.get(key)
        if keep is None or (img["shadow"] and not keep["shadow"]):
            groups[key] = img
    return list(groups.values())


def caption_for(img: dict) -> str:
    if img["view"] == "plate":
        return f"No. {img['number']}" if img["number"] else "Plate"
    return CAPTIONS.get(img["view"], "Detail")


def choose(slug: str, images: list[dict]) -> list[dict]:
    usable = dedupe(images)
    if not usable:
        return []
    order = lambda i: (COVER_ORDER.get(i["view"], 99), i["number"] or 0, i["path"])
    override = COVER_OVERRIDES.get(slug)
    cover = next((i for i in usable if override and override.lower() in i["path"].lower()), None)
    if cover is None:
        cover = min(usable, key=order)
    rest = sorted((i for i in usable if i is not cover),
                  key=lambda i: (GALLERY_ORDER.get(i["view"], 99), i["number"] or 0, i["path"]))
    return [cover] + rest


def fit(im: Image.Image, edge: int) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    if max(w, h) <= edge:
        return im
    scale = edge / max(w, h)
    return im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)


def write_pair(im: Image.Image, full: Path, thumb: Path) -> tuple[int, int]:
    full.parent.mkdir(parents=True, exist_ok=True)
    sized = fit(im, FULL_EDGE)
    sized.save(full, "WEBP", quality=FULL_QUALITY, method=5)
    fit(im, THUMB_EDGE).save(thumb, "WEBP", quality=THUMB_QUALITY, method=5)
    return sized.size


def prune(folder: Path, entries: list[dict]) -> int:
    """Remove generated images this work no longer uses (outputs are numbered
    by position, so removing or reordering a photo renames the rest)."""
    if not folder.is_dir():
        return 0
    keep = {Path(e["full"]).name for e in entries} | {Path(e["thumb"]).name for e in entries}
    removed = 0
    for path in folder.glob("*.webp"):
        if path.name not in keep:
            path.unlink()
            removed += 1
    if not any(folder.iterdir()):
        folder.rmdir()
    return removed


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=os.environ.get("DS_ARTWORK_ARCHIVE"),
                    help="the photograph archive; omit to keep the committed images")
    ap.add_argument("--manifest", default="content/manifest.json")
    ap.add_argument("--out", default="src/assets/works")
    ap.add_argument("--index", default="content/images.json")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    out_root, index_path = Path(args.out), Path(args.index)
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    index: dict[str, list] = {}
    if index_path.exists():
        index = json.loads(index_path.read_text(encoding="utf-8"))

    archive = Path(args.source).expanduser() if args.source else None
    if archive and not archive.is_dir():
        print(f"  ! archive not found at {archive}; keeping committed images", file=sys.stderr)
        archive = None

    rebuilt = skipped = 0
    missing: list[str] = []
    for work in manifest["works"]:
        slug = work["slug"]
        folder = work.get("archiveFolder")
        source_dir = (archive / folder) if (archive and folder) else None

        if source_dir is None or not source_dir.is_dir():
            skipped += 1
            if archive and folder:
                missing.append(folder)
            continue

        entries = []
        for n, pick in enumerate(choose(slug, collect(source_dir))):
            src = source_dir / pick["path"]
            name = f"{n:02d}-{pick['view']}" + (f"-{pick['number']}" if pick["number"] else "")
            full = out_root / slug / f"{name}.webp"
            thumb = out_root / slug / f"{name}.thumb.webp"

            fresh = (full.exists() and thumb.exists()
                     and min(full.stat().st_mtime, thumb.stat().st_mtime) >= src.stat().st_mtime)
            if fresh and not args.force:
                with Image.open(full) as probe:
                    size = probe.size
            else:
                im = load_image(src)
                if im is None:
                    print(f"  ! unreadable {src}", file=sys.stderr)
                    continue
                size = write_pair(im, full, thumb)
                print(f"  {slug}/{name}.webp  {size[0]}x{size[1]}", file=sys.stderr)

            entries.append({
                "full": f"{slug}/{name}.webp", "thumb": f"{slug}/{name}.thumb.webp",
                "view": pick["view"], "caption": caption_for(pick),
                "width": size[0], "height": size[1], "source": pick["path"],
            })

        index[slug] = entries
        prune(out_root / slug, entries)
        rebuilt += 1

    # A renamed or removed work leaves a whole folder behind.
    live = {w["slug"] for w in manifest["works"]}
    for folder_path in sorted(p for p in out_root.glob("*") if p.is_dir()):
        if folder_path.name not in live:
            for file in folder_path.glob("*"):
                file.unlink()
            folder_path.rmdir()
            print(f"  removed {folder_path.name}/ (no longer a work)", file=sys.stderr)
    for slug in [k for k in index if k not in live]:
        del index[slug]

    index_path.parent.mkdir(parents=True, exist_ok=True)
    index_path.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")

    total = sum(len(v) for v in index.values())
    if missing:
        shown = ", ".join(missing[:4]) + (f" and {len(missing) - 4} more" if len(missing) > 4 else "")
        print(f"  note: no archive folder for {shown}", file=sys.stderr)
        print(f"        Their committed images are kept. If the originals do exist, "
              f"scripts/normalise_archive.py renames folders to match.", file=sys.stderr)
    note = f", {skipped} kept as committed" if skipped else ""
    print(f"  {total} images across {len([v for v in index.values() if v])} works"
          f" ({rebuilt} from the archive{note})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
