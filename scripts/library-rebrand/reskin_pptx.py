"""Re-skin the J. Lynne webinar deck in the Transformidable design.

Usage: python3 -I reskin_pptx.py <art-dir> <src.pptx> <out.pptx>
"""
import os
import re
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand  # noqa: E402

art, src, dst = sys.argv[1:4]

COLORS = dict(brand.COLORS, **{
    # Five-step cards: oxblood to ink, in palette steps.
    '1F46BE': brand.OXBLOOD,
    '162F7F': brand.DEEP,
    '11235F': brand.INK,
    '4F74E6': brand.DEEP,  # big section numbers on oxblood panels
})

DARK = ('14161A', '2552DE')  # backgrounds that take the light mark
def gradient(a, b, mid=100000):
    return (f'<a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="{a}"/></a:gs>'
            f'<a:gs pos="{mid}"><a:srgbClr val="{b}"/></a:gs></a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill>')


BG = {
    '14161A': gradient(brand.DEEP, brand.INK, 62000),
    '2552DE': gradient(brand.OXBLOOD, brand.DEEP),
}

TEXT = brand.TEXT + [
    ('J. Lynne &amp; Co. elephant logo', 'Transformidable logo'),
    ('Decorative circle and bars', 'Decorative constellation'),
]


def is_motif(sp):
    """The J. Lynne circle-and-bars motif drawn as shapes: big ellipses and
    tall narrow bars hanging from the top edge."""
    geom = re.search(r'prst="(\w+)"', sp)
    off = re.search(r'<a:off x="(\d+)" y="(\d+)"/><a:ext cx="(\d+)" cy="(\d+)"/>', sp)
    if not geom or not off or '<a:t>' in sp:
        return False
    x, y, cx, cy = map(int, off.groups())
    return (geom.group(1) == 'ellipse' and cx >= 3_000_000) or (geom.group(1) == 'rect' and y == 0 and cx < 600_000 and cy > 3_000_000)


def font_for(rpr, text):
    size = int((re.search(r'sz="(\d+)"', rpr) or [0, 0])[1])
    return brand.DISPLAY if size >= 3600 else brand.TEXT_FACE


def set_fonts(xml):
    def run(m):
        rpr, text = m.group(1), m.group(2)
        face = font_for(rpr, text)
        latin = f'<a:latin typeface="{face}"/>'
        if face == brand.DISPLAY:
            rpr = rpr.replace(' b="1"', '')  # one weight only; never fake bold
        if rpr.endswith('/>'):
            rpr = rpr[:-2] + '>' + latin + '</a:rPr>'
        else:
            rpr = rpr.replace('</a:rPr>', latin + '</a:rPr>')
        return f'<a:r>{rpr}<a:t>{m.group(2)}</a:t></a:r>'
    xml = re.sub(r'<a:r>(<a:rPr[^>]*/>|<a:rPr[^>]*>.*?</a:rPr>)<a:t>([^<]*)</a:t></a:r>', run, xml, flags=re.S)
    # Empty paragraph ends carry no face; give them the text face so nothing
    # falls back to a system font.
    return re.sub(r'<a:endParaRPr([^>]*)/>', rf'<a:endParaRPr\1><a:latin typeface="{brand.TEXT_FACE}"/></a:endParaRPr>', xml)


light_mark = open(os.path.join(art, 'mark-gold.png'), 'rb').read()  # official gold symbol for dark slides
dark_slides = set()

with zipfile.ZipFile(src) as zin:
    names = zin.namelist()
    for n in names:
        if re.match(r'ppt/slides/slide\d+\.xml$', n):
            bg = re.search(r'<p:bg>.*?val="(\w+)".*?</p:bg>', zin.read(n).decode(), re.S)
            if bg and bg.group(1) in DARK:
                dark_slides.add(n.rsplit('/', 1)[1])

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            n = item.filename
            data = zin.read(n)
            if n == 'ppt/media/image1.png':      # logo mark
                data = open(os.path.join(art, 'mark-oxblood.png'), 'rb').read()
            elif n == 'ppt/media/image2.png':    # circle-and-bars panel
                data = open(os.path.join(art, 'mark-deck-side.png'), 'rb').read()
            elif n.startswith('ppt/media/') and n.endswith('.png'):
                data = brand.recolor_png(data)
            elif re.match(r'ppt/slides/_rels/slide\d+\.xml\.rels$', n) and n.rsplit('/', 1)[1][:-5] in dark_slides:
                data = data.decode().replace('../media/image1.png', '../media/image1-light.png').encode()
            elif n.endswith('.xml'):
                xml = data.decode('utf8')
                if n.startswith('ppt/slides/slide'):
                    xml = re.sub(r'<p:sp>.*?</p:sp>', lambda m: '' if is_motif(m.group(0)) else m.group(0), xml, flags=re.S)
                    xml = re.sub(r'(<p:bg><p:bgPr>)<a:solidFill><a:srgbClr val="(\w+)"/></a:solidFill>',
                                 lambda m: m.group(1) + BG.get(m.group(2), m.group(0)[len(m.group(1)):]), xml)
                    xml = set_fonts(xml)
                    xml = re.sub(r'<a:rPr[^>]*>.*?</a:rPr>', lambda m: m.group(0).replace('<a:srgbClr val="FFFFFF"/>', f'<a:srgbClr val="{brand.WHITE_TEXT}"/>'), xml, flags=re.S)
                if n.startswith('ppt/theme/'):
                    xml = xml.replace('<a:latin typeface="Inter"/>', f'<a:latin typeface="{brand.DISPLAY}"/>', 1)  # majorFont comes first
                    xml = xml.replace('<a:latin typeface="Inter"/>', f'<a:latin typeface="{brand.TEXT_FACE}"/>')
                xml = re.sub(r'(?<=val=")([0-9A-Fa-f]{6})(?=")', lambda m: COLORS.get(m.group(1).upper(), m.group(1)), xml)
                for old, new in TEXT:
                    xml = xml.replace(old, new)
                data = xml.encode('utf8')
            zout.writestr(item, data)
        zout.writestr('ppt/media/image1-light.png', light_mark)

with zipfile.ZipFile(dst) as z:
    left = [n for n in z.namelist() if n.endswith('.xml') and re.search(r'(?i)lynne|elephant', z.read(n).decode('utf8'))]
print('dark slides:', len(dark_slides), '| leftover J. Lynne:', left or 'none')
