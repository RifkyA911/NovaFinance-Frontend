// NovaFinance - Self-Purging Service Worker (Cleans up legacy workers & proxy websockets)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        if ('caches' in self) {
          const names = await caches.keys();
          await Promise.all(names.map((name) => caches.delete(name)));
        }
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) {
          client.postMessage({ action: 'sw_purged' });
        }
      } catch (err) {
        console.warn('SW purge completed with notice:', err);
      }
    })()
  );
});

// Pass all fetch requests directly to network without interception
self.addEventListener('fetch', () => {
  // Pass-through
});
