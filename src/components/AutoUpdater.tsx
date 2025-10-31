import { useEffect, useRef } from 'react';

const AutoUpdater = () => {
  const versionRef = useRef<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef<boolean>(false);

  const checkForUpdates = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;

    try {
      // Only check in production
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject')) {
        // Don't auto-reload in development
        isCheckingRef.current = false;
        return;
      }

      // Use a simple timestamp check on a meta tag we'll add
      const response = await fetch(`/index.html?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      const html = await response.text();
      const match = html.match(/<meta name="build-time" content="([^"]+)"/);
      const buildTime = match ? match[1] : null;

      if (!buildTime) {
        isCheckingRef.current = false;
        return;
      }

      // First time - just store the version
      if (!versionRef.current) {
        versionRef.current = buildTime;
        console.log('App version initialized:', buildTime);
        isCheckingRef.current = false;
        return;
      }

      // Check if version changed
      if (versionRef.current !== buildTime) {
        console.log('🔄 New version detected! Updating...', {
          old: versionRef.current,
          new: buildTime,
        });
        
        // Clear cache and reload
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Force hard reload
        window.location.reload();
      } else {
        console.log('✓ App is up to date');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    // Only run in production
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject')) {
      console.log('Auto-updater disabled in development mode');
      return;
    }

    // Check on mount (after a delay to let page load)
    const initialCheckTimer = setTimeout(() => {
      checkForUpdates();
    }, 5000);

    // Check every 5 minutes (optimized for better performance)
    checkIntervalRef.current = setInterval(() => {
      checkForUpdates();
    }, 300000); // 5 minutes

    // Check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Add a small delay before checking
        setTimeout(() => {
          checkForUpdates();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearTimeout(initialCheckTimer);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default AutoUpdater;
