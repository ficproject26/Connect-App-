import { redisManager } from '../redis/redisClient';
import { cacheManager } from '../cache/cacheManager';
import {
  StandardEventPayload,
  EventTarget,
  REDIS_CHANNELS,
  formatEventName,
  RealtimeEntities
} from './eventTypes';

// Unique identifier for this running backend instance
const INSTANCE_ID = `backend_${process.pid}_${Math.random().toString(36).substring(2, 8)}`;

class EventPublisher {
  private entityVersions: Map<string, number> = new Map();
  private recentPublishHashes: Map<string, number> = new Map();
  private instanceId: string = INSTANCE_ID;

  constructor() {
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

  public getInstanceId(): string {
    return this.instanceId;
  }

  /**
   * Get the next incremental version for an entity
   */
  public getNextVersion(entityId: string): number {
    const current = this.entityVersions.get(entityId) || 0;
    const next = current + 1;
    this.entityVersions.set(entityId, next);
    return next;
  }

  /**
   * Publishes an event to Redis Pub/Sub after database change has committed.
   */
  public async publishEvent<T = any>(
    entity: string,
    action: string,
    entityId: string,
    data?: T,
    target?: EventTarget
  ): Promise<StandardEventPayload<T> | null> {
    const normalizedEntity = entity.toLowerCase();
    const normalizedAction = action.toLowerCase();
    const eventName = formatEventName(normalizedEntity, normalizedAction);
    const version = this.getNextVersion(entityId);
    const timestamp = new Date().toISOString();

    // 1. Deduplication Check (sliding window 1.5 seconds)
    const dedupKey = `${normalizedEntity}:${entityId}:${normalizedAction}:${version}`;
    const now = Date.now();
    if (this.recentPublishHashes.has(dedupKey) && (now - this.recentPublishHashes.get(dedupKey)! < 1500)) {
      console.log(`[EventPublisher]: Suppressed duplicate event for ${dedupKey}`);
      return null;
    }
    this.recentPublishHashes.set(dedupKey, now);

    const payload: StandardEventPayload<T> = {
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
      await redisManager.publish(REDIS_CHANNELS.GLOBAL_EVENTS, message);

      console.log(`[EventPublisher]: Published ${eventName} (Entity: ${normalizedEntity}#${entityId}, v${version}) via Redis`);
      return payload;
    } catch (err: any) {
      console.error(`[EventPublisher]: Error publishing event ${eventName}:`, err);
      return payload;
    }
  }

  private async invalidateAffectedCaches(entity: string, entityId: string): Promise<void> {
    switch (entity) {
      case RealtimeEntities.PRODUCT:
        await cacheManager.invalidatePattern('cache:products:*');
        break;
      case RealtimeEntities.CATEGORY:
        await cacheManager.invalidatePattern('cache:categories:*');
        break;
      case RealtimeEntities.BANNER:
        await cacheManager.invalidatePattern('cache:banners:*');
        break;
      case RealtimeEntities.AD:
        await cacheManager.invalidatePattern('cache:ads:*');
        break;
      case RealtimeEntities.OFFER:
        await cacheManager.invalidatePattern('cache:offers:*');
        break;
      case RealtimeEntities.VENDOR:
        await cacheManager.invalidatePattern('cache:products:*');
        await cacheManager.invalidatePattern('cache:vendors:*');
        break;
      case RealtimeEntities.ORDER:
        await cacheManager.invalidate(`cache:orders:${entityId}`);
        break;
      default:
        break;
    }
  }
}

export const eventPublisher = new EventPublisher();
export default eventPublisher;
