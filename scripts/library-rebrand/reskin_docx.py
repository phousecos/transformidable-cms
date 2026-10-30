"""Re-skin J. Lynne library Word files in the Transformidable design.

Usage: python3 -I reskin_docx.py <art-dir> <out-dir> <file.docx>...
Writes <out-dir>/<name>.docx; PDFs come from LibreOffice afterwards.
"""
import hashlib
import os
import re
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brand  # noqa: E402

art, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

# Images replaced outright (by content hash); every other image is recolored.
REPLACE = {
    'ff71ef29': 'doc-cover.png',        # 1700x1100 cover band
    '997d27ef': 'doc-cover-short.png',  # 1700x560 board-brief cover band
    'fdbb3075': 'mark-footer.png',      # footer mark
}


def fix_xml(name, xml):
    if name.endswith('.rels'):
        for old, new in brand.LINKS.items():
            xml = xml.replace(f'Target="{old}"', f'Target="{new}"')
        return xml
    xml = brand.map_colors(xml)
    if name == 'word/styles.xml':
        # Title and heading styles take the display face, without bold.
        def heading(m):
            style = re.sub(r'w:(ascii|hAnsi|eastAsia|cs)="[^"]*"', rf'w:\1="{brand.DISPLAY}"', m.group(0))
            return style.replace('<w:b/>', '').replace('<w:bCs/>', '')
        xml = re.sub(r'<w:style [^>]*w:styleId="(?:%s)".*?</w:style>' % '|'.join(brand.HEADING_STYLES), heading, xml, flags=re.S)
    xml = xml.replace('<w:color w:val="FFFFFF"/>', f'<w:color w:val="{brand.WHITE_TEXT}"/>')
    for old, new in brand.FONTS.items():
        xml = re.sub(rf'(w:(?:ascii|hAnsi|eastAsia|cs)=")({old})(")', rf'\g<1>{new}\3', xml)
        xml = xml.replace(f'w:name="{old}"', f'w:name="{new}"').replace(f'typeface="{old}"', f'typeface="{new}"')
    return brand.map_text(xml)


for src in sys.argv[3:]:
    dst = os.path.join(out, os.path.basename(src))
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.startswith('word/media/') and not item.filename.endswith('/'):
                h = hashlib.md5(data).hexdigest()[:8]
                data = open(os.path.join(art, REPLACE[h]), 'rb').read() if h in REPLACE else brand.recolor_png(data)
            elif item.filename.endswith(('.xml', '.rels')):
                data = fix_xml(item.filename, data.decode('utf8')).encode('utf8')
            zout.writestr(item, data)
    # Anything J. Lynne left in the visible text means a phrase the map missed.
    with zipfile.ZipFile(dst) as z:
        left = [n for n in z.namelist() if n.endswith('.xml') and re.search(r'(?i)lynne|elephant', z.read(n).decode('utf8'))]
    print(os.path.basename(src), 'LEFTOVER: ' + ', '.join(left) if left else 'ok')
