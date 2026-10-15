const CACHE = 'chiikawa-tamagotchi-v1';
const CORE = ['./', './index.html', './style.css', './game.js', './manifest.webmanifest', ...['chiikawa','hachiware','usagi','momonga','kurimanju','shisa','rakko'].map(id => `./assets/characters/${id}.png`)];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('modumaru-') || key.startsWith('chiikawa-tamagotchi-')) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin || event.request.headers.has('range')) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || Response.error())));
});
