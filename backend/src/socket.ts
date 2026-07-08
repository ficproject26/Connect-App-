import { Server, Socket } from 'socket.io';
import http from 'http';

interface ActiveSocket {
  socketId: string;
  userId: string;
  role: 'customer' | 'vendor' | 'delivery' | 'admin';
}

class SocketManager {
  private io: Server | null = null;
  // Map socketId -> ActiveSocket detail
  private activeSockets: Map<string, ActiveSocket> = new Map();

  public init(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Allow all origins for testing ease
        methods: ['GET', 'POST']
      }
    });

    console.log('[Socket]: Real-time Socket.IO server initialized.');

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket]: New connection established: ${socket.id}`);

      // 1. Register socket with user details
      socket.on('register', (data: { userId: string; role: 'customer' | 'vendor' | 'delivery' | 'admin' }) => {
        const { userId, role } = data;
        if (!userId || !role) {
          console.warn(`[Socket]: Invalid registration data received:`, data);
          return;
        }

        // Store client details
        this.activeSockets.set(socket.id, {
          socketId: socket.id,
          userId,
          role
        });

        // Join default role room
        socket.join(`${role}:${userId}`);
        if (role === 'vendor') {
          // Join vendor specific updates channel
          socket.join(`vendor:${userId}`);
          console.log(`[Socket]: Registered Vendor "${userId}" to room vendor:${userId}`);
        } else if (role === 'delivery') {
          // Join active delivery partners channel
          socket.join('delivery_partners');
          console.log(`[Socket]: Registered Delivery Partner "${userId}"`);
        } else if (role === 'customer') {
          // Customer room for order status
          socket.join(`customer:${userId}`);
          console.log(`[Socket]: Registered Customer "${userId}"`);
        } else if (role === 'admin') {
          socket.join('admins');
          console.log(`[Socket]: Registered Admin "${userId}"`);
        }
      });

      // 2. Room subscription (e.g. for customer tracking a specific order)
      socket.on('join_order', (data: { orderId: string }) => {
        const { orderId } = data;
        if (orderId) {
          socket.join(`order:${orderId}`);
          console.log(`[Socket]: Socket ${socket.id} joined tracking channel for order:${orderId}`);
        }
      });

      socket.on('leave_order', (data: { orderId: string }) => {
        const { orderId } = data;
        if (orderId) {
          socket.leave(`order:${orderId}`);
          console.log(`[Socket]: Socket ${socket.id} left tracking channel for order:${orderId}`);
        }
      });

      // 3. Handle location update updates from Delivery Partner app
      socket.on('location_update', (data: {
        partnerId: string;
        orderId?: string;
        latitude: number;
        longitude: number;
        speed?: number;
        batteryLevel?: number;
        address?: string;
      }) => {
        const { partnerId, orderId, latitude, longitude, speed, batteryLevel, address } = data;
        if (!partnerId || latitude === undefined || longitude === undefined) return;

        // Broadcast location updates to the order room (for the customer)
        if (orderId) {
          this.io?.to(`order:${orderId}`).emit('partner_location_updated', {
            partnerId,
            orderId,
            latitude,
            longitude,
            speed: speed || 0,
            batteryLevel: batteryLevel || 100,
            address: address || '',
            timestamp: new Date().toISOString()
          });
        }

        // Also broadcast to the active sockets so that vendors can view it in their dashboard live tracking maps
        const socketInfo = this.activeSockets.get(socket.id);
        if (socketInfo && socketInfo.role === 'delivery') {
          // We find which vendor this partner belongs to. If we don't know it, we can broadcast it to delivery_partners channel
          this.io?.emit('partner_position_changed', {
            partnerId,
            latitude,
            longitude,
            speed: speed || 0,
            batteryLevel: batteryLevel || 100,
            address: address || '',
            orderId: orderId || null
          });
        }
      });

      // 4. Handle Disconnects
      socket.on('disconnect', () => {
        const active = this.activeSockets.get(socket.id);
        if (active) {
          console.log(`[Socket]: Client disconnected: User ${active.userId} (${active.role})`);
          if (active.role === 'delivery') {
            // Broadcast partner offline event
            this.io?.emit('partner_status_changed', {
              partnerId: active.userId,
              status: 'Offline'
            });
          }
          this.activeSockets.delete(socket.id);
        } else {
          console.log(`[Socket]: Anonymous connection disconnected: ${socket.id}`);
        }
      });
    });
  }

  // Helper methods to emit from outside (REST Routers)
  
  public emitToUser(role: string, userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`${role}:${userId}`).emit(event, data);
    }
  }

  public emitToOrder(orderId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`order:${orderId}`).emit(event, data);
    }
  }

  public emitToVendor(vendorId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`vendor:${vendorId}`).emit(event, data);
    }
  }

  public emitToAdmins(event: string, data: any) {
    if (this.io) {
      this.io.to('admins').emit(event, data);
    }
  }

  public broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketManager = new SocketManager();
export default socketManager;
