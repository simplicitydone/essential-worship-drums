import { useEffect, useReducer, useState } from 'react'
import { LANE_LABEL, type Lane, type Pattern } from '../types/drums'
import { engine, previewLane } from '../lib/audio'
import { useLang } from '../lib/lang'
import { ArrangementMap } from './ArrangementMap'

// The interactive step grid: kit lanes down the side, subdivided beats across.
// ▶ loops the pattern; a highlighted column tracks the playhead. A tempo trainer,
// a one-bar count-in, and a play-along mode (mute lanes to play them yourself)
// turn it from a demo into a practice tool.
const TEMPO_MIN = 30
const TEMPO_MAX = 220

export function GrooveGrid({ pattern }: { pattern: Pattern }) {
  const { lang } = useLang()
  const [step, setStep] = useState(-1)
  const [tempo, setTempo] = useState(pattern.bpm)
  const [countIn, setCountIn] = useState(false)
  const [playAlong, setPlayAlong] = useState(false)
  const [ramp, setRamp] = useState(false)
  const [muted, setMuted] = useState<Set<Lane>>(new Set())
  const [prevId, setPrevId] = useState(pattern.id)
  const [, force] = useReducer((x: number) => x + 1, 0)

  // Reset per-pattern controls when the pattern swaps out (render-phase reset).
  if (prevId !== pattern.id) {
    setPrevId(pattern.id)
    setTempo(pattern.bpm)
    setMuted(new Set())
    setPlayAlong(false)
    setRamp(false)
  }

  useEffect(() => engine.subscribe(force), [])
  useEffect(
    () => () => {
      if (engine.isPlaying(pattern.id)) engine.stop()
    },
    [pattern.id],
  )

  const playing = engine.isPlaying(pattern.id)
  const total = pattern.beats * pattern.subdivision

  const toggle = () => {
    if (playing) {
      engine.stop()
    } else {
      setStep(-1)
      engine.start(pattern, setStep, {
        bpm: tempo,
        countIn,
        mutedLanes: [...muted],
        ramp: ramp ? { stepBpm: 3, maxBpm: Math.min(TEMPO_MAX, tempo + 60) } : undefined,
        onTempo: setTempo,
      })
    }
  }
  // Live tempo change — no restart, so no audible gap or playhead jump.
  const changeTempo = (next: number) => {
    const bpm = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, next))
    setTempo(bpm)
    if (engine.isPlaying(pattern.id)) engine.setTempo(bpm)
  }
  // Lane label: preview the voice, or (in play-along) toggle muting it live.
  const onLane = (lane: Lane) => {
    if (playAlong) {
      const next = new Set(muted)
      if (next.has(lane)) next.delete(lane)
      else next.add(lane)
      setMuted(next)
      if (engine.isPlaying(pattern.id)) engine.setMuted([...next])
    } else {
      previewLane(lane)
    }
  }

  const countTokens = pattern.count.trim().split(/\s+/)
  const showCount = countTokens.length === total
  const howToKr = pattern.howToKr || pattern.howTo

  return (
    <div className="groove">
      <div className="groove__header">
        <div className="groove__title">
          <h3>{lang === 'kr' ? pattern.nameKr : pattern.name}</h3>
          {lang === 'both' && <span className="groove__title-kr">{pattern.nameKr}</span>}
        </div>
        <div className="groove__meta">
          <span className={`badge tier-${pattern.tier.toLowerCase()}`}>{pattern.tier}</span>
          <button
            type="button"
            className={`play-btn ${playing ? 'is-playing' : ''}`}
            aria-label={playing ? `Stop ${pattern.name}` : `Play ${pattern.name}`}
            onClick={toggle}
          >
            {playing ? '■' : '▶'}
          </button>
        </div>
      </div>

      <div className="tempo" aria-label="Tempo trainer">
        <button type="button" className="tempo__btn" aria-label="Slower" onClick={() => changeTempo(tempo - 5)}>
          −
        </button>
        <input
          type="range"
          className="tempo__slider"
          min={TEMPO_MIN}
          max={TEMPO_MAX}
          value={tempo}
          aria-label="Tempo in BPM"
          onChange={(e) => changeTempo(Number(e.target.value))}
        />
        <button type="button" className="tempo__btn" aria-label="Faster" onClick={() => changeTempo(tempo + 5)}>
          +
        </button>
        <span className="tempo__val">
          {tempo}
          <small>BPM</small>
        </span>
        {tempo !== pattern.bpm && (
          <button type="button" className="tempo__reset" onClick={() => changeTempo(pattern.bpm)}>
            reset {pattern.bpm}
          </button>
        )}
      </div>

      <div className="opts">
        <label className="opt">
          <input type="checkbox" checked={countIn} onChange={(e) => setCountIn(e.target.checked)} />
          Count-in
        </label>
        <label className="opt">
          <input type="checkbox" checked={playAlong} onChange={(e) => setPlayAlong(e.target.checked)} />
          Play-along <span className="opt__hint">(tap a lane to mute &amp; play it yourself)</span>
        </label>
        <label className="opt">
          <input type="checkbox" checked={ramp} onChange={(e) => setRamp(e.target.checked)} />
          Speed up <span className="opt__hint">(+3 BPM each loop)</span>
        </label>
      </div>

      <div className="groove__scroll">
        <div
          className="grid"
          role="group"
          aria-label={`${pattern.name} notation — ${pattern.lanes.length} kit voices over ${pattern.beats} beats`}
          style={{ ['--steps' as string]: total, ['--sub' as string]: pattern.subdivision }}
        >
          {pattern.lanes.map((lane: Lane) => {
            const row = pattern.grid[lane] ?? []
            const isMuted = muted.has(lane)
            return (
              <div key={lane} className={`grid__row ${isMuted ? 'grid__row--muted' : ''}`}>
                <button
                  type="button"
                  className={`grid__label ${playAlong ? 'grid__label--mutable' : ''} ${isMuted ? 'is-muted' : ''}`}
                  onClick={() => onLane(lane)}
                  title={
                    playAlong
                      ? `${isMuted ? 'Unmute' : 'Mute'} ${LANE_LABEL[lane].en}`
                      : `${LANE_LABEL[lane].en} · ${LANE_LABEL[lane].kr}`
                  }
                >
                  {LANE_LABEL[lane].short}
                </button>
                {row.map((v, i) => (
                  <div
                    key={i}
                    className={
                      'cell' +
                      (i % pattern.subdivision === 0 ? ' cell--beat' : '') +
                      (i === step ? ' cell--now' : '')
                    }
                  >
                    {v > 0 && (
                      <span
                        className={
                          'hit' +
                          (v === 2 ? ' hit--accent' : '') +
                          (v === 3 ? ' hit--ghost' : '') +
                          (lane === 'CR' || lane === 'RD' || lane === 'OH' || lane === 'HH'
                            ? ' hit--cym'
                            : '')
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )
          })}

          {showCount && (
            <div className="grid__row grid__row--count">
              <span className="grid__label grid__label--count" aria-hidden="true" />
              {countTokens.map((tok, i) => (
                <div
                  key={i}
                  className={
                    'count-cell' +
                    (i % pattern.subdivision === 0 ? ' count-cell--beat' : '') +
                    (i === step ? ' count-cell--now' : '')
                  }
                >
                  {tok}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="legend" aria-hidden="true">
        <span className="legend__item">
          <i className="legend__dot legend__dot--hit" /> hit
        </span>
        <span className="legend__item">
          <i className="legend__dot legend__dot--accent" /> accent
        </span>
        <span className="legend__item">
          <i className="legend__dot legend__dot--ghost" /> ghost
        </span>
        <span className="legend__item">
          <i className="legend__dot legend__dot--cym" /> cymbal
        </span>
      </div>

      {pattern.sticking && pattern.sticking.length > 0 && (
        <p className="groove__sticking">
          <span className="groove__sticking-label">Sticking</span> {pattern.sticking.join(' ')}
        </p>
      )}

      <p className="groove__desc">{lang === 'kr' ? pattern.descriptionKr : pattern.description}</p>
      {lang === 'both' && <p className="groove__desc groove__desc--kr">{pattern.descriptionKr}</p>}
      <p className="groove__howto">
        <span className="groove__howto-label">Practice</span> {lang === 'kr' ? howToKr : pattern.howTo}
      </p>
      {lang === 'both' && <p className="groove__howto groove__howto--kr">{howToKr}</p>}

      {pattern.arrangement && pattern.arrangement.length > 0 && (
        <ArrangementMap parts={pattern.arrangement} />
      )}
    </div>
  )
}
