// Render db/ewd.sqlite to public/db.json — the artifact the frontend fetches.
// Run after any DB edit: node scripts/export-db.mjs (or npm run db:export).
import { DatabaseSync } from 'node:sqlite'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const db = new DatabaseSync(path.join(ROOT, 'db', 'ewd.sqlite'), { readOnly: true })

const lessons = db.prepare('SELECT * FROM lessons ORDER BY section, ord').all().map((l) => ({
  id: l.id,
  section: l.section,
  title: l.title,
  titleKr: l.title_kr,
  order: l.ord,
  body: l.body,
  bodyKr: l.body_kr,
  keyPoints: JSON.parse(l.key_points),
  keyPointsKr: JSON.parse(l.key_points_kr),
  diagram: l.diagram ?? null,
  patternRef: l.pattern_ref ?? null,
}))

const patterns = db.prepare('SELECT * FROM patterns ORDER BY position').all().map((p) => ({
  id: p.id,
  section: p.section,
  name: p.name,
  nameKr: p.name_kr,
  tier: p.tier,
  bpm: p.bpm,
  beats: p.beats,
  subdivision: p.subdivision,
  lanes: JSON.parse(p.lanes),
  grid: JSON.parse(p.grid),
  count: p.count,
  sticking: p.sticking ? JSON.parse(p.sticking) : null,
  description: p.description,
  descriptionKr: p.description_kr,
  howTo: p.how_to,
  howToKr: p.how_to_kr ?? '',
  ...(p.arrangement ? { arrangement: JSON.parse(p.arrangement) } : {}),
}))

const rudiments = db.prepare('SELECT * FROM rudiments ORDER BY position').all().map((r) => ({
  id: r.id,
  name: r.name,
  nameKr: r.name_kr,
  sticking: JSON.parse(r.sticking),
  notation: r.notation,
  description: r.description,
  descriptionKr: r.description_kr,
  application: r.application,
}))

const drills = db.prepare('SELECT * FROM drills ORDER BY position').all().map((d) => ({
  id: d.id,
  title: d.title,
  titleKr: d.title_kr,
  focus: d.focus,
  focusKr: d.focus_kr,
  goal: d.goal,
  goalKr: d.goal_kr,
  reps: d.reps,
  repsKr: d.reps_kr,
  targetBpm: d.target_bpm ?? null,
  patternRef: d.pattern_ref ?? null,
  steps: JSON.parse(d.steps),
  stepsKr: JSON.parse(d.steps_kr),
}))

const quiz = db.prepare('SELECT * FROM quiz_items ORDER BY position').all().map((q) => ({
  question: q.question,
  questionKr: q.question_kr,
  answer: q.answer,
  answerKr: q.answer_kr,
}))

const glossary = db.prepare('SELECT * FROM glossary_items ORDER BY position').all().map((g) => ({
  term: g.term,
  termKr: g.term_kr,
  definition: g.definition,
  definitionKr: g.definition_kr,
}))

const data = {
  schemaVersion: Number(db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get().value),
  lessons,
  patterns,
  rudiments,
  drills,
  quiz,
  glossary,
}

db.close()
const outPath = path.join(ROOT, 'public', 'db.json')
writeFileSync(outPath, JSON.stringify(data, null, 1) + '\n')
console.log('Exported', outPath, '—', patterns.length, 'patterns,', lessons.length, 'lessons')
