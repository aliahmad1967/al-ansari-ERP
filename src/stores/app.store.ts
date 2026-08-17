import { STORAGE_KEYS } from '@/config/app.config'

/**
 * App shell state: desktop sidebar collapse + mobile navigation drawer.
 * Pure UI state; consumed by layout components through the app shell.
 */

export interface AppUiState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
}

const listeners = new Set<() => void>()
let state: AppUiState = {
  sidebarCollapsed: getInitialCollapsed(),
  mobileNavOpen: false,
}

function getInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true'
}

function setState(patch: Partial<AppUiState>): void {
  state = { ...state, ...patch }
  if ('sidebarCollapsed' in patch && typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(state.sidebarCollapsed))
  }
  emit()
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function getAppUiState(): AppUiState {
  return state
}

export function toggleSidebarCollapsed(): void {
  setState({ sidebarCollapsed: !state.sidebarCollapsed })
}

export function setSidebarCollapsed(collapsed: boolean): void {
  if (collapsed === state.sidebarCollapsed) return
  setState({ sidebarCollapsed: collapsed })
}

export function openMobileNav(): void {
  if (state.mobileNavOpen) return
  setState({ mobileNavOpen: true })
}

export function closeMobileNav(): void {
  if (!state.mobileNavOpen) return
  setState({ mobileNavOpen: false })
}

export function toggleMobileNav(): void {
  setState({ mobileNavOpen: !state.mobileNavOpen })
}

export function subscribeAppUi(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
