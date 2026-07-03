/* Pawang Cuaca — service worker: app shell offline + notifikasi hujan */

const CACHE_NAME = "pawang-cuaca-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;

  if (sameOrigin) {
    // App shell: cache-first supaya bisa dibuka offline, disegarkan diam-diam di latar.
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
          return res;
        }).catch(() => cached || caches.match("./index.html"));
        return cached || network;
      })
    );
  } else {
    // API cuaca & tile peta: network-first, fallback ke cache terakhir bila offline.
    event.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
    );
  }
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(list => {
      const existing = list.find(c => "focus" in c);
      return existing ? existing.focus() : self.clients.openWindow("./");
    })
  );
});
