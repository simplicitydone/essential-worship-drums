// EWD service worker: offline-capable worship-drum guide.
// - /assets/* are content-hashed → cache-first is always safe
// - navigations and /db.json → network-first so deploys/data edits win when online
// - everything else same-origin (icons, favicon, manifest) → cache-first
const CACHE = 'ewd-v1'
const PRECACHE = ['/', '/db.json', '/manifest.webmanifest', '/favicon.svg', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await caches.match(request)
    if (cached) return cached
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl)
      if (fallback) return fallback
    }
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'))
  } else if (url.pathname === '/db.json') {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(cacheFirst(request))
  }
})
