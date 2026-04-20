/**
 * Per-IP sliding-window rate limiter for lead submissions.
 *
 * In-memory store — fine for a single Node.js instance (one server / one
 * container). If the site is ever scaled horizontally, swap the store for
 * Redis (Upstash) keeping the same interface.
 *
 * Limits are deliberately tight: real users submit 1-2 times per session;
 * anything higher is spam or flood.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Cap the store so a flood of unique IPs can't blow up memory.
const MAX_TRACKED_IPS = 10_000;

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitVerdict {
  allowed: boolean;
  retryAfterSec: number;
  remaining: number;
}

export function checkRateLimit(key: string | undefined): RateLimitVerdict {
  // No IP → be conservative but don't block (trusted internal traffic or tests).
  if (!key) {
    return { allowed: true, retryAfterSec: 0, remaining: MAX_REQUESTS_PER_WINDOW };
  }

  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };

  // Drop timestamps outside the window.
  const cutoff = now - WINDOW_MS;
  const fresh = bucket.timestamps.filter((t) => t > cutoff);

  if (fresh.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = fresh[0]!;
    const retryAfterMs = Math.max(0, oldest + WINDOW_MS - now);
    return {
      allowed: false,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    };
  }

  fresh.push(now);
  buckets.set(key, { timestamps: fresh });

  evictIfOversized();

  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: MAX_REQUESTS_PER_WINDOW - fresh.length,
  };
}

function evictIfOversized(): void {
  if (buckets.size <= MAX_TRACKED_IPS) return;
  // Simple eviction — drop the oldest entry (first inserted). Map iteration
  // order is insertion order, so this works without tracking timestamps.
  const firstKey = buckets.keys().next().value;
  if (firstKey !== undefined) buckets.delete(firstKey);
}

// Test helper — allows resetting state between tests.
export function __resetRateLimiter(): void {
  buckets.clear();
}
