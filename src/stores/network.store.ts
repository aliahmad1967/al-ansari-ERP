/**
 * Network connectivity store — tracks whether the browser has network access.
 *
 * Follows the same useSyncExternalStore pattern as the rest of the app.
 * The online/offline status is the single source of truth for the UI layer.
 * Realm data is always available regardless of network state.
 *
 * Phase 023 enhancement: adds a preflight connectivity check that performs
 * an actual fetch to detect captive portals and other situations where
 * navigator.onLine reports true but the network is unreachable.
 */

export interface NetworkState {
  /** True when the browser reports an active network connection. */
  isOnline: boolean
  /** Timestamp of the last connectivity change. */
  lastChangedAt: number
  /** True when a preflight check has confirmed actual connectivity. */
  confirmedOnline: boolean
}

const listeners = new Set<() => void>()

let state: NetworkState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastChangedAt: Date.now(),
  confirmedOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
}

function setOnline(isOnline: boolean): void {
  if (state.isOnline === isOnline) return
  state = { isOnline, lastChangedAt: Date.now(), confirmedOnline: isOnline }
  emit()
}

function setConfirmed(confirmed: boolean): void {
  if (state.confirmedOnline === confirmed) return
  state = { ...state, confirmedOnline: confirmed }
  emit()
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

/* -------------------------------------------------------------------------- */
/*  Event listeners — respond to browser connectivity changes                 */
/* -------------------------------------------------------------------------- */

function handleOnline(): void {
  setOnline(true)
  // Run a preflight check to confirm actual connectivity
  void preflightCheck()
}

function handleOffline(): void {
  setOnline(false)
  setConfirmed(false)
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
}

/* -------------------------------------------------------------------------- */
/*  Preflight connectivity check                                              */
/* -------------------------------------------------------------------------- */

/**
 * Performs a lightweight fetch to confirm actual network connectivity.
 * Handles captive portals, firewalls, and other scenarios where
 * navigator.onLine reports true but the network is unreachable.
 */
let preflightAbortController: AbortController | null = null

export async function preflightCheck(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.onLine) {
    setConfirmed(false)
    return false
  }

  // Cancel any in-flight preflight
  preflightAbortController?.abort()
  preflightAbortController = new AbortController()

  try {
    // Fetch a tiny static asset with a short timeout
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-store',
      signal: preflightAbortController.signal,
    })
    const reachable = response.ok
    setConfirmed(reachable)
    return reachable
  } catch {
    setConfirmed(false)
    return false
  }
}

/* -------------------------------------------------------------------------- */
/*  Periodic connectivity monitoring                                          */
/* -------------------------------------------------------------------------- */

const CHECK_INTERVAL_MS = 30_000 // 30 seconds
let periodicTimer: ReturnType<typeof setInterval> | null = null

function startPeriodicChecks(): void {
  if (periodicTimer !== null) return
  periodicTimer = setInterval(() => {
    if (navigator.onLine) {
      void preflightCheck()
    }
  }, CHECK_INTERVAL_MS)
}

function stopPeriodicChecks(): void {
  if (periodicTimer !== null) {
    clearInterval(periodicTimer)
    periodicTimer = null
  }
}

// Start periodic checks when the module loads (browser only)
if (typeof window !== 'undefined') {
  // Defer start to avoid blocking
  setTimeout(startPeriodicChecks, 5000)
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export function getNetworkState(): NetworkState {
  return state
}

export function subscribeNetwork(listener: () => void): () => void {
  listeners.add(listener)

  // Start monitoring when first subscriber connects
  if (listeners.size === 1) {
    startPeriodicChecks()
  }

  return () => {
    listeners.delete(listener)
    // Stop monitoring when no subscribers remain
    if (listeners.size === 0) {
      stopPeriodicChecks()
    }
  }
}

/** Force a connectivity check (useful after recovering from offline). */
export function checkConnectivity(): boolean {
  const online = navigator.onLine
  setOnline(online)
  if (online) {
    void preflightCheck()
  }
  return online
}

/** Clean up resources when the store is no longer needed. */
export function destroyNetworkStore(): void {
  stopPeriodicChecks()
  preflightAbortController?.abort()
  listeners.clear()
}
