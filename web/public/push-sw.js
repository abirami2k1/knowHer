/**
 * The daily nudge, received. Imported into the generated service worker
 * (vite.config.ts → workbox.importScripts), because Workbox writes the rest
 * of sw.js for us and this is the only part that is ours.
 *
 * The payload carries no health data — the API sends a title, a line and a
 * path, nothing about her cycle — so nothing here needs to be hidden.
 */

self.addEventListener('push', (event) => {
  let payload = { title: 'knowHer', body: 'A moment for today, whenever suits you.', url: '/log' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // A malformed payload still shows the default line: the browser requires a
    // visible notification for every push, and a silent failure would look broken.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      // One nudge at a time: today's replaces yesterday's rather than stacking.
      tag: 'knowher-daily-nudge',
      data: { url: payload.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/log', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Reuse a window she already has open rather than piling up new ones.
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          await client.focus();
          if ('navigate' in client) await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
