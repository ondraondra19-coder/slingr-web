// app/api/adresa/route.ts
import { NextResponse } from "next/server";

const RUIAN_URL =
  "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/Vyhledavaci_sluzba_nad_daty_RUIAN/MapServer/exts/GeocodeSOE/findAddressCandidates";

const MULTI_PSC_MESTA = new Set([
  "praha", "brno", "ostrava", "plzen", "liberec", "olomouc",
  "ceske budejovice", "hradec kralove", "pardubice", "zlin",
  "kladno", "most", "opava", "frydek-mistek", "karvina",
]);

export type MestoResult = {
  label: string;
  mesto: string;
  vesnice: string;
  psc: string;
  multiPsc: boolean;
};

export type AdresaResult = {
  uliceCp: string;
  mesto: string;
  psc: string;
  label: string;
};

interface RuianCandidate {
  score: number;
  address?: string;
  attributes?: {
    Match_addr?: string;
  };
}

function stripDia(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatPsc(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 5);
  if (d.length <= 3) return d;
  return d.slice(0, 3) + " " + d.slice(3);
}

function capitalize(s: string): string {
  return s.split(" ").map(w => w ? w[0].toUpperCase() + w.slice(1) : "").join(" ");
}

function isMultiPsc(mesto: string): boolean {
  const cleanMesto = stripDia(mesto).replace(/\s+\d+$/, "").trim();
  return MULTI_PSC_MESTA.has(cleanMesto);
}

function isSilnaUlice(text: string): boolean {
  const lower = stripDia(text).trim();
  if (/\b(ulice|namesti|trida|nabrezi|aleje|stezka|pesina|most|uvez|uvoz|atrium|vnitroblok|alej|zahradami|safari|sidliste|cesta|okruh)\b/.test(lower)) return true;
  if (/^(na|za|v|u|pod|nad|k)\s/.test(lower)) return true;
  if (/[0-9]/.test(lower)) return true;
  return false;
}

function isTypickaUlice(text: string): boolean {
  const lower = stripDia(text).trim();
  if (!lower) return false;
  
  const streetSuffixes = ["ska", "sky", "ni", "ova", "ove", "eho", "ich", "ych"];
  
  if (lower.endsWith("ice") || lower.endsWith("any") || lower.endsWith("ov") || lower.endsWith("in") || lower.endsWith("lhota") || lower.endsWith("obec") || lower.endsWith("ves")) {
    return false;
  }
  
  return streetSuffixes.some(p => lower.endsWith(p));
}

// Filtruje balast typu chatové oblasti, zahrádkářské kolonie a průmyslové zóny
function isJunkLokalita(text: string): boolean {
  const lower = stripDia(text);
  return /\b(chatova|chatove|zahradkarska|zahradkarske|prumyslova|lokalita|oblast|osada|areal|skladovy|komercni|zona)\b/.test(lower);
}

function parseAddressLine(raw: string): {
  name: string;       
  cislo: string;      
  pscMesto: string;   
  cast: string;       
  psc: string;        
} | null {
  if (!raw) return null;

  const parts = raw.split(",").map(s => s.trim());

  let pscIndex = -1;
  let pscMatch: RegExpMatchArray | null = null;

  for (let i = parts.length - 1; i >= 0; i--) {
    const m = parts[i].match(/^(\d{3}\s?\d{2})\s*(.*)$/);
    if (m) { pscIndex = i; pscMatch = m; break; }
  }

  if (!pscMatch || pscIndex < 0) {
    if (!/\d/.test(raw) && raw.length > 2) {
      if (raw.includes(",")) return null;
      return { name: "", cislo: "", pscMesto: raw, cast: "", psc: "" };
    }
    return null;
  }

  const psc = formatPsc(pscMatch[1]);
  const pscMesto = pscMatch[2].trim() || parts[0];

  let name = "";
  let cislo = "";
  let cast = "";

  if (pscIndex > 0) {
    const rawUlice = parts[0];
    name = rawUlice;

    if (/^č\.(p\.|ev\.)/i.test(rawUlice)) {
      name = "";
      cislo = rawUlice;
    } else {
      const cpMatch = rawUlice.match(/(.*?)\s+((?:č\.p\.|č\.ev\.)?\s*\d+.*)$/i);
      if (cpMatch) {
        name = cpMatch[1].trim();
        cislo = cpMatch[2].trim();
      }
    }

    if (name && !/^č\.(p\.|ev\.)/i.test(name)) {
      name = capitalize(name);
    }

    if (pscIndex === 2 && parts.length >= 3) {
      const mid = parts[1];
      if (!/\d/.test(mid) && stripDia(mid) !== stripDia(pscMesto)) {
        cast = mid;
      }
    }
  }

  return { name, cislo, pscMesto, cast, psc };
}

async function callRuian(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    SingleLine: query,
    outFields: "Match_addr",
    maxLocations: "50",
    f: "json",
  });
  try {
    const res = await fetch(`${RUIAN_URL}?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.candidates ?? [])
      .filter((c: RuianCandidate) => (c.score ?? 0) >= 60)
      .map((c: RuianCandidate) => c.attributes?.Match_addr ?? c.address ?? "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type") ?? "adresa";

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const qTrim = q.trim();

  if (type === "debug") {
    const addrs = await callRuian(qTrim);
    return NextResponse.json({ raw: addrs });
  }

  // ── MĚSTO ──────────────────────────────────────────────────────────────────
  if (type === "mesto") {
    const qLower = stripDia(qTrim);
    const queries = /[0-9]/.test(qTrim) ? [qTrim] : [qTrim, `${qTrim} 1`];
    const allAddrs = (await Promise.all(queries.map(callRuian))).flat();

    const results: MestoResult[] = [];

    const pushResult = (label: string, mesto: string, vesnice: string, psc: string) => {
      // OPRAVA: Pokud obec nemá PSČ a nejedná se o velká multi-PSC města, jde o neúplný RUIAN polotovar. Zahodit.
      if (!isMultiPsc(mesto) && !psc) return;

      const displayPsc = isMultiPsc(mesto) ? "" : psc;
      const key = stripDia(label);
      
      const existingIdx = results.findIndex(r => stripDia(r.label) === key);
      if (existingIdx === -1) {
        results.push({
          label,
          mesto,
          vesnice,
          psc: displayPsc,
          multiPsc: isMultiPsc(mesto),
        });
      } else if (displayPsc && !results[existingIdx].psc) {
        results[existingIdx].psc = displayPsc;
      }
    };

    for (const addr of allAddrs) {
      const parsed = parseAddressLine(addr);
      if (!parsed) continue;

      let { name, pscMesto, cast, psc } = parsed;
      if (!pscMesto) continue;

      // OPRAVA: Odstranění chatových oblastí a jiného balastu z našeptávače obcí
      if (isJunkLokalita(pscMesto) || isJunkLokalita(name) || isJunkLokalita(cast)) {
        continue;
      }

      const dashIdx = pscMesto.indexOf("-");
      if (dashIdx !== -1) {
        const prefix = stripDia(pscMesto.substring(0, dashIdx)).trim();
        if (MULTI_PSC_MESTA.has(prefix) && qLower.length <= prefix.length) {
          pscMesto = pscMesto.substring(0, dashIdx).trim();
        }
      }

      const pscMestoLower = stripDia(pscMesto);
      const nameLower = stripDia(name);
      const castLower = stripDia(cast);

      if (pscMestoLower.startsWith(qLower) && !isSilnaUlice(pscMesto)) {
        pushResult(pscMesto, pscMesto, "", psc);
      }

      const dovolitCasti = !isMultiPsc(pscMesto) || !pscMestoLower.startsWith(qLower);

      if (dovolitCasti) {
        if (cast && castLower.startsWith(qLower) && !isSilnaUlice(cast)) {
          pushResult(`${pscMesto} - ${cast}`, pscMesto, cast, psc);
        }

        const jeValidniVesnice = name && nameLower.startsWith(qLower) && !isSilnaUlice(name) && (!isTypickaUlice(name) || nameLower === qLower);
        if (jeValidniVesnice && nameLower !== pscMestoLower) {
          pushResult(`${pscMesto} - ${name}`, pscMesto, name, psc);
        }

        if (pscMestoLower.startsWith(qLower)) {
          if (cast && pscMestoLower !== castLower && !isSilnaUlice(cast)) {
            pushResult(`${pscMesto} - ${cast}`, pscMesto, cast, psc);
          } else if (name && !isSilnaUlice(name) && !isTypickaUlice(name) && pscMestoLower !== nameLower) {
            pushResult(`${pscMesto} - ${name}`, pscMesto, name, psc);
          }
        }
      }
    }

    results.sort((a: MestoResult, b: MestoResult) => {
      const aLabelStart = stripDia(a.label).startsWith(qLower) ? 0 : 1;
      const bLabelStart = stripDia(b.label).startsWith(qLower) ? 0 : 1;
      if (aLabelStart !== bLabelStart) return aLabelStart - bLabelStart;
      return a.label.localeCompare(b.label, "cs");
    });

    return NextResponse.json({ results: results.slice(0, 10) });
  }

  // ── ADRESA ─────────────────────────────────────────────────────────────────
  if (type === "adresa") {
    const addrs = await callRuian(qTrim);
    const resulta: AdresaResult[] = [];
    const seen = new Set<string>();

    for (const addr of addrs) {
      const parsed = parseAddressLine(addr);
      if (!parsed) continue;

      const { name, cislo, pscMesto, psc, cast } = parsed;

      let displayUlice = name;
      if (cislo) {
        if (name) {
          displayUlice = `${name} ${cislo}`;
        } else {
          const obecnyNazev = cast ? cast : pscMesto;
          const cisteCislo = cislo.replace(/^č\.(p\.|ev\.)\s*/i, "").trim();
          displayUlice = `${obecnyNazev} ${cisteCislo}`;
        }
      } else if (!name) {
        continue;
      }

      const label = `${displayUlice}, ${psc} ${pscMesto}`;
      if (seen.has(label)) continue;
      seen.add(label);

      resulta.push({ uliceCp: displayUlice, mesto: pscMesto, psc, label });
    }

    return NextResponse.json({ results: resulta.slice(0, 10) });
  }

  return NextResponse.json({ results: [] });
}