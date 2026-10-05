const CACHE_NAME = 'studyisc2-cache-v2';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './1832quiz_NewExamDomainTH.html',
  './isc2_cc_BothThai-eng_583quiz.html',
  './isc2_cc_exam548_5Domain_dualTh-Eng.html',
  './isc2_cc_exam1NCSA_bi_no-track-50q.html',
  './isc2-cc-landing.html',
  './manifest.json',
  './favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Local resources
  if (url.origin === self.location.origin) {
    const isHtml = event.request.mode === 'navigate' ||
                   (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) ||
                   url.pathname.endsWith('.html');

    if (isHtml) {
      // Network-First for HTML so new UI/fixes reflect immediately on reload
      event.respondWith(
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => caches.match(event.request))
      );
      return;
    }

    // Stale-While-Revalidate for static assets
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
