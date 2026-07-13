// lib/rateLimit.ts
// Jednoduchý per-klíč rate limit (sliding-ish okno) nad Redisem. Na rozdíl od
// checkAndSetCooldown v lib/reviews.ts (striktní "1 akce za okno") tady povolíme
// až `max` akcí za `windowSeconds` — vhodné pro checkout, kde reálný zákazník
// může legitimně založit víc objednávek / zopakovat po zamítnuté kartě.
import { getRedis } from "./redis";

export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const redis = getRedis();
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  return count <= max;
}
