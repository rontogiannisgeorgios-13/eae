const CACHE_NAME = 'eae-mini-app-20260630-2';
const APP_SHELL = ['./', './index.html', './style.css', './manifest.json', './images/EAE_logo_EN.png', './images/icon-192.png', './images/icon-512.png'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((name) => name.startsWith('eae-mini-app-') && name !== CACHE_NAME).map((name) => caches.delete(name)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET') return; if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request).catch(() => caches.match('./index.html'))); return; } event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))); });
