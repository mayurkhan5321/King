const CACHE_NAME = 'unlock-style-v2';
const STATIC_CACHE = 'static-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v2';

const staticAssets = [
    '/',
    '/index.html',
    '/admin.html',
    '/admin-analytics.html',
    '/admin-customers.html',
    '/admin-staff.html',
    '/admin-notifications.html',
    '/css/style.css',
    '/css/admin.css',
    '/js/script.js',
    '/js/admin.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(staticAssets);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - network first strategy for dynamic content
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;

    event.respondWith(
        fetch(request)
            .then(networkResponse => {
                // Cache dynamic requests
                if (request.url.includes('/api/') || request.url.includes('admin')) {
                    const responseClone = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => {
                // Fallback to cache when offline
                return caches.match(request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Fallback for pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        // Fallback for images
                        if (request.headers.get('accept').includes('image')) {
                            return caches.match('/icons/icon-192x192.png');
                        }
                    });
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'New notification from Unlock Style',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: data.tag || 'general',
        data: data.data || { url: '/' },
        actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Unlock Style', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    } else if (event.action === 'dismiss') {
        // Notification dismissed
        console.log('Notification dismissed');
    } else {
        // Main notification body clicked
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(windowClients => {
                    const currentClient = windowClients.find(client => 
                        client.url === event.notification.data.url && 'focus' in client
                    );
                    
                    if (currentClient) {
                        return currentClient.focus();
                    } else if (clients.openWindow) {
                        return clients.openWindow(event.notification.data.url || '/');
                    }
                })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync for offline actions
    const requests = await getPendingRequests();
    
    for (const request of requests) {
        try {
            await fetch(request.url, {
                method: request.method,
                body: request.body,
                headers: request.headers
            });
            await removePendingRequest(request.id);
        } catch (error) {
            console.error('Background sync failed:', error);
        }
    }
}

// Utility functions for background sync
async function getPendingRequests() {
    // Get pending requests from IndexedDB
    return new Promise((resolve) => {
        const dbRequest = indexedDB.open('UnlockStyleDB', 1);
        
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['pendingRequests'], 'readonly');
            const store = transaction.objectStore('pendingRequests');
            const requests = store.getAll();
            
            requests.onsuccess = () => resolve(requests.result || []);
        };
        
        dbRequest.onerror = () => resolve([]);
    });
}

async function removePendingRequest(id) {
    // Remove request from IndexedDB after successful sync
    return new Promise((resolve) => {
        const dbRequest = indexedDB.open('UnlockStyleDB', 1);
        
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['pendingRequests'], 'readwrite');
            const store = transaction.objectStore('pendingRequests');
            store.delete(id);
            resolve();
        };
    });
}
