"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultLocale, dictionaries, type Dictionary, type Locale } from "./dictionaries";

const STORAGE_KEY = "language";

type LanguageContextValue = {
  language: Locale;
  setLanguage: (language: Locale) => void;
  dict: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>(defaultLocale);

  // Reading localStorage only after mount (never during the initial render)
  // keeps server and first client render identical — Italian, the default —
  // so there's no hydration mismatch; a returning English-preferring visitor
  // sees one brief flash of Italian before this swaps it.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "it" || stored === "en") setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next: Locale) {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
