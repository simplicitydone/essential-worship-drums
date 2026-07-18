import type { ArrangementPart } from '../types/drums'
import { useLang } from '../lib/lang'

// The dynamic arc of a whole song: how big the drums are in each section, plus
// what to actually play there. Shown on the Songs tab.
export function ArrangementMap({ parts }: { parts: ArrangementPart[] }) {
  const { lang } = useLang()
  const max = 5
  return (
    <div className="arrmap">
      <h4 className="arrmap__title">Song Map · 곡의 흐름 <span className="arrmap__sub">— how the drums grow &amp; pull back</span></h4>

      <div className="arrmap__arc" role="img" aria-label="Dynamic intensity across the song sections">
        {parts.map((p, i) => (
          <div key={i} className="arrmap__col">
            <div
              className="arrmap__bar"
              style={{ height: `${(p.intensity / max) * 100}%`, opacity: 0.35 + (p.intensity / max) * 0.65 }}
            />
            <span className="arrmap__lbl">{lang === 'kr' ? p.labelKr : p.label}</span>
          </div>
        ))}
      </div>

      <ol className="arrmap__notes">
        {parts.map((p, i) => (
          <li key={i} className="arrmap__note">
            <span className="arrmap__note-head">
              <span className="arrmap__note-lbl">{lang === 'kr' ? p.labelKr : p.label}</span>
              <span className="arrmap__dots" aria-hidden="true">
                {'●'.repeat(p.intensity)}
                <span className="arrmap__dots-off">{'●'.repeat(max - p.intensity)}</span>
              </span>
            </span>
            <span className="arrmap__note-txt">{lang === 'kr' ? p.noteKr : p.note}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
