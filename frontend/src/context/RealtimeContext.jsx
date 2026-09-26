import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { socketService } from '../services/socketService';

/**
 * Centralized Realtime Context
 * 
 * Provides a single, shared socket connection across the entire frontend application.
 * Components subscribe to events via useRealtimeEvent() or the useRealtimeSync() hook.
 * The socket auto-connects when a user is present in localStorage and auto-reconnects
 * when the app regains network connectivity.
 */
const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState('disconnected'); // 'connected' | 'fallback' | 'disconnected'
  const lastConnectAttempt = useRef(null);

  /**
   * Connects the socket using the current user from localStorage.
   * If no user is found, the socket remains disconnected (safe for public pages).
   */
  const connectSocket = useCallback(() => {
    try {
      const raw = localStorage.getItem('connect_current_user');
      if (!raw) {
        setIsConnected(false);
        setConnectionMode('disconnected');
        return;
      }
      const user = JSON.parse(raw);
      const userId = user?.id || user?._id || user?.userId || user?.email || 'guest';
      const role = user?.role || user?.userType || 'customer';

      // Avoid redundant reconnection
      const attemptKey = `${userId}:${role}`;
      if (lastConnectAttempt.current === attemptKey && socketService.socket?.connected) {
        return;
      }
      lastConnectAttempt.current = attemptKey;

      socketService.connect(userId, role);
    } catch (e) {
      // Operate gracefully if localStorage is unavailable
    }
  }, []);

  useEffect(() => {
    // Initial connection attempt
    connectSocket();

    // Monitor socket connection state for UI indicators
    const onConnect = () => {
      setIsConnected(true);
      setConnectionMode('connected');
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setConnectionMode('fallback');
    };
    const onConnectError = () => {
      setIsConnected(false);
      setConnectionMode('fallback');
    };

    socketService.on('connect', onConnect);
    socketService.on('disconnect', onDisconnect);
    socketService.on('connect_error', onConnectError);

    // Reconnect when the window regains focus after being away
    const handleStorageChange = (e) => {
      if (e.key === 'connect_current_user') {
        // User logged in or logged out in another tab
        setTimeout(connectSocket, 200);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      socketService.off('connect', onConnect);
      socketService.off('disconnect', onDisconnect);
      socketService.off('connect_error', onConnectError);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [connectSocket]);

  const value = {
    isConnected,
    connectionMode,
    reconnect: connectSocket,
    socketService
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Returns the RealtimeContext value: { isConnected, connectionMode, reconnect, socketService }
 */
export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    // Graceful fallback if used outside provider (e.g., during SSR or tests)
    return {
      isConnected: false,
      connectionMode: 'disconnected',
      reconnect: () => {},
      socketService
    };
  }
  return ctx;
}

export default RealtimeContext;
