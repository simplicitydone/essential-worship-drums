import { useState } from 'react'
import type { Lesson, Pattern } from '../types/drums'
import { useLang } from '../lib/lang'
import { KitDiagram } from './KitDiagram'
import { GrooveGrid } from './GrooveGrid'

function Body({ en, kr }: { en: string; kr: string }) {
  const { lang } = useLang()
  const text = lang === 'kr' ? kr : en
  const paras = text.split(/\n{2,}/)
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className="lesson__para">
          {p}
        </p>
      ))}
    </>
  )
}

function LessonBody({ lesson, patternLibrary }: { lesson: Lesson; patternLibrary: Record<string, Pattern> }) {
  const { lang } = useLang()
  const demo = lesson.patternRef ? patternLibrary[lesson.patternRef] : undefined
  const points = lang === 'kr' ? lesson.keyPointsKr : lesson.keyPoints
  return (
    <article className="lesson">
      <h2 className="lesson__title">{lang === 'kr' ? lesson.titleKr : lesson.title}</h2>

      {lesson.diagram && <KitDiagram name={lesson.diagram} />}

      <Body en={lesson.body} kr={lesson.bodyKr} />

      {points.length > 0 && (
        <div className="lesson__points">
          <h3 className="lesson__points-heading">{lang === 'kr' ? '핵심' : 'Key points'}</h3>
          <ul>
            {points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {demo && (
        <div className="lesson__demo">
          <h3 className="lesson__demo-heading">{lang === 'kr' ? '직접 해보기' : 'Try it'}</h3>
          <GrooveGrid pattern={demo} />
        </div>
      )}
    </article>
  )
}

export function LessonSection({
  title,
  lessons,
  patternLibrary,
}: {
  title: string
  lessons: Lesson[]
  patternLibrary: Record<string, Pattern>
}) {
  const { lang } = useLang()
  const [idx, setIdx] = useState(0)
  const active = lessons[idx] ?? lessons[0]

  return (
    <div className="section">
      <h2 className="section__heading">{title}</h2>
      <ol className="lesson-nav">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <button
              type="button"
              className={`lesson-nav__btn ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
            >
              <span className="lesson-nav__num">{i + 1}</span>
              {lang === 'kr' ? l.titleKr : l.title}
            </button>
          </li>
        ))}
      </ol>
      {active && <LessonBody lesson={active} patternLibrary={patternLibrary} />}
    </div>
  )
}
