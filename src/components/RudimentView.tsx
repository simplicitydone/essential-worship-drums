import type { Rudiment } from '../types/drums'
import { useLang } from '../lib/lang'

function Sticking({ sticking }: { sticking: string[] }) {
  return (
    <div className="sticking-row" aria-label="Sticking pattern">
      {sticking.map((s, i) => {
        const right = s.toUpperCase() === 'R'
        const soft = s === s.toLowerCase()
        return (
          <span
            key={i}
            className={`stick-chip ${right ? 'stick-chip--r' : 'stick-chip--l'} ${soft ? 'stick-chip--soft' : ''}`}
          >
            {s.toUpperCase()}
          </span>
        )
      })}
    </div>
  )
}

export function RudimentView({ rudiments }: { rudiments: Rudiment[] }) {
  const { lang } = useLang()
  return (
    <div className="section">
      <h2 className="section__heading">{lang === 'kr' ? '루디먼트' : 'Rudiments'}</h2>
      <p className="section__lead">
        {lang === 'kr'
          ? '드러밍의 알파벳이다. 작은 스티킹 패턴을 느리게 반복하다가 점점 빠르게 친다. 이 손동작을 익히면 모든 그루브와 필인이 쉬워진다.'
          : 'The alphabet of drumming — small sticking patterns you loop slowly, then speed up. Master these hands and every groove and fill gets easier.'}
      </p>
      <div className="rudiment-grid">
        {rudiments.map((r) => (
          <div key={r.id} className="rudiment-card">
            <div className="rudiment-card__head">
              <h3>{lang === 'kr' ? r.nameKr : r.name}</h3>
            </div>
            <Sticking sticking={r.sticking} />
            <code className="rudiment-card__notation">{r.notation}</code>
            <p className="rudiment-card__desc">{lang === 'kr' ? r.descriptionKr : r.description}</p>
            <p className="rudiment-card__app">
              <span className="rudiment-card__app-label">On the kit</span> {r.application}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
