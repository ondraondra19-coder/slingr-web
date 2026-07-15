// lib/messages.ts
// Zprávy odeslané z chat widgetu na e-shopu — uložené v Upstash Redis,
// viditelné jen v adminu (stejný vzor jako lib/reviews.ts).
import { getRedis } from "./redis";

export type Message = {
  id: string;
  name: string;
  email: string;
  text: string;
  date: string; // ISO string, formátování na klientu
  read: boolean;
};

export type NewMessageInput = {
  name: string;
  email: string;
  text: string;
};

const LIST_KEY = "messages:list";
const MAX_MESSAGES = 1000; // pojistka proti neomezenému růstu klíče

// ── Čtení všech zpráv (nejnovější první) ────────────────────────────────────
export async function getAllMessages(): Promise<Message[]> {
  const redis = getRedis();
  const raw = await redis.lrange<string>(LIST_KEY, 0, -1);

  const messages: Message[] = [];
  for (const item of raw) {
    try {
      const parsed: Message = typeof item === "string" ? JSON.parse(item) : (item as unknown as Message);
      messages.push(parsed);
    } catch {
      // Poškozenou položku tiše přeskočíme, ať nespadne celý výpis.
    }
  }
  return messages;
}

// ── Jedna konkrétní zpráva podle id (pro odpověď emailem v adminu) ─────────
export async function getMessageById(id: string): Promise<Message | null> {
  const messages = await getAllMessages();
  return messages.find((m) => m.id === id) ?? null;
}

// ── Vytvoření nové zprávy (validace probíhá v API route) ───────────────────
export async function addMessage(input: NewMessageInput): Promise<Message> {
  const redis = getRedis();

  const message: Message = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    text: input.text.trim(),
    date: new Date().toISOString(),
    read: false,
  };

  await redis.lpush(LIST_KEY, JSON.stringify(message));
  await redis.ltrim(LIST_KEY, 0, MAX_MESSAGES - 1);

  return message;
}

// ── Označení zprávy jako přečtené/nepřečtené ────────────────────────────────
export async function markMessageRead(id: string, read: boolean): Promise<boolean> {
  const redis = getRedis();
  const raw = await redis.lrange<string>(LIST_KEY, 0, -1);

  const updated: string[] = [];
  let found = false;

  for (const item of raw) {
    try {
      const parsed: Message = typeof item === "string" ? JSON.parse(item) : (item as unknown as Message);
      if (parsed.id === id) {
        found = true;
        parsed.read = read;
      }
      updated.push(JSON.stringify(parsed));
    } catch {
      updated.push(item as unknown as string);
    }
  }

  if (!found) return false;

  await redis.del(LIST_KEY);
  if (updated.length > 0) {
    await redis.rpush(LIST_KEY, ...updated);
  }
  return true;
}

// ── Smazání konkrétní zprávy podle id ───────────────────────────────────────
export async function deleteMessage(id: string): Promise<boolean> {
  const redis = getRedis();
  const raw = await redis.lrange<string>(LIST_KEY, 0, -1);

  const remaining: string[] = [];
  let found = false;

  for (const item of raw) {
    try {
      const parsed: Message = typeof item === "string" ? JSON.parse(item) : (item as unknown as Message);
      if (parsed.id === id) {
        found = true;
        continue; // vynecháme mazanou zprávu
      }
      remaining.push(typeof item === "string" ? item : JSON.stringify(parsed));
    } catch {
      remaining.push(item as unknown as string);
    }
  }

  if (!found) return false;

  await redis.del(LIST_KEY);
  if (remaining.length > 0) {
    await redis.rpush(LIST_KEY, ...remaining);
  }
  return true;
}

// ── Základní anti-spam: 1 zpráva / zařízení / 5 minut ───────────────────────
const COOLDOWN_SECONDS = 5 * 60;

export async function checkAndSetCooldown(deviceId: string): Promise<{ allowed: boolean; ttlSeconds: number }> {
  const redis = getRedis();
  const key = `messages:cooldown:${deviceId}`;

  // NX = zapiš jen pokud klíč neexistuje.
  const setResult = await redis.set(key, "1", { nx: true, ex: COOLDOWN_SECONDS });
  if (setResult === "OK") {
    return { allowed: true, ttlSeconds: 0 };
  }

  const ttl = await redis.ttl(key);
  return { allowed: false, ttlSeconds: ttl > 0 ? ttl : COOLDOWN_SECONDS };
}