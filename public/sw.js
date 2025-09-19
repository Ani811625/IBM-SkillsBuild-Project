// Enhanced Service Worker for Recipe Finder - Offline Support & Caching
const CACHE_NAME = 'recipe-finder-v2.0.0';
const RECIPES_CACHE = 'recipes-cache-v1';
const IMAGES_CACHE = 'images-cache-v1';
const API_CACHE = 'api-cache-v1';

// URLs to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add essential static assets
  '/static/js/',
  '/static/css/',
  '/favicon.ico'
];

// Recipe-related URLs patterns
const recipePatterns = [
  /\/recipe\//,
  /\/search/,
  /\/favorites/,
  /\/surprise/
];

// API endpoints to cache
const apiPatterns = [
  /api\.spoonacular\.com/,
  /images\.unsplash\.com/
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    Promise.all([
      // Cache essential app files
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('📦 Caching essential app files');
          return cache.addAll(urlsToCache);
        }),
      // Initialize other caches
      caches.open(RECIPES_CACHE),
      caches.open(IMAGES_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate caching strategies
  if (request.method !== 'GET') {
    return; // Only cache GET requests
  }

  // Strategy 1: Cache First for Images
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGES_CACHE));
    return;
  }

  // Strategy 2: Network First for API calls
  if (apiPatterns.some(pattern => pattern.test(url.hostname + url.pathname))) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Strategy 3: Cache First for Recipe pages
  if (recipePatterns.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstStrategy(request, RECIPES_CACHE));
    return;
  }

  // Strategy 4: Stale While Revalidate for app shell
  event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME));
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![
              CACHE_NAME, 
              RECIPES_CACHE, 
              IMAGES_CACHE, 
              API_CACHE
            ].includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// Caching Strategies

// Cache First Strategy - Good for images and static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First Strategy failed:', error);
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#9ca3af">Image unavailable offline</text></svg>', {
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    throw error;
  }
}

// Network First Strategy - Good for API calls
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline message for API calls
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate Strategy - Good for app shell
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  return networkResponsePromise || cachedResponse;
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
        break;
      case 'CACHE_RECIPE':
        cacheRecipe(event.data.recipe).then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
        break;
      case 'GET_CACHE_INFO':
        getCacheInfo().then(info => {
          event.ports[0]?.postMessage(info);
        });
        break;
    }
  }
});

// Helper functions
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function cacheRecipe(recipe) {
  const cache = await caches.open(RECIPES_CACHE);
  const recipeResponse = new Response(JSON.stringify(recipe), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put(`/recipe/${recipe.id}`, recipeResponse);
  
  // Cache recipe image
  if (recipe.image) {
    try {
      const imageResponse = await fetch(recipe.image);
      if (imageResponse.ok) {
        const imageCache = await caches.open(IMAGES_CACHE);
        await imageCache.put(recipe.image, imageResponse);
      }
    } catch (error) {
      console.log('Failed to cache recipe image:', error);
    }
  }
}

async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    info[cacheName] = keys.length;
  }
  
  return info;
}