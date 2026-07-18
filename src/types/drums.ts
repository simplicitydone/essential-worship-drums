// Shared types. The SQLite DB (db/ewd.sqlite) is the source of truth; the
// exporter renders it to public/db.json, which the app fetches at runtime.

export const KIT_LANES = ['CR', 'RD', 'OH', 'HH', 'T1', 'T2', 'FT', 'SN', 'KK'] as const
export type Lane = (typeof KIT_LANES)[number]

// Human labels for each kit lane (EN / KR), rendered on the GrooveGrid.
export const LANE_LABEL: Record<Lane, { short: string; en: string; kr: string }> = {
  CR: { short: 'Cr', en: 'Crash', kr: '크래시' },
  RD: { short: 'Rd', en: 'Ride', kr: '라이드' },
  OH: { short: 'oH', en: 'Open Hat', kr: '오픈 하이햇' },
  HH: { short: 'HH', en: 'Hi-Hat', kr: '하이햇' },
  T1: { short: 'T1', en: 'High Tom', kr: '하이 탐' },
  T2: { short: 'T2', en: 'Mid Tom', kr: '미드 탐' },
  FT: { short: 'FT', en: 'Floor Tom', kr: '플로어 탐' },
  SN: { short: 'Sn', en: 'Snare', kr: '스네어' },
  KK: { short: 'Kk', en: 'Kick', kr: '킥' },
}

export type Section =
  | 'crash'
  | 'basics'
  | 'grooves'
  | 'fills'
  | 'worship'
  | 'rudiments'
  | 'songs'
  | 'guide'
export const TABS: Section[] = ['crash', 'basics', 'grooves', 'fills', 'worship', 'rudiments', 'songs', 'guide']

export const TAB_LABEL: Record<Section, { en: string; kr: string }> = {
  crash: { en: 'Crash Course', kr: '속성 코스' },
  basics: { en: 'Back to Basics', kr: '기본기' },
  grooves: { en: 'Grooves', kr: '그루브' },
  fills: { en: 'Fills', kr: '필인' },
  worship: { en: 'Worship', kr: '예배' },
  rudiments: { en: 'Rudiments', kr: '루디먼트' },
  songs: { en: 'Songs', kr: '곡' },
  guide: { en: 'Study Guide', kr: '학습' },
}

export type PatternSection = 'grooves' | 'fills' | 'worship' | 'songs'

// One section of a song's dynamic arc (Intro, Verse, Chorus…), for the Songs tab.
export interface ArrangementPart {
  label: string
  labelKr: string
  intensity: number // 1 (whisper) … 5 (biggest)
  note: string
  noteKr: string
}

export interface Pattern {
  id: string
  section: PatternSection
  name: string
  nameKr: string
  tier: 'Basic' | 'Advanced'
  bpm: number
  beats: number
  subdivision: number
  lanes: Lane[]
  grid: Partial<Record<Lane, number[]>>
  count: string
  sticking?: string[] | null
  description: string
  descriptionKr: string
  howTo: string
  howToKr?: string
  arrangement?: ArrangementPart[]
}

export interface Lesson {
  id: string
  section: 'crash' | 'basics' | 'worship'
  title: string
  titleKr: string
  order: number
  body: string
  bodyKr: string
  keyPoints: string[]
  keyPointsKr: string[]
  diagram: string | null
  patternRef: string | null
}

export interface Rudiment {
  id: string
  name: string
  nameKr: string
  sticking: string[]
  notation: string
  description: string
  descriptionKr: string
  application: string
}

// A practice drill — the "earn it" work: a focused routine that turns a
// faked skill into a real one, optionally looping a pattern at a target tempo.
export interface Drill {
  id: string
  title: string
  titleKr: string
  focus: string
  focusKr: string
  goal: string
  goalKr: string
  reps: string
  repsKr: string
  targetBpm: number | null
  patternRef: string | null
  steps: string[]
  stepsKr: string[]
}

export interface QuizItem {
  question: string
  questionKr: string
  answer: string
  answerKr: string
}

export interface GlossaryItem {
  term: string
  termKr: string
  definition: string
  definitionKr: string
}

// ---- Raw payload fetched from /db.json (exported from db/ewd.sqlite) ----
export interface DbJson {
  schemaVersion: number
  lessons: Lesson[]
  patterns: Pattern[]
  rudiments: Rudiment[]
  drills: Drill[]
  quiz: QuizItem[]
  glossary: GlossaryItem[]
}

// ---- Reference-resolved runtime data ----
export interface AppData {
  schemaVersion: number
  lessons: Lesson[]
  crashLessons: Lesson[]
  basicsLessons: Lesson[]
  worshipLessons: Lesson[]
  patternLibrary: Record<string, Pattern>
  grooves: Pattern[]
  fills: Pattern[]
  worshipPatterns: Pattern[]
  songs: Pattern[]
  rudiments: Rudiment[]
  drills: Drill[]
  quiz: QuizItem[]
  glossary: GlossaryItem[]
}
