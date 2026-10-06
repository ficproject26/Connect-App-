"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSubscriber = void 0;
const redisClient_1 = require("../redis/redisClient");
const wsServer_1 = require("../websocket/wsServer");
const cacheManager_1 = require("../cache/cacheManager");
const eventTypes_1 = require("./eventTypes");
class EventSubscriber {
    constructor() {
        this.entityVersions = new Map();
        this.processedEventIds = new Set();
        this.isSubscribed = false;
        this.totalEventsReceived = 0;
        this.totalLatencyMs = 0;
    }
    async init() {
        if (this.isSubscribed)
            return;
        try {
            await redisClient_1.redisManager.subscribe(eventTypes_1.REDIS_CHANNELS.GLOBAL_EVENTS, (channel, message) => {
                this.handleIncomingMessage(message);
            });
            this.isSubscribed = true;
            console.log(`[EventSubscriber]: Subscribed to Redis channel "${eventTypes_1.REDIS_CHANNELS.GLOBAL_EVENTS}"`);
        }
        catch (err) {
            console.error('[EventSubscriber]: Subscription initialization error:', err);
        }
        // Clean up processed event IDs every 60 seconds
        setInterval(() => {
            this.processedEventIds.clear();
        }, 60000);
    }
    async handleIncomingMessage(rawMessage) {
        try {
            const event = JSON.parse(rawMessage);
            if (!event || !event.event || !event.entity || !event.entityId) {
                console.warn('[EventSubscriber]: Dropping malformed event:', rawMessage);
                return;
            }
            this.totalEventsReceived++;
            // 1. Deduplication check
            const eventKey = `${event.event}:${event.entity}:${event.entityId}:${event.version}`;
            if (this.processedEventIds.has(eventKey)) {
                return; // Suppress duplicate
            }
            this.processedEventIds.add(eventKey);
            // 2. Out-of-order check (prevent older version from overwriting newer state)
            const entityKey = `${event.entity}:${event.entityId}`;
            const lastVersion = this.entityVersions.get(entityKey) || 0;
            if (event.version < lastVersion) {
                console.warn(`[EventSubscriber]: Dropping out-of-order event for ${entityKey} (Incoming v${event.version} < Current v${lastVersion})`);
                return;
            }
            this.entityVersions.set(entityKey, event.version);
            // 3. Measure Propagation Latency (from creation timestamp to subscriber receive)
            const eventTime = new Date(event.timestamp).getTime();
            const now = Date.now();
            const latency = Math.max(0, now - eventTime);
            this.totalLatencyMs += latency;
            console.log(`[EventSubscriber]: Received ${event.event} for ${event.entity}#${event.entityId} (Propagation Latency: ${latency}ms)`);
            // 4. Invalidate local cache if event originated from another instance
            await this.invalidateLocalCache(event.entity, event.entityId);
            // 5. Deliver to connected WebSocket clients
            wsServer_1.wsServer.deliverEvent(event);
        }
        catch (err) {
            console.error('[EventSubscriber]: Error parsing/handling incoming event:', err);
        }
    }
    async invalidateLocalCache(entity, entityId) {
        switch (entity) {
            case eventTypes_1.RealtimeEntities.PRODUCT:
                await cacheManager_1.cacheManager.invalidatePattern('cache:products:*', false);
                break;
            case eventTypes_1.RealtimeEntities.CATEGORY:
                await cacheManager_1.cacheManager.invalidatePattern('cache:categories:*', false);
                break;
            case eventTypes_1.RealtimeEntities.BANNER:
                await cacheManager_1.cacheManager.invalidatePattern('cache:banners:*', false);
                break;
            case eventTypes_1.RealtimeEntities.AD:
                await cacheManager_1.cacheManager.invalidatePattern('cache:ads:*', false);
                break;
            case eventTypes_1.RealtimeEntities.OFFER:
                await cacheManager_1.cacheManager.invalidatePattern('cache:offers:*', false);
                break;
            case eventTypes_1.RealtimeEntities.ORDER:
                await cacheManager_1.cacheManager.invalidate(`cache:orders:${entityId}`, false);
                break;
            default:
                break;
        }
    }
    getStats() {
        const avgLatency = this.totalEventsReceived > 0
            ? (this.totalLatencyMs / this.totalEventsReceived).toFixed(1)
            : 0;
        return {
            totalEventsReceived: this.totalEventsReceived,
            averagePropagationLatencyMs: Number(avgLatency),
            trackedEntitiesCount: this.entityVersions.size
        };
    }
}
exports.eventSubscriber = new EventSubscriber();
exports.default = exports.eventSubscriber;
