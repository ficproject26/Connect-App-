import { io } from 'socket.io-client';

class SocketServiceClient {
  socket = null;
  listeners = new Map();

  connect(userId, role) {
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      // Connect to the Node/Express backend server
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log(`[Socket Client]: Connected to server. Socket ID: ${this.socket.id}`);
        // Register client details
        this.socket.emit('register', { userId, role });
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket Client]: Connection to backend failed. Emulating Socket updates locally.', err.message);
      });

      // Bind all registered event listeners to the new socket
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
    } catch (e) {
      console.warn('[Socket Client]: Socket connection failed. Operating in local emulation mode.', e);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket Client]: Disconnected from server.');
    }
  }

  joinOrder(orderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_order', { orderId });
      console.log(`[Socket Client]: Joined order channel order:${orderId}`);
    }
  }

  leaveOrder(orderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_order', { orderId });
      console.log(`[Socket Client]: Left order channel order:${orderId}`);
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
