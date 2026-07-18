-- EWD canonical database schema.
-- db/ewd.sqlite is the single source of truth for all lesson and pattern
-- content. The frontend embeds no content: scripts/export-db.mjs renders this
-- DB to public/db.json, which the app fetches at runtime.

-- Crash Course + Back-to-Basics + Worship prose lessons.
CREATE TABLE lessons (
  id            TEXT PRIMARY KEY,
  section       TEXT NOT NULL CHECK (section IN ('crash', 'basics', 'worship')),
  title         TEXT NOT NULL,
  title_kr      TEXT NOT NULL,
  ord           INTEGER NOT NULL,
  body          TEXT NOT NULL,
  body_kr       TEXT NOT NULL,
  key_points    TEXT NOT NULL,   -- JSON array of strings (EN)
  key_points_kr TEXT NOT NULL,   -- JSON array of strings (KR)
  diagram       TEXT,            -- named SVG id or NULL
  pattern_ref   TEXT             -- pattern id to demo, or NULL
);

-- Grooves / fills / worship demos / song templates (the GrooveGrid content).
CREATE TABLE patterns (
  id             TEXT PRIMARY KEY,
  section        TEXT NOT NULL CHECK (section IN ('grooves', 'fills', 'worship', 'songs')),
  name           TEXT NOT NULL,
  name_kr        TEXT NOT NULL,
  tier           TEXT NOT NULL CHECK (tier IN ('Basic', 'Advanced')),
  bpm            INTEGER NOT NULL,
  beats          INTEGER NOT NULL,
  subdivision    INTEGER NOT NULL CHECK (subdivision IN (2, 3, 4)),
  lanes          TEXT NOT NULL,  -- JSON array of lane ids (top->bottom)
  grid           TEXT NOT NULL,  -- JSON object { lane: int[] }, each length beats*subdivision
  count          TEXT NOT NULL,
  sticking       TEXT,           -- JSON array of 'R'/'L' or NULL
  description    TEXT NOT NULL,
  description_kr TEXT NOT NULL,
  how_to         TEXT NOT NULL,
  how_to_kr      TEXT,
  arrangement    TEXT,           -- songs only: JSON array of arc parts, or NULL
  position       INTEGER NOT NULL
);

-- Practice drills (the "earn it" work). May loop a pattern at a target tempo.
CREATE TABLE drills (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  title_kr    TEXT NOT NULL,
  focus       TEXT NOT NULL,
  focus_kr    TEXT NOT NULL,
  goal        TEXT NOT NULL,
  goal_kr     TEXT NOT NULL,
  reps        TEXT NOT NULL,
  reps_kr     TEXT NOT NULL,
  target_bpm  INTEGER,
  pattern_ref TEXT,
  steps       TEXT NOT NULL,  -- JSON array of strings (EN)
  steps_kr    TEXT NOT NULL,  -- JSON array of strings (KR)
  position    INTEGER NOT NULL
);

-- Rudiments with sticking + kit application.
CREATE TABLE rudiments (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_kr        TEXT NOT NULL,
  sticking       TEXT NOT NULL,  -- JSON array of 'R'/'L'/'r'/'l'
  notation       TEXT NOT NULL,
  description    TEXT NOT NULL,
  description_kr TEXT NOT NULL,
  application    TEXT NOT NULL,
  position       INTEGER NOT NULL
);

-- Study guide.
CREATE TABLE quiz_items (
  id          INTEGER PRIMARY KEY,
  question    TEXT NOT NULL,
  question_kr TEXT NOT NULL,
  answer      TEXT NOT NULL,
  answer_kr   TEXT NOT NULL,
  position    INTEGER NOT NULL
);

CREATE TABLE glossary_items (
  id            INTEGER PRIMARY KEY,
  term          TEXT NOT NULL,
  term_kr       TEXT NOT NULL,
  definition    TEXT NOT NULL,
  definition_kr TEXT NOT NULL,
  position      INTEGER NOT NULL
);

-- Schema/meta versioning for the exporter.
CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
