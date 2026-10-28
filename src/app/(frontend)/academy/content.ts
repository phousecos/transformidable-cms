// Copy shared by the Academy pages: the three programs, the audiences, and
// the FAQ. Kept in one place so the program pages, the Academy front door,
// the audience pages, and their structured data never disagree.
//
// The Academy leads with organizational buyers. Each program stands on its
// own: none is a prerequisite for another, and they are marketed
// independently while the certificate pathway is developed.
//
// Facts not yet decided (pricing) are written so they stay true until they
// are decided, and marked PENDING.

// `program` is the matching Academy Inquiries option, so a program page can
// preselect itself on the inquiry form. `stage` places it in the
// Understand / Govern / Implement sequence.
export const PROGRAMS = [
  {
    slug: "ai-governance-for-boards-and-councils",
    program: "course-1",
    featured: true,
    eyebrow: "Executive briefing · 90 minutes",
    stage: { name: "Understand", format: "90-minute executive briefing", line: "Build shared awareness and oversight literacy." },
    title: "AI Governance for Boards & Councils",
    subtitle: "Understanding the Decisions You're Responsible For",
    intro: [
      "Artificial intelligence is becoming part of how public institutions operate, deliver services, manage information, and make decisions. Yet many governing bodies are being asked to oversee AI initiatives without a common understanding of the technology, its risks, or the questions they should be asking.",
      "This executive briefing is designed for city councils, county commissions, university boards, and other governing bodies responsible for organizational oversight.",
      "Participants do not need technical expertise. The focus is on governance, accountability, and informed decision-making.",
    ],
    explore: [
      "What today's AI capabilities mean for public institutions.",
      "The distinction between management responsibilities and governing-body oversight.",
      "Risks involving privacy, security, accuracy, fairness, procurement, and public trust.",
      "Questions governing bodies should ask before approving or expanding AI initiatives.",
      "What effective AI governance reporting and accountability can look like.",
    ],
    takeaway:
      "Participants leave with a shared vocabulary, a practical set of oversight questions, and an AI Governance Oversight Checklist to support future discussions and decisions.",
    tools: ["AI Governance Oversight Checklist"],
    attend: "City councils, county commissions, boards of trustees, governing committees, and executive leadership teams.",
    delivery: ["90-minute facilitated briefing, available virtually or in person for private organizational groups."],
    facts: { format: "90-minute facilitated briefing", delivery: "Virtual or in person" },
    closing: {
      headline: "Bring AI governance into your next board or council discussion.",
      line: "Contact Transformidable Academy to discuss a private briefing for your organization.",
      form: "Discuss a private briefing",
      button: "Discuss a private briefing",
    },
    individuals: false,
  },
  {
    slug: "governing-ai-adoption",
    program: "course-2",
    featured: false,
    eyebrow: "Facilitated workshop · 4 hours",
    stage: { name: "Govern", format: "4-hour workshop", line: "Clarify decisions, accountability, and oversight." },
    title: "Governing AI Adoption",
    subtitle: "From AI Awareness to Effective Organizational Oversight",
    intro: [
      "Understanding artificial intelligence is only the beginning. As organizations introduce AI into their operations, leaders must determine who has authority to make decisions, how risks are evaluated, what evidence supports deployment, and when concerns require escalation.",
      "This interactive workshop helps governing bodies and executive teams translate AI awareness into practical governance expectations.",
      "Using realistic organizational scenarios and the Transformidable approach to governance, participants examine the decisions, responsibilities, and oversight mechanisms needed to govern AI adoption.",
    ],
    explore: [
      "Establishing AI decision rights and accountability.",
      "Evaluating proposed AI uses against organizational objectives and risk.",
      "Distinguishing operational management from governance oversight.",
      "Identifying information leaders need before authorizing AI initiatives.",
      "Designing escalation, monitoring, and reporting expectations.",
      "Developing priorities for the next 90 days.",
    ],
    takeaway:
      "Participants develop a preliminary AI Governance Oversight Scorecard and a 90-Day Governance Action Plan identifying practical next steps for their organization.",
    tools: ["AI Governance Oversight Scorecard", "90-Day Governance Action Plan"],
    attend:
      "Governing boards, councils, executive teams, CIOs, AI program sponsors, and leaders responsible for organizational risk and accountability.",
    delivery: [
      "Four-hour facilitated workshop, delivered as a half-day session or two virtual sessions.",
      "The workshop can be adapted to the organization's sector, existing AI activities, and governance responsibilities.",
    ],
    facts: { format: "Four-hour facilitated workshop", delivery: "Half-day session or two virtual sessions" },
    closing: {
      headline: "Move beyond AI awareness. Establish the questions, responsibilities, and evidence needed for effective oversight.",
      line: "Contact Transformidable Academy to arrange a private workshop.",
      form: "Arrange a private workshop",
      button: "Arrange a private workshop",
    },
    individuals: false,
  },
  {
    slug: "building-ai-governance",
    program: "course-3",
    featured: false,
    eyebrow: "Applied learning program · Approximately 7 hours",
    stage: { name: "Implement", format: "7-hour applied program", line: "Develop an actionable governance approach." },
    title: "Building AI Governance in Practice",
    subtitle: "Turning Governance Principles into an Actionable Organizational Approach",
    intro: [
      "Effective AI governance requires more than a policy statement or a technology committee. It requires clear authority, defined accountability, reliable information, and the ability to respond when circumstances change.",
      "This applied program helps organizational leaders develop a practical approach to governing AI initiatives, from initial evaluation through ongoing oversight.",
      "Participants work through governance scenarios and apply structured decision-making tools to their own organizational context.",
    ],
    explore: [
      "Defining AI governance roles and decision-making authority.",
      "Establishing requirements for evaluating proposed AI uses.",
      "Assigning accountability across leadership, technology, legal, risk, and operational functions.",
      "Designing escalation and exception-management processes.",
      "Identifying evidence needed to support governance decisions.",
      "Establishing oversight measures, reporting expectations, and review cycles.",
      "Developing an actionable governance implementation roadmap.",
    ],
    takeaway:
      "Participants complete an AI Governance Action Brief outlining governance priorities, decision rights, oversight expectations, and recommended next steps for their organization.",
    tools: ["AI Governance Action Brief"],
    attend:
      "Executive leaders, governance and risk professionals, AI program sponsors, CIOs, and organizational teams responsible for establishing or strengthening AI governance.",
    delivery: ["Approximately seven hours of facilitated instruction and applied exercises, available as a private organizational program."],
    note: "This course is being developed as part of the Transformidable Academy AI Governance Foundation learning pathway.",
    facts: { format: "About seven hours of instruction and applied exercises", delivery: "Private organizational program" },
    closing: {
      headline: "Translate governance principles into a practical plan for your organization.",
      line: "Register your interest in an upcoming program or discuss a private organizational cohort.",
      form: "Discuss a private organizational cohort",
      button: "Discuss a private program",
    },
    individuals: true,
  },
];

export const FEATURED = PROGRAMS.find((p) => p.featured);
export const programHref = (slug: string) => `/academy/courses/${slug}`;

// What every program shares, in the order the copy leads with it.
export const PROMISES = [
  {
    title: "For decision-makers",
    text: "Designed for the people who oversee and answer for AI decisions, not technical specialists. No technical expertise is needed.",
  },
  {
    title: "Practical governance tools",
    text: "Participants leave with tools they can use: an oversight checklist, a scorecard and 90-day action plan, or a governance action brief.",
  },
  {
    title: "Private sessions",
    text: "Organizations can arrange a private session for their entire leadership team or governing body, virtually or in person.",
  },
];

export const PRIMARY_AUDIENCES = [
  "City councils",
  "County commissions",
  "University governing boards",
  "Executive leadership teams",
];
export const OTHER_AUDIENCES = "Other governing bodies, including nonprofit and financial institution boards.";

type FaqGroup = "general" | "organizations" | "individuals";

export const FAQ_GROUPS: { key: FaqGroup; title: string }[] = [
  { key: "general", title: "About the programs" },
  { key: "organizations", title: "For organizations" },
  { key: "individuals", title: "For individuals" },
];

export const FAQ: { q: string; a: string; group: FaqGroup }[] = [
  {
    q: "Who are the programs for?",
    a: "City councils, county commissions, university governing boards, and executive leadership teams, along with other governing bodies, including nonprofit and financial institution boards, that oversee decisions about artificial intelligence.",
    group: "general",
  },
  {
    q: "Do participants need a technical background?",
    a: "No. The programs are designed for decision-makers rather than technical specialists. The focus is on governance, accountability, and informed decision-making.",
    group: "general",
  },
  {
    q: "Do we have to start with the briefing?",
    a: "No. Each program stands on its own, and none is a prerequisite for another. A council may want only the briefing; an executive team may be ready for the half-day workshop; an organization building an AI governance program may need the applied course.",
    group: "general",
  },
  {
    q: "What do participants leave with?",
    a: "Practical governance tools. The briefing provides an AI Governance Oversight Checklist; the workshop, a preliminary AI Governance Oversight Scorecard and a 90-Day Governance Action Plan; the applied program, an AI Governance Action Brief for your organization.",
    group: "general",
  },
  {
    q: "Are the programs delivered online or in person?",
    a: "The briefing is available virtually or in person. The workshop runs as a half-day session or two virtual sessions. The applied program is arranged as a private program with each organization.",
    group: "general",
  },
  {
    q: "How does the Academy relate to Transformidable research?",
    a: "The Academy draws on Transformidable's governance research, which examines how governance decisions shape technology-enabled transformation, and turns those lessons into executive education.",
    group: "general",
  },
  {
    q: "Can you hold a session for our whole council or board?",
    a: "Yes. Organizations can arrange a private session for their entire leadership team or governing body, virtually or in person.",
    group: "organizations",
  },
  {
    q: "Can a program be adapted to our organization?",
    a: "Yes. The workshop can be adapted to your sector, your existing AI activities, and your governance responsibilities, and the applied program works directly with your own organizational context.",
    group: "organizations",
  },
  {
    q: "Which program should we start with?",
    a: "The briefing suits a governing body that wants a common understanding and the right oversight questions. The workshop suits leaders ready to set decision rights and oversight expectations. The applied program suits an organization building its AI governance approach. We can help you choose.",
    group: "organizations",
  },
  {
    // PENDING: replace with published pricing once it is set.
    q: "How is a private session priced?",
    a: "Pricing depends on the program, group size, delivery format, and how much it is adapted to your organization, so we prepare it after an initial conversation. An inquiry carries no commitment.",
    group: "organizations",
  },
  {
    q: "Can individuals take part?",
    a: "The programs are currently offered as private sessions for organizations. If you would like to take part as an individual, join the interest list and we will let you know when an open program is scheduled.",
    group: "individuals",
  },
  {
    q: "Does joining the interest list commit me to anything?",
    a: "No. Joining the interest list is not enrollment and carries no financial commitment.",
    group: "individuals",
  },
];

export const faqIn = (...groups: FaqGroup[]) => FAQ.filter((item) => groups.includes(item.group));

// schema.org FAQPage markup, so search engines can show the answers directly.
// Used only on /academy/faq, the one page that carries every question.
export const faqJsonLd = (items: typeof FAQ) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});
