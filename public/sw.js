// Service Worker for Event Management App

const CACHE_NAME = 'eventvibe-cache-v1';
const DATA_CACHE_NAME = 'eventvibe-data-cache-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/events',
  '/dashboard',
  '/placeholder.svg',
  '/default.png',
  '/placeholder.jpg',
  '/placeholder-logo.svg',
  '/fonts/inter.woff2',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Handle API requests separately
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event));
    return;
  }

  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetchAndCache(event.request);
    }).catch((error) => {
      // Return fallback for HTML pages
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('/');
      }
      return new Response('Network error happened', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});

// Function to fetch and cache regular requests
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    
    // Clone the response since it can only be consumed once
    if (response.status === 200) {
      cache.put(request.url, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}

// Function to handle API requests with a network-first approach
async function handleApiRequest(event) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(event.request);
    
    // Cache successful responses
    if (response.status === 200) {
      cache.put(event.request.url, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, using cache', error);
    
    // If network fails, try to serve from cache
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cached response exists, throw error
    throw error;
  }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 