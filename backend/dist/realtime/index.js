"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtimeHealth = exports.formatEventName = exports.RealtimeActions = exports.RealtimeEntities = exports.cacheManager = exports.eventSubscriber = exports.eventPublisher = exports.wsServer = exports.redisManager = void 0;
exports.initRealtimeInfrastructure = initRealtimeInfrastructure;
const redisClient_1 = require("./redis/redisClient");
Object.defineProperty(exports, "redisManager", { enumerable: true, get: function () { return redisClient_1.redisManager; } });
const wsServer_1 = require("./websocket/wsServer");
Object.defineProperty(exports, "wsServer", { enumerable: true, get: function () { return wsServer_1.wsServer; } });
const eventSubscriber_1 = require("./events/eventSubscriber");
Object.defineProperty(exports, "eventSubscriber", { enumerable: true, get: function () { return eventSubscriber_1.eventSubscriber; } });
const eventPublisher_1 = require("./events/eventPublisher");
Object.defineProperty(exports, "eventPublisher", { enumerable: true, get: function () { return eventPublisher_1.eventPublisher; } });
const cacheManager_1 = require("./cache/cacheManager");
Object.defineProperty(exports, "cacheManager", { enumerable: true, get: function () { return cacheManager_1.cacheManager; } });
const eventTypes_1 = require("./events/eventTypes");
Object.defineProperty(exports, "RealtimeEntities", { enumerable: true, get: function () { return eventTypes_1.RealtimeEntities; } });
Object.defineProperty(exports, "RealtimeActions", { enumerable: true, get: function () { return eventTypes_1.RealtimeActions; } });
Object.defineProperty(exports, "formatEventName", { enumerable: true, get: function () { return eventTypes_1.formatEventName; } });
const metrics_1 = require("./observability/metrics");
Object.defineProperty(exports, "getRealtimeHealth", { enumerable: true, get: function () { return metrics_1.getRealtimeHealth; } });
/**
 * Initializes the entire real-time synchronization infrastructure:
 * 1. Redis pub/sub broker & resilient in-memory fallback
 * 2. WebSocket server attached to HTTP server
 * 3. Event subscriber listening on Redis channels
 */
async function initRealtimeInfrastructure(server) {
    console.log('[Realtime]: Initializing global real-time synchronization architecture...');
    // 1. Initialize WebSocket Server
    wsServer_1.wsServer.init(server);
    // 2. Initialize Redis Manager (Pub/Sub & Cache)
    await redisClient_1.redisManager.init();
    // 3. Initialize Event Subscriber (listens to Redis & forwards to WebSockets)
    await eventSubscriber_1.eventSubscriber.init();
    console.log('[Realtime]: Global real-time architecture ready (Event Publisher -> Redis -> Subscriber -> WebSocket).');
}
exports.default = {
    initRealtimeInfrastructure,
    redisManager: redisClient_1.redisManager,
    wsServer: wsServer_1.wsServer,
    eventPublisher: eventPublisher_1.eventPublisher,
    eventSubscriber: eventSubscriber_1.eventSubscriber,
    cacheManager: cacheManager_1.cacheManager,
    RealtimeEntities: eventTypes_1.RealtimeEntities,
    RealtimeActions: eventTypes_1.RealtimeActions,
    getRealtimeHealth: metrics_1.getRealtimeHealth
};
