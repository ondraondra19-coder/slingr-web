import { useEffect } from "react";
import { manualTranslations } from "./manualTranslations";

export function useManualTranslations(langCode: string) {
  useEffect(() => {
    if (langCode === "cs") return;

    const translations = manualTranslations[langCode];
    if (!translations) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function applyTranslations() {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        nodes.push(node as Text);
      }

      for (const textNode of nodes) {
        const original = textNode.textContent ?? "";
        for (const [wrong, correct] of Object.entries(translations)) {
          if (original.includes(wrong)) {
            textNode.textContent = original.replaceAll(wrong, correct);
          }
        }
      }
    }

    // MutationObserver sleduje změny v DOM které dělá Google Translate
    const observer = new MutationObserver(() => {
      // Debounce — počkáme až GT přestane měnit DOM
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyTranslations();
      }, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Také spustíme jednou po 2s jako zálohu
    const fallbackTimer = setTimeout(applyTranslations, 2000);

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      clearTimeout(fallbackTimer);
    };
  }, [langCode]);
}