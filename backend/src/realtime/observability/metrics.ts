import { redisManager } from '../redis/redisClient';
import { wsServer } from '../websocket/wsServer';
import { cacheManager } from '../cache/cacheManager';
import { eventSubscriber } from '../events/eventSubscriber';
import { eventPublisher } from '../events/eventPublisher';

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  instanceId: string;
  redis: {
    connected: boolean;
    mode: string;
    host: string;
    port: number;
    latencyMs: number;
  };
  websocket: {
    activeConnections: number;
    totalConnectionsHandled: number;
    totalMessagesDelivered: number;
  };
  cache: {
    hits: number;
    misses: number;
    keysCount: number;
    hitRate: string;
  };
  events: {
    totalEventsReceived: number;
    averagePropagationLatencyMs: number;
  };
}

export async function getRealtimeHealth(): Promise<HealthReport> {
  const redisStatus = await redisManager.getStatus();
  const wsStats = wsServer.getStats();
  const cacheStats = cacheManager.getStats();
  const eventStats = eventSubscriber.getStats();

  const totalCacheRequests = cacheStats.hits + cacheStats.misses;
  const hitRate = totalCacheRequests > 0
    ? `${((cacheStats.hits / totalCacheRequests) * 100).toFixed(1)}%`
    : '0%';

  const isHealthy = redisStatus.mode === 'redis' || redisStatus.mode === 'fallback';

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    instanceId: eventPublisher.getInstanceId(),
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
