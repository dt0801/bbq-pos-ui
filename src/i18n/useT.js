import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';

/**
 * useT — Translation hook
 *
 * Usage:
 *   const t = useT();
 *   t('nav.order')              → "Đặt món" / "Order" / "Bestellung"
 *   t('manage.roles.admin')     → nested key support
 *   t('common.total', { count: 3 }) → interpolation: "Total (3)"
 *
 * Safe: returns the key itself if translation is missing,
 * so the app never crashes or shows blank text.
 */
export function useT() {
  const { locale } = useLanguage();

  const t = useCallback((key, vars) => {
    // Traverse nested keys: "nav.order" → locale.nav.order
    const value = key.split('.').reduce((obj, k) => obj?.[k], locale);

    if (value === undefined || value === null) {
      // Fallback: return last segment of key as readable text
      return key.split('.').pop();
    }

    if (typeof value !== 'string') return String(value);

    // Simple interpolation: t('msg', { name: 'Alice' }) → "Hello Alice"
    if (vars && typeof vars === 'object') {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
    }

    return value;
  }, [locale]);

  return t;
}

export default useT;