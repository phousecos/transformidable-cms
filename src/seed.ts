import { getPayload } from 'payload'
import config from './payload.config.ts'

const payload = await getPayload({ config })

// ── Helper: Lexical richText from plain paragraphs ───────────────────
function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [{ type: 'text', text, format: 0, mode: 'normal', style: '', detail: 0, version: 1 }],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// ── Helper: find-or-create ───────────────────────────────────────────
async function findOrCreate<T extends Record<string, unknown>>(
  collection: string,
  where: Record<string, unknown>,
  data: T,
): Promise<{ id: number }> {
  const existing = await payload.find({
    collection: collection as 'users',
    where,
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`[seed] ${collection} "${Object.values(where)[0]?.toString()}" already exists — skipping create.`)
    return existing.docs[0] as unknown as { id: number }
  }
  const doc = await payload.create({
    collection: collection as 'users',
    data: data as never,
  })
  console.log(`[seed] Created ${collection} "${Object.values(where)[0]?.toString()}".`)
  return doc as unknown as { id: number }
}

// ═══════════════════════════════════════════════════════════════════════
// 1. Brand Pillars (legacy — keep existing seed)
// ═══════════════════════════════════════════════════════════════════════
await findOrCreate(
  'brand-pillars',
  { name: { equals: 'HR & Compliance' } },
  {
    name: 'HR & Compliance',
    slug: 'hr-compliance',
    mappedDomain: 'vettersgroup.com',
    contentFocus: 'Background screening compliance, FCRA, hiring risk, and HR best practices.',
  },
)

// ═══════════════════════════════════════════════════════════════════════
// 2. Verticals
// ═══════════════════════════════════════════════════════════════════════
const verticals = [
  { name: 'Technology Strategy', slug: 'technology-strategy', description: 'Technology leadership, digital transformation, and IT governance.', color: '#4A90D9' },
  { name: 'Executive Leadership', slug: 'executive-leadership', description: 'C-suite strategy, boardroom dynamics, and organizational leadership.', color: '#8B4513' },
  { name: 'Unlimited Powerhouse', slug: 'unlimited-powerhouse', description: 'Bold perspectives on leading transformative change in technology and business.', color: '#6B2D5B' },
  { name: 'Women in Tech', slug: 'women-in-tech', description: 'Advancing women in technology leadership and breaking barriers.', color: '#C2185B' },
  { name: 'Leadership & Change', slug: 'leadership-and-change', description: 'Change management, organizational development, and adaptive leadership.', color: '#2E7D32' },
]

const verticalMap: Record<string, { id: number }> = {}
for (const v of verticals) {
  verticalMap[v.slug] = await findOrCreate('verticals', { slug: { equals: v.slug } }, v)
}

// ═══════════════════════════════════════════════════════════════════════
// 3. Issue 01
// ═══════════════════════════════════════════════════════════════════════
const issue01 = await findOrCreate('issues', { issueNumber: { equals: 1 } }, {
  issueNumber: 1,
  volume: 1,
  title: 'Issue 01 — Spring 2026',
  themeTagline: 'When technology outruns leadership, who pays the price?',
  themeSubheading: 'This issue — Technology, Trust & the Leadership Gap',
  publicationDate: '2026-04-01T00:00:00.000Z',
  status: 'published',
  editorLetter: {
    title: 'Letter from the Editor',
    body: richText([
      'Welcome to the inaugural issue of Transformidable.',
      'We launched this publication because we believe the most important conversations in technology aren\'t about the technology itself — they\'re about the people trusted to lead it. And too often, those conversations aren\'t happening at all.',
      'In this issue, we examine the widening gap between the pace of technological change and the leadership capacity to guide it. From boardrooms that confuse IT budgets with digital strategy, to the women reshaping what executive leadership looks like in tech, every article asks a version of the same question: who is truly prepared to lead what\'s next?',
      'This is not a tech magazine. This is a leadership magazine for people who happen to work in technology — and for the organizations that depend on them.',
      'We\'re glad you\'re here.',
    ]),
    signoff: '— Dr. Jerri Bland, Founder & Editor-in-Chief',
  },
})

// ═══════════════════════════════════════════════════════════════════════
// 4. Articles — update verticals & issue assignment
// ═══════════════════════════════════════════════════════════════════════
const articleAssignments = [
  {
    title: "The Conversation No One's Having About Technology and Trust",
    vertical: 'unlimited-powerhouse',
    displayOrder: 1,
    isFlagship: true,
    dek: 'Technology decisions are trust decisions. Yet most organizations treat them as budget line items — and wonder why transformation stalls.',
    readTime: 12,
  },
  {
    title: 'Owning the Strategy Room: How Women in Tech Move from Execution to Vision',
    vertical: 'executive-leadership',
    displayOrder: 2,
    isFlagship: false,
    dek: 'Women in technology are running the show behind the scenes. It\'s time they set the agenda in the room where it happens.',
    readTime: 9,
  },
  {
    title: 'Why Your IT Roadmap Is a Business Strategy Problem',
    vertical: 'executive-leadership',
    displayOrder: 3,
    isFlagship: false,
    dek: 'If your technology roadmap lives in IT and never reaches the boardroom, it isn\'t a strategy — it\'s a wishlist.',
    readTime: 8,
  },
  {
    title: "The CIO You Hired Can't Lead the Organization You're Becoming",
    vertical: 'unlimited-powerhouse',
    displayOrder: 4,
    isFlagship: false,
    dek: 'The role of CIO has outgrown the job description most companies wrote a decade ago. Are you hiring for where you\'re headed — or where you\'ve been?',
    readTime: 10,
  },
]

for (const assignment of articleAssignments) {
  const found = await payload.find({
    collection: 'articles',
    where: { title: { equals: assignment.title } },
    limit: 1,
  })

  const verticalId = verticalMap[assignment.vertical]?.id

  if (found.docs.length > 0) {
    const article = found.docs[0] as unknown as { id: number }
    await payload.update({
      collection: 'articles',
      id: article.id,
      data: {
        issue: issue01.id,
        vertical: verticalId,
        displayOrder: assignment.displayOrder,
        isFlagship: assignment.isFlagship,
        dek: assignment.dek,
        readTime: assignment.readTime,
        status: 'published',
      },
    })
    console.log(`[seed] Updated article "${assignment.title}" → vertical=${assignment.vertical}, order=${assignment.displayOrder}.`)
  } else {
    await payload.create({
      collection: 'articles',
      data: {
        title: assignment.title,
        issue: issue01.id,
        vertical: verticalId,
        displayOrder: assignment.displayOrder,
        isFlagship: assignment.isFlagship,
        dek: assignment.dek,
        readTime: assignment.readTime,
        status: 'published',
        body: richText([`Content for "${assignment.title}" — coming soon.`]),
      },
    })
    console.log(`[seed] Created article "${assignment.title}" with vertical=${assignment.vertical}.`)
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 5. Site Settings — founder letter
// ═══════════════════════════════════════════════════════════════════════
try {
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      publicationName: 'Transformidable',
      tagline: 'Where Technology Meets Leadership',
      founderLetter: {
        title: 'From the Desk of Jerri Bland',
        body: richText([
          'I started Transformidable because I was tired of watching brilliant technologists get overlooked for leadership — and tired of watching leaders without technical fluency make decisions that cost organizations millions.',
          'This publication exists at the intersection of technology and leadership, where the real work of transformation happens. Not in vendor pitches or quarterly reviews, but in the daily decisions made by people who understand both the systems and the humans those systems serve.',
          'Thank you for reading. Thank you for leading. And thank you for believing that we can build something better.',
        ]),
        signoff: 'Jerri Bland, Ed.D. — Founder & CEO, Powerhouse Companies',
        isVisible: true,
      },
    },
  })
  console.log('[seed] Updated SiteSettings (publicationName, tagline, founderLetter).')
} catch (err) {
  console.error('[seed] Failed to update SiteSettings:', err)
}

console.log('\n[seed] ✓ Seed complete.')
await payload.destroy()
process.exit(0)
