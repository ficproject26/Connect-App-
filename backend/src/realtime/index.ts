import http from 'http';
import { redisManager } from './redis/redisClient';
import { wsServer } from './websocket/wsServer';
import { eventSubscriber } from './events/eventSubscriber';
import { eventPublisher } from './events/eventPublisher';
import { cacheManager } from './cache/cacheManager';
import { RealtimeEntities, RealtimeActions, StandardEventPayload, formatEventName } from './events/eventTypes';
import { getRealtimeHealth } from './observability/metrics';

/**
 * Initializes the entire real-time synchronization infrastructure:
 * 1. Redis pub/sub broker & resilient in-memory fallback
 * 2. WebSocket server attached to HTTP server
 * 3. Event subscriber listening on Redis channels
 */
export async function initRealtimeInfrastructure(server: http.Server): Promise<void> {
  console.log('[Realtime]: Initializing global real-time synchronization architecture...');

  // 1. Initialize WebSocket Server
  wsServer.init(server);

  // 2. Initialize Redis Manager (Pub/Sub & Cache)
  await redisManager.init();

  // 3. Initialize Event Subscriber (listens to Redis & forwards to WebSockets)
  await eventSubscriber.init();

  console.log('[Realtime]: Global real-time architecture ready (Event Publisher -> Redis -> Subscriber -> WebSocket).');
}

export {
  redisManager,
  wsServer,
  eventPublisher,
  eventSubscriber,
  cacheManager,
  RealtimeEntities,
  RealtimeActions,
  StandardEventPayload,
  formatEventName,
  getRealtimeHealth
};

export default {
  initRealtimeInfrastructure,
  redisManager,
  wsServer,
  eventPublisher,
  eventSubscriber,
  cacheManager,
  RealtimeEntities,
  RealtimeActions,
  getRealtimeHealth
};
