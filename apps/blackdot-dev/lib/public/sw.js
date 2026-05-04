const CACHE_NAME = 'three-assets-v1';
const ASSET_URLS = ['/assets/assets-manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSET_URLS))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Cache model and texture requests aggressively
  if (
    url.pathname.endsWith('.glb') || 
    url.pathname.endsWith('.gltf') || 
    url.pathname.endsWith('.ktx2') ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        
        try {
          const resp = await fetch(event.request);
          if (resp.ok && resp.status === 200) {
            // Only cache successful responses
            const responseClone = resp.clone();
            // Ensure the response is valid before caching
            if (responseClone instanceof Response) {
              cache.put(event.request, responseClone).catch(err => {
                console.warn('Failed to cache response:', err);
              });
            }
          }
          return resp;
        } catch (error) {
          // If network fails and we have cached version, return it
          const cached = await cache.match(event.request);
          if (cached) return cached;
          throw error;
        }
      })
    );
    return;
  }
  
  // Otherwise default network-first
  event.respondWith(
    fetch(event.request).catch(() => 
      caches.match(event.request)
    )
  );
});

