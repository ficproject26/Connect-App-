import { redisManager } from '../redis/redisClient';
import { REDIS_CHANNELS } from '../events/eventTypes';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keysCount: number;
  lastInvalidation: string | null;
}

class CacheManager {
  private localCache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keysCount: 0,
    lastInvalidation: null
  };

  constructor() {
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

  private async setupInvalidationSubscriber(): Promise<void> {
    try {
      await redisManager.subscribe(REDIS_CHANNELS.CACHE_INVALIDATION, (channel, message) => {
        try {
          const { pattern, key } = JSON.parse(message);
          if (key) {
            this.localCache.delete(key);
          } else if (pattern) {
            this.purgeLocalPattern(pattern);
          }
          this.stats.lastInvalidation = new Date().toISOString();
        } catch (err: any) {
          console.error('[Cache]: Error handling remote cache invalidation:', err);
        }
      });
    } catch (err: any) {
      console.warn('[Cache]: Subscriber setup postponed:', err.message);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    // 1. Check L1 in-memory cache
    const local = this.localCache.get(key);
    if (local && local.expiresAt > now) {
      this.stats.hits++;
      return local.data as T;
    }
    if (local && local.expiresAt <= now) {
      this.localCache.delete(key);
    }

    // 2. Check L2 Redis cache if available
    const redis = redisManager.getCacheClient();
    if (redis) {
      try {
        const raw = await redis.get(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Populate L1 cache with remaining TTL or 30s
          this.localCache.set(key, { data: parsed, expiresAt: now + 30000 });
          this.stats.hits++;
          return parsed as T;
        }
      } catch (err: any) {
        console.warn(`[Cache]: Redis get error for key "${key}":`, err.message);
      }
    }

    this.stats.misses++;
    return null;
  }

  public async set<T>(key: string, data: T, ttlSeconds: number = 60): Promise<void> {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    // Save to L1 cache
    this.localCache.set(key, { data, expiresAt });
    this.stats.keysCount = this.localCache.size;

    // Save to L2 Redis cache if available
    const redis = redisManager.getCacheClient();
    if (redis) {
      try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      } catch (err: any) {
        console.warn(`[Cache]: Redis set error for key "${key}":`, err.message);
      }
    }
  }

  public async invalidate(key: string, broadcastCrossInstance: boolean = true): Promise<void> {
    this.localCache.delete(key);
    this.stats.keysCount = this.localCache.size;
    this.stats.lastInvalidation = new Date().toISOString();

    const redis = redisManager.getCacheClient();
    if (redis) {
      try {
        await redis.del(key);
      } catch (err: any) {
        console.warn(`[Cache]: Redis del error for key "${key}":`, err.message);
      }
    }

    if (broadcastCrossInstance) {
      await redisManager.publish(REDIS_CHANNELS.CACHE_INVALIDATION, JSON.stringify({ key }));
    }
  }

  public async invalidatePattern(pattern: string, broadcastCrossInstance: boolean = true): Promise<void> {
    this.purgeLocalPattern(pattern);
    this.stats.keysCount = this.localCache.size;
    this.stats.lastInvalidation = new Date().toISOString();

    const redis = redisManager.getCacheClient();
    if (redis) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (err: any) {
        console.warn(`[Cache]: Redis keys/del error for pattern "${pattern}":`, err.message);
      }
    }

    if (broadcastCrossInstance) {
      await redisManager.publish(REDIS_CHANNELS.CACHE_INVALIDATION, JSON.stringify({ pattern }));
    }
  }

  private purgeLocalPattern(pattern: string): void {
    // Convert glob-like pattern "products:*" to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.localCache.keys()) {
      if (regex.test(key)) {
        this.localCache.delete(key);
      }
    }
  }

  public getStats(): CacheStats {
    return {
      ...this.stats,
      keysCount: this.localCache.size
    };
  }
}

export const cacheManager = new CacheManager();
export default cacheManager;
