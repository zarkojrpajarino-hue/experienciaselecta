export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Check if we need to force update (only during development or specific updates)
      const forceUpdate = sessionStorage.getItem('force-sw-update') === 'true';
      
      if (forceUpdate) {
        console.log('🔄 Force updating service worker...');
        // Unregister existing service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Clear the flag
        sessionStorage.removeItem('force-sw-update');
      }
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registered successfully');

      // Check for updates every 5 minutes (less aggressive)
      setInterval(() => {
        registration.update();
      }, 300000);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📦 New version available!');
              // Tell the new service worker to skip waiting
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              // Reload after a short delay to allow Supabase session to persist
              setTimeout(() => {
                console.log('🔄 Reloading for new version...');
                window.location.reload();
              }, 1000);
            }
          });
        }
      });

      // Handle controller change (when a new service worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Only reload if we're not in the middle of authentication
        const authInProgress = localStorage.getItem('oauthInProgress') === 'true';
        if (!authInProgress) {
          console.log('🔄 Service Worker controller changed');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          console.log('⏸️ Skipping reload - auth in progress');
        }
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};
