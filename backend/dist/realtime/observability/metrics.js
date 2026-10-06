"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtimeHealth = getRealtimeHealth;
const redisClient_1 = require("../redis/redisClient");
const wsServer_1 = require("../websocket/wsServer");
const cacheManager_1 = require("../cache/cacheManager");
const eventSubscriber_1 = require("../events/eventSubscriber");
const eventPublisher_1 = require("../events/eventPublisher");
async function getRealtimeHealth() {
    const redisStatus = await redisClient_1.redisManager.getStatus();
    const wsStats = wsServer_1.wsServer.getStats();
    const cacheStats = cacheManager_1.cacheManager.getStats();
    const eventStats = eventSubscriber_1.eventSubscriber.getStats();
    const totalCacheRequests = cacheStats.hits + cacheStats.misses;
    const hitRate = totalCacheRequests > 0
        ? `${((cacheStats.hits / totalCacheRequests) * 100).toFixed(1)}%`
        : '0%';
    const isHealthy = redisStatus.mode === 'redis' || redisStatus.mode === 'fallback';
    return {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        instanceId: eventPublisher_1.eventPublisher.getInstanceId(),
        redis: {
            connected: redisStatus.isConnected,
            mode: redisStatus.mode,
            host: redisStatus.host,
            port: redisStatus.port,
            latencyMs: redisStatus.latencyMs
        },
        websocket: {
            activeConnections: wsStats.activeConnections,
            totalConnectionsHandled: wsStats.totalConnectionsHandled,
            totalMessagesDelivered: wsStats.totalMessagesDelivered
        },
        cache: {
            hits: cacheStats.hits,
            misses: cacheStats.misses,
            keysCount: cacheStats.keysCount,
            hitRate
        },
        events: {
            totalEventsReceived: eventStats.totalEventsReceived,
            averagePropagationLatencyMs: eventStats.averagePropagationLatencyMs
        }
    };
}
