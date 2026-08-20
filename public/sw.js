/**
 * AL-ANSARI ERP — Service Worker (Phase 023)
 *
 * Offline-first caching strategy:
 *  1. App shell (HTML, CSS, JS, fonts) → cache-first after first load
 *  2. Static assets (images, icons) → cache-first
 *  3. Navigation requests → network-first with cache fallback
 *  4. Versioned caches for safe updates across deployments
 *  5. Runtime precache manifest for build-output assets
 *
 * The service worker does NOT touch Realm data (stored via the runtime's
 * native persistence layer). Its sole responsibility is ensuring the
 * application shell is available offline so Realm can serve local data.
 */

const CACHE_VERSION = 'v2'
const CACHE_NAME = `al-ansari-erp-${CACHE_VERSION}`
const OFFLINE_CACHE = `al-ansari-erp-offline-${CACHE_VERSION}`
const PRECACHE_MANIFEST_URL = '/precache-manifest.json'

/** Core app shell URLs to pre-cache on install. */
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.svg',
  '/assets/icon-192.svg',
  '/assets/icon-512.svg',
]

/* -------------------------------------------------------------------------- */
/*  Install — pre-cache the app shell + precache manifest                     */
/* -------------------------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)

      // Pre-cache the core app shell
      await cache.addAll(APP_SHELL_URLS)

      // Fetch and apply the build-generated precache manifest (if available)
      try {
        const response = await fetch(PRECACHE_MANIFEST_URL)
        if (response.ok) {
          const manifest = await response.json()
          if (Array.isArray(manifest)) {
            await Promise.all(
              manifest.map((url) =>
                cache.add(url).catch(() => {
                  // Silently skip assets that fail to cache (non-critical)
                }),
              ),
            )
          }
        }
      } catch {
        // Manifest not available (dev mode) — continue with app shell only
      }

      // Skip waiting to activate immediately
      self.skipWaiting()
    })(),
  )
})

/* -------------------------------------------------------------------------- */
/*  Activate — purge old versioned caches                                     */
/* -------------------------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      const oldCaches = cacheNames.filter(
        (name) =>
          name.startsWith('al-ansari-erp-') &&
          name !== CACHE_NAME &&
          name !== OFFLINE_CACHE,
      )
      await Promise.all(oldCaches.map((name) => caches.delete(name)))

      // Claim all open clients immediately
      await self.clients.claim()

      // Notify all clients that the new SW is active
      const clients = await self.clients.matchAll()
      for (const client of clients) {
        client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION })
      }
    })(),
  )
})

/* -------------------------------------------------------------------------- */
/*  Fetch strategies                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Cache-first: serve from cache, fall back to network and cache the response.
 * Ideal for static assets that rarely change.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Network failed and no cache — return a generic offline response
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Network-first: try the network, fall back to cache.
 * Ideal for navigation requests (HTML pages).
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // Offline fallback for navigation — serve the cached index.html
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html')
      if (fallback) return fallback
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http schemes
  if (!request.url.startsWith('http')) return

  // Skip cross-origin requests (let them fail naturally)
  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== self.location.origin) return

  // Navigation requests → network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  // Everything else (JS, CSS, images, fonts, SVG) → cache-first
  event.respondWith(cacheFirst(request))
})

/* -------------------------------------------------------------------------- */
/*  Messages — allow the app to trigger cache updates                         */
/* -------------------------------------------------------------------------- */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data?.type === 'GET_VERSION') {
    const client = event.source
    if (client) {
      client.postMessage({ type: 'SW_VERSION', version: CACHE_VERSION })
    }
  }

  if (event.data?.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(names.map((name) => caches.delete(name))),
      ),
    )
  }
})
