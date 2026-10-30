"""Pull a re-skinned Word file back to its original page count.

The longer Transformidable links can push a tightly set page over by a line
or two. This trims paragraph spacing in steps (never the text or type size)
until LibreOffice lays it out on the original number of pages.

Usage: python3 -I fit_pages.py <file.docx> <target-pages>
"""
import os
import re
import subprocess
import sys
import zipfile

path, target = sys.argv[1], int(sys.argv[2])
folder = os.path.dirname(os.path.abspath(path))
pdf = path[:-5] + '.pdf'


def pages():
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', folder, path], capture_output=True, timeout=300)
    out = subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout
    return int(re.search(r'Pages:\s+(\d+)', out).group(1))


def scale_spacing(factor):
    with zipfile.ZipFile(path) as z:
        items = [(i, z.read(i.filename)) for i in z.infolist()]
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for item, data in items:
            if item.filename == 'word/document.xml':
                xml = data.decode('utf8')
                xml = re.sub(r'<w:spacing\b[^>]*>', lambda tag: re.sub(
                    r'(w:(?:before|after)=")(\d+)(")',
                    lambda m: f'{m.group(1)}{int(int(m.group(2)) * factor)}{m.group(3)}', tag.group(0)), xml)
                data = xml.encode('utf8')
            z.writestr(item, data)


n = pages()
step = 0
while n > target and step < 4:
    scale_spacing(0.88)
    step += 1
    n = pages()
print(os.path.basename(path), f'{n} pages after {step} spacing step(s)', 'OK' if n <= target else 'STILL OVER')
