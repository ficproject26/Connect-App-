import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { StandardEventPayload } from '../events/eventTypes';
import { isAllowedOrigin } from '../../security/middleware';

export interface ConnectedClientInfo {
  socketId: string;
  userId: string;
  role: string;
  connectedAt: string;
  ip: string;
  rooms: string[];
}

class WebSocketServer {
  private io: SocketIOServer | null = null;
  private clients: Map<string, ConnectedClientInfo> = new Map();
  private totalConnectionsHandled: number = 0;
  private totalMessagesDelivered: number = 0;

  public init(server: http.Server): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Origin not allowed by WebSocket CORS policy'));
          }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      transports: ['polling', 'websocket']
    });

    console.log('[WebSocketServer]: Centralized Real-Time WebSocket Server initialized.');

// Throttled logging for WebSocket warnings to prevent production log spam
let lastSocketLogTime = 0;
let suppressedSocketLogs = 0;
function logSocketWarningThrottled(msg: string) {
  const now = Date.now();
  if (now - lastSocketLogTime > 60000) {
    if (suppressedSocketLogs > 0) {
      console.warn(`[WebSocketServer]: (Suppressed ${suppressedSocketLogs} repeated warnings) ${msg}`);
    } else {
      console.warn(`[WebSocketServer]: ${msg}`);
    }
    lastSocketLogTime = now;
    suppressedSocketLogs = 0;
  } else {
    suppressedSocketLogs++;
  }
}

    // Connection Authentication & Registration Middleware
    this.io.use((socket: Socket, next) => {
      try {
        const authHeader = (socket.handshake.headers?.authorization || socket.handshake.headers?.['x-auth-token'] || '') as string;
        const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const token = socket.handshake.auth?.token || headerToken || socket.handshake.query?.token;
        const requestedUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
        const secret = process.env.JWT_SECRET || 'dev_only_jwt_secret_DO_NOT_USE_IN_PRODUCTION_min32chars';

        if (token && typeof token === 'string') {
          try {
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
            const decoded: any = jwt.verify(cleanToken, secret);
            socket.data.userId = decoded.id || decoded.userId || decoded._id || requestedUserId || `user_${socket.id.substring(0, 6)}`;
            socket.data.role = decoded.role || decoded.userType || 'customer';
            socket.data.authenticated = true;
          } catch {
            // Token verification failed; fall back to guest/customer, NEVER grant unauthenticated admin
            socket.data.userId = requestedUserId || `guest_${socket.id.substring(0, 6)}`;
            socket.data.role = 'customer';
            socket.data.authenticated = false;
          }
        } else {
          // No token provided: unauthenticated connections can NEVER assume admin/manager/delivery roles
          socket.data.userId = requestedUserId || `guest_${socket.id.substring(0, 6)}`;
          socket.data.role = 'customer';
          socket.data.authenticated = false;
        }

        next();
      } catch (err: any) {
        next();
      }
    });

    this.io.on('connection', (socket: Socket) => {
      this.totalConnectionsHandled++;
      const clientInfo: ConnectedClientInfo = {
        socketId: socket.id,
        userId: socket.data.userId,
        role: socket.data.role,
        connectedAt: new Date().toISOString(),
        ip: socket.handshake.address || '127.0.0.1',
        rooms: []
      };
      this.clients.set(socket.id, clientInfo);

      console.log(`[WebSocketServer]: Client connected: ${socket.id} (User: ${clientInfo.userId}, Role: ${clientInfo.role})`);

      // Automatically join initial role & user rooms
      this.joinUserRooms(socket, clientInfo.userId, clientInfo.role);

      // 1. Explicit Register Event (with server-side token & role verification)
      socket.on('register', (data: any) => {
        if (!data || typeof data !== 'object') {
          logSocketWarningThrottled(`Invalid registration data received from socket ${socket.id}: ${JSON.stringify(data)}`);
          return;
        }

        const requestedRole = data.role || 'customer';
        const rawToken = data.token || socket.handshake.auth?.token || socket.handshake.query?.token;
        const secret = process.env.JWT_SECRET || 'dev_only_jwt_secret_DO_NOT_USE_IN_PRODUCTION_min32chars';

        let effectiveUserId = data.userId || socket.data.userId || `user_${socket.id.substring(0, 6)}`;
        let effectiveRole = 'customer';
        let isAuthenticated = false;

        if (rawToken && typeof rawToken === 'string') {
          try {
            const cleanToken = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
            const decoded: any = jwt.verify(cleanToken, secret);
            const tokenRole = decoded.role || decoded.userType;
            const tokenUserId = decoded.id || decoded.userId || decoded._id;

            if (tokenUserId) effectiveUserId = tokenUserId;
            if (['admin', 'manager', 'vendor', 'delivery', 'agent'].includes(tokenRole)) {
              effectiveRole = tokenRole;
              isAuthenticated = true;
            } else {
              effectiveRole = tokenRole || 'customer';
              isAuthenticated = true;
            }
          } catch {
            // Token verification failed
            if (requestedRole === 'admin' || requestedRole === 'manager') {
              logSocketWarningThrottled(`Unauthorized admin registration attempt on socket ${socket.id} (invalid token)`);
              socket.emit('registered', {
                status: 'error',
                code: 'UNAUTHORIZED_ROLE',
                message: 'Admin role requires valid JWT authentication'
              });
              return;
            }
          }
        } else {
          // No token provided: reject privileged registration
          if (requestedRole === 'admin' || requestedRole === 'manager') {
            logSocketWarningThrottled(`Unauthenticated privileged registration attempt { role: '${requestedRole}' } on socket ${socket.id} without token`);
            socket.emit('registered', {
              status: 'error',
              code: 'UNAUTHORIZED_ROLE',
              message: 'Authentication token is required for privileged roles'
            });
            return;
          }
          effectiveRole = 'customer';
        }

        // Leave previous role/user rooms if identity changed
        if (clientInfo.userId && clientInfo.role) {
          socket.leave(`user:${clientInfo.userId}`);
          socket.leave(`${clientInfo.role}:${clientInfo.userId}`);
          if (clientInfo.role === 'admin') socket.leave('admins');
        }

        clientInfo.userId = effectiveUserId;
        clientInfo.role = effectiveRole;
        socket.data.userId = effectiveUserId;
        socket.data.role = effectiveRole;
        socket.data.authenticated = isAuthenticated;

        this.joinUserRooms(socket, effectiveUserId, effectiveRole);

        socket.emit('registered', {
          status: 'ok',
          socketId: socket.id,
          userId: effectiveUserId,
          role: effectiveRole
        });
      });

      // 2. Room Subscriptions
      socket.on('join_order', (data: { orderId: string }) => {
        if (data?.orderId) {
          const room = `order:${data.orderId}`;
          socket.join(room);
          clientInfo.rooms.push(room);
          console.log(`[WebSocketServer]: Socket ${socket.id} joined ${room}`);
        }
      });

      socket.on('leave_order', (data: { orderId: string }) => {
        if (data?.orderId) {
          const room = `order:${data.orderId}`;
          socket.leave(room);
          clientInfo.rooms = clientInfo.rooms.filter(r => r !== room);
          console.log(`[WebSocketServer]: Socket ${socket.id} left ${room}`);
        }
      });

      // 3. Heartbeat / Latency Ping-Pong
      socket.on('ping_check', (data: { timestamp: number }, callback) => {
        const serverTime = Date.now();
        const payload = {
          clientTime: data?.timestamp || 0,
          serverTime,
          latency: data?.timestamp ? serverTime - data.timestamp : 0
        };
        if (typeof callback === 'function') {
          callback(payload);
        } else {
          socket.emit('pong_check', payload);
        }
      });

      // 4. Delivery Partner Location Updates (legacy compatibility)
      socket.on('location_update', (data: any) => {
        const { partnerId, orderId, latitude, longitude, speed, batteryLevel, address } = data || {};
        if (!partnerId || latitude === undefined || longitude === undefined) return;

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

        this.io?.emit('partner_position_changed', {
          partnerId,
          latitude,
          longitude,
          speed: speed || 0,
          batteryLevel: batteryLevel || 100,
          address: address || '',
          orderId: orderId || null
        });
      });

      // 5. Disconnect Handling
      socket.on('disconnect', (reason) => {
        const info = this.clients.get(socket.id);
        if (info) {
          // Only log unusual disconnections to prevent production log spamming
          if (reason !== 'client namespace disconnect' && reason !== 'transport close') {
            console.log(`[WebSocketServer]: Client disconnected: ${socket.id} (${info.role}:${info.userId}, reason: ${reason})`);
          }
          if (info.role === 'delivery') {
            this.io?.emit('partner_status_changed', {
              partnerId: info.userId,
              status: 'Offline'
            });
          }
        }
        this.clients.delete(socket.id);
      });
    });

    return this.io;
  }

  private joinUserRooms(socket: Socket, userId: string, role: string) {
    // Universal user room
    socket.join(`user:${userId}`);
    // Role-specific user room
    socket.join(`${role}:${userId}`);

    // Global role channel
    if (role === 'vendor') {
      socket.join('vendors');
      socket.join(`vendor:${userId}`);
    } else if (role === 'delivery') {
      socket.join('delivery_partners');
    } else if (role === 'customer') {
      socket.join('customers');
      socket.join(`customer:${userId}`);
    } else if (role === 'admin') {
      socket.join('admins');
    } else if (role === 'agent') {
      socket.join('agents');
    }
  }

  /**
   * Deliver structured event to relevant connected clients based on target
   */
  public deliverEvent(event: StandardEventPayload): void {
    if (!this.io) return;
    this.totalMessagesDelivered++;

    const { target, event: eventName } = event;

    // Also emit entity-specific simplified event name for legacy/granular frontend subscribers
    // e.g. "product:created", "categories:updated", "banners:updated"
    const legacyEventName = `${event.entity}:${event.action}`;

    if (target?.userId) {
      const room = target.role ? `${target.role}:${target.userId}` : `user:${target.userId}`;
      this.io.to(room).emit(eventName, event);
      this.io.to(room).emit(legacyEventName, event);
      return;
    }

    if (target?.room) {
      this.io.to(target.room).emit(eventName, event);
      this.io.to(target.room).emit(legacyEventName, event);
      return;
    }

    if (target?.role && target.role !== 'all') {
      const roleRoom = target.role === 'delivery' ? 'delivery_partners' : `${target.role}s`;
      this.io.to(roleRoom).emit(eventName, event);
      this.io.to(roleRoom).emit(legacyEventName, event);
      return;
    }

    // Broadcast globally to all connected applications
    this.io.emit(eventName, event);
    this.io.emit(legacyEventName, event);

    // Also emit common convenience events for customer dashboard
    if (event.entity === 'category') {
      this.io.emit('categories:updated', event);
    }
    if (event.entity === 'banner') {
      this.io.emit('banners:updated', event);
    }
  }

  // Direct socket helpers for backward compatibility
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

  public getStats() {
    return {
      activeConnections: this.clients.size,
      totalConnectionsHandled: this.totalConnectionsHandled,
      totalMessagesDelivered: this.totalMessagesDelivered,
      clients: Array.from(this.clients.values()).map(c => ({
        socketId: c.socketId,
        userId: c.userId,
        role: c.role,
        connectedAt: c.connectedAt
      }))
    };
  }
}

export const wsServer = new WebSocketServer();
export default wsServer;
