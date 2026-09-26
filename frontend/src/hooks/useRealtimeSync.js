import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService';

/**
 * useRealtimeSync — Universal Real-Time Event Subscription Hook
 *
 * This hook bridges the backend's centralized event-publisher architecture to any
 * React component. It subscribes to one or more Socket.IO event names, calls the
 * provided `onEvent` callback whenever any of them fire, and ensures a clean
 * teardown on unmount to prevent memory leaks.
 *
 * ---
 * Usage patterns:
 *
 * // 1. Listen for ANY entity update and refetch data
 * useRealtimeSync(['product:updated', 'product:created', 'product:deleted'], fetchProducts);
 *
 * // 2. Listen for category changes and invalidate a cache
 * useRealtimeSync('categories:updated', () => categoryService.clearCache());
 *
 * // 3. Listen for banner and ad updates together
 * useRealtimeSync(['banners:updated', 'ad:updated'], refetchBannersAndAds);
 *
 * // 4. Use the event payload in the callback
 * useRealtimeSync('order:status_changed', (eventPayload) => {
 *   if (eventPayload.entityId === currentOrderId) setOrderStatus(eventPayload.data?.status);
 * });
 *
 * ---
 * @param {string | string[]} events   - Event name(s) to subscribe to.
 * @param {Function}          onEvent  - Callback fired when any subscribed event fires.
 *                                       Receives the full StandardEventPayload as argument.
 * @param {Array}             deps     - Optional extra React deps. Causes re-subscription
 *                                       if they change (e.g., [orderId]).
 */
export function useRealtimeSync(events, onEvent, deps = []) {
  const savedCallback = useRef(onEvent);

  // Keep the ref current without triggering re-subscription
  useEffect(() => {
    savedCallback.current = onEvent;
  });

  useEffect(() => {
    const eventNames = Array.isArray(events)
      ? events.filter(Boolean)
      : events
      ? [events]
      : [];

    if (eventNames.length === 0) return;

    const handler = (payload) => {
      try {
        savedCallback.current(payload);
      } catch (err) {
        console.warn('[useRealtimeSync]: Event handler error:', err);
      }
    };

    eventNames.forEach((event) => socketService.on(event, handler));

    return () => {
      eventNames.forEach((event) => socketService.off(event, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(events) ? events.join(',') : events, ...deps]);
}

/**
 * useRealtimeRefresh — Combines useRealtimeSync with an immediate fetch on mount.
 *
 * Calls `fetchFn` immediately on mount, then again whenever any of the specified
 * Socket.IO events fire. This is the recommended pattern for data-fetching components
 * that want both initial load and push-based updates.
 *
 * Usage:
 * useRealtimeRefresh(
 *   fetchProducts,
 *   ['product:created', 'product:updated', 'product:deleted']
 * );
 *
 * @param {Function}          fetchFn   - Async function to call on mount + every real-time event.
 * @param {string | string[]} events    - Socket.IO event name(s) to listen for.
 * @param {Array}             deps      - Optional extra deps that re-trigger the initial fetch.
 */
export function useRealtimeRefresh(fetchFn, events, deps = []) {
  const savedFetch = useRef(fetchFn);
  const inFlight = useRef(false);

  useEffect(() => {
    savedFetch.current = fetchFn;
  });

  // Debounced trigger: coalesces bursts of events into a single fetch call
  const debouncedFetch = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    Promise.resolve()
      .then(() => savedFetch.current())
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          console.warn('[useRealtimeRefresh]: Fetch error:', err?.message || err);
        }
      })
      .finally(() => {
        inFlight.current = false;
      });
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    debouncedFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Subscribe to real-time events
  useRealtimeSync(events, debouncedFetch, deps);
}

export default useRealtimeSync;
