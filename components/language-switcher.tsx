"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Locale } from "@/lib/i18n/dictionaries";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "it", label: "IT" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, dict } = useLanguage();

  return (
    <div
      role="group"
      aria-label={dict.languageSwitcher.ariaLabel}
      className="fixed top-6 left-6 z-50 flex items-center gap-0.5 rounded-full border border-border bg-background/70 p-1 backdrop-blur-md"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={cn(
            "rounded-full px-3 py-1 font-mono text-xs tracking-wide transition-colors duration-300 ease-signature",
            language === code
              ? "bg-brand text-brand-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
