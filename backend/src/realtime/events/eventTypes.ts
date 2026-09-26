/**
 * Realtime Event Standard Types & Constants
 * Defines structured event naming, schemas, and versioning for the ecosystem.
 */

export const RealtimeEntities = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  BANNER: 'banner',
  AD: 'ad',
  OFFER: 'offer',
  ORDER: 'order',
  VENDOR: 'vendor',
  DELIVERY_PARTNER: 'delivery_partner',
  AGENT: 'agent',
  MEMBERSHIP: 'membership',
  WALLET: 'wallet',
  NOTIFICATION: 'notification',
  SYSTEM: 'system'
} as const;

export type RealtimeEntityType = typeof RealtimeEntities[keyof typeof RealtimeEntities] | string;

export const RealtimeActions = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed',
  LOCATION_UPDATED: 'location_updated',
  ASSIGNED: 'assigned',
  SYNC: 'sync',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
} as const;

export type RealtimeActionType = typeof RealtimeActions[keyof typeof RealtimeActions] | string;

export interface EventTarget {
  role?: 'all' | 'customer' | 'vendor' | 'delivery' | 'admin' | 'agent' | string;
  userId?: string;
  room?: string;
}

export interface StandardEventPayload<T = any> {
  event: string;
  entity: string;
  entityId: string;
  action: string;
  timestamp: string;
  version: number;
  originInstanceId: string;
  target?: EventTarget;
  data?: T;
}

export const REDIS_CHANNELS = {
  GLOBAL_EVENTS: 'connect:realtime:events',
  CACHE_INVALIDATION: 'connect:realtime:cache_invalidate',
  METRICS: 'connect:realtime:metrics'
} as const;

/**
 * Format a standard event name, e.g. "PRODUCT_CREATED", "ORDER_STATUS_CHANGED"
 */
export function formatEventName(entity: string, action: string): string {
  const normEntity = entity.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const normAction = action.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return `${normEntity}_${normAction}`;
}
