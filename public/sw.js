self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // A minimum viable fetch listener is required by some browsers (like legacy Chrome versions) 
  // to trigger the native PWA install prompt.
});
