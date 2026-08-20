/**
 * Service Worker registration and lifecycle management.
 *
 * Responsibilities:
 *  - Register the service worker on app load
 *  - Detect when a new version is available and notify the user
 *  - Handle controlled/uncontrolled transitions gracefully
 *  - Communicate with the SW for version checks and cache management
 *
 * This module is safe to import in the browser; it no-ops on the server.
 */

const SW_PATH = '/sw.js'
const UPDATE_CHECK_INTERVAL_MS = 60_000

let registration: ServiceWorkerRegistration | null = null

/** Callback invoked when a new service worker is waiting to activate. */
let onUpdateAvailable: (() => void) | null = null

/** Callback invoked when the service worker has activated and taken control. */
let onReady: (() => void) | null = null

/** Callback invoked when the SW version changes (new deployment detected). */
let onVersionChanged: ((version: string) => void) | null = null

/** The currently active SW version string, if known. */
let activeSWVersion: string | null = null

export interface ServiceWorkerManager {
  /** The raw ServiceWorkerRegistration, if available. */
  registration: ServiceWorkerRegistration | null
  /** Trigger an immediate update check. */
  checkForUpdates: () => Promise<void>
  /** Skip the waiting phase and activate the new service worker. */
  skipWaiting: () => Promise<void>
  /** Register a callback for when a new version is detected. */
  setOnUpdateAvailable: (cb: (() => void) | null) => void
  /** Register a callback for when the SW is ready. */
  setOnReady: (cb: (() => void) | null) => void
  /** Register a callback for when the SW version changes. */
  setOnVersionChanged: (cb: ((version: string) => void) | null) => void
  /** Get the currently active SW version. */
  getActiveVersion: () => string | null
  /** Request the SW to clear all caches. */
  clearCaches: () => Promise<void>
}

export function getServiceWorkerManager(): ServiceWorkerManager {
  return {
    get registration() {
      return registration
    },
    checkForUpdates: async () => {
      if (registration) {
        try {
          await registration.update()
        } catch {
          // Silently ignore — offline or network error
        }
      }
    },
    skipWaiting: async () => {
      const worker = registration?.waiting
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' })
      }
    },
    setOnUpdateAvailable: (cb) => {
      onUpdateAvailable = cb
    },
    setOnReady: (cb) => {
      onReady = cb
    },
    setOnVersionChanged: (cb) => {
      onVersionChanged = cb
    },
    getActiveVersion: () => activeSWVersion,
    clearCaches: async () => {
      registration?.active?.postMessage({ type: 'CLEAR_CACHES' })
    },
  }
}

/**
 * Register the service worker. Call once from the app entry point.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  if (registration) return

  try {
    registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    })

    // Listen for a waiting service worker (new version available)
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // A new version is installed and waiting to activate
          onUpdateAvailable?.()
        }
        if (newWorker.state === 'activated') {
          onReady?.()
        }
      })
    })

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_VERSION' && event.data.version) {
        activeSWVersion = event.data.version
        onVersionChanged?.(event.data.version)
      }
      if (event.data?.type === 'SW_ACTIVATED' && event.data.version) {
        activeSWVersion = event.data.version
        onReady?.()
      }
    })

    // If the page was already controlled, fire onReady and request version
    if (navigator.serviceWorker.controller) {
      onReady?.()
      navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' })
    }

    // Periodic update checks (to detect new deploys)
    setInterval(() => {
      void getServiceWorkerManager().checkForUpdates()
    }, UPDATE_CHECK_INTERVAL_MS)
  } catch (error) {
    // Registration failed — app continues to work without SW
    console.warn('[SW] Registration failed:', error)
  }
}
