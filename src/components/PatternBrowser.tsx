import type { Pattern } from '../types/drums'
import { useLang } from '../lib/lang'
import { useDone } from '../lib/progress'
import { GrooveGrid } from './GrooveGrid'
import { GotItButton, ProgressBar } from './ProgressBits'

// Selector (grouped by Basic / Advanced tier) + the selected GrooveGrid.
// Selection is controlled by the parent so it can be deep-linked in the URL hash.
// A progress bar and per-pattern "got it" toggle track what the learner owns.
export function PatternBrowser({
  heading,
  lead,
  patterns,
  groupByTier = true,
  selectedId,
  onSelect,
}: {
  heading: string
  lead?: string
  patterns: Pattern[]
  groupByTier?: boolean
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const { lang } = useLang()
  const done = useDone()
  const active = patterns.find((p) => p.id === selectedId) ?? patterns[0]

  const basic = patterns.filter((p) => p.tier === 'Basic')
  const advanced = patterns.filter((p) => p.tier === 'Advanced')

  const btn = (p: Pattern) => (
    <button
      key={p.id}
      type="button"
      className={`chip ${active?.id === p.id ? 'active' : ''} ${done.has(p.id) ? 'chip--done' : ''}`}
      onClick={() => onSelect(p.id)}
    >
      {done.has(p.id) && <span className="chip__check">✓</span>}
      {lang === 'kr' ? p.nameKr : p.name}
    </button>
  )

  return (
    <div className="section">
      <h2 className="section__heading">{heading}</h2>
      {lead && <p className="section__lead">{lead}</p>}
      <ProgressBar ids={patterns.map((p) => p.id)} />

      {groupByTier ? (
        <>
          {basic.length > 0 && (
            <div className="chip-group">
              <span className="chip-group__label chip-group__label--basic">Basics</span>
              <div className="chips">{basic.map(btn)}</div>
            </div>
          )}
          {advanced.length > 0 && (
            <div className="chip-group">
              <span className="chip-group__label chip-group__label--advanced">Advanced</span>
              <div className="chips">{advanced.map(btn)}</div>
            </div>
          )}
        </>
      ) : (
        <div className="chips">{patterns.map(btn)}</div>
      )}

      {active && (
        <>
          <GrooveGrid pattern={active} />
          <div className="gotit-row">
            <GotItButton id={active.id} />
          </div>
        </>
      )}
    </div>
  )
}
