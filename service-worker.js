const CACHE_NAME = "gloucestershire-weather-hub-v20261007";

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"])
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  // Always ask the network for HTML navigations. This prevents an old
  // GitHub Pages copy becoming the page shown to visitors.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(new Request(request, { cache: "no-store" }))
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Normal assets can use the cache, with a network fallback.
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
