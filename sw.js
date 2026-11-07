/* Mathe-Stern – Service Worker (offline, cache-first)
   Bei Änderungen an Dateien die Versionsnummer erhöhen. */
var CACHE = 'mathe-stern-v2';
var DATEIEN = [
  './',
  './index.html',
  './styles.css',
  './aufgaben.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Einzeln cachen, damit eine fehlende Datei nicht alles verhindert
      return Promise.all(DATEIEN.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.map(function (n) {
        if (n !== CACHE && n.indexOf('mathe-stern-') === 0) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (treffer) {
      if (treffer) return treffer;
      return fetch(req).then(function (antwort) {
        if (antwort && antwort.ok && antwort.type === 'basic') {
          var kopie = antwort.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, kopie); });
        }
        return antwort;
      }).catch(function () {
        if (req.mode === 'navigate') {
          return caches.match('./index.html').then(function (r) { return r || caches.match('./'); });
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
