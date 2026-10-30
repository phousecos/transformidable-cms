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
// Official marks only: gold on dark grounds, oxblood on light.
const MARK = mark('gold')
const LOGO = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'marks/logo-dark-ground.png')).toString('base64')

// The brand kit palette (palette A), plus deep oxblood and mark gold from the
// official logo files. Nothing outside it: tints only come from these colours
// at reduced opacity.
const C = { oxblood: '#6B1429', deep: '#5C1D27', ink: '#1A1714', gold: '#C0A23C', markGold: '#9E810A', cream: '#F7F3EB', mist: '#E7DFD2' }
const DARK = `linear-gradient(100deg,${C.deep} 0%,${C.ink} 62%)`

// Seeded constellation like the site's og.png: faint nodes and links, a few gold.
// `ink` is the node and line colour as an "r,g,b" string; `accent` marks
// every ninth node. Defaults draw cream and gold on the dark gradient.
function constellation(w, h, { seed = 7, count = 60, xMin = 0, alpha = 1, scale = 1, ink = '247,243,235', accent = C.gold } = {}) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const pts = Array.from({ length: count }, () => [xMin * w + rnd() * w * (1 - xMin), rnd() * h])
  const reach = Math.max(w, h) * 0.16
  let lines = ''
  pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
    const d = Math.hypot(a[0] - b[0], a[1] - b[1])
    if (d < reach) lines += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="rgba(${ink},${0.09 * alpha})" stroke-width="${scale}"/>`
  }))
  const dots = pts.map((p, i) => {
    const gold = i % 9 === 0
    const r = (gold ? 3 : 1.5 + rnd() * 2) * scale
    const fill = gold ? accent : `rgba(${ink},${0.35 * alpha})`
    const ring = gold || i % 5 === 0 ? `<circle cx="${p[0]}" cy="${p[1]}" r="${r + 5 * scale}" stroke-width="${scale}" fill="none" stroke="${gold ? accent : `rgba(${ink},.25)`}" stroke-opacity="${0.7 * alpha}"/>` : ''
    return `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}"/>${ring}`
  }).join('')
  return `<svg class="net" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${lines}${dots}</svg>`
}

const base = (w, h, body, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;color:${C.cream};font-family:'DM Sans',sans-serif;
  background:${DARK}}
.net{position:absolute;inset:0}
.scrim{position:absolute;inset:0;pointer-events:none}
.serif{font-family:'DM Serif Display',serif;font-weight:400}
.eyebrow{font-family:'DM Sans',sans-serif;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:${C.gold}}
.rule{height:2px;background:${C.gold}}
.mark{display:block}
${extra}</style></head><body>${body}</body></html>`

// The trademarked logo artwork (gold mark + cream wordmark, for dark grounds), never retyped.
const wordmark = (size) => `<img class="mark" src="${LOGO}" alt="Transformidable" style="height:${size}px;width:auto">`

// Plain constellation backgrounds (no text or mark), 16:9 at 2x. `gold` turns
// every Nth light node into a glowing, ringed gold node.
function background(bg, net, gold, glow = 'rgba(192,162,60,.85)') {
  const accent = net.accent || C.gold
  let svg = constellation(1920, 1080, net)
  if (gold) {
    let i = 0
    const ink = net.ink || '247,243,235'
    svg = svg.replace(new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="([\\d.]+)" fill="rgba\\(${ink},[\\d.]+\\)"\\/>`, 'g'), (m, x, y, r) =>
      ++i % gold === 0
        ? `<circle cx="${x}" cy="${y}" r="${+r + 1}" fill="${accent}"/><circle cx="${x}" cy="${y}" r="${+r + 7}" fill="none" stroke="${accent}" stroke-opacity=".6"/>`
        : m)
  }
  return [1920, 1080, `<!doctype html><html><body style="margin:0;width:1920px;height:1080px;overflow:hidden;background:${bg};position:relative"><style>.net{position:absolute;inset:0}.net circle[fill="${accent}"]{filter:drop-shadow(0 0 6px ${glow})}</style>${svg}</body></html>`, 2]
}
const GRADIENT = DARK

const templates = {
  // Word/PDF cover band: 8.5in x 5.5in at 200dpi. The document sets its own
  // eyebrow, title and byline over the left two-thirds, so the art stays right.
  'doc-cover': [1700, 1100, base(1700, 1100, `${constellation(1700, 1100, { seed: 11, count: 70, xMin: 0.5 })}
    <img src="${MARK}" style="position:absolute;right:150px;top:150px;width:140px;height:140px">`)],

  // Shorter cover band used by the one-page board briefs.
  'doc-cover-short': [1700, 560, base(1700, 560, `${constellation(1700, 560, { seed: 13, count: 45, xMin: 0.5 })}
    <img src="${MARK}" style="position:absolute;right:150px;top:110px;width:120px;height:120px">`)],

  // Transparent constellation panel for the right side of dark deck slides
  // (sits where the J. Lynne circle and bars were).
  'mark-deck-side': [1441, 2048, `<!doctype html><html><head><style>*{margin:0}body{width:1441px;height:2048px;background:transparent;position:relative}.net{position:absolute;inset:0}</style></head>
    <body>${constellation(1441, 2048, { seed: 21, count: 55, scale: 3.5, alpha: 1.6 })}</body></html>`],

  // Light page-footer mark.
  'mark-footer': [96, 96, `<!doctype html><html><body style="margin:0;background:transparent"><img src="${mark('oxblood')}" style="width:96px;height:96px;display:block"></body></html>`],

  'linkedin-header': [1584, 396, base(1584, 396, `${constellation(1584, 396, { seed: 3, count: 55 })}
    <div class="scrim" style="background:radial-gradient(ellipse 560px 210px at 1190px 200px,rgba(26,23,20,.92),rgba(26,23,20,0))"></div>
    <div style="position:absolute;right:96px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right">
      ${wordmark(64)}
      <div class="rule" style="width:120px;margin:26px 0 22px"></div>
      <div class="eyebrow" style="font-size:20px">Evidence for better transformation governance</div>
      <div class="serif" style="font-size:26px;margin-top:14px;color:${C.mist}">Research · Governance · Transformation</div>
    </div>`)],

  'linkedin-post-webinar': [1200, 1200, base(1200, 1200, `${constellation(1200, 1200, { seed: 5, count: 65, xMin: 0.35 })}
    <div class="scrim" style="background:linear-gradient(90deg,rgba(92,29,39,.85) 0%,rgba(26,23,20,.6) 62%,rgba(26,23,20,0) 85%)"></div>
    <div style="position:absolute;inset:96px;display:flex;flex-direction:column">
      <div class="eyebrow" style="font-size:24px">An executive briefing</div>
      <div class="serif" style="font-size:100px;line-height:1.02;margin-top:40px">Are we governing AI<br><span style="color:${C.gold};font-style:italic">or just letting it happen?</span></div>
      <div class="rule" style="width:120px;margin:56px 0 40px"></div>
      <div style="font-size:34px;line-height:1.4;max-width:820px;color:${C.mist}">Five questions every leadership team should be able to answer about AI. None of them are tech questions.</div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end">
        <div><div style="font-size:30px;font-weight:600">Jerri Bland, Ed.D.</div><div style="font-size:24px;color:${C.gold};margin-top:6px">betransformidable.com</div></div>
        ${wordmark(48)}
      </div>
    </div>`)],

  'og-webinar': [1200, 630, base(1200, 630, `${constellation(1200, 630, { seed: 9, count: 55 })}
    <div class="scrim" style="background:radial-gradient(ellipse 520px 230px at 600px 315px,rgba(26,23,20,.9),rgba(26,23,20,0))"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px">
      <div class="eyebrow" style="font-size:18px">An executive briefing</div>
      <div class="serif" style="font-size:72px;line-height:1.05;margin-top:26px">Are we governing AI<br><span style="color:${C.gold};font-style:italic">or just letting it happen?</span></div>
      <div class="rule" style="width:120px;margin:34px 0 26px"></div>
      <div class="serif" style="font-size:26px;color:${C.mist}">Jerri Bland, Ed.D. · Transformidable</div>
    </div>`)],

  // Constellation backgrounds for slides, screens and video (3840x2160).
  'bg-1-even': background(GRADIENT, { seed: 9, count: 110 }, 7),
  'bg-2-right-weighted': background(GRADIENT, { seed: 11, count: 90, xMin: 0.45 }, 7),
  'bg-3-sparse': background(`linear-gradient(100deg,${C.deep} -40%,${C.ink} 50%)`, { seed: 5, count: 45, alpha: 0.85 }, 5),
  'bg-4-dense-gold': background(`radial-gradient(ellipse at 30% 40%,${C.oxblood} 0%,${C.deep} 30%,${C.ink} 85%)`, { seed: 17, count: 170, alpha: 1.3 }, 4),

  // Gold grounds with oxblood nodes, for variety.
  'bg-5-gold-oxblood': background(`linear-gradient(100deg,${C.gold} 0%,${C.markGold} 100%)`,
    { seed: 23, count: 110, ink: '92,29,39', accent: C.oxblood, alpha: 1.8, scale: 1.4 }, 5, 'rgba(107,20,41,.55)'),
  'bg-6-light-gold-oxblood': background(`linear-gradient(100deg,${C.cream} 0%,${C.mist} 50%,${C.gold} 100%)`,
    { seed: 29, count: 90, xMin: 0.35, ink: '107,20,41', accent: C.oxblood, alpha: 1.6, scale: 1.4 }, 5, 'rgba(107,20,41,.45)'),
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
