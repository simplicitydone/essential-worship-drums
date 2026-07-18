import { createContext, useContext } from 'react'

// Bilingual guide: the whole UI can show English, Korean, or both.
export type Lang = 'en' | 'kr' | 'both'

export interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

export const LANG_KEY = 'ewd-lang'
export const LangContext = createContext<LangCtx>({ lang: 'en', setLang: () => {} })

export function useLang(): LangCtx {
  return useContext(LangContext)
}
