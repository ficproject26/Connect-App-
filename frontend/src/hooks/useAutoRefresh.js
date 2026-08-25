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
    let isMounted = true;

    const executeCallback = async () => {
      if (!isMounted || inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await savedCallback.current();
      } catch (err) {
        // Log errors silently without breaking component lifecycle
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
        if (typeof document !== 'undefined' && !document.hidden) {
          executeCallback();
        }
      }, intervalMs);
    };

    // Execute immediately on mount/dependency change if tab is active
    if (typeof document !== 'undefined' && !document.hidden) {
      executeCallback();
    }

    startTimer();

    // Tab visibility & Window focus listeners
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        // Immediately fetch data on tab return & reset interval
        executeCallback();
        startTimer();
      } else {
        // Pause timer when tab is inactive
        if (timerId) clearInterval(timerId);
      }
    };

    const handleFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        executeCallback();
        startTimer();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
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
