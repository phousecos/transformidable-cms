// Renders Transformidable brand art (document covers, LinkedIn, Open Graph)
// from HTML templates, and copies the mark variants alongside for the
// re-skin scripts. Usage: node art.js <outdir> [template...]
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = process.argv[2] || 'out'
fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(path.join(__dirname, 'marks'))) fs.copyFileSync(path.join(__dirname, 'marks', f), path.join(OUT, f))
const mark = (c) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, `marks/mark-${c}.png`)).toString('base64')
const MARK = mark('parchment')

const C = { oxblood: '#7B2828', obsidian: '#1A1A1A', gold: '#C9A227', parchment: '#F4EDD8' }

// Seeded constellation like the site's og.png: faint nodes and links, a few gold.
function constellation(w, h, { seed = 7, count = 60, xMin = 0, alpha = 1, scale = 1 } = {}) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const pts = Array.from({ length: count }, () => [xMin * w + rnd() * w * (1 - xMin), rnd() * h])
  const reach = Math.max(w, h) * 0.16
  let lines = ''
  pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
    const d = Math.hypot(a[0] - b[0], a[1] - b[1])
    if (d < reach) lines += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="rgba(244,237,216,${0.09 * alpha})" stroke-width="${scale}"/>`
  }))
  const dots = pts.map((p, i) => {
    const gold = i % 9 === 0
    const r = (gold ? 3 : 1.5 + rnd() * 2) * scale
    const fill = gold ? C.gold : `rgba(244,237,216,${0.35 * alpha})`
    const ring = gold || i % 5 === 0 ? `<circle cx="${p[0]}" cy="${p[1]}" r="${r + 5 * scale}" stroke-width="${scale}" fill="none" stroke="${gold ? C.gold : 'rgba(244,237,216,.25)'}" stroke-opacity="${0.7 * alpha}"/>` : ''
    return `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}"/>${ring}`
  }).join('')
  return `<svg class="net" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${lines}${dots}</svg>`
}

const base = (w, h, body, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;color:${C.parchment};font-family:'DM Sans',sans-serif;
  background:linear-gradient(100deg,#3D0B13 0%,#1E0A0D 48%,#0D0B0B 100%)}
.net{position:absolute;inset:0}
.scrim{position:absolute;inset:0;pointer-events:none}
.serif{font-family:'Source Serif 4',serif}
.eyebrow{font-family:'Archivo',sans-serif;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:${C.gold}}
.rule{height:2px;background:${C.gold}}
.mark{display:block}
${extra}</style></head><body>${body}</body></html>`

const wordmark = (size) => `<div style="display:flex;align-items:center;gap:${size * 0.35}px">
  <img class="mark" src="${MARK}" style="width:${size}px;height:${size}px"><span class="serif" style="font-weight:700;font-size:${size * 0.92}px;color:${C.parchment}">Transformidable</span></div>`

// Plain constellation backgrounds (no text or mark), 16:9 at 2x. `gold` turns
// every Nth light node into a glowing, ringed gold node.
function background(bg, net, gold) {
  let svg = constellation(1920, 1080, net)
  if (gold) {
    let i = 0
    svg = svg.replace(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="rgba\(244,237,216,[\d.]+\)"\/>/g, (m, x, y, r) =>
      ++i % gold === 0
        ? `<circle cx="${x}" cy="${y}" r="${+r + 1}" fill="${C.gold}"/><circle cx="${x}" cy="${y}" r="${+r + 7}" fill="none" stroke="${C.gold}" stroke-opacity=".6"/>`
        : m)
  }
  return [1920, 1080, `<!doctype html><html><body style="margin:0;width:1920px;height:1080px;overflow:hidden;background:${bg};position:relative"><style>.net{position:absolute;inset:0}.net circle[fill="${C.gold}"]{filter:drop-shadow(0 0 6px rgba(201,162,39,.85))}</style>${svg}</body></html>`, 2]
}
const GRADIENT = 'linear-gradient(100deg,#3D0B13 0%,#1E0A0D 48%,#0D0B0B 100%)'

const templates = {
  // Word/PDF cover band: 8.5in x 5.5in at 200dpi. The document sets its own
  // eyebrow, title and byline over the left two-thirds, so the art stays right.
  'doc-cover': [1700, 1100, base(1700, 1100, `${constellation(1700, 1100, { seed: 11, count: 70, xMin: 0.5 })}
    <img src="${MARK}" style="position:absolute;right:150px;top:150px;width:140px;height:140px;opacity:.9">`)],

  // Shorter cover band used by the one-page board briefs.
  'doc-cover-short': [1700, 560, base(1700, 560, `${constellation(1700, 560, { seed: 13, count: 45, xMin: 0.5 })}
    <img src="${MARK}" style="position:absolute;right:150px;top:110px;width:120px;height:120px;opacity:.9">`)],

  // Transparent constellation panel for the right side of dark deck slides
  // (sits where the J. Lynne circle and bars were).
  'mark-deck-side': [1441, 2048, `<!doctype html><html><head><style>*{margin:0}body{width:1441px;height:2048px;background:transparent;position:relative}.net{position:absolute;inset:0}</style></head>
    <body>${constellation(1441, 2048, { seed: 21, count: 55, scale: 3.5, alpha: 1.6 })}</body></html>`],

  // Light page-footer mark.
  'mark-footer': [96, 96, `<!doctype html><html><body style="margin:0;background:transparent"><img src="${mark('oxblood')}" style="width:96px;height:96px;display:block"></body></html>`],

  'linkedin-header': [1584, 396, base(1584, 396, `${constellation(1584, 396, { seed: 3, count: 55 })}
    <div class="scrim" style="background:radial-gradient(ellipse 560px 210px at 1190px 200px,rgba(14,10,11,.92),rgba(14,10,11,0))"></div>
    <div style="position:absolute;right:96px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right">
      ${wordmark(64)}
      <div class="rule" style="width:120px;margin:26px 0 22px"></div>
      <div class="eyebrow" style="font-size:20px">Evidence for better transformation governance</div>
      <div class="serif" style="font-size:26px;margin-top:14px;color:rgba(244,237,216,.8)">Research · Governance · Transformation</div>
    </div>`)],

  'linkedin-post-webinar': [1200, 1200, base(1200, 1200, `${constellation(1200, 1200, { seed: 5, count: 65, xMin: 0.35 })}
    <div class="scrim" style="background:linear-gradient(90deg,rgba(40,9,14,.85) 0%,rgba(30,9,12,.6) 62%,rgba(0,0,0,0) 85%)"></div>
    <div style="position:absolute;inset:96px;display:flex;flex-direction:column">
      <div class="eyebrow" style="font-size:24px">An executive briefing</div>
      <div class="serif" style="font-weight:700;font-size:96px;line-height:1.04;margin-top:40px">Are we governing AI<br><span style="color:${C.gold};font-style:italic;font-weight:600">or just letting it happen?</span></div>
      <div class="rule" style="width:120px;margin:56px 0 40px"></div>
      <div style="font-size:34px;line-height:1.4;max-width:820px;color:rgba(244,237,216,.88)">Five questions every leadership team should be able to answer about AI. None of them are tech questions.</div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end">
        <div><div style="font-size:30px;font-weight:600">Jerri Bland, Ed.D.</div><div style="font-size:24px;color:rgba(244,237,216,.7);margin-top:6px">betransformidable.com</div></div>
        ${wordmark(48)}
      </div>
    </div>`)],

  'og-webinar': [1200, 630, base(1200, 630, `${constellation(1200, 630, { seed: 9, count: 55 })}
    <div class="scrim" style="background:radial-gradient(ellipse 520px 230px at 600px 315px,rgba(18,9,11,.9),rgba(18,9,11,0))"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px">
      <div class="eyebrow" style="font-size:18px">An executive briefing</div>
      <div class="serif" style="font-weight:700;font-size:68px;line-height:1.08;margin-top:26px">Are we governing AI<br><span style="color:${C.gold};font-style:italic;font-weight:600">or just letting it happen?</span></div>
      <div class="rule" style="width:120px;margin:34px 0 26px"></div>
      <div class="serif" style="font-size:26px;color:rgba(244,237,216,.8)">Jerri Bland, Ed.D. · Transformidable</div>
    </div>`)],

  // Constellation backgrounds for slides, screens and video (3840x2160).
  'bg-1-even': background(GRADIENT, { seed: 9, count: 110 }, 7),
  'bg-2-right-weighted': background(GRADIENT, { seed: 11, count: 90, xMin: 0.45 }, 7),
  'bg-3-sparse': background('linear-gradient(100deg,#2E0A10 0%,#170A0C 50%,#0B0A0A 100%)', { seed: 5, count: 45, alpha: 0.85 }, 5),
  'bg-4-dense-gold': background('radial-gradient(ellipse at 30% 40%,#4A0F18 0%,#1E0A0D 55%,#0B0909 100%)', { seed: 17, count: 170, alpha: 1.3 }, 4),
}

;(async () => {
  const only = process.argv.slice(3)
  const browser = await chromium.launch()
  for (const [name, [w, h, html, scale = 1]] of Object.entries(templates)) {
    if (only.length && !only.includes(name)) continue
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale })
    const transparent = name.startsWith('mark')
    await page.setContent(html)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(OUT, `${name}.png`), omitBackground: transparent })
    await page.close()
    console.log(name, w, h)
  }
  await browser.close()
})()
