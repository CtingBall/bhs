// PWA Service Worker：离线缓存（vite-plugin-singlefile 产物为单文件，缓存整页即可离线秒开）
// 经验：必须用「网络优先」而非「缓存优先」——
// 缓存优先会让已注册的 SW 永远返回旧内容（旧图/旧样式），且 dev 模式也会注册 SW 导致陈旧。
// 网络优先：在线时永远拿最新（配合 ETag 协商），断网时回退缓存，两者兼得。
const CACHE = 'bhs-clan-v2';
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // 仅拦截同源请求，避免污染跨域资源
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 仅缓存成功响应的核心资源（页面/清单/图标），其余放行
        if (res.ok && (e.request.mode === 'navigate' || ASSETS.includes(url.pathname))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached ?? Response.error())),
  );
});
