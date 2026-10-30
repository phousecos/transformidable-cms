"""Shared J. Lynne -> Transformidable mappings for the document and deck re-skins."""
import io
import re

import numpy as np
from PIL import Image

# The brand kit palette (palette A), plus two colours taken from the official
# logo files: DEEP (the light-ground mark) and MARK_GOLD (the gold symbol),
# used for dark tones and small gold text on cream. Every J. Lynne colour maps
# to one of these; nothing else is introduced. The logo artwork keeps its own
# colours and is never recoloured.
OXBLOOD, DEEP, INK, GOLD, MARK_GOLD = '6B1429', '5C1D27', '1A1714', 'C0A23C', '9E810A'
CREAM, MIST, SLATE = 'F7F3EB', 'E7DFD2', '6E5D53'

COLORS = {
    '2552DE': OXBLOOD,  # primary blue
    '3A66EA': OXBLOOD,  # light blue
    '2E74B5': OXBLOOD,  # Word default heading blue
    '1A3A9E': DEEP,     # deep blue
    '1F4D78': DEEP,     # Word default heading blue
    '14161A': INK,
    '4A4F58': SLATE,    # grey text
    '6B707A': SLATE,
    'F6F6F2': CREAM,    # paper panels
    'E9EBF0': MIST,     # cool grey fills
    'C9CDD6': MIST,     # rules
    'C9A227': GOLD,
    'F3D77A': GOLD,     # light gold on blue slides
    '7F6619': MARK_GOLD,  # dark gold labels on light paper
}

# White text becomes cream, as in the logo's wordmark; white paper stays white.
WHITE_TEXT = CREAM

FONTS = {'Inter': 'DM Sans', 'Poppins': 'Source Serif 4'}

SITE = 'betransformidable.com'

# Brand wording, longest first so the specific sentences win.
TEXT = [
    # Company description. Matched without the name, which some files keep in
    # a separate bold run.
    ('is an independent governance advisory firm working with organizations to lead major transformations with confidence.',
     'is an independent research and advisory practice helping organizations lead major transformations with confidence.'),
    ('is an independent governance advisory firm.', 'is an independent research and advisory practice.'),
    ('J. Lynne &amp; Co. All rights', 'Transformidable. All rights'),
    ('J. Lynne &amp; Co. elephant mark', 'Transformidable mark'),
    ('J. Lynne &amp; Co. elephant logo', 'Transformidable logo'),
    ('ABOUT J. LYNNE &amp; CO.', 'ABOUT TRANSFORMIDABLE'),
    ('The patience to see it. The drive to move it.', 'Evidence for better transformation governance.'),
    ('jlynne.co/contact', f'{SITE}/contact'),
    ('jlynne.co', SITE),
    ('J. Lynne &amp; Co.', 'Transformidable'),
    ('J. LYNNE ADVISORY GOVERNANCE', 'TRANSFORMIDABLE ADVISORY'),
    ('J. Lynne Advisory Governance', 'Transformidable Advisory'),
]

LINKS = {'https://jlynne.co/contact': f'https://{SITE}/contact', 'https://jlynne.co': f'https://{SITE}'}


def map_colors(xml: str) -> str:
    return re.sub(r'(?<=")([0-9A-Fa-f]{6})(?=")', lambda m: COLORS.get(m.group(1).upper(), m.group(1)), xml)


def map_text(xml: str) -> str:
    for old, new in TEXT:
        xml = xml.replace(old, new)
    return xml


# Every flat colour found in the J. Lynne illustrations, and the palette colour
# it becomes. Ordered light-to-dark within each family so shading survives.
IMAGE_MAP = {
    '2552DE': OXBLOOD, '1F46BE': OXBLOOD,
    '2049CC': DEEP, '436AE2': DEEP, '53649A': DEEP, '566597': DEEP,
    '1A3A9E': DEEP, '1D347C': DEEP, '162F7F': DEEP,
    '11235F': INK, '14161A': INK,
    '6E89DE': MIST, '6D88DE': MIST, '8FA4E5': MIST, '92A9EF': MIST, '90A4E6': MIST,
    'C8D3F7': MIST, 'C7D1F2': MIST, 'C8CCD6': MIST, 'E9EBF0': MIST,
    '8991A7': SLATE,
    'F6F6F2': CREAM, 'FFFFFF': 'FFFFFF',
    'C9A227': GOLD, 'F3D77A': GOLD,
    '8A7122': MARK_GOLD, '6F5C21': MARK_GOLD, '9C7F24': MARK_GOLD, '7F6619': MARK_GOLD,
}


def _rgb(hexes):
    return np.array([[int(h[i:i + 2], 16) for i in (0, 2, 4)] for h in hexes], np.float32)


def recolor_png(data: bytes) -> bytes:
    """Map each flat J. Lynne colour to its palette colour. A pixel between two
    source colours (an anti-aliased edge) becomes the same blend of their two
    targets, so no colour outside the palette appears except at those edges."""
    im = Image.open(io.BytesIO(data))
    mode = im.mode
    rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
    src, dst = _rgb(IMAGE_MAP.keys()), _rgb(IMAGE_MAP.values())
    h, w = rgba.shape[:2]
    flat = rgba[..., :3].reshape(-1, 3)
    out = np.empty_like(flat)
    for a in range(0, len(flat), 262144):
        p = flat[a:a + 262144]
        d = ((p[:, None, :] - src[None]) ** 2).sum(-1)
        near = np.argsort(d, axis=1)[:, :2]
        i, j = near[:, 0], near[:, 1]
        seg = src[j] - src[i]
        t = np.clip(((p - src[i]) * seg).sum(-1) / np.maximum((seg ** 2).sum(-1), 1), 0, 1)
        out[a:a + 262144] = dst[i] + (dst[j] - dst[i]) * t[:, None]
    rgba[..., :3] = out.reshape(h, w, 3)
    res = Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA')
    if mode != 'RGBA':
        res = res.convert('RGB')
    buf = io.BytesIO()
    res.save(buf, 'PNG')
    return buf.getvalue()
