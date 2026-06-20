// Service Worker — ทำให้เล่นออฟไลน์ได้ + ติดตั้งบนมือถือ (PWA)
// เปลี่ยนเลขเวอร์ชันเมื่อแก้ไฟล์ เพื่อให้ cache อัปเดต
const CACHE = "vowel-game-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./vowels.js",
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

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // หน้าเว็บ/HTML: network-first → ออนไลน์เห็นเวอร์ชันใหม่ทันที, ออฟไลน์ใช้ cache
  const isHTML = req.mode === "navigate" || req.destination === "document";
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // ไฟล์อื่น (css/js/รูป): stale-while-revalidate → เร็ว + อัปเดตเบื้องหลัง
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const network = fetch(req)
      .then((resp) => { if (resp && resp.status === 200) cache.put(req, resp.clone()); return resp; })
      .catch(() => null);
    return cached || (await network) || new Response("offline", { status: 503 });
  })());
});
