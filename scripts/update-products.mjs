import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const xlsx = require("xlsx");

const EXCEL_FILE = "./produkty.xlsx";
const PRODUCTS_FILE = "./lib/products.ts";

const workbook = xlsx.readFile(EXCEL_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

let productsContent = fs.readFileSync(PRODUCTS_FILE, "utf-8");

let updated = 0;
let notFound = [];

for (const row of rows) {
  const nazev = String(row["Název"] || row["nazev"] || "").trim();
  const cena = Number(row["Cena"] || row["cena"] || 0);
  const kusy = Number(row["Počet kusů skladem"] || row["Pocet kusu skladem"] || row["Skladem"] || 0);
  const inStock = kusy > 0;

  if (!nazev) continue;

  const escaped = nazev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exists = new RegExp(`name:\\s*"${escaped}"`).test(productsContent);

  if (exists) {
    // Cena
    productsContent = productsContent.replace(
      new RegExp(`(name:\\s*"${escaped}"[\\s\\S]*?price:\\s*)\\d+`),
      `$1${cena}`
    );
    // inStock
    productsContent = productsContent.replace(
      new RegExp(`(name:\\s*"${escaped}"[\\s\\S]*?inStock:\\s*)(true|false)`),
      `$1${inStock}`
    );
    // stock
    productsContent = productsContent.replace(
      new RegExp(`(name:\\s*"${escaped}"[\\s\\S]*?stock:\\s*)\\d+`),
      `$1${kusy}`
    );
    updated++;
    console.log(`✓ ${nazev} — ${cena} Kč, ${kusy} ks`);
  } else {
    notFound.push(nazev);
    console.log(`✗ Nenalezen: "${nazev}"`);
  }
}

fs.writeFileSync(PRODUCTS_FILE, productsContent, "utf-8");
console.log(`\nHotovo! Aktualizováno: ${updated} produktů.`);
if (notFound.length > 0) console.log(`Nenalezeno: ${notFound.join(", ")}`);
