"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function HtmlLangUpdater() {
  const { i18n } = useTranslation();

  // After hydration, restore the user's saved language from localStorage.
  // i18n always inits with 'vi' for SSR consistency; this effect switches
  // to the saved language once the client has mounted.
  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return null;
}
