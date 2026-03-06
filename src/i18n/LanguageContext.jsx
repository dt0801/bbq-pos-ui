import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import vi from './locales/vi';
import en from './locales/en';
import de from './locales/de';

// ─── Config ────────────────────────────────────────────────────────────────────
const LOCALES = { vi, en, de };
const STORAGE_KEY = 'bbq_pos_language';
const DEFAULT_LANG = 'vi';

export const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
];

// ─── Context ───────────────────────────────────────────────────────────────────
const LanguageContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LOCALES[saved] ? saved : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  const changeLanguage = useCallback((code) => {
    if (!LOCALES[code]) return;
    setLang(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const value = useMemo(() => ({
    lang,
    locale: LOCALES[lang],
    changeLanguage,
    languages: LANGUAGE_OPTIONS,
  }), [lang, changeLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Internal hook (used by useT) ─────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}