// ─── Header — thanh trên mobile ───────────────────────────────────────────────
import React, { useState, useRef, useEffect } from "react";
import { useT, useLanguage, LANGUAGE_OPTIONS } from "../../i18n";

export default function Header({ currentTable, tableStatus, printerStatus, darkMode, setDarkMode, logout, textSub }) {
  const t = useT();
  const { lang, changeLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentFlag = LANGUAGE_OPTIONS.find(o => o.code === lang)?.flag || "🌐";

  return (
    <div className={`bg-[#0b1220] px-4 py-3 flex items-center justify-between flex-shrink-0 border-b ${darkMode ? "border-slate-700" : "border-gray-300"}`}>
      <div className="flex items-center gap-2">
        <span className="text-orange-400 text-xl"><i className="fa-solid fa-fire-flame-curved" /></span>
        <span className="font-bold text-sm">BBQ POS</span>
        {currentTable && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tableStatus[currentTable] === "OPEN" ? "bg-orange-500/20 text-orange-400" : tableStatus[currentTable] === "PAYING" ? "bg-purple-500/20 text-purple-400" : "bg-slate-700 text-slate-400"}`}>
            {t('table.table')} {currentTable}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* ── Language popup ── */}
        <div ref={langRef} className="relative">
          <button onClick={() => setLangOpen(o => !o)} title={t('settings.languageLabel')}
            className={`text-lg transition ${langOpen ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
            {currentFlag}
          </button>
          {langOpen && (
            <div className="absolute top-full right-0 mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 py-1 min-w-max">
              {LANGUAGE_OPTIONS.map(opt => (
                <button key={opt.code} onClick={() => { changeLanguage(opt.code); setLangOpen(false); }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition hover:bg-slate-700 ${lang === opt.code ? "text-orange-400 font-semibold" : "text-slate-300"}`}>
                  <span className="text-base">{opt.flag}</span>
                  <span>{opt.label}</span>
                  {lang === opt.code && <i className="fa-solid fa-check text-xs ml-auto pl-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={`w-2 h-2 rounded-full ${printerStatus === "online" ? "bg-green-400" : printerStatus === "offline" ? "bg-red-500" : "bg-yellow-400 animate-pulse"}`} />
        <button onClick={() => setDarkMode(d => !d)} className={`${textSub} text-lg`}>
          {darkMode ? <i className="fa-solid fa-sun" /> : <i className="fa-solid fa-moon" />}
        </button>
        <button onClick={() => { if (window.confirm(t('auth.confirmLogout'))) logout(); }} className={`${textSub} text-lg`}>
          <i className="fa-solid fa-right-from-bracket" />
        </button>
      </div>
    </div>
  );
}