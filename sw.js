// Service worker: salva i file dell'app sul telefono così si apre anche senza internet
const CACHE = "meteo-pwa-v3";
const FILE = ["./meteo_pwa_icone_nuove.html", "./manifest.json", "./icon-3d-192.png", "./icon-3d-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(chiavi => Promise.all(chiavi.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Prima provo online (così gli aggiornamenti arrivano), se non c'è rete uso la copia salvata
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // le chiamate alle API non vengono toccate
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
