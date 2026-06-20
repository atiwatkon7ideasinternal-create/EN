// Service Worker — ทำให้เล่นออฟไลน์ได้ + ติดตั้งบนมือถือ (PWA)
// เปลี่ยนเลขเวอร์ชันเมื่อแก้ไฟล์ เพื่อให้ cache อัปเดต
const CACHE = "vowel-game-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./vowels.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
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

// stale-while-revalidate: ใช้ cache เร็ว ๆ แล้วอัปเดตเบื้องหลัง
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    const network = fetch(e.request)
      .then((resp) => { if (resp && resp.status === 200) cache.put(e.request, resp.clone()); return resp; })
      .catch(() => null);
    return cached || (await network) || new Response("offline", { status: 503 });
  })());
});
