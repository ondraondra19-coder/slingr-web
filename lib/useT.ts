import cs from "@/messages/cs.json";
import en from "@/messages/en.json";
import sk from "@/messages/sk.json";
import { useLang } from "./LangContext";

const messages = { cs, en, sk } as const;
type Messages = typeof cs;

export function useT(namespace: keyof Messages) {
  const { locale } = useLang();
  const section = messages[locale][namespace] as Record<string, string>;
  return (key: string): string => section[key] ?? key;
}