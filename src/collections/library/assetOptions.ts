// Select options for Assets. Values are short, stable codes that connected systems
// (KADE, jlynne.co) query on, so never change a value once it is in use.

export const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'In review', value: 'in-review' },
  { label: 'Final', value: 'final' },
  { label: 'Retired', value: 'retired' },
]

export const TRACK_OPTIONS = [
  { label: 'T1 ERP transformation', value: 'T1' },
  { label: 'T2 Technology controls', value: 'T2' },
  { label: 'T3 Leadership transition', value: 'T3' },
  { label: 'T4 M&A and separation', value: 'T4' },
  { label: 'T5 Distress and recovery', value: 'T5' },
  { label: 'T6 Vendor portfolio (Vendor Detox)', value: 'T6' },
  { label: 'T7 Fractional CIO', value: 'T7' },
  { label: 'T8 AI governance', value: 'T8' },
  { label: 'Cross-track', value: 'cross-track' },
]

export const ASSET_TYPE_OPTIONS = [
  { label: 'Governance Brief', value: 'governance-brief' },
  { label: 'Board Brief', value: 'board-brief' },
  { label: 'Checklist', value: 'checklist' },
  { label: 'Guide', value: 'guide' },
  { label: 'Workbook', value: 'workbook' },
  { label: 'Webinar recording', value: 'webinar-recording' },
  { label: 'Briefing cut', value: 'briefing-cut' },
  { label: 'Short video', value: 'short-video' },
  { label: 'Post', value: 'post' },
  { label: 'Research note', value: 'research-note' },
  { label: 'Cover note template', value: 'cover-note-template' },
  { label: 'Deck', value: 'deck' },
]

export const SECTOR_EDITION_OPTIONS = [
  { label: 'Private sector', value: 'private-sector' },
  { label: 'Credit union', value: 'credit-union' },
  { label: 'Higher ed & nonprofit', value: 'higher-ed-nonprofit' },
  { label: 'Government', value: 'government' },
  { label: 'All', value: 'all' },
]
