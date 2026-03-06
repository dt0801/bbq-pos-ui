import React from 'react';
import { useLanguage, LANGUAGE_OPTIONS } from './LanguageContext';
import { useT } from './useT';

/**
 * LanguageSwitcher
 *
 * Drop this anywhere inside your Settings view:
 *
 *   import { LanguageSwitcher } from '../i18n';
 *   ...
 *   <LanguageSwitcher />
 *
 * Props:
 *   className  — extra Tailwind classes on the wrapper (optional)
 *   showLabel  — show "Ngôn ngữ / Language" label above (default: true)
 */
export function LanguageSwitcher({ className = '', showLabel = true }) {
  const { lang, changeLanguage } = useLanguage();
  const t = useT();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">
          {t('settings.languageLabel')}
        </label>
      )}

      <div className="flex gap-2 flex-wrap">
        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = lang === option.code;
          return (
            <button
              key={option.code}
              onClick={() => changeLanguage(option.code)}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium',
                'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm focus:ring-orange-400'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-500 focus:ring-orange-300',
              ].join(' ')}
            >
              <span className="text-base leading-none">{option.flag}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSwitcher;