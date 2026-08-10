import { io } from 'socket.io-client';
import { getBackendUrl } from './apiSetup';

class SocketServiceClient {
  socket = null;
  listeners = new Map();

  connect(userId, role) {
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      // Connect to the Node/Express backend server — websocket only to avoid 404 polling noise
      this.socket = io(getBackendUrl(), {
        transports: ['websocket'],
        reconnectionAttempts: 2,
        reconnectionDelay: 10000,
        timeout: 8000,
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
