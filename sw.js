// offline cache for the Wine Atlas app; the version changes whenever any file does
const CACHE = "atlas-2b905f93d8";
const FILES = ["./", "index.html", "manifest.webmanifest", "lib/d3.min.js", "lib/lakes-50m.js", "lib/rivers-50m.js", "lib/terrain-250-0.js", "lib/topojson.min.js", "lib/world-110m.js", "lib/world-50m.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // the page itself: try the network so updates show up, fall back to the saved copy
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put("index.html", r.clone())); return r; }).catch(() => caches.match("index.html"))); return; }
  // fonts and everything else: saved copy first, then the network (and keep what we fetch)
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r; })));
});
