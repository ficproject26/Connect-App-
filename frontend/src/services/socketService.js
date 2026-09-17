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

  connect(userId, role) {
    this.setupLifecycleListeners();
    this.lastUserId = userId;
    this.lastRole = role;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    try {
      const socketUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        ? 'http://localhost:8001' 
        : 'https://api.ficapp.in';

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        reconnectionDelayMax: 15000,
        timeout: 10000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        // Register client details
        this.socket.emit('register', { userId, role });
      });

      this.socket.on('connect_error', () => {
        // Silently operate in local emulation mode if socket backend is offline/unreachable
      });

      // Bind all registered event listeners to the new socket
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
    } catch (e) {
      // Socket connection failed; operate in local emulation mode
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
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
