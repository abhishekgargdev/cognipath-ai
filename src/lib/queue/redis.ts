import Redis from 'ioredis';

let connection: Redis | null = null;
let connectionFailed = false;

export function getRedisUrl(): string | null {
  // 1. Explicit REDIS_URL from .env
  const redisUrl = (process.env.REDIS_URL || '').trim();
  if (redisUrl) return redisUrl;

  // 2. Upstash Redis REST URL & Token conversion to TCP URL for BullMQ / ioredis
  const restUrl = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const restToken = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

  if (restUrl && restToken) {
    try {
      const hostname = restUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (hostname) {
        return `rediss://default:${restToken}@${hostname}:6379`;
      }
    } catch (err) {
      console.warn('[BullMQ Redis] Failed to derive Redis TCP URL from Upstash credentials:', err);
    }
  }

  return null;
}

export function getRedisConnection(): Redis | null {
  if (connection) return connection;
  if (connectionFailed) return null;

  const url = getRedisUrl();
  if (!url) {
    // If no Redis connection string or Upstash config is available, return null.
    // Avoid connecting to 127.0.0.1:6379 to eliminate ECONNREFUSED log noise.
    return null;
  }

  try {
    connection = new Redis(url, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          connectionFailed = true;
          return null; // Stop retrying after 3 failed connection attempts
        }
        return Math.min(times * 500, 2000);
      },
    });

    connection.on('error', (err: any) => {
      // Suppress unhandled ECONNREFUSED error spam in server logs
      if (err?.code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED')) {
        connectionFailed = true;
      } else {
        console.warn('[BullMQ Redis Warning]:', err?.message || err);
      }
    });

    return connection;
  } catch (err) {
    console.warn('[BullMQ Redis] Failed to instantiate ioredis client:', err);
    connectionFailed = true;
    return null;
  }
}
