/* global clients */

const CACHE_NAME = 'hermes-citadel-v4-production-reset';

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.resolve());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((windowClients) => {
        // Demo has its own origin on 4176 and must retain query-driven fixtures.
        // Every production client is deliberately reloaded once after this SW
        // upgrade so an old Home Screen shell cannot keep CAT/demo assets alive.
        if (self.location.port === '4176') return undefined;
        const productionRoot = new URL('/', self.location.origin).href;
        return Promise.all(windowClients.map((client) => client.navigate(productionRoot)));
      })
  );
});

// Do not intercept app shell/assets. This origin was temporarily pointed at
// another app, so network-first passthrough avoids stale white-screen bundles.

self.addEventListener('push', (event) => {
  let data = { title: 'Hermes Citadel', body: 'Otrzymano powiadomienie.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/citadel-icon-192-v3.png',
    badge: '/citadel-icon-192-v3.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      let matchingClient = null;
      for (let client of windowClients) {
        if (client.url === urlToOpen) {
          matchingClient = client;
          break;
        }
      }
      if (matchingClient) {
        return matchingClient.focus();
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
