import { KIT_LANES, type AppData, type DbJson, type Lane, type Pattern } from '../types/drums'

const LANE_SET = new Set<string>(KIT_LANES)

// Build typed, validated app data from the raw db.json payload. Throws on any
// structural problem (unknown lane, wrong grid length, dangling pattern ref) so
// a bad export fails loudly instead of rendering a broken grid.
export function buildAppData(raw: DbJson): AppData {
  const patternLibrary: Record<string, Pattern> = {}

  for (const p of raw.patterns) {
    if (patternLibrary[p.id]) throw new Error(`db.json has duplicate pattern id '${p.id}'`)
    const total = p.beats * p.subdivision
    for (const lane of p.lanes) {
      if (!LANE_SET.has(lane)) throw new Error(`pattern '${p.id}' uses unknown lane '${lane}'`)
      const row = p.grid[lane as Lane]
      if (!row || row.length !== total) {
        throw new Error(
          `pattern '${p.id}' lane '${lane}' has ${row ? row.length : 'no'} steps, expected ${total}`,
        )
      }
    }
    patternLibrary[p.id] = p
  }

  for (const l of raw.lessons) {
    if (l.patternRef && !patternLibrary[l.patternRef]) {
      throw new Error(`lesson '${l.id}' references unknown pattern '${l.patternRef}'`)
    }
  }
  for (const d of raw.drills ?? []) {
    if (d.patternRef && !patternLibrary[d.patternRef]) {
      throw new Error(`drill '${d.id}' references unknown pattern '${d.patternRef}'`)
    }
  }

  const bySection = (s: Pattern['section']) => raw.patterns.filter((p) => p.section === s)
  const lessonsIn = (s: 'crash' | 'basics' | 'worship') =>
    raw.lessons.filter((l) => l.section === s).sort((a, b) => a.order - b.order)

  return {
    schemaVersion: raw.schemaVersion,
    lessons: raw.lessons,
    crashLessons: lessonsIn('crash'),
    basicsLessons: lessonsIn('basics'),
    worshipLessons: lessonsIn('worship'),
    patternLibrary,
    grooves: bySection('grooves'),
    fills: bySection('fills'),
    worshipPatterns: bySection('worship'),
    songs: bySection('songs'),
    rudiments: raw.rudiments,
    drills: raw.drills ?? [],
    quiz: raw.quiz,
    glossary: raw.glossary,
  }
}

export async function loadAppData(): Promise<AppData> {
  const res = await fetch('/db.json', { cache: 'no-cache' })
  if (!res.ok) {
    throw new Error(`Failed to load drum database (${res.status})`)
  }
  return buildAppData((await res.json()) as DbJson)
}
