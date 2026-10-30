# Library rebrand: J. Lynne → Transformidable

Re-skins the 30 advisory library assets (Word originals and their PDFs), the
"Are we governing AI?" deck, and the LinkedIn and Open Graph art in the site's
Transformidable design: oxblood, obsidian, gold and parchment, Source Serif 4
headings, DM Sans body, Archivo labels, and the T mark. The J. Lynne circle
and bars motif is dropped; dark panels use the constellation from the site's
`og.png` instead.

| File | What it does |
| --- | --- |
| `art.cjs` | Renders document covers, the deck side panel, the LinkedIn post and header, the Open Graph image, and six plain constellation backgrounds (`bg-*`, 3840×2160: four on the dark gradient, two in oxblood on gold) from HTML templates (Playwright). Pass template names to render only those, e.g. `node art.cjs out bg-1-even`. |
| `brand.py` | The colour, font, wording and link maps, and the blue → oxblood image recolour. |
| `reskin_docx.py` | Re-skins Word files: colours, fonts, wording, links, covers, footer mark, illustrations. |
| `reskin_pptx.py` | Same for the deck, and removes the circle and bars shapes. |
| `fit_pages.py` | Trims paragraph spacing when the longer links push a page over. |
| `build.sh` | Runs everything above from the originals in R2. |
| `upload.mjs` | Puts the results into Payload as a new version of each asset. |

PDFs are exported from the Word files with LibreOffice, as the originals were.

## Run

```bash
scripts/library-rebrand/build.sh /tmp/rebrand path/to/deck.pptx
```

```bash
PAYLOAD_API_KEY=... node scripts/library-rebrand/upload.mjs /tmp/rebrand/final --status in-review
```

That prints the plan. Add `--apply` to write. Add `--brand` to set the brand
to Transformidable, but only once the Assets change that lets Transformidable
items keep stored files is deployed. Before that change, the field rules
require an external URL for Transformidable items.

Moving an asset out of Final takes it off /advisory and out of
`/api/assets/current` (KADE) until it is Final again.
