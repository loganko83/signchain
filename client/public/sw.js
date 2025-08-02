// SignChain Service Worker
const CACHE_NAME = 'signchain-v1.0.0';
const BASE_URL = '/signchain/';

// 캐시할 핵심 리소스들
const STATIC_CACHE_FILES = [
  `${BASE_URL}`,
  `${BASE_URL}index.html`,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}icons/icon-192x192.png`,
  `${BASE_URL}icons/icon-512x512.png`
];

// 동적으로 캐시할 리소스 패턴
const DYNAMIC_CACHE_PATTERNS = [
  /.*\.js$/,
  /.*\.css$/,
  /.*\.png$/,
  /.*\.jpg$/,
  /.*\.webp$/,
  /.*\.svg$/
];

// API 요청은 항상 네트워크 우선
const API_PATTERNS = [
  /\/api\//,
  /\/auth\//
];

// Install 이벤트 - 필수 리소스 캐시
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Static cache complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
});

// Activate 이벤트 - 이전 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch 이벤트 - 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 네트워크 우선 (캐시 안함)
  if (API_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // API 실패 시 기본 에러 응답
          return new Response(
            JSON.stringify({ error: '네트워크 오류', offline: true }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선, 네트워크 폴백
  if (DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // 캐시에서 발견 시 백그라운드로 업데이트
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, networkResponse.clone()));
                }
              })
              .catch(() => {}); // 네트워크 실패는 무시
            
            return response;
          }

          // 캐시에 없으면 네트워크에서 가져오고 캐시에 저장
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone));
              }
              return networkResponse;
            });
        })
    );
    return;
  }

  // HTML 페이지는 네트워크 우선, 오프라인 시 캐시된 index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(`${BASE_URL}index.html`)
            .then((response) => {
              return response || new Response(
                '<!DOCTYPE html><html><head><title>오프라인</title></head><body><h1>인터넷 연결을 확인해주세요</h1></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        })
    );
    return;
  }

  // 기본 처리: 네트워크 우선
  event.respondWith(fetch(request));
});

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 오프라인에서 저장된 데이터 동기화 로직
      console.log('[SW] Performing background sync')
    );
  }
});

// 푸시 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: `${BASE_URL}icons/icon-192x192.png`,
    badge: `${BASE_URL}icons/icon-72x72.png`,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인',
        icon: `${BASE_URL}icons/icon-96x96.png`
      },
      {
        action: 'close',
        title: '닫기',
        icon: `${BASE_URL}icons/icon-96x96.png`
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SignChain', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(`${BASE_URL}dashboard`)
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
