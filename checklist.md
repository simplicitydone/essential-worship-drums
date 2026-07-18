# EWD Build Checklist

## Content (workflow) — DONE
- [x] Basics lessons (11: grip variants → fulcrum → stroke → kit → setup → counting → reading grid → click → warm-ups)
- [x] Grooves (13, Basic + Advanced tiers)
- [x] Fills (11)
- [x] Worship skills lessons (10) + example patterns (7)
- [x] Rudiments (9, with sticking + kit application)
- [x] Songs (7 generic groove templates, no copyrighted charts)
- [x] Quiz (12 bilingual) + Glossary (22 bilingual)
- [x] Adversarial verification of notation + technique (7 author + 7 independent verifier agents)
- [x] Authored JSON written to `scripts/authored/content.json`

## Scaffold — DONE
- [x] package.json / tsconfig / vite.config / eslint
- [x] types/drums.ts (Db* + App* + AppData)
- [x] lib/audio.ts (drum synth voices + look-ahead loop scheduler)
- [x] components: GrooveGrid, KitDiagram (SVG), LessonView, RudimentView, StudyGuide, PatternBrowser
- [x] App.tsx (+ hash-routed tabs, EN/KR/both toggle) + App.css + index.css + main.tsx + LangProvider
- [x] db/schema.sql
- [x] scripts/seed-db.mjs (authored JSON → sqlite, hard-validates grids)
- [x] scripts/export-db.mjs (sqlite → public/db.json)
- [x] tests (validate db.json export)
- [x] PWA: index.html, manifest.webmanifest, sw.js, favicon.svg, icon.svg
- [x] nginx.conf, docker-compose.yml, .gitignore, .gitattributes, LICENSE, README.md

## Verify — DONE
- [x] `npm run db:seed` → `npm run db:export` (38 patterns, 21 lessons)
- [x] `npm run test:run` passes (10/10)
- [x] `npm run build` passes (tsc + vite, 67 kB gzip)
- [x] `npx eslint .` clean
- [x] Headless-browser render: Basics/Grooves/Worship/Rudiments/Guide all correct
- [x] Notation spot-check (8-beat: HH eighths, SN 2&4, KK 1&3) + bilingual coverage
- [ ] Audible playback (needs a real browser + user gesture — engine is standard look-ahead)

## Deploy (awaiting confirmation)
- [ ] Build images / ship to Ubuntu server (build-on-server skill)
- [ ] `docker compose up -d` on port 3027
- [ ] DNS ewd.simplicity-is-art.com

## Reframe: Crash Course → Back to Basics — DONE
- [x] Crash Course tab (6 fast steps, now the default front door)
- [x] Back to Basics = Fundamentals (Fake-vs-Real lead + How-to-Practice + Daily Routine)
- [x] Practice Drills (7) + DrillView + drills table/type/seed/export/provider
- [x] Tempo trainer on every GrooveGrid (live retempo, reset)
- [x] Tabs reordered to the arc; HTML entities decoded on merge
- [x] 11/11 tests, build + eslint clean, headless-Edge verified
