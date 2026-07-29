// lib/description.ts
// Popis produktu zůstává obyčejný text v `products.ts` (kvůli hledání, meta
// popiskům a administraci), ale na detailu produktu se vykreslí jako sázená
// stránka. Tenhle soubor je ta hranice — z textu udělá bloky.
//
// FORMÁT (bloky odděluje prázdný řádek):
//
//   Úvodní odstavec.            ← první blok = upoutávka, vidí se v náhledu
//
//   Další odstavec normálního textu.
//
//   ⚡ Titulek — popis          ← blok samých „emoji řádků" = vlastnosti
//   🔋 Titulek — popis
//
//   📦 Titulek: první · druhý · třetí     ← výčet oddělený tečkami
//
//   ⚠️ Titulek: text                      ← zvýrazněné upozornění
//
//   Klíč: hodnota · Klíč: hodnota         ← parametry (každá část má dvojtečku)
//
// Nic z toho není povinné. Když popis žádnou strukturu nemá, vyjdou z něj
// prosté odstavce a stránka vypadá jako dřív — staré popisy se tím nerozbijí.

export type DescBlock =
  | { kind: "lead"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "features"; items: { icon: string; title: string; text: string }[] }
  | { kind: "list"; icon: string; title: string; items: string[] }
  | { kind: "note"; icon: string; title: string; text: string }
  | { kind: "specs"; items: { label: string; value: string }[] };

// Emoji na začátku řádku + mezera. \p{Extended_Pictographic} chytí i emoji
// složená z víc znaků (⚠️ = znak + variation selector), proto ten `+`.
const EMOJI_LINE = /^(\p{Extended_Pictographic}[\p{Extended_Pictographic}️‍]*)\s+(.*)$/u;

// „Titulek — text" nebo „Titulek – text"; pomlčka s mezerami po obou stranách.
const TITLE_SPLIT = /\s+[—–]\s+/;

// Emoji, která mají zvláštní význam: 📦 dělá výčet, ⚠️ zvýrazněné upozornění.
// Cokoli jiného je řádek s vlastností.
const LIST_ICON = "📦";
const NOTE_ICON = "⚠";

function parseFeatureLine(line: string): { icon: string; title: string; text: string } | null {
  const m = line.match(EMOJI_LINE);
  if (!m) return null;
  const [, icon, rest] = m;
  const parts = rest.split(TITLE_SPLIT);
  if (parts.length < 2) return { icon, title: rest.trim(), text: "" };
  return { icon, title: parts[0].trim(), text: parts.slice(1).join(" — ").trim() };
}

// „Titulek: a · b · c" — dvojtečka odděluje nadpis od obsahu.
function splitAfterColon(rest: string): { title: string; body: string } {
  const idx = rest.indexOf(":");
  if (idx === -1) return { title: "", body: rest.trim() };
  return { title: rest.slice(0, idx).trim(), body: rest.slice(idx + 1).trim() };
}

function asSpecs(block: string): { label: string; value: string }[] | null {
  if (block.includes("\n")) return null;
  const parts = block.split("·").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const items = parts.map((part) => {
    const idx = part.indexOf(":");
    if (idx === -1) return null;
    return { label: part.slice(0, idx).trim(), value: part.slice(idx + 1).trim() };
  });
  return items.every((i) => i && i.label && i.value) ? (items as { label: string; value: string }[]) : null;
}

export function parseDescription(text: string): DescBlock[] {
  const raw = (text ?? "").trim();
  if (!raw) return [];

  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, index): DescBlock => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const emojiLines = lines.map(parseFeatureLine);
    const allEmoji = emojiLines.every(Boolean);

    if (allEmoji && lines.length > 0) {
      // O druhu bloku rozhoduje EMOJI, ne interpunkce uvnitř věty. Dřív se
      // koukalo na pomlčku — jenže „⚠️ Než začnete: … — …" ji má taky, takže
      // upozornění spadlo mezi vlastnosti.
      const single = lines.length === 1 ? lines[0].match(EMOJI_LINE) : null;
      if (single && (single[1].startsWith(LIST_ICON) || single[1].startsWith(NOTE_ICON))) {
        const { title, body } = splitAfterColon(single[2]);
        if (single[1].startsWith(LIST_ICON) && body.includes("·")) {
          return { kind: "list", icon: single[1], title, items: body.split("·").map((s) => s.trim()).filter(Boolean) };
        }
        return { kind: "note", icon: single[1], title, text: body };
      }
      return { kind: "features", items: emojiLines as { icon: string; title: string; text: string }[] };
    }

    const specs = asSpecs(block);
    if (specs) return { kind: "specs", items: specs };

    const text = lines.join(" ");
    return index === 0 ? { kind: "lead", text } : { kind: "paragraph", text };
  });
}

/** První odstavec — do meta popisku a náhledů při sdílení. */
export function descriptionLead(text: string): string {
  const first = parseDescription(text)[0];
  return first && (first.kind === "lead" || first.kind === "paragraph") ? first.text : (text ?? "").trim();
}

/**
 * Úvodní odstavce do náhledu na detailu produktu — bere je od začátku, dokud
 * jde o běžný text. Jakmile přijde první emoji blok nebo parametry, končí:
 * ty patří až do rozkliknutého popisu.
 */
export function descriptionPreview(text: string, maxParagraphs = 2): string[] {
  const paragraphs: string[] = [];
  for (const block of parseDescription(text)) {
    if (block.kind !== "lead" && block.kind !== "paragraph") break;
    paragraphs.push(block.text);
    if (paragraphs.length >= maxParagraphs) break;
  }
  return paragraphs.length > 0 ? paragraphs : [(text ?? "").trim()];
}
