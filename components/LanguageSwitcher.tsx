"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("nav.language")}
        className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{locale}</span>
      </button>
      {open && (
        <div className="glass absolute right-0 z-20 mt-2 w-36 rounded-2xl py-1 shadow-lg">
          {LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-white/5 ${
                locale === code ? "text-gradient font-semibold" : "text-muted-foreground"
              }`}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
