#!/usr/bin/env bash
# Rebuilds the Transformidable versions of the library files.
#
#   scripts/library-rebrand/build.sh <workdir> [deck.pptx]
#
# Needs LibreOffice (soffice), poppler (pdfinfo), Python 3 with Pillow and
# NumPy, Node with Playwright, and Cloudflare API access to the
# transformidable-media bucket. Output lands in <workdir>/final.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mkdir -p "$1" && cd "$1" && pwd)"
DECK="${2:-}"
ACCOUNT="${CF_ACCOUNT_ID:-eafd097bc9914edce898c4d47bd6d875}"
R2="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/r2/buckets/transformidable-media/objects"
mkdir -p "$WORK/src" "$WORK/art" "$WORK/final" "$HOME/.fonts"

echo "== Fonts (DM Serif Display, the wordmark's face, and DM Sans)"
python3 -I - "$HOME/.fonts" <<'EOF'
import re, subprocess, sys, urllib.parse
out = sys.argv[1]
for fam in ['DM Serif Display:ital@0;1', 'DM Sans:ital,wght@0,400;0,500;0,600;0,700;1,400']:
    css = subprocess.run(['curl', '-sS', 'https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(fam, safe=':,;@.')],
                         capture_output=True, text=True, check=True).stdout
    for blk in re.findall(r'@font-face \{(.*?)\}', css, re.S):
        name = re.search(r"font-family: '([^']+)'", blk)[1].replace(' ', '')
        file = f"{out}/{name}-{re.search(r'font-weight: (\d+)', blk)[1]}-{re.search(r'font-style: (\w+)', blk)[1]}.ttf"
        subprocess.run(['curl', '-sS', '-o', file, re.search(r'url\(([^)]+)\)', blk)[1]], check=True)
EOF
fc-cache -f >/dev/null

echo "== Originals from R2 (asset-files/)"
for k in $(curl -sS "$R2?prefix=asset-files/&per_page=1000" | python3 -I -c "import sys,json;[print(o['key']) for o in json.load(sys.stdin)['result']]"); do
  f="$WORK/src/$(basename "$k")"
  for try in 1 2 3; do
    curl -sS -o "$f" "$R2/$k" && file "$f" | grep -qE 'Microsoft|PDF' && break
    sleep 2
  done
done

echo "== Art"
node "$HERE/art.cjs" "$WORK/art" >/dev/null

echo "== Word files"
# Payload's renamed duplicates (name-1.docx) are copies of a file already here.
ls "$WORK"/src/*.docx | grep -vE -- '-[0-9]+\.docx$' | xargs python3 -I "$HERE/reskin_docx.py" "$WORK/art" "$WORK/final"
(cd "$WORK/final" && soffice --headless --convert-to pdf ./*.docx >/dev/null 2>&1)

echo "== Page counts"
for pdf in "$WORK"/final/*.pdf; do
  orig="$WORK/src/$(basename "$pdf")"
  [ -f "$orig" ] || continue
  want=$(pdfinfo "$orig" | awk '/^Pages/{print $2}')
  have=$(pdfinfo "$pdf" | awk '/^Pages/{print $2}')
  [ "$have" -gt "$want" ] && python3 -I "$HERE/fit_pages.py" "${pdf%.pdf}.docx" "$want"
done

if [ -n "$DECK" ]; then
  echo "== Deck"
  out="$WORK/final/$(basename "${DECK%.pptx}")-Transformidable.pptx"
  python3 -I "$HERE/reskin_pptx.py" "$WORK/art" "$DECK" "$out"
  (cd "$WORK/final" && soffice --headless --convert-to pdf "$(basename "$out")" >/dev/null 2>&1)
fi

echo "== Leftover J. Lynne text in PDFs (should be none)"
for pdf in "$WORK"/final/*.pdf; do
  pdftotext "$pdf" - | grep -qiE 'lynne|patience to see|elephant' && echo "  $(basename "$pdf")"
done
echo "Done: $WORK/final"
