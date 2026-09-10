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

export function getRedisOptions(): any {
  const url = getRedisUrl();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      username: parsed.username ? decodeURIComponent(parsed.username) : 'default',
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  } catch {
    return {
      url,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }
}

export function getRedisConnection(): Redis | null {
  if (connection) return connection;
  if (connectionFailed) return null;

  const url = getRedisUrl();
  if (!url) return null;

  try {
    connection = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        if (times > 3) {
          connectionFailed = true;
          return null;
        }
        return Math.min(times * 500, 2000);
      },
    });

    connection.on('error', (err: any) => {
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
