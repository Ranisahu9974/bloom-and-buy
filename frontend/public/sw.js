const CACHE_NAME = 'bloom-and-buy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Bypass API calls and hot-reload requests
  if (event.request.url.includes('/api/') || event.request.url.includes('@vite')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Clone the request because it can only be used once
        return fetch(event.request).catch(err => {
          console.warn('[SW] Fetch failed for:', event.request.url, err);
          // For navigation requests, we can't do much without a fallback page
          throw err;
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
