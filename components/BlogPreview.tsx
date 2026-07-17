import { getAllPosts } from "@/lib/blog";
import BlogPreviewList from "./BlogPreviewList";

// Serverová komponenta jen kvůli načtení článků — vykreslení je v
// BlogPreviewList, protože nadpisy sekce potřebují jazyk, a ten je na klientovi.
//
// Samotné články (titulek, datum, obsah) zůstávají v jazyce, ve kterém je
// napsal admin. Překládat je by znamenalo psát každý článek třikrát, což je
// redakční rozhodnutí, ne technické.
export default async function BlogPreview() {
  // getAllPosts() vrací už seřazeno od nejnovějšího.
  const shown = (await getAllPosts()).slice(0, 3);

  if (shown.length === 0) return null;

  return (
    <BlogPreviewList
      posts={shown.map((p) => ({ slug: p.slug, title: p.title, date: p.date, img: p.img }))}
    />
  );
}
