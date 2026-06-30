const CACHE_NAME = 'eae-mini-app-v6';
const APP_BASE = new URL('./', self.registration.scope).pathname;
const OFFLINE_URL = APP_BASE;

const PRECACHE_PATHS = [
  '',
  'index.html',
  'style.css?v=20260630-4',
  'style.css',
  'manifest.json',
  'images/EAE_logo_EN.png',
  'images/icon-192.png',
  'images/icon-512.png'
];

const PRECACHE_URLS = PRECACHE_PATHS.map(path => new URL(path, self.registration.scope).toString());

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(APP_BASE)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

function networkFirst(request) {
  return fetch(request)
    .then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    })
    .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_URL)));
}

function cacheFirst(request) {
  return caches.match(request)
    .then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }

        return response;
      });
    });
}
