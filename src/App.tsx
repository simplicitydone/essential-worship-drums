import { useEffect, useState } from 'react'
import './App.css'
import { loadAppData } from './data/provider'
import { useLang, type Lang } from './lib/lang'
import { LessonSection } from './components/LessonView'
import { PatternBrowser } from './components/PatternBrowser'
import { RudimentView } from './components/RudimentView'
import { StudyGuide } from './components/StudyGuide'
import { DrillView } from './components/DrillView'
import { MetronomeTool } from './components/MetronomeTool'
import { TABS, TAB_LABEL, type AppData, type Section } from './types/drums'

// The active tab AND the selected pattern are mirrored in the URL hash
// (e.g. #grooves.groove-half-time) so a specific groove is shareable.
interface Nav {
  tab: Section
  sel?: string
}
function parseHash(): Nav {
  const [t, s] = window.location.hash.slice(1).split('.')
  return { tab: (TABS as string[]).includes(t) ? (t as Section) : 'crash', sel: s || undefined }
}

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'kr', label: '한국어' },
  { value: 'both', label: 'EN+한' },
]

export default function App() {
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadAppData()
      .then((d) => !cancelled && setData(d))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  if (error) {
    return (
      <div className="app app-status">
        <h1>🥁</h1>
        <p className="app-status__message">Could not load the drum guide.</p>
        <p className="app-status__detail">{error}</p>
        <button
          type="button"
          className="chip"
          onClick={() => {
            setError(null)
            setReloadKey((k) => k + 1)
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="app app-status" aria-busy="true">
        <h1>🥁</h1>
        <p className="app-status__message">Loading the kit…</p>
      </div>
    )
  }

  return <LoadedApp data={data} />
}

function LoadedApp({ data }: { data: AppData }) {
  const { lang, setLang } = useLang()
  const [nav, setNav] = useState<Nav>(parseHash)
  const { tab, sel } = nav
  const setTab = (t: Section) => setNav({ tab: t })
  const setSel = (id: string) => setNav((n) => ({ tab: n.tab, sel: id }))

  // Keep the URL hash and the nav (tab + selection) in sync, both directions.
  useEffect(() => {
    const h = sel ? `#${tab}.${sel}` : `#${tab}`
    if (window.location.hash !== h) history.replaceState(null, '', h)
  }, [tab, sel])
  useEffect(() => {
    const onHash = () => setNav(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>🥁 Essential Worship Drums</h1>
        <div className="lang-toggle" role="group" aria-label="Language">
          {LANG_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`lang-btn ${lang === o.value ? 'active' : ''}`}
              onClick={() => setLang(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {lang === 'kr' ? TAB_LABEL[t].kr : TAB_LABEL[t].en}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'crash' && (
          <LessonSection
            title="Crash Course — Play This Sunday · 속성 코스"
            lessons={data.crashLessons}
            patternLibrary={data.patternLibrary}
          />
        )}

        {tab === 'basics' && (
          <>
            <MetronomeTool />
            <LessonSection
              title="The Fundamentals · 기본기"
              lessons={data.basicsLessons}
              patternLibrary={data.patternLibrary}
            />
            <DrillView drills={data.drills} patternLibrary={data.patternLibrary} />
          </>
        )}

        {tab === 'grooves' && (
          <PatternBrowser
            heading="Grooves · 그루브"
            lead="The beats you'll play under 90% of worship songs. Loop each one slowly with the ▶ until it feels automatic."
            patterns={data.grooves}
            selectedId={sel}
            onSelect={setSel}
          />
        )}

        {tab === 'fills' && (
          <PatternBrowser
            heading="Fills · 필인"
            lead="Short breaks that lead back to beat 1. Keep them simple and always land the downbeat."
            patterns={data.fills}
            selectedId={sel}
            onSelect={setSel}
          />
        )}

        {tab === 'worship' && (
          <>
            <LessonSection
              title="Serving the Song · 곡을 섬기기"
              lessons={data.worshipLessons}
              patternLibrary={data.patternLibrary}
            />
            <PatternBrowser
              heading="Worship Grooves · 예배 그루브"
              patterns={data.worshipPatterns}
              groupByTier={false}
              selectedId={sel}
              onSelect={setSel}
            />
          </>
        )}

        {tab === 'rudiments' && <RudimentView rudiments={data.rudiments} />}

        {tab === 'songs' && (
          <PatternBrowser
            heading="Song Templates · 곡 템플릿"
            lead="Generic worship-song feels you'll meet again and again — match the groove to the moment in the set."
            patterns={data.songs}
            groupByTier={false}
            selectedId={sel}
            onSelect={setSel}
          />
        )}

        {tab === 'guide' && <StudyGuide quiz={data.quiz} glossary={data.glossary} />}
      </main>

      <footer className="footer">
        <span>
          Content: <code>db/ewd.sqlite</code> · schema v{data.schemaVersion} ·{' '}
          {Object.keys(data.patternLibrary).length} patterns
        </span>
        <a href="https://github.com/simplicitydone/3027_ewd" target="_blank" rel="noreferrer">
          Source
        </a>
      </footer>
    </div>
  )
}
