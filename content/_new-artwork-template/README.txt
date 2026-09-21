Copy this whole folder to start a new piece.

  1. Rename the copy after the work, e.g. the-harbour-console
  2. Open Description.docx and fill it in. The first line is the title.
     Replace [todo] where you know the answer; leave it where you do not.
     Discipline is the only one that must be filled in:
        Canvas | Ceramic | Glass | Soft Pastel | Console | Cabinet | Sculpture
  3. Add the photographs, named:
        art-bg.jpg          the piece in a room          <- becomes the cover
        art-front.jpg       straight on
        art-white.jpg       cut out on white
        art-back.jpg  art-left.jpg  art-right.jpg  art-top.jpg  art-side.jpg
        art-detail-1.jpg    a close-up
        art-plate-1.jpg     one piece of a collection
     Add -shadow for a drop-shadow version: art-front-shadow.jpg
     Add -white first if it is also a cut-out: art-back-white-shadow.jpg
  4. From the repo, run:
        python3 scripts/add_artwork.py <path to your folder>
        npm run content -- --source "$DS_ARTWORK_ARCHIVE"
        npm run dev
     Then the folder you made can be deleted.
