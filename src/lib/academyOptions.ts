// Option lists shared by the Academy Inquiries collection, the public inquiry
// form, and the API route that validates it, so a value the form can send is
// always one the collection accepts. Plain data, safe to import client-side.
// Adding or renaming a value also means updating the matching enumColumns
// entry in src/migrate.ts.
// Every program value an inquiry can hold, including retired ones, so older
// inquiries keep their answer. The values stay fixed; only labels change.
export const ACADEMY_PROGRAMS = [
  { label: 'AI Governance for Boards & Councils (90-minute briefing)', value: 'course-1' },
  { label: 'Governing AI Adoption (4-hour workshop)', value: 'course-2' },
  { label: 'Building AI Governance in Practice (applied program)', value: 'course-3' },
  { label: 'More than one program', value: 'foundation-certificate' },
  { label: 'Not sure yet', value: 'not-sure' },
  { label: 'Executive briefing (retired option)', value: 'executive-briefing' },
]

// What the public form offers now, and all the API accepts from it.
const RETIRED_PROGRAMS = ['executive-briefing']
export const ACADEMY_PROGRAM_CHOICES = ACADEMY_PROGRAMS.filter((o) => !RETIRED_PROGRAMS.includes(o.value))

export const ACADEMY_SECTORS = [
  { label: 'Local government / municipal', value: 'local-government' },
  { label: 'Higher education', value: 'higher-education' },
  { label: 'Banking / financial services', value: 'financial-services' },
  { label: 'Nonprofit', value: 'nonprofit' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Corporate / private sector', value: 'corporate' },
  { label: 'Other', value: 'other' },
]

export const ACADEMY_PARTICIPANTS = [
  { label: '1–9', value: '1-9' },
  { label: '10–24', value: '10-24' },
  { label: '25–49', value: '25-49' },
  { label: '50+', value: '50-plus' },
  { label: 'Not sure yet', value: 'not-sure' },
]

export const ACADEMY_DELIVERY = [
  { label: 'In person', value: 'in-person' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Combination', value: 'hybrid' },
  { label: 'No preference', value: 'no-preference' },
]

export const ACADEMY_TIMEFRAMES = [
  { label: 'Within 3 months', value: '0-3-months' },
  { label: '3–6 months', value: '3-6-months' },
  { label: '6–12 months', value: '6-12-months' },
  { label: 'Just exploring', value: 'exploring' },
]

export const optionValues = (options: { value: string }[]) => options.map((o) => o.value)
