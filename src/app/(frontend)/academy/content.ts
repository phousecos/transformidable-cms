// Copy shared by the Academy pages: the courses, the governance disciplines,
// the two audiences, and the FAQ. Kept in one place so the course pages, the
// audience pages, the certificate page, and their structured data never
// disagree.
//
// Facts not yet decided (price, first cohort dates, credit for continuing
// education) are written so they stay true until they are decided. Each one
// is marked PENDING; replace the wording when the fact is settled.

export const PROGRAM_STATUS = "In development. Interest registration is open for future cohorts.";

export const CERTIFICATE = {
  name: "Foundation Certificate in AI Governance",
  href: "/academy/foundation-certificate",
  summary:
    "A three-course executive education program that moves from understanding AI, to exercising oversight, to building the structures that make governance work.",
};

// `program` is the matching Academy Inquiries option, so a course page can
// preselect its course on either inquiry form.
export const COURSES = [
  {
    slug: "ai-explained",
    program: "course-1",
    no: "Course 1",
    title: "AI Explained for Executive Decision-Makers",
    tagline: "Understanding the machinery",
    summary:
      "Understand artificial intelligence, large language models, AI agents, data use, and the capabilities and limitations that matter to organizational leaders.",
    detail: [
      "A foundational introduction to artificial intelligence, generative AI, large language models, AI agents, and the role of data.",
      "Participants explore how these technologies work, what they can and cannot reliably do, and the questions executives should ask about their organizational use.",
    ],
    format: "Approximately 35 minutes of recorded instruction, with an optional facilitated executive briefing.",
    delivery: "Recorded, with an optional live briefing",
    outcomes: [
      "Explain essential AI concepts and distinguish AI assistants, language models, and agents.",
      "Recognize organizational AI use, limitations, and material governance concerns.",
    ],
  },
  {
    slug: "governing-ai-adoption",
    program: "course-2",
    no: "Course 2",
    title: "Governing AI Adoption",
    tagline: "Exercising executive oversight",
    summary:
      "Learn to exercise executive oversight using six practical governance disciplines: SEE, DECIDE, OWN, ESCALATE, EVIDENCE, and RESPOND.",
    detail: [
      "A four-hour interactive workshop introducing the six disciplines of the Transformidable Governance Method.",
      "Participants apply these disciplines to an evolving organizational AI adoption scenario and identify priorities for strengthening executive oversight.",
    ],
    format: "Four hours in person, or two live virtual sessions.",
    delivery: "In person or live virtual",
    outcomes: [
      "Evaluate AI-related decisions and the evidence supporting them.",
      "Establish appropriate accountability and escalation expectations.",
    ],
  },
  {
    slug: "building-ai-governance",
    program: "course-3",
    no: "Course 3",
    title: "Building AI Governance in Practice",
    tagline: "Turning expectations into operating mechanisms",
    summary:
      "Translate governance expectations into operating structures, decision rights, accountability mechanisms, reporting requirements, and improvement processes.",
    detail: [
      "An applied workshop focused on making governance operational: governance structures, decision rights, accountability, escalation pathways, oversight reporting, and continuous improvement.",
      "The course culminates in the development of an AI Governance Action Brief.",
    ],
    format: "Approximately seven instructional hours, in person or across multiple virtual sessions.",
    delivery: "In person or across virtual sessions",
    outcomes: [
      "Identify essential governance structures, reporting mechanisms, and intervention processes.",
      "Develop a practical action brief for improving AI governance.",
    ],
  },
];

export const courseHref = (slug: string) => `/academy/courses/${slug}`;

export const DISCIPLINES = [
  { code: "SEE", desc: "Recognize what is happening and what matters." },
  { code: "DECIDE", desc: "Exercise appropriate decision authority." },
  { code: "OWN", desc: "Establish and maintain accountability." },
  { code: "ESCALATE", desc: "Bring consequential issues to the appropriate level." },
  { code: "EVIDENCE", desc: "Measure performance and substantiate claims." },
  { code: "RESPOND", desc: "Intervene, correct course, and improve." },
];

export const OUTCOMES = COURSES.flatMap((c) => c.outcomes);

export const AUDIENCES = [
  "City councils, municipal executives, and public-sector leadership teams",
  "University presidents, trustees, and higher education executives",
  "Bank boards, CEOs, and financial services leaders",
  "Nonprofit boards and executive directors",
  "Organizational leaders responsible for major technology decisions",
];

// The two ways to take the courses. Each route has its own page and form.
export const ROUTES = {
  organization: {
    label: "For organizations",
    title: "Learn together as a board or leadership team",
    summary:
      "Private cohorts bring your governing body or executive team through the program together, with facilitated discussion and scenarios drawn from your sector. Virtual or in person.",
    href: "/academy/organizations",
    cta: "Private cohorts",
  },
  individual: {
    label: "For individuals",
    title: "Take the program on your own",
    summary:
      "Future open-enrollment cohorts will let executives and professionals take the courses independently and work toward the certificate.",
    href: "/academy/individuals",
    cta: "Open enrollment",
  },
};

type FaqGroup = "general" | "organizations" | "individuals" | "certificate";

export const FAQ_GROUPS: { key: FaqGroup; title: string }[] = [
  { key: "general", title: "About the Academy" },
  { key: "certificate", title: "The certificate" },
  { key: "organizations", title: "For organizations" },
  { key: "individuals", title: "For individuals" },
];

export const FAQ: { q: string; a: string; group: FaqGroup }[] = [
  {
    q: "Who is Transformidable Academy for?",
    a: "Executives, governing boards, and organizational leaders who are asked to authorize, oversee, or take accountability for consequential technology decisions. That includes city councils and municipal executives, university presidents and trustees, bank boards and financial services leaders, nonprofit boards and executive directors, and the leadership teams around them.",
    group: "general",
  },
  {
    q: "Do I need a technical background in AI?",
    a: "No. The Foundation Certificate assumes no technical AI background. Course 1 explains the technology in terms leaders need for oversight, and the rest of the program focuses on governance: decisions, accountability, escalation, evidence, and response.",
    group: "general",
  },
  {
    q: "Is it delivered online or in person?",
    a: "Both. Courses 2 and 3 can be delivered in person or across live virtual sessions, and Course 1 is recorded with an optional facilitated briefing.",
    group: "general",
  },
  {
    q: "How does the Academy relate to Transformidable research?",
    a: "The Academy draws on Transformidable's governance research and on the practical disciplines of the Transformidable Governance Method. The research examines how governance decisions shape technology-enabled transformation; the Academy turns those lessons into executive education.",
    group: "general",
  },
  {
    q: "What does the Foundation Certificate cover?",
    a: "Three courses: AI Explained for Executive Decision-Makers, Governing AI Adoption, and Building AI Governance in Practice. Together they move from understanding the technology, to exercising oversight with six governance disciplines, to building the structures that make governance work day to day.",
    group: "certificate",
  },
  {
    q: "How much time does the program take?",
    a: "As currently planned: about 35 minutes of recorded instruction for Course 1, a four-hour workshop for Course 2, and about seven instructional hours for Course 3, plus learning assessments and an applied capstone.",
    group: "certificate",
  },
  {
    q: "What does it take to earn the certificate?",
    a: "Completing all three courses, the learning assessments, and an applied governance capstone, which takes the form of an AI Governance Action Brief.",
    group: "certificate",
  },
  {
    q: "Is the certificate an accredited professional certification?",
    a: "No. The Foundation Certificate is a Transformidable Academy executive education credential, not an independently accredited professional certification. Final assessment requirements and certificate issuance procedures will be published before enrollment opens.",
    group: "certificate",
  },
  {
    q: "Can you deliver the program for our board or leadership team?",
    a: "Yes. Private cohorts bring a governing body or executive team through the program together, with facilitated discussion, sector-relevant scenarios, and an organizational governance action-planning exercise. Delivery can be virtual or in person.",
    group: "organizations",
  },
  {
    q: "Can the program reflect our sector?",
    a: "Yes. Private cohorts can use scenarios drawn from your sector, whether that is local government, higher education, financial services, or the nonprofit world, so the discussion stays close to the decisions your leaders actually face.",
    group: "organizations",
  },
  {
    q: "Can we start with a single course or a briefing?",
    a: "The certificate is designed as a three-course pathway. If a single session fits your needs better, such as an AI briefing for your board based on Course 1, tell us in your inquiry and we will discuss what fits.",
    group: "organizations",
  },
  {
    // PENDING: replace with published cohort pricing once it is set.
    q: "How is a private cohort priced?",
    a: "Private cohort pricing depends on group size, delivery format, and how much the program is tailored to your sector, so we prepare it after an initial conversation. An inquiry carries no commitment.",
    group: "organizations",
  },
  {
    // PENDING: replace with the first open-enrollment dates once they are set.
    q: "When does open enrollment start?",
    a: "The program is in development and dates have not yet been announced. Join the interest list and you will be among the first to hear about scheduling and enrollment.",
    group: "individuals",
  },
  {
    // PENDING: replace with published pricing once it is set.
    q: "How much does it cost?",
    a: "Pricing for open-enrollment cohorts will be published before enrollment opens.",
    group: "individuals",
  },
  {
    q: "Can I earn the certificate as an individual?",
    a: "Yes. Open-enrollment certificate cohorts are planned so that executives and professionals can complete the program independently of their organization.",
    group: "individuals",
  },
  {
    q: "Does joining the interest list commit me to anything?",
    a: "No. Joining the interest list is not enrollment and carries no financial commitment. You will simply hear about program announcements, dates, and enrollment.",
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
