"use client";

import LegalLayout from "./LegalLayout";
import { TERMS_BODY, TERMS_TITLE, TERMS_EFFECTIVE_FROM } from "@/content/legal/terms";
import { useLang } from "@/lib/LangContext";

export default function TermsPage() {
  const { locale } = useLang();
  const Body = TERMS_BODY[locale];

  return (
    <LegalLayout title={TERMS_TITLE[locale]} effectiveFrom={TERMS_EFFECTIVE_FROM}>
      <Body />
    </LegalLayout>
  );
}
