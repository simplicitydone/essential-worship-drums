# Essential Worship Drums (EWD)

An interactive beginner's guide to **worship drumming** — from *how to hold the
sticks* to playing real grooves — with **audible, looping** GrooveGrids. Bilingual
(English / 한국어 toggle). Live at https://ewd.simplicity-is-art.com/ (port 3012 via
`docker-compose`, nginx serving `dist/`).

Modeled on [Essential Guitar Chords](https://github.com/simplicitydone/essential-guitar-chords): same
SQLite-is-the-source-of-truth data flow, PWA packaging, and nginx deploy — but
the domain is the drum kit, and the interactive centerpiece is a **step-sequencer
groove that loops through a synthesized kit** instead of a strummed chord.

The learning arc is **Crash Course → Back to Basics**: get playing *this Sunday*,
then drill the technique so you're genuinely at that level instead of faking it.

## Sections

- **Crash Course** — the fast track: grip in 60 seconds → your first groove →
  lock to a click → one fill → loud/soft = chorus/verse → ready for Sunday.
- **Back to Basics** — *The Fundamentals* (led by "Now Earn It: Fake vs. Real",
  then grip/fulcrum/stroke/kit, how to sit & pedal technique, counting/click,
  How to Practice, a daily routine)
  plus **Practice Drills** (rebound, single-stroke tempo ladder, accents/ghosts,
  rudiment ladder, click discipline, foot control, independence).
- **Grooves** — 8-beat, 16-beat, half-time, driving 8ths, four-on-the-floor,
  6/8 ballad, shuffle… (Basic → Advanced tiers).
- **Fills** — quarter/eighth/sixteenth fills, tom fills, build-ups, crash-on-the-1.
- **Worship** — click & in-ears, dynamics, set energy, spontaneous worship,
  rods/brushes, band cues, swells, transitions, *serving the song*.
- **Rudiments** — single/double stroke, paradiddle, flam, drag… with sticking
  and kit application.
- **Songs** — generic worship-song groove templates (no copyrighted charts).
- **Study Guide** — bilingual quiz + glossary.

Every GrooveGrid has a **▶** that loops the pattern through a Web Audio drum synth
(kick/snare/hi-hat/toms/cymbals), with a moving playhead, a **tempo trainer**
(slow it down / speed it up while looping) so you can drill at your level, and
tap-to-preview lane labels.

## Stack

- React 19 + TypeScript, Vite 8, PWA (manifest + service worker).
- Web Audio synthesis + a look-ahead loop scheduler (`src/lib/audio.ts`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (usually http://localhost:5173) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run test:run` | Run tests once |
| `npm run db:seed` | Rebuild `db/ewd.sqlite` from `scripts/authored/content.json` |
| `npm run db:export` | Render `db/ewd.sqlite` → `public/db.json` |

## Data workflow (the DB is the source of truth)

The frontend contains **no** lesson or pattern data. Everything lives in
`db/ewd.sqlite` (lessons, patterns, rudiments, quiz, glossary). To change content:

1. Edit the SQLite file directly, e.g.
   `sqlite3 db/ewd.sqlite "UPDATE patterns SET bpm=84 WHERE id='groove-8beat-basic'"`
2. `npm run db:export` — regenerates `public/db.json`
3. `npm run build` — ships it (tests validate the export automatically)

The initial content was authored into `scripts/authored/content.json`;
`npm run db:seed` bootstraps the DB from it. After seeding, the SQLite file is
canonical. `public/db.json` and the DB live outside `src/`, so a frontend rewrite
can't lose data. Tests enforce that every pattern's grid rows are exactly
`beats × subdivision` long and that grooves carry a snare + kick.

### GrooveGrid model

A pattern loops `beats` quarter-notes, each split into `subdivision` steps
(2 = eighths, 3 = triplet/compound, 4 = sixteenths). Each used kit lane
(`CR RD OH HH T1 T2 FT SN KK`) has a same-length array of cell values:
`0` rest · `1` hit · `2` accent · `3` ghost. Step seconds = `(60/bpm)/subdivision`.

## Deploy

`npm run build` regenerates `dist/` (bundle + `db.json` + `sw.js`); the running
`ewd` nginx container serves it directly (volume mount), no restart needed.
Changing `nginx.conf` or `docker-compose.yml` requires `docker compose up -d`.
If `public/sw.js` changes, bump its `CACHE` constant so clients drop the old cache.

## Requirements

- Node.js 22+ (uses the built-in `node:sqlite`).

## License

[MIT](LICENSE)
