import { io } from 'socket.io-client';
import { getSocketUrl } from './apiSetup';

class SocketServiceClient {
  socket = null;
  listeners = new Map();
  lastUserId = null;
  lastRole = null;
  lifecycleBound = false;

  setupLifecycleListeners() {
    if (this.lifecycleBound || typeof window === 'undefined') return;
    this.lifecycleBound = true;

    window.addEventListener('online', () => {
      if (this.lastUserId && (!this.socket || !this.socket.connected)) {
        setTimeout(() => {
          this.connect(this.lastUserId, this.lastRole);
        }, 500);
      }
    });

    window.addEventListener('offline', () => {
      this.disconnect();
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && typeof navigator !== 'undefined' && navigator.onLine && this.lastUserId) {
          if (!this.socket || !this.socket.connected) {
            setTimeout(() => {
              this.connect(this.lastUserId, this.lastRole);
            }, 500);
          }
        }
      });
    }
  }

  connect(userId, role, token) {
    this.setupLifecycleListeners();

    // Safely retrieve token from parameter or localStorage
    const authToken = token || (typeof localStorage !== 'undefined' ? (localStorage.getItem('connect_token') || localStorage.getItem('token') || localStorage.getItem('admin_token') || localStorage.getItem('vendor_token') || '') : '');

    // Fallback userId if missing to prevent sending malformed { role: 'admin' } payload
    const effectiveUserId = userId || (typeof localStorage !== 'undefined' ? (() => {
      try {
        const u = JSON.parse(localStorage.getItem('connect_current_user') || '{}');
        return u.id || u._id || u.userId || u.email;
      } catch { return null; }
    })() : null) || 'guest';

    const effectiveRole = role || 'customer';

    if (this.socket && (this.socket.connected || this.socket.active || this.isConnecting) && this.lastUserId === effectiveUserId && this.lastRole === effectiveRole) {
      return;
    }

    this.lastUserId = effectiveUserId;
    this.lastRole = effectiveRole;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    if (this.socket) {
      try {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      } catch (e) {}
      this.socket = null;
    }

    this.isConnecting = true;

    try {
      const socketUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        ? 'http://localhost:8001' 
        : 'https://api.ficapp.in';

      this.socket = io(socketUrl, {
        auth: {
          token: authToken,
          userId: effectiveUserId,
          role: effectiveRole
        },
        query: {
          token: authToken,
          userId: effectiveUserId,
          role: effectiveRole
        },
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 10000,
        timeout: 15000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        this.isConnecting = false;
        // Register client details with verified identity and auth token
        this.socket.emit('register', {
          userId: effectiveUserId,
          role: effectiveRole,
          token: authToken
        });
      });

      this.socket.on('connect_error', () => {
        this.isConnecting = false;
        // Silently operate in local emulation mode if socket backend is offline/unreachable
      });

      this.socket.on('disconnect', () => {
        this.isConnecting = false;
      });

      // Bind all registered event listeners to the new socket
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
    } catch (e) {
      this.isConnecting = false;
      // Socket connection failed; operate in local emulation mode
    }
  }

  disconnect() {
    this.isConnecting = false;
    if (this.socket) {
      try {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      } catch (e) {}
      this.socket = null;
      this.lastUserId = null;
      this.lastRole = null;
    }
  }

  joinOrder(orderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_order', { orderId });
    }
  }

  leaveOrder(orderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_order', { orderId });
    }
  }

  sendLocation(partnerId, orderId, latitude, longitude, speed = 0, batteryLevel = 100, address = '') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('location_update', {
        partnerId,
        orderId,
        latitude,
        longitude,
        speed,
        batteryLevel,
        address
      });
    }
  }

  // Bind callback to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unbind callback
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Dispatch custom simulated socket events locally when server is offline
  triggerLocalEvent(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const socketService = new SocketServiceClient();
export default socketService;
