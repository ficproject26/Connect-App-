"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventPublisher = void 0;
const redisClient_1 = require("../redis/redisClient");
const cacheManager_1 = require("../cache/cacheManager");
const eventTypes_1 = require("./eventTypes");
// Unique identifier for this running backend instance
const INSTANCE_ID = `backend_${process.pid}_${Math.random().toString(36).substring(2, 8)}`;
class EventPublisher {
    constructor() {
        this.entityVersions = new Map();
        this.recentPublishHashes = new Map();
        this.instanceId = INSTANCE_ID;
        // Clean up recent publish hash cache every 30 seconds
        setInterval(() => {
            const now = Date.now();
            for (const [hash, timestamp] of this.recentPublishHashes.entries()) {
                if (now - timestamp > 5000) {
                    this.recentPublishHashes.delete(hash);
                }
            }
        }, 30000);
    }
    getInstanceId() {
        return this.instanceId;
    }
    /**
     * Get the next incremental version for an entity
     */
    getNextVersion(entityId) {
        const current = this.entityVersions.get(entityId) || 0;
        const next = current + 1;
        this.entityVersions.set(entityId, next);
        return next;
    }
    /**
     * Publishes an event to Redis Pub/Sub after database change has committed.
     */
    async publishEvent(entity, action, entityId, data, target) {
        const normalizedEntity = entity.toLowerCase();
        const normalizedAction = action.toLowerCase();
        const eventName = (0, eventTypes_1.formatEventName)(normalizedEntity, normalizedAction);
        const version = this.getNextVersion(entityId);
        const timestamp = new Date().toISOString();
        // 1. Deduplication Check (sliding window 1.5 seconds)
        const dedupKey = `${normalizedEntity}:${entityId}:${normalizedAction}:${version}`;
        const now = Date.now();
        if (this.recentPublishHashes.has(dedupKey) && (now - this.recentPublishHashes.get(dedupKey) < 1500)) {
            console.log(`[EventPublisher]: Suppressed duplicate event for ${dedupKey}`);
            return null;
        }
        this.recentPublishHashes.set(dedupKey, now);
        const payload = {
            event: eventName,
            entity: normalizedEntity,
            entityId: String(entityId),
            action: normalizedAction,
            timestamp,
            version,
            originInstanceId: this.instanceId,
            target,
            data
        };
        try {
            // 2. Automated Event-Driven Cache Invalidation
            await this.invalidateAffectedCaches(normalizedEntity, entityId);
            // 3. Publish to Redis Pub/Sub Message Broker
            const message = JSON.stringify(payload);
            await redisClient_1.redisManager.publish(eventTypes_1.REDIS_CHANNELS.GLOBAL_EVENTS, message);
            console.log(`[EventPublisher]: Published ${eventName} (Entity: ${normalizedEntity}#${entityId}, v${version}) via Redis`);
            return payload;
        }
        catch (err) {
            console.error(`[EventPublisher]: Error publishing event ${eventName}:`, err);
            return payload;
        }
    }
    async invalidateAffectedCaches(entity, entityId) {
        switch (entity) {
            case eventTypes_1.RealtimeEntities.PRODUCT:
                await cacheManager_1.cacheManager.invalidatePattern('cache:products:*');
                break;
            case eventTypes_1.RealtimeEntities.CATEGORY:
                await cacheManager_1.cacheManager.invalidatePattern('cache:categories:*');
                break;
            case eventTypes_1.RealtimeEntities.BANNER:
                await cacheManager_1.cacheManager.invalidatePattern('cache:banners:*');
                break;
            case eventTypes_1.RealtimeEntities.AD:
                await cacheManager_1.cacheManager.invalidatePattern('cache:ads:*');
                break;
            case eventTypes_1.RealtimeEntities.OFFER:
                await cacheManager_1.cacheManager.invalidatePattern('cache:offers:*');
                break;
            case eventTypes_1.RealtimeEntities.VENDOR:
                await cacheManager_1.cacheManager.invalidatePattern('cache:products:*');
                await cacheManager_1.cacheManager.invalidatePattern('cache:vendors:*');
                break;
            case eventTypes_1.RealtimeEntities.ORDER:
                await cacheManager_1.cacheManager.invalidate(`cache:orders:${entityId}`);
                break;
            default:
                break;
        }
    }
}
exports.eventPublisher = new EventPublisher();
exports.default = exports.eventPublisher;
