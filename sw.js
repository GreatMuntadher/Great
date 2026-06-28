const CACHE_NAME = 'recovery-journey-v10';

const CORE_ASSETS = [
  '/recovery-journey/',
  '/recovery-journey/index.html',
  '/recovery-journey/offline.html',
  '/recovery-journey/manifest.json',
  '/recovery-journey/assets/icons/icon.svg',
  '/recovery-journey/css/base.css',
  '/recovery-journey/css/layout.css',
  '/recovery-journey/css/components.css',
  '/recovery-journey/css/modals.css',
  '/recovery-journey/css/pages.css',
  '/recovery-journey/css/responsive.css',
  '/recovery-journey/css/space-theme.css',
  '/recovery-journey/js/constants.js',
  '/recovery-journey/js/storage.js',
  '/recovery-journey/js/navigation.js',
  '/recovery-journey/js/dashboard.js',
  '/recovery-journey/js/day-plan.js',
  '/recovery-journey/js/sos.js',
  '/recovery-journey/js/triggers.js',
  '/recovery-journey/js/recovery-lock.js',
  '/recovery-journey/js/privacy.js',
  '/recovery-journey/js/backup.js',
  '/recovery-journey/js/reports.js',
  '/recovery-journey/js/memoirs.js',
  '/recovery-journey/js/daily-assessment.js',
  '/recovery-journey/js/journal.js',
  '/recovery-journey/js/rules.js',
  '/recovery-journey/js/timeline.js',
  '/recovery-journey/js/reasons.js',
  '/recovery-journey/js/weekly-review.js',
  '/recovery-journey/js/stats.js',
  '/recovery-journey/js/challenges.js',
  '/recovery-journey/js/calendar.js',
  '/recovery-journey/js/evaluations.js',
  '/recovery-journey/js/app.js',
];

/* ── install: cache core assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── activate: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── fetch: cache-first for assets, network-first for navigation ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP
  if (!url.protocol.startsWith('http')) return;

  // تجاهل CDN (خطوط + أيقونات خارجية) — نتركها للمتصفح
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 408 }))
    );
    return;
  }

  // Navigation requests — network first, then cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/recovery-journey/offline.html'))
        )
    );
    return;
  }

  // Static assets — cache first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
