// Jom Cakap offline support. App shell: network-first (updates arrive), audio packs and photos: cache-first.
const V = 'e96ea1bc';
const APP = 'jc-app-' + V;
const AUD = 'jc-audio';
const EXT = 'jc-ext-v1';
const PACKS = ["audio/b1.3d2eafdf.bin", "audio/b2.7ebd675a.bin", "audio/b3.47662890.bin", "audio/b4.c490c5e8.bin", "audio/b5.26319243.bin", "audio/b6.9dfe0f39.bin", "audio/b7.848dd45b.bin", "audio/b8.5c00e42e.bin", "audio/b9.a9084f87.bin", "audio/b9-1.1d4d1091.bin", "audio/b10.3fe44d83.bin", "audio/b11.f3558c58.bin", "audio/d1.8d98a5ca.bin", "audio/d2.798458fb.bin", "audio/d2-1.061a8fe9.bin", "audio/d3.a1fed00b.bin", "audio/d4.c300de57.bin", "audio/d5.5c836fe4.bin", "audio/d6.70ac510f.bin", "audio/d7.8e41afeb.bin", "audio/c1.e1c36cdd.bin", "audio/c1-1.1f4dfac6.bin", "audio/c2.2d009457.bin", "audio/c3.dc470523.bin", "audio/c3-1.293da8e4.bin", "audio/d8.65e5c0c6.bin", "audio/d9.ed0338ee.bin", "audio/d9-1.3e566bce.bin", "audio/d10.4213db99.bin", "audio/d10-1.a44d96ee.bin", "audio/d11.54c2a26a.bin", "audio/d12.0b204e76.bin", "audio/d12-1.cf0f4d23.bin", "audio/e1.a7896a0e.bin", "audio/e1-1.6d848f8d.bin", "audio/e2.5d48a080.bin", "audio/e2-1.9eb1f9dc.bin", "audio/d13.20484019.bin", "audio/d13-1.293b3d6d.bin", "audio/e3.7734c634.bin", "audio/e3-1.d07da074.bin", "audio/d14.4f4d80a7.bin", "audio/d14-1.041ac302.bin", "audio/f1.f673a2c4.bin", "audio/f1-1.127fb961.bin", "audio/f2.570a3bdf.bin", "audio/f2-1.7f495dc3.bin", "audio/f3.1bdde5ea.bin", "audio/f3-1.47f6382d.bin", "audio/f4.c62a920e.bin", "audio/f4-1.c97976af.bin", "audio/f5.f40d4b3c.bin", "audio/f5-1.6ae9ecd2.bin", "audio/f6.49cf485b.bin", "audio/f6-1.22bb755a.bin", "audio/f7.1e123e19.bin", "audio/f7-1.7399dcab.bin", "audio/f9.9d123aee.bin", "audio/f9-1.ff173a5b.bin", "audio/f10.f66f974e.bin", "audio/f10-1.8bb6b9c7.bin", "audio/f11.a0c076dc.bin", "audio/f11-1.b05a015b.bin", "audio/f8.a8656c76.bin", "audio/f8-1.d6683015.bin", "audio/h1.7e5ad61f.bin", "audio/h1-1.0d9c1dc2.bin", "audio/h2.235cf4f6.bin", "audio/h2-1.ef4b4b20.bin", "audio/h3.3aa12178.bin", "audio/h3-1.d2ad85b1.bin", "audio/h4.b1e9630d.bin", "audio/h4-1.0e7bdf20.bin", "audio/h5.500324fb.bin", "audio/h5-1.8daa7581.bin", "audio/h6.5aca87b7.bin", "audio/h6-1.0a18f325.bin", "audio/h7.97912298.bin", "audio/h7-1.38142af2.bin", "audio/h9.69d2f83f.bin", "audio/h9-1.962e017f.bin", "audio/h10.8e1929db.bin", "audio/h10-1.e65353b5.bin", "audio/h11.0656afe8.bin", "audio/h11-1.c39c4f24.bin", "audio/h8.9b4b3001.bin", "audio/h8-1.fad26b16.bin", "audio/j1.78db2cad.bin", "audio/j1-1.28c257d6.bin", "audio/j2.a813fd8d.bin", "audio/j2-1.f8d6f6d4.bin", "audio/j3.794bb758.bin", "audio/j3-1.fca9778e.bin", "audio/j4.7825d16a.bin", "audio/j4-1.e41ba614.bin", "audio/j5.da425a72.bin", "audio/j5-1.c7f3a9f8.bin", "audio/j6.379ebb73.bin", "audio/j6-1.280e9c2b.bin", "audio/j7.fb8711a4.bin", "audio/j7-1.68eb3690.bin", "audio/j9.1806f7a3.bin", "audio/j9-1.f81e236c.bin", "audio/j10.c1af95e4.bin", "audio/j10-1.eef523b4.bin", "audio/j11.ced558f6.bin", "audio/j11-1.a493377d.bin", "audio/j8.79ec26d5.bin", "audio/j8-1.36ccd213.bin", "audio/grammar.52accda1.bin", "audio/grammar-1.5691d1b0.bin", "audio/base.ade26b11.bin", "audio/culture.aef2a6ed.bin", "audio/culture-1.68c5105c.bin", "audio/culture-2.1ec5b8cb.bin", "audio/culture-3.dd0ea6d8.bin"];
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
