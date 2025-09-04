const CACHE_NAME = 'analizador-cache-v1';
const urlsToCache = [
    '/Analizador-Futbol/index.html',
    '/Analizador-Futbol/style.css',
    '/Analizador-Futbol/script.js',
    '/Analizador-Futbol/icon-192x192.png',
    '/Analizador-Futbol/icon-512x512.png',
    '/Analizador-Futbol/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierta');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
