import { countDone, toggleDone, useDone } from '../lib/progress'

// A slim progress bar over a set of ids (e.g. all grooves).
export function ProgressBar({ ids, label = 'got it' }: { ids: string[]; label?: string }) {
  const done = useDone()
  const n = countDone(done, ids)
  const pct = ids.length ? Math.round((n / ids.length) * 100) : 0
  return (
    <div className="progress" aria-label={`${n} of ${ids.length} ${label}`}>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__label">
        {n}/{ids.length} {label}
      </span>
    </div>
  )
}

// A toggle the learner taps once a skill feels solid.
export function GotItButton({ id }: { id: string }) {
  const done = useDone()
  const isDone = done.has(id)
  return (
    <button
      type="button"
      className={`gotit ${isDone ? 'gotit--done' : ''}`}
      aria-pressed={isDone}
      onClick={() => toggleDone(id)}
    >
      {isDone ? '✓ Got it' : 'Mark got it'}
    </button>
  )
}
