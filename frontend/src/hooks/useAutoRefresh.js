import { useEffect, useRef } from 'react';

/**
 * Custom React hook for real-time data polling with tab-visibility awareness.
 * 
 * - Polls automatically every `intervalMs` (default: 5000ms).
 * - Pauses polling when the browser tab is hidden/inactive.
 * - Immediately refetches when user returns to the tab, then resumes interval.
 * - Prevents duplicate/overlapping in-flight requests.
 * 
 * @param {Function} callback - Async or synchronous function to fetch updated data.
 * @param {number} intervalMs - Polling interval in milliseconds (default: 5000ms).
 * @param {Array} dependencies - Additional dependencies that should re-trigger polling.
 */
export function useAutoRefresh(callback, intervalMs = 5000, dependencies = []) {
  const savedCallback = useRef(callback);
  const inFlightRef = useRef(false);

  // Keep latest callback reference
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let timerId = null;
    let wakeTimeout = null;
    let isMounted = true;

    const executeCallback = async () => {
      if (!isMounted || inFlightRef.current) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      inFlightRef.current = true;
      try {
        await savedCallback.current();
      } catch (err) {
        // Silently skip if network was suspended/aborted
        if (
          err?.message?.includes('NETWORK_IO_SUSPENDED') ||
          err?.message?.includes('Failed to fetch') ||
          err?.name === 'AbortError'
        ) {
          return;
        }
        console.warn('[useAutoRefresh]: Refetch failed:', err);
      } finally {
        if (isMounted) {
          inFlightRef.current = false;
        }
      }
    };

    const startTimer = () => {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden && typeof navigator !== 'undefined' && navigator.onLine) {
          executeCallback();
        }
      }, intervalMs);
    };

    // Execute immediately on mount/dependency change if tab is active and online
    if (typeof document !== 'undefined' && !document.hidden && typeof navigator !== 'undefined' && navigator.onLine) {
      executeCallback();
    }

    startTimer();

    // Tab visibility & Window focus listeners
    const handleVisibilityChange = () => {
      if (wakeTimeout) clearTimeout(wakeTimeout);
      if (typeof document !== 'undefined' && !document.hidden) {
        // Allow 300ms for network adapter to fully awaken from system sleep/standby
        wakeTimeout = setTimeout(() => {
          if (isMounted && typeof navigator !== 'undefined' && navigator.onLine) {
            executeCallback();
            startTimer();
          }
        }, 300);
      } else {
        // Pause timer when tab is inactive
        if (timerId) clearInterval(timerId);
      }
    };

    const handleFocus = () => {
      if (wakeTimeout) clearTimeout(wakeTimeout);
      if (typeof document !== 'undefined' && !document.hidden) {
        wakeTimeout = setTimeout(() => {
          if (isMounted && typeof navigator !== 'undefined' && navigator.onLine) {
            executeCallback();
            startTimer();
          }
        }, 300);
      }
    };

    const handleOnline = () => {
      if (wakeTimeout) clearTimeout(wakeTimeout);
      wakeTimeout = setTimeout(() => {
        if (isMounted && typeof document !== 'undefined' && !document.hidden) {
          executeCallback();
          startTimer();
        }
      }, 300);
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [intervalMs, ...dependencies]);
}

export default useAutoRefresh;
