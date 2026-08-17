import { STORAGE_KEYS } from '@/config/app.config'

export type Theme = 'light' | 'dark'

const listeners = new Set<() => void>()
let theme: Theme = getInitialTheme()

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEYS.theme)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(STORAGE_KEYS.theme, theme)
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function getTheme(): Theme {
  return theme
}

export function setTheme(next: Theme): void {
  if (next === theme) return
  theme = next
  applyTheme()
  emit()
}

export function toggleTheme(): void {
  setTheme(theme === 'dark' ? 'light' : 'dark')
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

applyTheme()
