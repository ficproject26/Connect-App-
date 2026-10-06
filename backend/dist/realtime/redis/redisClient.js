"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisManager = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const events_1 = require("events");
class RedisManager {
    constructor() {
        this.publisher = null;
        this.subscriber = null;
        this.cacheClient = null;
        this.inMemoryBus = new events_1.EventEmitter();
        this.mode = 'fallback';
        this.isConnected = false;
        this.lastError = null;
        this.reconnectAttempts = 0;
        this.subscriptions = new Map();
        this.host = '127.0.0.1';
        this.port = 6379;
        this.isInitializing = false;
        this.inMemoryBus.setMaxListeners(200);
    }
    async init() {
        if (this.isInitializing)
            return;
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
        const redisOptions = {
            retryStrategy: (times) => {
                this.reconnectAttempts = times;
                return Math.min(times * 1000, 10000);
            },
            maxRetriesPerRequest: null,
            enableOfflineQueue: true,
            connectTimeout: 10000,
            keepAlive: 10000,
            lazyConnect: true
        };
        if (redisPassword) {
            redisOptions.password = redisPassword;
        }
        try {
            if (redisUrl) {
                this.publisher = new ioredis_1.default(redisUrl, redisOptions);
                this.subscriber = new ioredis_1.default(redisUrl, redisOptions);
                this.cacheClient = new ioredis_1.default(redisUrl, redisOptions);
            }
            else {
                this.publisher = new ioredis_1.default(this.port, this.host, redisOptions);
                this.subscriber = new ioredis_1.default(this.port, this.host, redisOptions);
                this.cacheClient = new ioredis_1.default(this.port, this.host, redisOptions);
            }
            this.setupErrorHandling(this.publisher, 'Publisher');
            this.setupErrorHandling(this.subscriber, 'Subscriber');
            this.setupErrorHandling(this.cacheClient, 'CacheClient');
            // Attempt initial connection with timeout protection
            await Promise.all([
                this.publisher.connect().catch((err) => { throw err; }),
                this.subscriber.connect().catch((err) => { throw err; }),
                this.cacheClient.connect().catch((err) => { throw err; })
            ]);
            this.mode = 'redis';
            this.isConnected = true;
            this.lastError = null;
            console.log(`[Redis]: Successfully connected to Redis instance at ${this.host}:${this.port}`);
            // Handle incoming messages on Redis subscriber
            this.subscriber.on('message', (channel, message) => {
                this.dispatchMessage(channel, message);
            });
            // Re-subscribe to any channels previously registered
            for (const channel of this.subscriptions.keys()) {
                await this.subscriber.subscribe(channel).catch(() => { });
            }
        }
        catch (err) {
            this.mode = 'fallback';
            this.isConnected = false;
            this.lastError = err.message || 'Connection failed';
            console.warn(`[Redis]: Redis is unavailable (${err.message || 'offline'}). Seamlessly using resilient in-memory event bus and cache with background reconnect.`);
        }
        finally {
            this.isInitializing = false;
        }
    }
    setupErrorHandling(client, name) {
        if (!client)
            return;
        client.on('error', (err) => {
            this.lastError = err?.message || 'Redis error';
            if (this.mode === 'redis') {
                this.mode = 'fallback';
                this.isConnected = false;
                console.warn(`[Redis]: ${name} connection dropped (${err?.message || 'offline'}). Switched to in-memory fallback.`);
            }
        });
        client.on('ready', async () => {
            this.isConnected = true;
            this.lastError = null;
            if (this.mode !== 'redis') {
                this.mode = 'redis';
                console.log(`[Redis]: ${name} connection ready. Operating in full Redis Pub/Sub mode.`);
            }
            if (name === 'Subscriber' && this.subscriber) {
                for (const channel of this.subscriptions.keys()) {
                    await this.subscriber.subscribe(channel).catch(() => { });
                }
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
    async publish(channel, message) {
        if (this.mode === 'redis' && this.publisher && this.isConnected) {
            try {
                return await this.publisher.publish(channel, message);
            }
            catch (err) {
                console.warn(`[Redis]: Failed to publish via Redis (${err.message}), falling back to memory bus`);
                this.mode = 'fallback';
            }
        }
        // In-memory dispatch
        this.inMemoryBus.emit(channel, message);
        this.dispatchMessage(channel, message);
        return 1;
    }
    async subscribe(channel, handler) {
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, new Set());
        }
        this.subscriptions.get(channel).add(handler);
        if (this.mode === 'redis' && this.subscriber && this.isConnected) {
            try {
                await this.subscriber.subscribe(channel);
            }
            catch (err) {
                console.warn(`[Redis]: Failed to subscribe via Redis (${err.message})`);
            }
        }
    }
    async unsubscribe(channel, handler) {
        if (!this.subscriptions.has(channel))
            return;
        if (handler) {
            this.subscriptions.get(channel).delete(handler);
            if (this.subscriptions.get(channel).size === 0) {
                this.subscriptions.delete(channel);
            }
        }
        else {
            this.subscriptions.delete(channel);
        }
        if (!this.subscriptions.has(channel) && this.mode === 'redis' && this.subscriber && this.isConnected) {
            try {
                await this.subscriber.unsubscribe(channel);
            }
            catch (err) {
                console.warn(`[Redis]: Failed to unsubscribe via Redis (${err.message})`);
            }
        }
    }
    dispatchMessage(channel, message) {
        const handlers = this.subscriptions.get(channel);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(channel, message);
                }
                catch (handlerErr) {
                    console.error(`[Redis]: Error in subscriber handler for channel "${channel}":`, handlerErr);
                }
            });
        }
    }
    getCacheClient() {
        if (this.mode === 'redis' && this.isConnected && this.cacheClient) {
            return this.cacheClient;
        }
        return null;
    }
    async ping() {
        const start = Date.now();
        if (this.mode === 'redis' && this.publisher && this.isConnected) {
            try {
                await this.publisher.ping();
                return Date.now() - start;
            }
            catch {
                return -1;
            }
        }
        return 0; // In-memory responds immediately
    }
    async getStatus() {
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
exports.redisManager = new RedisManager();
exports.default = exports.redisManager;
