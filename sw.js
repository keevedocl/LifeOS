const CACHE = "lifeos-flat-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./storage.js",
  "./xp.js",
  "./schedule.js",
  "./notifications.js",
  "./pdf.js",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {

            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            const copy = response.clone();

            caches
              .open(CACHE)
              .then(cache =>
                cache.put(
                  event.request,
                  copy
                )
              );

            return response;
          })
          .catch(() =>
            caches.match("./index.html")
          );
      })
  );
});

self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data
      ? event.data.json()
      : {};
  } catch {
    data = {
      title: "LifeOS",
      body: event.data
        ? event.data.text()
        : "Tienes una nueva notificación."
    };
  }

  const title =
    data.title || "LifeOS";

  const options = {
    body:
      data.body ||
      "Tienes una nueva notificación.",

    icon: "./icon-192.png",

    badge: "./icon-192.png",

    data: {
      url:
        data.url || "./"
    },

    vibrate: [
      200,
      100,
      200
    ],

    tag:
      data.tag ||
      "lifeos-notification",

    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const url =
      event.notification.data?.url ||
      "./";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true
        })
        .then(clientList => {

          for (const client of clientList) {

            if (
              "focus" in client
            ) {
              client.navigate(url);
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
);
