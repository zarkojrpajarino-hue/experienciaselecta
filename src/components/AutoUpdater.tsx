import { useEffect, useRef } from 'react';

const AutoUpdater = () => {
  const versionRef = useRef<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentVersion = async (): Promise<string> => {
    try {
      // Use cache-busting to always get fresh version
      const response = await fetch(`/index.html?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      // Use ETag or Last-Modified as version identifier
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');
      
      return etag || lastModified || Date.now().toString();
    } catch (error) {
      console.error('Error checking version:', error);
      return '';
    }
  };

  const checkForUpdates = async () => {
    const currentVersion = await getCurrentVersion();
    
    if (!currentVersion) return;

    // First time - just store the version
    if (!versionRef.current) {
      versionRef.current = currentVersion;
      console.log('Initial version stored:', currentVersion);
      return;
    }

    // Check if version changed
    if (versionRef.current !== currentVersion) {
      console.log('New version detected! Reloading...', {
        old: versionRef.current,
        new: currentVersion,
      });
      
      // Force hard reload to get fresh content
      window.location.reload();
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkForUpdates();

    // Check every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      checkForUpdates();
    }, 30000); // 30 seconds

    // Check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, checking for updates...');
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check when window regains focus
    const handleFocus = () => {
      console.log('Window focused, checking for updates...');
      checkForUpdates();
    };

    window.addEventListener('focus', handleFocus);

    // Check when coming back online
    const handleOnline = () => {
      console.log('Connection restored, checking for updates...');
      checkForUpdates();
    };

    window.addEventListener('online', handleOnline);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default AutoUpdater;
