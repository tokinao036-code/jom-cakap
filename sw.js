// Jom Cakap offline support. App shell: network-first (updates arrive), audio packs and photos: cache-first.
const V = 'd79e8a0c';
const APP = 'jc-app-' + V;
const AUD = 'jc-audio';
const EXT = 'jc-ext-v1';
const PACKS = ["audio/d1.806e77e0.bin", "audio/d2.3a881a63.bin", "audio/d2-1.9b539cf4.bin", "audio/d3.cefe7636.bin", "audio/d4.897c344d.bin", "audio/d5.b5f57dd8.bin", "audio/d6.3e55f513.bin", "audio/d7.4642122a.bin", "audio/d8.d4c9b6f5.bin", "audio/d9.1f111882.bin", "audio/d9-1.579d27fd.bin", "audio/d10.b78947d1.bin", "audio/d10-1.3285f6e7.bin", "audio/d11.5b29aab8.bin", "audio/d12.d2c41a11.bin", "audio/d12-1.15700479.bin", "audio/d13.45e5e0b4.bin", "audio/d13-1.2a8c0acc.bin", "audio/d14.4f4d80a7.bin", "audio/d14-1.9f22e8e4.bin", "audio/grammar.cf4e1c6b.bin", "audio/culture.aef2a6ed.bin", "audio/culture-1.664c2823.bin", "audio/culture-2.78c7d23c.bin", "audio/culture-3.d4858b59.bin", "audio/base.b9008117.bin"];
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('jc-app-') && k !== APP) await caches.delete(k);
    // drop audio packs that are no longer part of this build (their names carry a content hash)
    const keep = new Set(PACKS.map(p => new URL(p, self.registration.scope).href));
    const a = await caches.open(AUD);
    for (const r of await a.keys()) if (!keep.has(r.url)) await a.delete(r);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.endsWith('.bin')) {
    e.respondWith(caches.open(AUD).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(APP).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com|wikimedia\.org|pinimg\.com/.test(url.host)) {
    e.respondWith(caches.open(EXT).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }))));
  }
});

// The page asks to pre-fetch every audio pack and photo once per build, so lessons work offline.
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'warm') return;
  e.waitUntil(Promise.all(e.data.urls.map(u => {
    const same = new URL(u).origin === location.origin;
    return caches.open(same ? AUD : EXT).then(c => c.match(u).then(hit => hit || fetch(same ? u : new Request(u, { mode: 'no-cors', referrerPolicy: 'no-referrer' })).then(res => (res.ok || res.type === 'opaque') && c.put(u, res)).catch(() => {})));
  })));
});
