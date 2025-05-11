// Service Worker for Event Management App
const CACHE_NAME = 'eventvibe-cache-v1';
const DATA_CACHE_NAME = 'eventvibe-data-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/placeholder.svg',
  '/placeholder.jpg',
  '/placeholder-logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing Service Worker...');
  
  // Skip waiting to ensure the service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating Service Worker...');
  
  // Claim client to ensure the service worker controls the page immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache:', key);
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
      if (event.request.headers.get('accept') && 
          event.request.headers.get('accept').includes('text/html')) {
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

// Listen for push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push Notification received', event);
  
  let data = { title: 'New Event!', content: 'Something happened in the app.', openUrl: '/' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      const text = event.data.text();
      data.content = text;
    }
  }
  
  const options = {
    body: data.content,
    icon: '/placeholder-logo.png',
    badge: '/placeholder-logo.png',
    vibrate: [100, 50, 100],
    data: {
      openUrl: data.openUrl || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked', event);
  
  event.notification.close();
  
  const openUrl = event.notification.data.openUrl || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsArr) => {
      // If a client tab is already open, focus it
      const hadWindowToFocus = clientsArr.some((windowClient) => {
        if (windowClient.url === openUrl) {
          return windowClient.focus();
        }
      });
      
      // Otherwise open a new tab
      if (!hadWindowToFocus) {
        clients.openWindow(openUrl).then((windowClient) => {
          if (windowClient) {
            windowClient.focus();
          }
        });
      }
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  // Handle skip waiting message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Broadcast messages to all clients (for realtime sync)
  if (event.data && event.data.type === 'BROADCAST') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        // Don't send the message back to the sender
        if (client.id !== event.source.id) {
          client.postMessage(event.data.payload);
        }
      });
    });
  }
}); 