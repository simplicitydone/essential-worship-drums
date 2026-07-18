# Essential Worship Drums (EWD) — Plan

A beginner's worship-drumming guide, architecturally modeled on `3025_egc`
(Essential Guitar Chords). Same stack and data philosophy; the domain shifts
from guitar chords to the drum kit.

## Goal

Take an absolute beginner from **how to hold a stick** to **playing real
worship grooves** — interactive, audible, installable, bilingual (EN primary /
KR secondary).

## Architecture (mirrors 3025_egc)

- React 19 + TypeScript + Vite 8, PWA (manifest + service worker).
- **SQLite is the single source of truth** (`db/ewd.sqlite`) →
  `scripts/export-db.mjs` → `public/db.json` → fetched at runtime by
  `src/data/provider.ts`. The frontend embeds **no** content.
- Web Audio engine (`src/lib/audio.ts`) synthesizes the kit and **loops a
  groove at its BPM** (the analog of egc's Karplus-Strong strum).
- nginx:alpine docker-compose, `dist/` volume-mounted, port **3027**,
  `ewd.simplicity-is-art.com`.
- Vitest suite validates the exported `db.json`.

## Concept mapping (guitar → drums)

| 3025_egc | EWD |
|----------|-----|
| Chord diagram (fretboard) | **GrooveGrid** (kit lanes × subdivided beats) |
| ▶ strum (Karplus-Strong) | ▶ **loop the groove** (drum synth + scheduler) |
| Open / Tension / Tunings / Barre / Electric / Examples tabs | **Basics / Grooves / Fills / Worship / Rudiments / Songs** tabs |
| Tension study guide (quiz + glossary) | **Study Guide** (quiz + glossary) |
| Nashville number badge | Tier / BPM / count badges |

## Sections (tabs)

1. **Basics** — hold the stick (matched: German/French/American; traditional
   grip note), fulcrum & rebound, kit parts & setup, throne/pedal, posture,
   counting & subdivision, how to read the GrooveGrid, practicing to a click.
2. **Grooves** — 8-beat, 16-beat, half-time, driving 8ths, four-on-the-floor
   anthem, 6/8 ballad, shuffle, tom grooves. Basic → Advanced tiers.
3. **Fills** — quarter/eighth/sixteenth fills, snare-tom fills, crash-on-the-1,
   build-ups, swells, 2- and 4-beat fills.
4. **Worship** — playing to a click/in-ears, dynamics (verse→chorus→bridge),
   set energy map, free/spontaneous worship, rods/brushes/mallets, band cues,
   swells & cymbal washes, transitions, when NOT to fill.
5. **Rudiments** — single/double stroke rolls, paradiddle, flam, drag,
   5-stroke roll — with sticking and kit application.
6. **Songs** — generic worship-song groove templates (no copyrighted charts):
   mid-tempo anthem, driving anthem, 6/8 ballad, half-time chorus, build/bridge,
   spontaneous.
7. **Study Guide** — bilingual quiz + glossary.

## Build order

1. Author + verify all curriculum content (multi-agent workflow) → `scripts/authored/*.json`.
2. Scaffold app: types, drum engine, components, DB schema, seed/export, tests, PWA, deploy.
3. Seed DB from authored JSON → export `db.json`.
4. `npm run build` + `npm run test:run` + drive the app (verify audio & notation).
5. Offer server deploy (separate, confirmed step).
