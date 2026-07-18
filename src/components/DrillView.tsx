import { useState } from 'react'
import type { Drill, Pattern } from '../types/drums'
import { useLang } from '../lib/lang'
import { GrooveGrid } from './GrooveGrid'
import { GotItButton, ProgressBar } from './ProgressBits'

function DrillCard({ drill, patternLibrary }: { drill: Drill; patternLibrary: Record<string, Pattern> }) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const demo = drill.patternRef ? patternLibrary[drill.patternRef] : undefined
  const steps = lang === 'kr' ? drill.stepsKr : drill.steps

  return (
    <div className="drill">
      <button type="button" className="drill__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="drill__head-main">
          <span className="drill__focus">{lang === 'kr' ? drill.focusKr : drill.focus}</span>
          <h3 className="drill__title">{lang === 'kr' ? drill.titleKr : drill.title}</h3>
        </div>
        <div className="drill__reps">
          {lang === 'kr' ? drill.repsKr : drill.reps}
          {drill.targetBpm != null && <span className="drill__bpm">{drill.targetBpm} BPM</span>}
        </div>
        <span className={`drill__chev ${open ? 'open' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <p className="drill__goal">
        <span className="drill__goal-label">Goal</span> {lang === 'kr' ? drill.goalKr : drill.goal}
      </p>

      <div className="gotit-row">
        <GotItButton id={drill.id} />
      </div>

      {open && (
        <div className="drill__body">
          <ol className="drill__steps">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {demo && (
            <div className="drill__demo">
              <p className="drill__demo-hint">Loop it — start slow, speed up only when it stays relaxed.</p>
              <GrooveGrid pattern={demo} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function DrillView({
  drills,
  patternLibrary,
}: {
  drills: Drill[]
  patternLibrary: Record<string, Pattern>
}) {
  const { lang } = useLang()
  return (
    <div className="section">
      <h2 className="section__heading">Practice Drills · 연습 드릴</h2>
      <p className="section__lead">
        This is where faking turns into real playing. Do a few every day — slow,
        relaxed, and honest. Tap a drill to open its steps.
        {lang !== 'en' && (
          <span className="bi-kr">
            흉내가 진짜 실력으로 바뀌는 곳이다. 매일 몇 가지씩 느리고 편안하게, 정직하게
            연습한다. 드릴을 눌러 단계를 펼쳐 본다.
          </span>
        )}
      </p>
      <ProgressBar ids={drills.map((d) => d.id)} label="drilled" />
      <div className="drill-list">
        {drills.map((d) => (
          <DrillCard key={d.id} drill={d} patternLibrary={patternLibrary} />
        ))}
      </div>
    </div>
  )
}
