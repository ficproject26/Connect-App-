import http from 'http';
import { wsServer } from './realtime/websocket/wsServer';

/**
 * SocketManager Adapter
 * Maintains complete backwards compatibility with existing backend routes
 * while delegating all real-time WebSocket interactions to the centralized wsServer.
 */
class SocketManager {
  public init(server: http.Server) {
    return wsServer.init(server);
  }

  public emitToUser(role: string, userId: string, event: string, data: any) {
    wsServer.emitToUser(role, userId, event, data);
  }

  public emitToOrder(orderId: string, event: string, data: any) {
    wsServer.emitToOrder(orderId, event, data);
  }

  public emitToVendor(vendorId: string, event: string, data: any) {
    wsServer.emitToVendor(vendorId, event, data);
  }

  public emitToAdmins(event: string, data: any) {
    wsServer.emitToAdmins(event, data);
  }

  public broadcast(event: string, data: any) {
    wsServer.broadcast(event, data);
  }
}

export const socketManager = new SocketManager();
export default socketManager;
