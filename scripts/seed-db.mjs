// Bootstrap db/ewd.sqlite from the authored curriculum JSON
// (scripts/authored/content.json). After seeding, the SQLite file is the
// canonical store — edit it directly, then run export-db.mjs.
//
// Usage: node scripts/seed-db.mjs  (or npm run db:seed)
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DB_PATH = path.join(ROOT, 'db', 'ewd.sqlite')
const CONTENT = JSON.parse(
  readFileSync(path.join(ROOT, 'scripts', 'authored', 'content.json'), 'utf8'),
)

const LANES = new Set(['CR', 'RD', 'OH', 'HH', 'T1', 'T2', 'FT', 'SN', 'KK'])

// Fail loudly if the authored data is internally inconsistent, so a bad export
// never reaches the app.
function validate(content) {
  const ids = new Set()
  for (const p of content.patterns) {
    if (ids.has(p.id)) throw new Error(`duplicate pattern id '${p.id}'`)
    ids.add(p.id)
    const total = p.beats * p.subdivision
    for (const lane of p.lanes) {
      if (!LANES.has(lane)) throw new Error(`pattern '${p.id}' uses unknown lane '${lane}'`)
      const row = p.grid[lane]
      if (!Array.isArray(row) || row.length !== total) {
        throw new Error(
          `pattern '${p.id}' lane '${lane}' has ${row ? row.length : 'no'} steps, expected ${total} (beats ${p.beats} * subdivision ${p.subdivision})`,
        )
      }
    }
  }
  const patternIds = ids
  for (const l of content.lessons) {
    if (l.patternRef && !patternIds.has(l.patternRef)) {
      throw new Error(`lesson '${l.id}' references unknown pattern '${l.patternRef}'`)
    }
  }
  for (const d of content.drills ?? []) {
    if (d.patternRef && !patternIds.has(d.patternRef)) {
      throw new Error(`drill '${d.id}' references unknown pattern '${d.patternRef}'`)
    }
  }
  console.log(
    `validated ${content.lessons.length} lessons, ${content.patterns.length} patterns, ` +
      `${content.rudiments.length} rudiments, ${(content.drills ?? []).length} drills, ` +
      `${content.quiz.length} quiz, ${content.glossary.length} glossary`,
  )
}

validate(CONTENT)

rmSync(DB_PATH, { force: true })
const db = new DatabaseSync(DB_PATH)
db.exec(readFileSync(path.join(ROOT, 'db', 'schema.sql'), 'utf8'))

const insLesson = db.prepare(
  `INSERT INTO lessons (id, section, title, title_kr, ord, body, body_kr, key_points, key_points_kr, diagram, pattern_ref)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
)
for (const l of CONTENT.lessons) {
  insLesson.run(
    l.id, l.section, l.title, l.titleKr, l.order, l.body, l.bodyKr,
    JSON.stringify(l.keyPoints ?? []), JSON.stringify(l.keyPointsKr ?? []),
    l.diagram ?? null, l.patternRef ?? null,
  )
}

const insPattern = db.prepare(
  `INSERT INTO patterns (id, section, name, name_kr, tier, bpm, beats, subdivision, lanes, grid, count, sticking, description, description_kr, how_to, how_to_kr, arrangement, position)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
)
CONTENT.patterns.forEach((p, i) => {
  insPattern.run(
    p.id, p.section, p.name, p.nameKr, p.tier, p.bpm, p.beats, p.subdivision,
    JSON.stringify(p.lanes), JSON.stringify(p.grid), p.count,
    p.sticking ? JSON.stringify(p.sticking) : null,
    p.description, p.descriptionKr, p.howTo, p.howToKr ?? null,
    p.arrangement ? JSON.stringify(p.arrangement) : null, i,
  )
})

const insDrill = db.prepare(
  `INSERT INTO drills (id, title, title_kr, focus, focus_kr, goal, goal_kr, reps, reps_kr, target_bpm, pattern_ref, steps, steps_kr, position)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
)
;(CONTENT.drills ?? []).forEach((d, i) => {
  insDrill.run(
    d.id, d.title, d.titleKr, d.focus, d.focusKr, d.goal, d.goalKr, d.reps, d.repsKr,
    d.targetBpm ?? null, d.patternRef ?? null,
    JSON.stringify(d.steps ?? []), JSON.stringify(d.stepsKr ?? []), i,
  )
})

const insRud = db.prepare(
  `INSERT INTO rudiments (id, name, name_kr, sticking, notation, description, description_kr, application, position)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
)
CONTENT.rudiments.forEach((r, i) => {
  insRud.run(
    r.id, r.name, r.nameKr, JSON.stringify(r.sticking), r.notation,
    r.description, r.descriptionKr, r.application, i,
  )
})

const insQuiz = db.prepare(
  'INSERT INTO quiz_items (question, question_kr, answer, answer_kr, position) VALUES (?, ?, ?, ?, ?)',
)
CONTENT.quiz.forEach((q, i) => insQuiz.run(q.question, q.questionKr, q.answer, q.answerKr, i))

const insGloss = db.prepare(
  'INSERT INTO glossary_items (term, term_kr, definition, definition_kr, position) VALUES (?, ?, ?, ?, ?)',
)
CONTENT.glossary.forEach((g, i) => insGloss.run(g.term, g.termKr, g.definition, g.definitionKr, i))

db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('schema_version', '1')

db.close()
console.log('Seeded', DB_PATH)
