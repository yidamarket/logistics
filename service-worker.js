// service-worker.js
const CACHE_NAME = 'livreurs-app-v2'; // 改这里来更新版本

// 需要缓存的资源
const urlsToCache = [
  '/',
  '/index.html'
];

// 安装Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker安装 - 版本:', CACHE_NAME);
  
  // 强制等待中的Service Worker成为激活的
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存打开成功');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('所有资源缓存成功');
      })
      .catch(error => {
        console.error('缓存失败:', error);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker激活 - 版本:', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧版本的缓存
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('旧缓存清理完成');
      // 立即控制所有客户端
      return self.clients.claim();
    }).then(() => {
      console.log('Service Worker现在控制所有客户端');
    })
  );
});

// 拦截网络请求 - 网络优先策略
self.addEventListener('fetch', event => {
  // 只处理同源请求
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // 如果是有效的响应，更新缓存
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // 如果网络请求失败，从缓存中获取
          return caches.match(event.request);
        })
    );
  } else {
    // 跨域请求直接通过网络获取
    event.respondWith(fetch(event.request));
  }
});

// 监听消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('收到SKIP_WAITING消息');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});