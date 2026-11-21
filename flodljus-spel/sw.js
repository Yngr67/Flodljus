// Service worker för Flodljus Manager: gör att spelet startar utan internet.
// Byt versionsnumret när bilder eller typsnitt byts ut, så hämtas de på nytt.
const CACHE = 'flodljus-3';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'app.js', 'audio.js', 'world.js', 'ai.js', 'render.js', 'data.js', 'match.js', 'ui.js', 'screens.js',
  'fonts/barlow-latin-400-normal.woff2', 'fonts/barlow-latin-500-normal.woff2', 'fonts/barlow-latin-600-normal.woff2', 'fonts/barlow-latin-700-normal.woff2',
  'fonts/teko-latin-400-normal.woff2', 'fonts/teko-latin-500-normal.woff2', 'fonts/teko-latin-600-normal.woff2', 'fonts/teko-latin-700-normal.woff2',
  'img/hero.webp', 'img/icon-180.png', 'img/icon-192.png', 'img/icon-512.png', 'img/trophy-cup.webp', 'img/trophy-plate.webp',
  ...[1, 2, 3, 4, 5, 6].flatMap(n => [`img/arena-${n}-day.webp`, `img/arena-${n}-night.webp`]),
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const timeout = (ms, p) => new Promise((ok, fail) => { const t = setTimeout(() => fail(new Error('timeout')), ms); p.then(v => { clearTimeout(t); ok(v); }, err => { clearTimeout(t); fail(err); }); });

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  const fixed = /\/(img|fonts)\//.test(url.pathname);
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    // Bilder och typsnitt ändras sällan: ta dem direkt ur enheten
    if (fixed && hit) return hit;
    // Sidan och koden: senaste versionen från nätet om det går, annars den sparade
    try {
      const res = await timeout(hit ? 4000 : 20000, fetch(req, { cache: 'no-cache' }));
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return hit || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    }
  })());
});
