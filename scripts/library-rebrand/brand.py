"""Shared J. Lynne -> Transformidable mappings for the document and deck re-skins."""
import io
import re

import numpy as np
from PIL import Image

# J. Lynne hex -> Transformidable hex (site tokens: oxblood 7B2828, obsidian
# 1A1A1A, gold C9A227, parchment F4EDD8).
COLORS = {
    '2552DE': '7B2828',  # primary blue -> oxblood
    '1A3A9E': '5A1C1C',  # deep blue -> deep oxblood
    '3A66EA': '9A3B3B',  # light blue -> light oxblood
    '1F4D78': '5A1C1C',  # Word default heading blues
    '2E74B5': '7B2828',
    '14161A': '1A1A1A',  # ink -> obsidian
    '4A4F58': '57514A',  # cool grey text -> warm grey
    'F6F6F2': 'F8F3E6',  # paper -> light parchment
    'E9EBF0': 'F1E9D6',  # cool grey fill -> parchment fill
    'C9CDD6': 'DDD3BE',  # cool rule -> warm rule
}

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


def recolor_png(data: bytes) -> bytes:
    """Shift blue pixels to oxblood, keeping their lightness relationships and
    leaving gold, white, black and greys alone."""
    im = Image.open(io.BytesIO(data))
    mode = im.mode
    rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
    rgb = rgba[..., :3] / 255
    hsv = np.asarray(Image.fromarray((rgb * 255).astype(np.uint8)).convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    bluish = (h > 195) & (h < 255)
    blue = bluish & (s > 0.18)
    # Blend weight eases in over saturation so anti-aliased edges stay smooth.
    w = np.clip((s - 0.18) / 0.2, 0, 1) * blue
    # 2552DE (s .83, v .87) -> 7B2828 (s .67, v .48)
    ns, nv = s * 0.8, np.clip(v * 0.52 + (1 - s) * v * 0.35, 0, 1)
    target = Image.fromarray(np.dstack([np.zeros_like(h), ns * 255, nv * 255]).astype(np.uint8), 'HSV').convert('RGB')
    t = np.asarray(target).astype(np.float32) / 255
    out = rgb * (1 - w[..., None]) + t * w[..., None]
    # Pale blue tints and cool light greys (E9EBF0) -> parchment tints.
    pale = bluish & (s <= 0.4) & (v > 0.75) & (w < 1)
    pw = pale * (1 - w)
    warm = Image.fromarray(np.dstack([np.full_like(h, 30 * 255 / 360), np.clip(0.06 + s * 0.6, 0, 1) * 255, v * 0.97 * 255]).astype(np.uint8), 'HSV').convert('RGB')
    wt = np.asarray(warm).astype(np.float32) / 255
    out = out * (1 - pw[..., None]) + wt * pw[..., None]
    rgba[..., :3] = out * 255
    res = Image.fromarray(rgba.astype(np.uint8), 'RGBA')
    if mode != 'RGBA':
        res = res.convert('RGB')
    buf = io.BytesIO()
    res.save(buf, 'PNG')
    return buf.getvalue()
