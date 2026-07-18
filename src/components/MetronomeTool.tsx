import { useEffect, useReducer, useState } from 'react'
import { metronome } from '../lib/audio'
import { useLang } from '../lib/lang'

const MIN = 30
const MAX = 220
const BAR_OPTIONS = [3, 4, 6]

// The "play to a click" tool the guide keeps preaching — a real metronome with
// an accented downbeat and a visual pulse.
export function MetronomeTool() {
  const { lang } = useLang()
  const [bpm, setBpm] = useState(90)
  const [beatsPerBar, setBeatsPerBar] = useState(4)
  const [beat, setBeat] = useState(-1)
  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => metronome.subscribe(force), [])
  useEffect(
    () => () => {
      if (metronome.running) metronome.stop()
    },
    [],
  )

  const running = metronome.running
  const toggle = () => {
    if (running) metronome.stop()
    else metronome.start(bpm, beatsPerBar, setBeat)
  }
  const changeBpm = (n: number) => {
    const b = Math.min(MAX, Math.max(MIN, n))
    setBpm(b)
    if (metronome.running) metronome.setBpm(b)
  }
  const changeBeats = (n: number) => {
    setBeatsPerBar(n)
    if (metronome.running) metronome.start(bpm, n, setBeat)
  }

  return (
    <div className="metronome">
      <div className="metronome__top">
        <h3 className="metronome__title">🥁 Metronome · 메트로놈</h3>
        <button
          type="button"
          className={`play-btn ${running ? 'is-playing' : ''}`}
          aria-label={running ? 'Stop metronome' : 'Start metronome'}
          onClick={toggle}
        >
          {running ? '■' : '▶'}
        </button>
      </div>

      <div className="metronome__beats" aria-hidden="true">
        {Array.from({ length: beatsPerBar }).map((_, i) => (
          <span
            key={i}
            className={`beat-dot ${i === 0 ? 'beat-dot--one' : ''} ${beat === i ? 'is-on' : ''}`}
          />
        ))}
      </div>

      <div className="tempo">
        <button type="button" className="tempo__btn" aria-label="Slower" onClick={() => changeBpm(bpm - 5)}>
          −
        </button>
        <input
          type="range"
          className="tempo__slider"
          min={MIN}
          max={MAX}
          value={bpm}
          aria-label="Metronome tempo in BPM"
          onChange={(e) => changeBpm(Number(e.target.value))}
        />
        <button type="button" className="tempo__btn" aria-label="Faster" onClick={() => changeBpm(bpm + 5)}>
          +
        </button>
        <span className="tempo__val">
          {bpm}
          <small>BPM</small>
        </span>
      </div>

      <div className="metronome__bars">
        <span className="metronome__bars-label">{lang === 'kr' ? '박자' : 'Beats/bar'}</span>
        {BAR_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            className={`chip ${beatsPerBar === n ? 'active' : ''}`}
            onClick={() => changeBeats(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
