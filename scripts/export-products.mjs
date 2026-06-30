import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const xlsx = require("xlsx");

const content = fs.readFileSync("./lib/products.ts", "utf-8");
const rows = [];
const blocks = content.match(/\{[\s\S]*?slug:[\s\S]*?\}/g) || [];

for (const block of blocks) {
  const name = block.match(/name:\s*"([^"]+)"/)?.[1];
  const price = block.match(/price:\s*(\d+)/)?.[1];
  const inStock = block.match(/inStock:\s*(true|false)/)?.[1];
  const stock = block.match(/stock:\s*(\d+)/)?.[1] ?? "0";
  const categories = block.match(/categories:\s*\[([^\]]+)\]/)?.[1]
    ?.replace(/"/g, "").replace(/\s/g, "") || "";

  if (name && price) {
    rows.push({
      "Kategorie": categories,
      "Název": name,
      "Cena": Number(price),
      "Počet kusů skladem": Number(stock),
    });
  }
}

const ws = xlsx.utils.json_to_sheet(rows);
ws["!cols"] = [{ wch: 25 }, { wch: 45 }, { wch: 10 }, { wch: 22 }];
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Produkty");
xlsx.writeFile(wb, "./produkty.xlsx");
console.log(`Exportováno ${rows.length} produktů do produkty.xlsx`);
