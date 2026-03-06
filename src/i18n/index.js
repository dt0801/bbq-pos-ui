// ─── BBQ POS i18n System ──────────────────────────────────────────────────────
// Single import point for all i18n utilities.
//
// Usage in components:
//   import { useT, LanguageSwitcher } from '../i18n';
//
// Usage in index.jsx (wrap once, done):
//   import { LanguageProvider } from '../i18n';
//   <LanguageProvider><App /></LanguageProvider>
// ─────────────────────────────────────────────────────────────────────────────

export { LanguageProvider, useLanguage, LANGUAGE_OPTIONS } from './LanguageContext';
export { useT } from './useT';
export { LanguageSwitcher } from './LanguageSwitcher';
root.render(
  <LanguageProvider>                          // thêm
    <App />
  </LanguageProvider>                         // thêm
);