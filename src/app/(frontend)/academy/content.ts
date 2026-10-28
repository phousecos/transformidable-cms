// Copy shared by the Academy pages: the courses, the governance disciplines,
// and the FAQ. Kept in one place so the landing page, the certificate page,
// and their structured data never disagree.
//
// Facts not yet decided (price, first cohort dates, credit for continuing
// education) are written so they stay true until they are decided. Each one
// is marked PENDING; replace the wording when the fact is settled.

export const PROGRAM_STATUS = "In development. Interest registration is open for future cohorts.";

export const COURSES = [
  {
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
  },
  {
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
  },
  {
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
  },
];

export const DISCIPLINES = [
  { code: "SEE", desc: "Recognize what is happening and what matters." },
  { code: "DECIDE", desc: "Exercise appropriate decision authority." },
  { code: "OWN", desc: "Establish and maintain accountability." },
  { code: "ESCALATE", desc: "Bring consequential issues to the appropriate level." },
  { code: "EVIDENCE", desc: "Measure performance and substantiate claims." },
  { code: "RESPOND", desc: "Intervene, correct course, and improve." },
];

export const OUTCOMES = [
  "Explain essential AI concepts and distinguish AI assistants, language models, and agents.",
  "Recognize organizational AI use, limitations, and material governance concerns.",
  "Evaluate AI-related decisions and the evidence supporting them.",
  "Establish appropriate accountability and escalation expectations.",
  "Identify essential governance structures, reporting mechanisms, and intervention processes.",
  "Develop a practical action brief for improving AI governance.",
];

export const AUDIENCES = [
  "City councils, municipal executives, and public-sector leadership teams",
  "University presidents, trustees, and higher education executives",
  "Bank boards, CEOs, and financial services leaders",
  "Nonprofit boards and executive directors",
  "Organizational leaders responsible for major technology decisions",
];

// `on` says which page shows the question: the Academy landing page, the
// certificate page, or both.
export const FAQ: { q: string; a: string; on: ("academy" | "certificate")[] }[] = [
  {
    q: "Who is Transformidable Academy for?",
    a: "Executives, governing boards, and organizational leaders who are asked to authorize, oversee, or take accountability for consequential technology decisions. That includes city councils and municipal executives, university presidents and trustees, bank boards and financial services leaders, nonprofit boards and executive directors, and the leadership teams around them.",
    on: ["academy", "certificate"],
  },
  {
    q: "Do I need a technical background in AI?",
    a: "No. The Foundation Certificate assumes no technical AI background. Course 1 explains the technology in terms leaders need for oversight, and the rest of the program focuses on governance: decisions, accountability, escalation, evidence, and response.",
    on: ["academy", "certificate"],
  },
  {
    q: "What does the Foundation Certificate in AI Governance cover?",
    a: "Three courses: AI Explained for Executive Decision-Makers, Governing AI Adoption, and Building AI Governance in Practice. Together they move from understanding the technology, to exercising oversight with six governance disciplines, to building the structures that make governance work day to day.",
    on: ["academy"],
  },
  {
    q: "How much time does the program take?",
    a: "As currently planned: about 35 minutes of recorded instruction for Course 1, a four-hour workshop for Course 2, and about seven instructional hours for Course 3, plus learning assessments and an applied capstone. Private cohorts can schedule the sessions to suit a board or leadership calendar.",
    on: ["certificate"],
  },
  {
    q: "Is it delivered online or in person?",
    a: "Both. Courses 2 and 3 can be delivered in person or across live virtual sessions, and Course 1 is recorded with an optional facilitated briefing. Private cohorts choose the format that suits their group.",
    on: ["academy", "certificate"],
  },
  {
    // PENDING: replace with the first cohort dates once they are set.
    q: "When does the first cohort start?",
    a: "The program is in development and dates have not yet been announced. Register your interest and you will be among the first to hear about scheduling and enrollment. Organizations planning a private cohort can contact us now to discuss timing.",
    on: ["academy", "certificate"],
  },
  {
    // PENDING: replace with published pricing once it is set.
    q: "How much does it cost?",
    a: "Pricing for open-enrollment cohorts will be published before enrollment opens. Private cohort pricing depends on group size, delivery format, and how much the program is tailored to your sector, so we prepare it after an initial conversation.",
    on: ["academy", "certificate"],
  },
  {
    q: "Is the certificate an accredited professional certification?",
    a: "No. The Foundation Certificate is a Transformidable Academy executive education credential, not an independently accredited professional certification. Final assessment requirements and certificate issuance procedures will be published before enrollment opens.",
    on: ["certificate"],
  },
  {
    q: "What does it take to earn the certificate?",
    a: "Completing all three courses, the learning assessments, and an applied governance capstone, which takes the form of an AI Governance Action Brief for your organization.",
    on: ["certificate"],
  },
  {
    q: "Can you deliver the program for our board or leadership team?",
    a: "Yes. Private cohorts bring a governing body or executive team through the program together, with facilitated discussion, sector-relevant scenarios, and an organizational governance action-planning exercise. Delivery can be virtual or in person.",
    on: ["academy", "certificate"],
  },
  {
    q: "Can we start with a single course or a briefing?",
    a: "The certificate is designed as a three-course pathway. If a single session fits your needs better, such as an AI briefing for your board based on Course 1, tell us in your inquiry and we will discuss what fits.",
    on: ["academy", "certificate"],
  },
  {
    q: "Does registering interest commit me to anything?",
    a: "No. Registering interest is not enrollment and carries no financial commitment. It simply means you will hear about program announcements, dates, and enrollment.",
    on: ["academy", "certificate"],
  },
  {
    q: "How does the Academy relate to Transformidable research?",
    a: "The Academy draws on Transformidable's governance research and on the practical disciplines of the Transformidable Governance Method. The research examines how governance decisions shape technology-enabled transformation; the Academy turns those lessons into executive education.",
    on: ["academy"],
  },
];

export const faqFor = (page: "academy" | "certificate") => FAQ.filter((item) => item.on.includes(page));

// schema.org FAQPage markup, so search engines can show the answers directly.
export const faqJsonLd = (items: typeof FAQ) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});
