import { Redis } from "@upstash/redis";
import { logger } from "./logger";

const CACHE_VERSION = "v1";
const KEY_PREFIX = `hoshigumi:${CACHE_VERSION}`;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];
  if (!url || !token) {
    logger.warn("Redis env vars not set — caching disabled");
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

export function cacheKey(...parts: (string | number)[]): string {
  return [KEY_PREFIX, ...parts].join(":");
}

export interface CacheResult<T> {
  data: T;
  hit: boolean;
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<CacheResult<T>> {
  const r = getRedis();

  if (r) {
    try {
      const cached = await r.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return { data: cached, hit: true };
      }
    } catch (err) {
      logger.warn({ err, key }, "Redis GET failed — falling back to scrape");
    }
  }

  const data = await fn();

  if (r) {
    try {
      await r.set(key, data, { ex: ttlSeconds });
    } catch (err) {
      logger.warn({ err, key }, "Redis SET failed — result not cached");
    }
  }

  return { data, hit: false };
}

export async function bustCache(key: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.del(key);
  } catch (err) {
    logger.warn({ err, key }, "Redis DEL failed");
  }
}

type WarmerTask = {
  key: string;
  ttl: number;
  fn: () => Promise<unknown>;
  intervalMs: number;
};

const warmerTasks: WarmerTask[] = [];

export function registerWarmer(task: WarmerTask): void {
  warmerTasks.push(task);
}

async function runTask(task: WarmerTask): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    const data = await task.fn();
    await r.set(task.key, data, { ex: task.ttl });
    logger.debug({ key: task.key }, "Cache pre-warmed");
  } catch (err) {
    logger.warn({ err, key: task.key }, "Cache warmer task failed");
  }
}

export function startCacheWarmer(): void {
  if (!getRedis()) return;

  for (const task of warmerTasks) {
    runTask(task).catch(() => {});

    setInterval(() => {
      runTask(task).catch(() => {});
    }, task.intervalMs);
  }

  logger.info({ tasks: warmerTasks.length }, "Cache warmer started");
}
