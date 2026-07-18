import { useSyncExternalStore } from 'react'

// Tracks which grooves/fills/songs/drills the learner has marked "got it".
// Persisted in localStorage; a tiny external store so any component can read and
// subscribe without prop-drilling.
const KEY = 'ewd-progress'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    // localStorage may be unavailable (private mode) — start empty.
    return new Set()
  }
}

let done = load()
const listeners = new Set<() => void>()

function emit(): void {
  for (const l of listeners) l()
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function getSnapshot(): Set<string> {
  return done
}

export function toggleDone(id: string): void {
  const next = new Set(done)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  done = next
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]))
  } catch {
    // ignore write failures; progress just won't persist this session.
  }
  emit()
}

export function useDone(): Set<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

// How many of `ids` are marked done.
export function countDone(doneSet: Set<string>, ids: string[]): number {
  return ids.reduce((n, id) => (doneSet.has(id) ? n + 1 : n), 0)
}
