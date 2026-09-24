# Content

Everything on the site is **generated**. You never edit `src/data/artworks.ts`
or anything under `src/assets/` — they are rebuilt from scratch on every run.

Your work lives in one folder — a subfolder per piece, holding its
photographs and its `Description.docx`, side by side. Edit it there, then point
one command at it:

```
npm run content -- --source ~/Downloads
```

That reads your folder and rebuilds the site from it. **It never writes to
your folder** — `--source` is only ever read. The folder can be anywhere; the
subfolders just need to be named after the piece (`the-tree`, `vintage-noir`).

The repo keeps its own copy of each description, because Cloudflare builds the
site from GitHub and cannot see your laptop. That copy is refreshed from your
folder every time you run the command, so you never edit it directly.

Then preview it, and publish it:

```
npm run dev
git add -A && git commit -m "Update artwork" && git push
```

Cloudflare rebuilds the live site on its own within a couple of minutes.

---

## Quick reference

| I want to | Do this |
| --- | --- |
| Change a description, dimensions, title, year, availability | Edit the `Description.docx` in your folder, run `npm run content -- --source <folder>` |
| Replace, add or remove a photograph | Change the files in your folder, run `npm run content -- --source <folder>` |
| Add a new piece | `python3 scripts/add_artwork.py <folder>`, then `npm run content` |
| Add a catalogue | `python3 scripts/compress_catalogue.py <pdf> public/catalogues/<name>.pdf`, then add the year to `src/data/catalogues.ts` |
| See what is still missing | Read `content/GAPS.md` — rewritten every run |
| Preview it | `npm run dev` |

---

## Where everything lives

| What | Where | In git? |
| --- | --- | --- |
| **Everything written about a piece** | the `Description.docx` in your folder — copied into `content/artworks/` on each run | yes, as a copy |
| The images the site serves | `src/assets/works/` | yes, 35 MB |
| **Original photographs** | the archive, a folder on disk | **no, 811 MB** |
| A template to start a new piece | `content/_new-artwork-template/` | yes |

One piece, one document. It holds the title, the text, the medium, the
dimensions and the availability. There is no second file, no database and no
code to edit.

**The repo is self-sufficient.** `npm run content` rebuilds every page with no
archive attached — it leaves the committed images alone. The archive is only
needed when a photograph changes.

### The archive

Set it once in `~/.zshrc`, then you never pass a path again:

```
export DS_ARTWORK_ARCHIVE=~/"Different Strokes/Artwork"
```

It must be an ordinary folder, laid out like this:

```
<archive>/
    Paintings/    Consoles/    Cabinets/    Scultpures/
        <slug>/
            Description.docx        ← a copy, refreshed automatically
            art-bg.jpg
            art-front-shadow.jpg
            …
    _new-artwork-template/
```

**The path is the root**, the folder holding those four — never an individual
piece. The scripts find each work themselves at `<archive>/<Category>/<slug>`.

> A copy of each document is kept beside its photographs so the archive folder
> holds everything about a piece. **Those copies are overwritten on every run.
> Always edit the one in `content/artworks/`.**

Google Drive works as an archive only with Google Drive for desktop installed,
which mounts it at `~/Library/CloudStorage/GoogleDrive-<email>/My Drive/` — and
set that folder to *Available offline*, or the scripts will sit waiting on
downloads. Browser-only Drive gives no path and cannot be used; keep a local
folder or an external disk and treat Drive as backup.

---

## Adding a new piece

1. Copy `content/_new-artwork-template/` somewhere — your Desktop is fine — and
   rename it after the work.
2. Fill in `Description.docx`. See **The document** below.
3. Add the photographs, named as in **Photographs** below.
4. Run:

```
python3 scripts/add_artwork.py ~/Desktop/the-harbour-console
npm run content
npm run dev
```

`add_artwork.py` copies the document into the repo and files the originals into
the archive under the right category, so the folder you started with can be
deleted. It is the only command that takes a piece's folder.

Then commit.

---

## Changing a piece

### The words

Open `content/artworks/<slug>/Description.docx` in Word, edit, save, run
`npm run content`. No archive needed.

### The photographs

Edit them in `<archive>/<Category>/<slug>/`, then run `npm run content`.

- **Replace one** — save the new photo over the old, keeping the filename.
- **Add one** — drop it in, named for the view it shows.
- **Remove one** — delete it. The generated copies go with it.
- **Change the cover** — rename the shot you want to `art-bg`.

Renaming a piece changes its URL. The pipeline cleans up the old image folder
and share card, but a link someone already has will break — rename before
launch, not after.

---

## The document

The **first line is the title**. Then each heading on its own line, with its
value on the next:

```
Dimensions          41" width x 53" height x 3" depth
Material            3D Ceramic painting made on wood, framed in wood
Discipline          Console
Status              Available
Year                2026
Short Description   one or two sentences, used on cards and in search results
One liner           the short line shown under the title
Long Description    the full note, in your own words — blank lines make paragraphs
```

**Discipline is the only one that must be filled in.** It decides the category
the piece files under and where its originals live. One of:

```
Canvas | Ceramic | Glass | Soft Pastel | Console | Cabinet | Sculpture
```

Leave anything else out, or write `[todo]`, and the page shows *To be
confirmed* instead of a guess. `Year` is hidden entirely until it is filled in.

A heading may appear twice — one empty, one answered — and the `[todo]` is
ignored. Order does not matter.

---

## Photographs

Every file is `art-<view>[-n][-white][-shadow].<ext>`.

| Filename | Used as | Caption |
| --- | --- | --- |
| `art-bg.jpg` | the piece in a room | **cover**, "In the room" |
| `art-front.jpg` | straight on, filling the frame | "Full view" |
| `art-white.jpg` | cut out on white, no particular angle | "On white" |
| `art-back.jpg` | the other side | "Back view" |
| `art-left.jpg` `art-right.jpg` `art-top.jpg` `art-side.jpg` | angles | "Left view", … |
| `art-detail-1.jpg` | a close-up, numbered | "Detail" |
| `art-plate-1.jpg` | one piece of a collection | "No. 1" |

Two optional treatments, in this order. `-white` means that view cut out on
white; `-shadow` adds a drop shadow. So `art-back-white-shadow.jpg` is the back
of the piece, cut out, with a shadow.

Where a shot and its shadow twin both exist — `art-front.jpg` and
`art-front-shadow.jpg` — they are one photograph in two treatments, and the
shadow one is used.

**Order on the page follows the table.** The cover is `art-bg`, falling back to
`art-front`, then `art-white`. So three photographs named `art-bg`,
`art-front-shadow` and `art-back-shadow` give you a cover plus those two, in
that order.

Two genuinely different shots of the same view get a number: `art-back.jpg` and
`art-back-2.jpg`. If the second is really a close-up, `art-detail-1.jpg`
describes it better.

Anything with `nametag` in the name, and anything inside an `Assembly
pictures/` folder, is ignored. Filenames that predate the convention still
work; `scripts/normalise_archive.py` renames an archive into it.

### What happens to a photograph

Everything the site serves is WebP; nothing in the archive is used directly.
Each photograph becomes two files — a full view capped at 2000px on the long
edge, and an 800px thumbnail for the grid. A 20 MB camera JPEG comes out around
240 KB and 60 KB.

JPEG, PNG, HEIC, TIFF, files with no extension, and Canon CR3 raws are all read
— for a raw, the full-size JPEG preview inside it is used. Keep originals at
whatever size the camera produces: the archive is where quality is preserved,
and the repo only ever holds the web-sized versions.

---

## Adding a catalogue

Print PDFs are 300ppi CMYK and run to 80 MB. Compress first — 150ppi is
indistinguishable on screen and 7–11x smaller. **Never commit the original.**

```
python3 scripts/compress_catalogue.py ~/Desktop/catalogue2027.pdf \
    public/catalogues/different-strokes-catalogue-2027.pdf
npm run content
```

Then add the year to `catalogues` in `src/data/catalogues.ts`. The cover tile
is generated from page 1 automatically.

To list which works appear in a catalogue, fill in its `works` array with
artwork slugs and the plate listing appears on the page.

---

## The scripts

| Script | Does | Writes |
| --- | --- | --- |
| `sync.py` | runs all seven below, in order | — |
| `pull_documents.py` | copies each description in from `--source`; never writes to it | `content/artworks/` |
| `extract_content.py` | reads every `Description.docx` | `content/manifest.json`, `content/GAPS.md` |
| `build_images.py` | originals → WebP; skips any piece whose archive folder is not attached | `src/assets/works/` |
| `build_catalogue_covers.py` | page 1 of each catalogue PDF | `src/assets/catalogues/` |
| `gen_artworks.py` | manifest → TypeScript | `src/data/artworks.ts` |
| `build_share_images.py` | covers → link-preview cards | `public/og/` |
| `build_sitemap.py` | everything → sitemap | `public/sitemap.xml` |
| `add_artwork.py` | imports a new piece from a folder | repo and archive |
| `compress_catalogue.py` | shrinks a print PDF for the web | wherever you point it |
| `normalise_archive.py` | renames an archive into the convention | the archive |
| `normalise_documents.py` | gives every document the same headings | `content/artworks/` |
| `migrate_to_repo.py` | one-time, already run: moved content off `~/Downloads` | `content/artworks/` |
| `fold_into_documents.py` | one-time, already run: folded `work.json` into the documents | `content/artworks/` |

All are idempotent — re-running only redoes what changed. `npm run
content:force` rebuilds everything from scratch.

`content/GAPS.md` is rewritten every run: what each work is still missing,
which pieces share suspiciously identical dimensions, and which have no year.

### Hand-maintained exceptions

Small reviewable maps, rather than logic buried in the scripts:

- `TITLE_OVERRIDES`, `DISCIPLINE_OVERRIDES` (`extract_content.py`)
- `COVER_OVERRIDES` (`build_images.py`) — when the automatic cover is wrong
- `LEGACY` (`build_images.py`) — how pre-convention filenames are read
- `FEATURED` / `SPOTLIGHT` (`src/routes/index.tsx`) — which pieces lead the homepage

### Filtering on the works page

Visitors can narrow by category, by medium within a category, and by
availability. Availability comes straight from each document's `Status` line,
so a piece with no `Status` appears only under **All** — another reason to fill
it in.

---

## Things that will catch you

- **Edit the document in `content/artworks/`, never the archive copy.** The
  archive copies are rewritten on every run.
- **If someone sends you an edited document, check it still has its headings.**
  Copies made before the headings were added have no `Discipline`, and the
  build will stop with an error until one is added.
- **`--source` is the archive root**, not a piece folder. With
  `DS_ARTWORK_ARCHIVE` set you never pass it at all.
- **Rename before launch, not after** — it changes the URL.
- **Don't commit an uncompressed catalogue PDF.**
