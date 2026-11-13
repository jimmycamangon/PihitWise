// PihitWise service worker: lets the app open without signal and show the last data it loaded.
//
// - Pages: network first, falls back to the cached app shell (index.html).
// - /assets/*: cache first. Vite gives these hashed names, so a file never changes.
// - GET /api/*: network first, falls back to the last good answer.
//   The page clears this cache on sign out, so the next rider never sees it.
// - Anything else that isn't a GET (saving, deleting) always goes to the network.

const VERSION = 'v1'
const SHELL = `pihitwise-shell-${VERSION}`
const ASSETS = `pihitwise-assets-${VERSION}`
const API = 'pihitwise-api'
const KEEP = [SHELL, ASSETS, API]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL)
            .then((cache) => cache.addAll(['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png']))
            .then(() => self.skipWaiting()),
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    )
})

async function networkFirst(request, cacheName, fallbackUrl) {
    const cache = await caches.open(cacheName)
    try {
        const response = await fetch(request)
        if (response.ok) cache.put(fallbackUrl ?? request, response.clone())
        return response
    } catch (err) {
        const cached = await cache.match(fallbackUrl ?? request)
        if (cached) return cached
        throw err
    }
}

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) (await caches.open(cacheName)).put(request, response.clone())
    return response
}

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return

    const url = new URL(request.url)

    // Opening any page of the app: every route is the same index.html.
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, SHELL, '/index.html'))
        return
    }

    if (url.origin !== self.location.origin) {
        // Google Fonts: keep a copy so text looks the same offline.
        if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
            event.respondWith(cacheFirst(request, ASSETS))
        }
        return
    }

    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request, API))
        return
    }

    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(cacheFirst(request, ASSETS))
        return
    }

    event.respondWith(networkFirst(request, SHELL))
})
