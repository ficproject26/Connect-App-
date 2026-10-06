"use strict";
/**
 * Realtime Event Standard Types & Constants
 * Defines structured event naming, schemas, and versioning for the ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_CHANNELS = exports.RealtimeActions = exports.RealtimeEntities = void 0;
exports.formatEventName = formatEventName;
exports.RealtimeEntities = {
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
};
exports.RealtimeActions = {
    CREATED: 'created',
    UPDATED: 'updated',
    DELETED: 'deleted',
    STATUS_CHANGED: 'status_changed',
    LOCATION_UPDATED: 'location_updated',
    ASSIGNED: 'assigned',
    SYNC: 'sync',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};
exports.REDIS_CHANNELS = {
    GLOBAL_EVENTS: 'connect:realtime:events',
    CACHE_INVALIDATION: 'connect:realtime:cache_invalidate',
    METRICS: 'connect:realtime:metrics'
};
/**
 * Format a standard event name, e.g. "PRODUCT_CREATED", "ORDER_STATUS_CHANGED"
 */
function formatEventName(entity, action) {
    const normEntity = entity.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const normAction = action.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return `${normEntity}_${normAction}`;
}
