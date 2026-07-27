// scripts/orders-admin.mjs
// Správa objednávek přímo v Redisu — admin panel umí měnit jen stav, ne mazat.
//
// Použití:
//   node scripts/orders-admin.mjs list                 → vypíše všechny objednávky
//   node scripts/orders-admin.mjs delete <id> [<id>…]  → smaže konkrétní objednávky
//   node scripts/orders-admin.mjs wipe                  → smaže VŠECHNY objednávky (i pending)
//
// Objednávky žijí ve dvou klíčích: `orders:data:<id>` (samotná data) a
// `orders:index` (seřazený seznam ID). Smazat = odstranit z obou. Pending
// (nedokončené karty) jsou `orders:pending:<id>` a mizí samy do 24 h.

import { readFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

// Načteme .env.local ručně — skripty tu nejedou přes Next.js runtime.
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const fmt = (o) =>
  `  #${(o.id || "").replace(/\D/g, "").slice(-8).padStart(8, "0")}  ${new Date(o.createdAt).toLocaleString("cs-CZ")}  ` +
  `${o.status}/${o.paymentMethod}  ${o.total} ${o.currency}  ${o.customer?.jmeno || "?"} <${o.customer?.email || "?"}>\n` +
  `      id=${o.id}  položky: ${(o.items || []).map((i) => `${i.name}×${i.quantity}`).join(", ")}`;

async function getAll() {
  const ids = (await redis.zrange("orders:index", 0, -1, { rev: true })) ?? [];
  const out = [];
  for (const id of ids) {
    const raw = await redis.get(`orders:data:${id}`);
    if (raw) out.push(typeof raw === "string" ? JSON.parse(raw) : raw);
    else out.push({ id, _orphan: true }); // v indexu, ale data chybí
  }
  return { ids, out };
}

async function del(ids) {
  const p = redis.pipeline();
  for (const id of ids) {
    p.del(`orders:data:${id}`);
    p.zrem("orders:index", id);
  }
  await p.exec();
}

const cmd = process.argv[2];
const args = process.argv.slice(3);

if (cmd === "list") {
  const { out } = await getAll();
  if (out.length === 0) console.log("Žádné objednávky.");
  else console.log(`Objednávek: ${out.length}\n${out.map((o) => (o._orphan ? `  (osiřelý index) id=${o.id}` : fmt(o))).join("\n\n")}`);
} else if (cmd === "delete") {
  if (args.length === 0) { console.error("Zadej alespoň jedno id. Viz `list`."); process.exit(1); }
  await del(args);
  console.log(`Smazáno ${args.length} objednávek.`);
} else if (cmd === "wipe") {
  const { ids } = await getAll();
  await del(ids);
  // Uklidíme i nedokončené pending objednávky.
  const pending = [];
  let cursor = 0;
  do {
    const [next, keys] = await redis.scan(cursor, { match: "orders:pending:*", count: 100 });
    cursor = Number(next);
    pending.push(...keys);
  } while (cursor !== 0);
  if (pending.length) await redis.del(...pending);
  console.log(`Smazáno ${ids.length} objednávek a ${pending.length} pending záznamů.`);
} else {
  console.log("Použití: node scripts/orders-admin.mjs [list | delete <id>… | wipe]");
}
