# EWD Context Notes

Decisions and reasoning, appended as work proceeds.

## Framing
- "Similar to 3025_egc" → reuse egc's exact architecture (SQLite→db.json→PWA→
  nginx/docker). Language: EN primary + KR secondary, matching egc (egc's UI/
  README are English; study guide + form names are Korean).
- Worship context assumed = contemporary CCM / 찬양 band, with acoustic/hymn
  and 6/8 ballad coverage. Broad by design (it's a guide).
- Port 3027 (3025 egc, 3026 auth taken); subdomain `ewd.simplicity-is-art.com`,
  matching egc's acronym-subdomain convention.

## Data model
- The "chord" analog is a **pattern** (groove/fill/song template) rendered as a
  grid. Timing: `beats` (quarter-note beats in the loop) × `subdivision`
  (2=eighths, 3=triplet/compound, 4=sixteenths). totalSteps = beats*subdivision.
  Step seconds = (60/bpm)/subdivision.
- Canonical kit lanes (top→bottom render order): CR, RD, OH, HH, T1, T2, FT, SN, KK.
  Each pattern lists only the lanes it uses.
- Grid cell values: 0 rest, 1 hit, 2 accent, 3 ghost (snare). Open vs closed
  hat = separate OH/HH lanes, not a value. Keeps the engine simple.
- Lessons (Basics + Worship prose) are their own table; may reference a named
  SVG diagram and/or a pattern id to demo.
- Rudiments carry a sticking array (R/L) and a kit-application note.

## Copyright
- Songs tab uses **generic descriptive templates** (tempo/feel/arrangement
  shape), NOT reproductions of specific copyrighted worship charts.

## Audio engine
- Look-ahead scheduler (setTimeout wake + Web Audio precise timing), loops the
  active pattern until stopped. Voices: kick (pitched sine w/ fast decay),
  snare (noise + tone), HH/OH (highpassed noise, short/long), toms (pitched
  sines), crash/ride (bandpassed noise, longer). Single shared AudioContext.

## Completion (2026-07-12)
- Content authored by a 14-agent workflow (7 domains × author+verifier), 600k
  tokens, 0 errors. Result extracted from the task output file's `.result` and
  written to scripts/authored/content.json.
- Final counts: 21 lessons (11 basics + 10 worship), 38 patterns
  (13 grooves + 11 fills + 7 worship + 7 songs), 9 rudiments, 12 quiz, 22 glossary.
- Full pipeline green: seed (grids validated) → export → 10/10 tests → build →
  eslint clean. Verified in headless Edge across 5 tabs; GrooveGrid notation and
  bilingual content render correctly. KR present in 100% of prose, no colon-enders.
- NOT yet deployed. Deploy is the remaining step (server build via build-on-server,
  docker compose up -d on 3027, DNS ewd.simplicity-is-art.com) — awaiting go-ahead.
- Audio not verified headlessly (needs a real browser + user gesture); the engine
  is a standard two-clock look-ahead scheduler with synth voices.

## Reframe: Crash Course → Back to Basics (2026-07-12)
- User asked for a "crash course → back to basics" feel: play right away, then
  drill basics/technique to actually be at the level, not fake it.
- New `crash` lesson section + new front tab "Crash Course" (6 fast steps).
  Basics tab relabeled "Back to Basics" = Fundamentals (led by "Now Earn It:
  Fake vs. Real", order 0; existing 11 lessons; + How-to-Practice + Daily Routine)
  followed by a new DrillView.
- New `drills` type/table/seed/export/provider + DrillView (focus/goal/reps/
  targetBpm/steps, optional looped pattern). 7 drills.
- **Tempo trainer** added to GrooveGrid (−/slider/+, live retempo while looping,
  reset). engine.start() gained a bpmOverride arg. This is the "drill it slow" tool.
- Tabs reordered: crash → basics → grooves → fills → worship → rudiments → songs → guide.
- Content authored by a 2nd 6-agent workflow. NOTE: that batch HTML-escaped
  ampersands (&amp;); the merge script decodes entities recursively before seeding.
- Verified: 11/11 tests, build + eslint clean, headless-Edge screenshots of Crash
  Course, Back to Basics (Fundamentals + Drills), and Grooves (tempo trainer).
- Known cosmetic: pattern.howTo shows EN+KR together (single field, batch-1 authors
  wrote both). Would need a howToKr split to respect the toggle. Not done.

## Upgrade pass (2026-07-12)
Implemented the review bundle:
- Tempo trainer no longer restarts on drag → engine.setTempo() updates stepDur live.
- Audio unlock: ensureRunning() resumes the AudioContext + console.warn if blocked.
- Count-in (1 bar of clicks) + Play-along (tap a lane to mute it live) on GrooveGrid.
  engine.start() takes opts {bpm, countIn, mutedLanes}; engine.setMuted() for live.
- Standalone Metronome (audio.ts Metronome class + MetronomeTool.tsx) at top of
  Back to Basics: accented downbeat, beat-dot pulse, 3/4/6 beats/bar.
- Progress tracking (lib/progress.ts, useSyncExternalStore + localStorage):
  ProgressBar + GotItButton in PatternBrowser & DrillView; chips show ✓.
- On-grid notation legend (hit/accent/ghost/cymbal).
- Deep-link the selection: hash is now #tab or #tab.<patternId>; PatternBrowser is
  controlled (selectedId/onSelect) from App.
- howTo split bilingual: grooves+fills split deterministically (first-hangul / " / "),
  worship+songs translated by a workflow. New pattern.howToKr (+ schema/seed/export).
  FIXES the earlier "howTo shows EN+KR" cosmetic.
- Real PNG icons (192/512/maskable) rasterized from icon.svg via headless Edge;
  manifest now lists PNG + SVG.
- Tests: stepSeconds + countDone unit tests, count-token alignment, bilingual-tip
  coverage. 15 tests pass. eslint + build clean.
Deferred (told user): accelerando trainer, sample-based drum sounds (need a listen),
song-structure maps.
Workflow note: passing a big array via Workflow `args` as a JSON string fails
(script sees a string). Embed data in the script or pass a real JSON array.

## Deferred items completed (2026-07-12)
- Accelerando trainer: PlayOpts.ramp {stepBpm,maxBpm} + onTempo; scheduler bumps
  curBpm at each loop wrap and reports via the draw queue. GrooveGrid "Speed up"
  toggle (+3/loop, cap start+60). setTempo() also resets curBpm.
- Better sound: master -> DynamicsCompressor(limiter) -> destination, plus a short
  convolver room-reverb send (roomImpulse, 0.4s), plus humanize() ±velocity/pitch
  on voices. UNVERIFIED audibly (headless) — standard, reversible; user to listen.
- Song-structure maps: Pattern.arrangement (ArrangementPart[]: label/labelKr/
  intensity 1-5/note/noteKr) + schema col + seed/export; ArrangementMap.tsx renders
  an energy-arc bar chart + per-section notes, shown in GrooveGrid when present.
  7 songs authored by a workflow (author+verify). 16 tests (added arrangement +
  timing + progress). build + eslint clean. Verified Songs tab in headless Edge.
- Cloudflare: no tunnel config in the laptop repo (lives on server or dashboard).
  ewd = port 3027. Adding a hostname = one cloudflared ingress rule + DNS route;
  doable server-side if file/CLI-managed, else dashboard/API-token needed.

## Bilingual mode simplified (2026-07-18)
- Deleted the 'both' (EN+한) language mode per user: type Lang = 'en' | 'kr' now.
  Removed the third toggle button, every `lang === 'both'` render branch, and the
  orphaned *-kr / bi-kr CSS rules. localStorage 'both' falls back to 'en'.
- Also killed the remaining kr+eng mixing so each mode is single-language:
  hard-coded "EN · 한글" composite headings (App section titles, Practice Drills,
  Key points, Try it, Metronome, Rudiments, Study Guide, Glossary, Song Map, lane
  tooltips) now pick one string via the toggle, and the `lang !== 'en'` stacked
  leads (Drills/Rudiments/StudyGuide) became exclusive en/kr text. Authored KR
  strings for the Grooves/Fills/Songs leads + drill demo hint, which were EN-only.
- Repo made public as github.com/simplicitydone/essential-worship-drums
  (port number dropped from the GitHub name, same convention as
  korean-lottery-analysis; folder stays 3012_ewd). README port 3027→3012.
