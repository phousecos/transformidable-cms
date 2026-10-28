// Option lists shared by the Academy Inquiries collection, the public inquiry
// form, and the API route that validates it, so a value the form can send is
// always one the collection accepts. Plain data, safe to import client-side.
// Adding or renaming a value also means updating the matching enumColumns
// entry in src/migrate.ts.
export const ACADEMY_PROGRAMS = [
  { label: 'Full certificate program', value: 'foundation-certificate' },
  { label: 'Course 1: AI Explained for Executive Decision-Makers', value: 'course-1' },
  { label: 'Course 2: Governing AI Adoption', value: 'course-2' },
  { label: 'Course 3: Building AI Governance in Practice', value: 'course-3' },
  { label: 'Executive briefing for a board or leadership team', value: 'executive-briefing' },
  { label: 'Not sure yet', value: 'not-sure' },
]

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
