"use client";

import LegalLayout from "./LegalLayout";
import { PRIVACY_BODY, PRIVACY_TITLE, PRIVACY_SUBTITLE, PRIVACY_EFFECTIVE_FROM } from "@/content/legal/privacy";
import { useLang } from "@/lib/LangContext";

export default function PrivacyPage() {
  const { locale } = useLang();
  const Body = PRIVACY_BODY[locale];

  return (
    <LegalLayout
      title={PRIVACY_TITLE[locale]}
      effectiveFrom={`${PRIVACY_EFFECTIVE_FROM} · ${PRIVACY_SUBTITLE[locale]}`}
    >
      <Body />
    </LegalLayout>
  );
}
