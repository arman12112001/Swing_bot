/* Service worker: makes the game work offline and installable.
   Bump CACHE when you want every phone to drop its old copy immediately. */
const CACHE = 'love-run-v6';
const CORE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
const FACE_NAMES = ['hero', 'me', 'dragon'];
for (let i = 1; i <= 10; i++) FACE_NAMES.push('enemy' + i);
const FACE_URLS = [];
for (const n of FACE_NAMES) for (const ext of ['png', 'jpg']) FACE_URLS.push('./faces/' + n + '.' + ext);
const SOUND_URLS = [];
for (const n of ['cry', 'laugh', 'giggle', 'atata', 'angry']) for (const ext of ['mp3', 'm4a']) SOUND_URLS.push('./sounds/' + n + '.' + ext);

// 1x1 transparent PNG, returned for face photos that don't exist (the game treats it as "missing").
const EMPTY_PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='), (c) => c.charCodeAt(0));
const emptyFace = () => new Response(EMPTY_PNG, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } });
const emptySound = () => new Response(new Uint8Array(0), { headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store' } });

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.concat(FACE_URLS, SOUND_URLS).map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) await cache.put(url, res);
      } catch (e) { /* offline or missing: fine */ }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isFace = /\/faces\/[^/]+\.(png|jpe?g)$/i.test(url.pathname);
  const isSound = /\/sounds\/[^/]+\.(mp3|m4a)$/i.test(url.pathname);
  const optional = isFace || isSound;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    // Stale-while-revalidate: answer from cache instantly, refresh it in the background.
    const network = fetch(req).then(async (res) => {
      if (res.ok) { await cache.put(req, res.clone()); return res; }
      if (optional && res.status === 404) await cache.delete(req, { ignoreSearch: true });
      return optional ? null : res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    if (res) return res;
    if (isFace) return emptyFace();
    if (isSound) return emptySound();
    if (req.mode === 'navigate') {
      const shell = await cache.match('./index.html');
      if (shell) return shell;
    }
    return Response.error();
  })());
});
