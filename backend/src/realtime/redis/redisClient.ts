import Redis from 'ioredis';
import { EventEmitter } from 'events';

export type ConnectionMode = 'redis' | 'fallback';

export interface RedisConnectionStatus {
  isConnected: boolean;
  mode: ConnectionMode;
  host: string;
  port: number;
  latencyMs: number;
  lastError: string | null;
  reconnectAttempts: number;
}

class RedisManager {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private cacheClient: Redis | null = null;
  private inMemoryBus: EventEmitter = new EventEmitter();
  private mode: ConnectionMode = 'fallback';
  private isConnected: boolean = false;
  private lastError: string | null = null;
  private reconnectAttempts: number = 0;
  private subscriptions: Map<string, Set<(channel: string, message: string) => void>> = new Map();
  private host: string = '127.0.0.1';
  private port: number = 6379;
  private isInitializing: boolean = false;

  constructor() {
    this.inMemoryBus.setMaxListeners(200);
  }

  public async init(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    let redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL;
    if (redisUrl) {
      redisUrl = redisUrl.replace(/^redis-cli\s+-u\s+/i, '').trim();
    }
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = Number(process.env.REDIS_PORT) || 6379;
    const redisPassword = process.env.REDIS_PASSWORD || undefined;

    this.host = redisHost;
    this.port = redisPort;

    const redisOptions: any = {
      retryStrategy: (times: number) => {
        this.reconnectAttempts = times;
        if (times > 10) {
          // Keep fallback active while attempting backoff retry every 15 seconds
          return 15000;
        }
        return Math.min(times * 1000, 5000);
      },
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 4000,
      lazyConnect: true
    };

    if (redisPassword) {
      redisOptions.password = redisPassword;
    }

    try {
      if (redisUrl) {
        this.publisher = new Redis(redisUrl, redisOptions);
        this.subscriber = new Redis(redisUrl, redisOptions);
        this.cacheClient = new Redis(redisUrl, redisOptions);
      } else {
        this.publisher = new Redis(this.port, this.host, redisOptions);
        this.subscriber = new Redis(this.port, this.host, redisOptions);
        this.cacheClient = new Redis(this.port, this.host, redisOptions);
      }

      this.setupErrorHandling(this.publisher, 'Publisher');
      this.setupErrorHandling(this.subscriber, 'Subscriber');
      this.setupErrorHandling(this.cacheClient, 'CacheClient');

      // Attempt initial connection with timeout protection
      await Promise.all([
        this.publisher.connect().catch((err: any) => { throw err; }),
        this.subscriber.connect().catch((err: any) => { throw err; }),
        this.cacheClient.connect().catch((err: any) => { throw err; })
      ]);

      this.mode = 'redis';
      this.isConnected = true;
      this.lastError = null;
      console.log(`[Redis]: Successfully connected to Redis instance at ${this.host}:${this.port}`);

      // Handle incoming messages on Redis subscriber
      this.subscriber.on('message', (channel: string, message: string) => {
        this.dispatchMessage(channel, message);
      });

      // Re-subscribe to any channels previously registered
      for (const channel of this.subscriptions.keys()) {
        await this.subscriber.subscribe(channel).catch(() => {});
      }
    } catch (err: any) {
      this.mode = 'fallback';
      this.isConnected = false;
      this.lastError = err.message || 'Connection failed';
      console.warn(`[Redis]: Redis is unavailable (${err.message || 'offline'}). Seamlessly using resilient in-memory event bus and cache with background reconnect.`);
    } finally {
      this.isInitializing = false;
    }
  }

  private setupErrorHandling(client: Redis | null, name: string) {
    if (!client) return;

    client.on('error', (err: any) => {
      this.lastError = err.message || 'Redis error';
      if (this.mode === 'redis') {
        this.mode = 'fallback';
        this.isConnected = false;
        console.warn(`[Redis]: ${name} connection dropped (${err.message}). Switched to in-memory fallback.`);
      }
    });

    client.on('ready', () => {
      if (this.mode !== 'redis') {
        this.mode = 'redis';
        this.isConnected = true;
        this.lastError = null;
        console.log(`[Redis]: ${name} connection ready. Operating in full Redis Pub/Sub mode.`);
      }
    });

    client.on('close', () => {
      if (this.isConnected) {
        this.isConnected = false;
        this.mode = 'fallback';
        console.warn(`[Redis]: ${name} connection closed. Switched to in-memory fallback.`);
      }
    });
  }

  public async publish(channel: string, message: string): Promise<number> {
    if (this.mode === 'redis' && this.publisher && this.isConnected) {
      try {
        return await this.publisher.publish(channel, message);
      } catch (err: any) {
        console.warn(`[Redis]: Failed to publish via Redis (${err.message}), falling back to memory bus`);
        this.mode = 'fallback';
      }
    }

    // In-memory dispatch
    this.inMemoryBus.emit(channel, message);
    this.dispatchMessage(channel, message);
    return 1;
  }

  public async subscribe(channel: string, handler: (channel: string, message: string) => void): Promise<void> {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(handler);

    if (this.mode === 'redis' && this.subscriber && this.isConnected) {
      try {
        await this.subscriber.subscribe(channel);
      } catch (err: any) {
        console.warn(`[Redis]: Failed to subscribe via Redis (${err.message})`);
      }
    }
  }

  public async unsubscribe(channel: string, handler?: (channel: string, message: string) => void): Promise<void> {
    if (!this.subscriptions.has(channel)) return;

    if (handler) {
      this.subscriptions.get(channel)!.delete(handler);
      if (this.subscriptions.get(channel)!.size === 0) {
        this.subscriptions.delete(channel);
      }
    } else {
      this.subscriptions.delete(channel);
    }

    if (!this.subscriptions.has(channel) && this.mode === 'redis' && this.subscriber && this.isConnected) {
      try {
        await this.subscriber.unsubscribe(channel);
      } catch (err: any) {
        console.warn(`[Redis]: Failed to unsubscribe via Redis (${err.message})`);
      }
    }
  }

  private dispatchMessage(channel: string, message: string): void {
    const handlers = this.subscriptions.get(channel);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(channel, message);
        } catch (handlerErr: any) {
          console.error(`[Redis]: Error in subscriber handler for channel "${channel}":`, handlerErr);
        }
      });
    }
  }

  public getCacheClient(): Redis | null {
    if (this.mode === 'redis' && this.isConnected && this.cacheClient) {
      return this.cacheClient;
    }
    return null;
  }

  public async ping(): Promise<number> {
    const start = Date.now();
    if (this.mode === 'redis' && this.publisher && this.isConnected) {
      try {
        await this.publisher.ping();
        return Date.now() - start;
      } catch {
        return -1;
      }
    }
    return 0; // In-memory responds immediately
  }

  public async getStatus(): Promise<RedisConnectionStatus> {
    const latency = await this.ping();
    return {
      isConnected: this.mode === 'redis' && this.isConnected,
      mode: this.mode,
      host: this.host,
      port: this.port,
      latencyMs: latency,
      lastError: this.lastError,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export const redisManager = new RedisManager();
export default redisManager;
