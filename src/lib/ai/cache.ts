import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

let redisClient: Redis | null = null;

function getRedisInstance(): Redis | null {
  if (redisClient) return redisClient;

  const url = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

  if (!url || !token) {
    return null;
  }

  try {
    redisClient = new Redis({ url, token });
    return redisClient;
  } catch (err) {
    console.warn('[AI Cache] Failed to initialize Upstash Redis client:', err);
    return null;
  }
}

export function computeCacheKey(taskName: string, input: any): string {
  const normalizedInput = JSON.stringify(input, Object.keys(input || {}).sort());
  const hash = createHash('sha256').update(`${taskName}:${normalizedInput}`).digest('hex');
  return `ai-task:${taskName}:${hash}`;
}

export async function getCachedTaskResult<T>(taskName: string, input: any): Promise<T | null> {
  const redis = getRedisInstance();
  if (!redis) return null;

  try {
    const key = computeCacheKey(taskName, input);
    const cached = await redis.get<T>(key);
    if (cached) {
      console.log(`[AI Cache] Cache HIT for key: ${key}`);
      return cached;
    }
  } catch (err) {
    console.warn('[AI Cache] Error reading from Redis cache:', err);
  }

  return null;
}

export async function setCachedTaskResult(
  taskName: string,
  input: any,
  data: any,
  ttlSeconds: number = 7 * 24 * 3600 // 7 days default
): Promise<void> {
  const redis = getRedisInstance();
  if (!redis) return;

  try {
    const key = computeCacheKey(taskName, input);
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
    console.log(`[AI Cache] Cached result saved for key: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (err) {
    console.warn('[AI Cache] Error writing to Redis cache:', err);
  }
}

export { getRedisInstance };
