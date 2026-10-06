"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = void 0;
const redisClient_1 = require("../redis/redisClient");
const eventTypes_1 = require("../events/eventTypes");
class CacheManager {
    constructor() {
        this.localCache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            keysCount: 0,
            lastInvalidation: null
        };
        // Listen for cross-instance cache invalidations from Redis Pub/Sub
        this.setupInvalidationSubscriber();
        // Periodic sweep of expired in-memory items every 60 seconds
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.localCache.entries()) {
                if (entry.expiresAt <= now) {
                    this.localCache.delete(key);
                }
            }
            this.stats.keysCount = this.localCache.size;
        }, 60000);
    }
    async setupInvalidationSubscriber() {
        try {
            await redisClient_1.redisManager.subscribe(eventTypes_1.REDIS_CHANNELS.CACHE_INVALIDATION, (channel, message) => {
                try {
                    const { pattern, key } = JSON.parse(message);
                    if (key) {
                        this.localCache.delete(key);
                    }
                    else if (pattern) {
                        this.purgeLocalPattern(pattern);
                    }
                    this.stats.lastInvalidation = new Date().toISOString();
                }
                catch (err) {
                    console.error('[Cache]: Error handling remote cache invalidation:', err);
                }
            });
        }
        catch (err) {
            console.warn('[Cache]: Subscriber setup postponed:', err.message);
        }
    }
    async get(key) {
        const now = Date.now();
        // 1. Check L1 in-memory cache
        const local = this.localCache.get(key);
        if (local && local.expiresAt > now) {
            this.stats.hits++;
            return local.data;
        }
        if (local && local.expiresAt <= now) {
            this.localCache.delete(key);
        }
        // 2. Check L2 Redis cache if available
        const redis = redisClient_1.redisManager.getCacheClient();
        if (redis) {
            try {
                const raw = await redis.get(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Populate L1 cache with remaining TTL or 30s
                    this.localCache.set(key, { data: parsed, expiresAt: now + 30000 });
                    this.stats.hits++;
                    return parsed;
                }
            }
            catch (err) {
                console.warn(`[Cache]: Redis get error for key "${key}":`, err.message);
            }
        }
        this.stats.misses++;
        return null;
    }
    async set(key, data, ttlSeconds = 60) {
        const now = Date.now();
        const expiresAt = now + ttlSeconds * 1000;
        // Save to L1 cache
        this.localCache.set(key, { data, expiresAt });
        this.stats.keysCount = this.localCache.size;
        // Save to L2 Redis cache if available
        const redis = redisClient_1.redisManager.getCacheClient();
        if (redis) {
            try {
                await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            }
            catch (err) {
                console.warn(`[Cache]: Redis set error for key "${key}":`, err.message);
            }
        }
    }
    async invalidate(key, broadcastCrossInstance = true) {
        this.localCache.delete(key);
        this.stats.keysCount = this.localCache.size;
        this.stats.lastInvalidation = new Date().toISOString();
        const redis = redisClient_1.redisManager.getCacheClient();
        if (redis) {
            try {
                await redis.del(key);
            }
            catch (err) {
                console.warn(`[Cache]: Redis del error for key "${key}":`, err.message);
            }
        }
        if (broadcastCrossInstance) {
            await redisClient_1.redisManager.publish(eventTypes_1.REDIS_CHANNELS.CACHE_INVALIDATION, JSON.stringify({ key }));
        }
    }
    async invalidatePattern(pattern, broadcastCrossInstance = true) {
        this.purgeLocalPattern(pattern);
        this.stats.keysCount = this.localCache.size;
        this.stats.lastInvalidation = new Date().toISOString();
        const redis = redisClient_1.redisManager.getCacheClient();
        if (redis) {
            try {
                const keys = await redis.keys(pattern);
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            }
            catch (err) {
                console.warn(`[Cache]: Redis keys/del error for pattern "${pattern}":`, err.message);
            }
        }
        if (broadcastCrossInstance) {
            await redisClient_1.redisManager.publish(eventTypes_1.REDIS_CHANNELS.CACHE_INVALIDATION, JSON.stringify({ pattern }));
        }
    }
    purgeLocalPattern(pattern) {
        // Convert glob-like pattern "products:*" to regex
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of this.localCache.keys()) {
            if (regex.test(key)) {
                this.localCache.delete(key);
            }
        }
    }
    getStats() {
        return {
            ...this.stats,
            keysCount: this.localCache.size
        };
    }
}
exports.cacheManager = new CacheManager();
exports.default = exports.cacheManager;
