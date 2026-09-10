import Redis, { RedisOptions } from 'ioredis';

let connection: Redis | null = null;

export function getRedisConnection(): Redis | null {
  if (connection) return connection;

  const redisUrl = (process.env.REDIS_URL || '').trim();
  
  // If Upstash REST URL is given, try parsing host/port or check REDIS_URL
  if (redisUrl) {
    try {
      connection = new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
        lazyConnect: true,
      });
      return connection;
    } catch (err) {
      console.warn('[BullMQ Redis] Failed to initialize ioredis connection with REDIS_URL:', err);
    }
  }

  // Local fallback
  try {
    const fallbackOptions: RedisOptions = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    };
    connection = new Redis(fallbackOptions);
    return connection;
  } catch (err) {
    console.warn('[BullMQ Redis] Failed to initialize default local Redis connection:', err);
    return null;
  }
}
