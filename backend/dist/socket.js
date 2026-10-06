"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = void 0;
const wsServer_1 = require("./realtime/websocket/wsServer");
/**
 * SocketManager Adapter
 * Maintains complete backwards compatibility with existing backend routes
 * while delegating all real-time WebSocket interactions to the centralized wsServer.
 */
class SocketManager {
    init(server) {
        return wsServer_1.wsServer.init(server);
    }
    emitToUser(role, userId, event, data) {
        wsServer_1.wsServer.emitToUser(role, userId, event, data);
    }
    emitToOrder(orderId, event, data) {
        wsServer_1.wsServer.emitToOrder(orderId, event, data);
    }
    emitToVendor(vendorId, event, data) {
        wsServer_1.wsServer.emitToVendor(vendorId, event, data);
    }
    emitToAdmins(event, data) {
        wsServer_1.wsServer.emitToAdmins(event, data);
    }
    broadcast(event, data) {
        wsServer_1.wsServer.broadcast(event, data);
    }
}
exports.socketManager = new SocketManager();
exports.default = exports.socketManager;
