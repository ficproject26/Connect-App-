import { redisManager } from '../redis/redisClient';
import { wsServer } from '../websocket/wsServer';
import { cacheManager } from '../cache/cacheManager';
import {
  StandardEventPayload,
  REDIS_CHANNELS,
  RealtimeEntities
} from './eventTypes';

class EventSubscriber {
  private entityVersions: Map<string, number> = new Map();
  private processedEventIds: Set<string> = new Set();
  private isSubscribed: boolean = false;
  private totalEventsReceived: number = 0;
  private totalLatencyMs: number = 0;

  public async init(): Promise<void> {
    if (this.isSubscribed) return;

    try {
      await redisManager.subscribe(REDIS_CHANNELS.GLOBAL_EVENTS, (channel, message) => {
        this.handleIncomingMessage(message);
      });
      this.isSubscribed = true;
      console.log(`[EventSubscriber]: Subscribed to Redis channel "${REDIS_CHANNELS.GLOBAL_EVENTS}"`);
    } catch (err: any) {
      console.error('[EventSubscriber]: Subscription initialization error:', err);
    }

    // Clean up processed event IDs every 60 seconds
    setInterval(() => {
      this.processedEventIds.clear();
    }, 60000);
  }

  private async handleIncomingMessage(rawMessage: string): Promise<void> {
    try {
      const event: StandardEventPayload = JSON.parse(rawMessage);
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
      wsServer.deliverEvent(event);
    } catch (err: any) {
      console.error('[EventSubscriber]: Error parsing/handling incoming event:', err);
    }
  }

  private async invalidateLocalCache(entity: string, entityId: string): Promise<void> {
    switch (entity) {
      case RealtimeEntities.PRODUCT:
        await cacheManager.invalidatePattern('cache:products:*', false);
        break;
      case RealtimeEntities.CATEGORY:
        await cacheManager.invalidatePattern('cache:categories:*', false);
        break;
      case RealtimeEntities.BANNER:
        await cacheManager.invalidatePattern('cache:banners:*', false);
        break;
      case RealtimeEntities.AD:
        await cacheManager.invalidatePattern('cache:ads:*', false);
        break;
      case RealtimeEntities.OFFER:
        await cacheManager.invalidatePattern('cache:offers:*', false);
        break;
      case RealtimeEntities.ORDER:
        await cacheManager.invalidate(`cache:orders:${entityId}`, false);
        break;
      default:
        break;
    }
  }

  public getStats() {
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

export const eventSubscriber = new EventSubscriber();
export default eventSubscriber;
