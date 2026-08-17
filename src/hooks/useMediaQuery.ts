import { useSyncExternalStore } from 'react'

function subscribe(query: string, callback: () => void): () => void {
  const mediaQuery = window.matchMedia(query)
  mediaQuery.addEventListener('change', callback)
  return () => {
    mediaQuery.removeEventListener('change', callback)
  }
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches
}

/** Subscribes to a CSS media query and returns whether it currently matches. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    () => false,
  )
}
