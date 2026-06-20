// Service Worker — ทำให้เล่นออฟไลน์ได้ + ติดตั้งบนมือถือ (PWA)
// เปลี่ยนเลขเวอร์ชันเมื่อแก้ไฟล์ เพื่อให้ cache อัปเดต
const CACHE = "vowel-game-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./vowels.js",
  "./vocab.js",
  "./vocab-game.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// network-first ทุกไฟล์: ออนไลน์เห็นเวอร์ชันใหม่เสมอ, ออฟไลน์ค่อยใช้ cache
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      })
      .catch(() => caches.match(req).then((c) =>
        c || (req.mode === "navigate" ? caches.match("./index.html") : undefined)))
  );
});
