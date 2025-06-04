import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type Limiter = { limit: (key: string) => Promise<{ success: boolean }> };

// No-op when Upstash is not configured (local dev without .env.local credentials)
const noop: Limiter = { limit: async () => ({ success: true }) };

const redis =
  process.env["UPSTASH_REDIS_REST_URL"] && process.env["UPSTASH_REDIS_REST_TOKEN"]
    ? Redis.fromEnv()
    : null;

export const createPostLimiter: Limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "rl:createPost",
    })
  : noop;

export const toggleVoteLimiter: Limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(30, "1 m"),
      prefix: "rl:toggleVote",
    })
  : noop;
