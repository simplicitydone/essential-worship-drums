import { describe, expect, it } from 'vitest'
import rawDb from '../../public/db.json'
import { buildAppData } from '../data/provider'
import { stepSeconds } from '../lib/audio'
import { countDone } from '../lib/progress'
import { KIT_LANES, type DbJson } from '../types/drums'

// The exported database is the artifact the app actually loads — test that.
const data = buildAppData(rawDb as unknown as DbJson)
const laneSet = new Set<string>(KIT_LANES)

describe('database export (public/db.json)', () => {
  it('builds without structural errors', () => {
    expect(Object.keys(data.patternLibrary).length).toBeGreaterThan(0)
  })

  it('gives every pattern grid rows of length beats*subdivision', () => {
    for (const p of Object.values(data.patternLibrary)) {
      const total = p.beats * p.subdivision
      for (const lane of p.lanes) {
        expect(laneSet.has(lane), `${p.id} lane ${lane}`).toBe(true)
        expect(p.grid[lane]?.length, `${p.id} lane ${lane}`).toBe(total)
      }
    }
  })

  it('only fills grid cells with values 0..3', () => {
    for (const p of Object.values(data.patternLibrary)) {
      for (const lane of p.lanes) {
        for (const v of p.grid[lane] ?? []) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(3)
        }
      }
    }
  })

  it('aligns the count string with the grid, one token per step', () => {
    for (const p of Object.values(data.patternLibrary)) {
      const tokens = p.count.trim().split(/\s+/).length
      expect(tokens, p.id).toBe(p.beats * p.subdivision)
    }
  })

  it('ships a bilingual practice tip for every pattern', () => {
    for (const p of Object.values(data.patternLibrary)) {
      expect(p.howTo.length, p.id).toBeGreaterThan(0)
      expect(/[가-힣]/.test(p.howToKr ?? ''), `${p.id} howToKr`).toBe(true)
      // the English tip must not carry leftover Korean
      expect(/[가-힣]/.test(p.howTo), `${p.id} howTo EN-only`).toBe(false)
    }
  })
})

describe('timing math', () => {
  it('computes step seconds from bpm and subdivision', () => {
    expect(stepSeconds(120, 4)).toBeCloseTo(0.125) // 16ths at 120 bpm
    expect(stepSeconds(60, 2)).toBeCloseTo(0.5) // 8ths at 60 bpm
    expect(stepSeconds(90, 3)).toBeCloseTo(60 / 90 / 3)
  })
})

describe('progress store helpers', () => {
  it('counts how many ids are marked done', () => {
    const done = new Set(['a', 'c'])
    expect(countDone(done, ['a', 'b', 'c', 'd'])).toBe(2)
    expect(countDone(new Set(), ['a', 'b'])).toBe(0)
  })
})

describe('content coverage', () => {
  it('has a crash course and ordered fundamentals', () => {
    expect(data.crashLessons.length).toBeGreaterThan(0)
    expect(data.basicsLessons.length).toBeGreaterThanOrEqual(1)
    const orders = data.basicsLessons.map((l) => l.order)
    expect([...orders]).toEqual([...orders].sort((a, b) => a - b))
  })

  it('has practice drills whose pattern refs resolve', () => {
    expect(data.drills.length).toBeGreaterThan(0)
    for (const d of data.drills) {
      expect(d.steps.length).toBeGreaterThan(0)
      if (d.patternRef) expect(data.patternLibrary[d.patternRef]).toBeDefined()
    }
  })

  it('has grooves with a backbeat-capable kit', () => {
    expect(data.grooves.length).toBeGreaterThan(0)
    for (const g of data.grooves) {
      expect(g.lanes).toContain('SN')
      expect(g.lanes).toContain('KK')
    }
  })

  it('has fills, worship patterns, and song templates', () => {
    expect(data.fills.length).toBeGreaterThan(0)
    expect(data.worshipPatterns.length).toBeGreaterThan(0)
    expect(data.songs.length).toBeGreaterThan(0)
  })

  it('gives every song a valid dynamic arrangement arc', () => {
    for (const s of data.songs) {
      expect(s.arrangement && s.arrangement.length, s.id).toBeGreaterThan(1)
      for (const part of s.arrangement ?? []) {
        expect(part.intensity, `${s.id}/${part.label}`).toBeGreaterThanOrEqual(1)
        expect(part.intensity, `${s.id}/${part.label}`).toBeLessThanOrEqual(5)
        expect(part.label.length).toBeGreaterThan(0)
        expect(/[가-힣]/.test(part.noteKr)).toBe(true)
      }
    }
  })

  it('has rudiments with sticking', () => {
    expect(data.rudiments.length).toBeGreaterThan(0)
    for (const r of data.rudiments) {
      expect(r.sticking.length).toBeGreaterThan(0)
    }
  })

  it('ships a bilingual study guide', () => {
    expect(data.quiz.length).toBeGreaterThan(0)
    expect(data.glossary.length).toBeGreaterThan(0)
    for (const q of data.quiz) {
      expect(q.question.length).toBeGreaterThan(0)
      expect(q.questionKr.length).toBeGreaterThan(0)
    }
  })
})

describe('provider error handling', () => {
  it('throws on a grid row of the wrong length', () => {
    const broken = JSON.parse(JSON.stringify(rawDb)) as DbJson
    const p = broken.patterns[0]
    const lane = p.lanes[0]
    p.grid[lane] = [1]
    expect(() => buildAppData(broken)).toThrow(/steps/)
  })

  it('throws on a lesson referencing an unknown pattern', () => {
    const broken = JSON.parse(JSON.stringify(rawDb)) as DbJson
    if (broken.lessons.length > 0) {
      broken.lessons[0].patternRef = 'no-such-pattern'
      expect(() => buildAppData(broken)).toThrow(/unknown pattern/)
    }
  })
})
