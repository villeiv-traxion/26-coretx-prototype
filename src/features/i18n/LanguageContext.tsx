"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { Language, Translations, translations } from "./translations";

const STORAGE_KEY = "coretx-language";
const DEFAULT_LANGUAGE: Language = "es";

/**
 * El idioma vive en localStorage, no en estado de React: así el valor
 * persistido se lee vía `useSyncExternalStore` sin provocar un setState
 * dentro de un effect ni un desajuste de hidratación (en servidor siempre
 * se sirve `DEFAULT_LANGUAGE`).
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && stored in translations
    ? (stored as Language)
    : DEFAULT_LANGUAGE;
}

function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    listeners.forEach((listener) => listener());
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
