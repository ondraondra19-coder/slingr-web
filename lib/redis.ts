// lib/redis.ts
// Sdílený Upstash Redis klient. Čte UPSTASH_REDIS_REST_URL a
// UPSTASH_REDIS_REST_TOKEN z env proměnných (Vercel: nastavit v Project Settings).
import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "❌ Chybí UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN v .env.local (nebo v env proměnných na Vercelu)."
    );
  }

  client = new Redis({ url, token });
  return client;
}