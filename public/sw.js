/**
 * DevToyNative Service Worker
 * Strategy: NETWORK-FIRST with cache fallback
 * 
 * This ensures users always get the latest version when online,
 * and only falls back to cache when offline.
 */

const CACHE_NAME = 'devtoy-v3'; // Increment version to bust old caches

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...');
  // Skip waiting to activate new SW immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * NETWORK-FIRST Strategy:
 * 1. Try to fetch from network first
 * 2. If successful, update cache and return fresh response
 * 3. If network fails, fall back to cache
 * 4. If both fail, return offline fallback
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // NETWORK FIRST - always try network
    fetch(event.request)
      .then((networkResponse) => {
        // Got a valid response from network
        if (networkResponse && networkResponse.status === 200) {
          // Clone and cache the fresh response
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((err) => {
              console.log('[SW] Cache put failed:', err);
            });
        }
        
        return networkResponse;
      })
      .catch((error) => {
        // Network failed - try cache
        console.log('[SW] Network failed, trying cache:', event.request.url);
        
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache:', event.request.url);
              return cachedResponse;
            }
            
            // No cache either - return offline page for navigation
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Return a simple offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Force update - clear all caches
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

console.log('[SW] Service worker v3 loaded - Network-first strategy');
