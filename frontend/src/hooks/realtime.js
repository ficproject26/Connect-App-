/**
 * Realtime Sync — Central Exports Barrel
 *
 * Import from this module to access all real-time synchronization utilities:
 *
 *   import { useRealtimeSync, useRealtimeRefresh } from '../hooks/realtime';
 *   import { useRealtime, RealtimeProvider }        from '../hooks/realtime';
 *   import { socketService }                        from '../hooks/realtime';
 */

// Core hooks
export { useRealtimeSync, useRealtimeRefresh } from './useRealtimeSync';

// Context provider + low-level connection hook
export { RealtimeProvider, useRealtime } from '../context/RealtimeContext';

// Raw socket service (for direct emit / join-room usage)
export { socketService } from '../services/socketService';
