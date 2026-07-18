import { useState, type ReactNode } from 'react'
import { LangContext, LANG_KEY, type Lang } from './lang'

// The choice lives in a tiny context so any component can read it without
// prop-drilling, and persists across visits via localStorage.
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null
    return saved === 'kr' ? 'kr' : 'en'
  })
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      // localStorage can be unavailable (private mode); the choice just won't persist.
    }
  }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}
