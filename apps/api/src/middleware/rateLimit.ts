import type { Context, Next } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";

interface Bucket {
  count: number;
  resetAt: number;
}

// ponytail: in-memory fixed-window limiter, single-process only, resets on
// restart. Swap for a Redis-backed limiter if the API ever runs multi-instance.
const buckets = new Map<string, Bucket>();

export function rateLimit(options: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    const ip = getConnInfo(c).remote.address ?? "unknown";
    const key = `${c.req.path}:${ip}`;
    const now = Date.now();

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      await next();
      return;
    }

    if (bucket.count >= options.max) {
      return c.json({ error: "Too many requests. Please try again later." }, 429);
    }

    bucket.count += 1;
    await next();
  };
}
