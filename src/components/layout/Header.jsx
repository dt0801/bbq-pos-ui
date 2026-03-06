// ─── Header — thanh trên mobile ───────────────────────────────────────────────
import React from "react";
import { useT } from "../../i18n";

export default function Header({ currentTable, tableStatus, printerStatus, darkMode, setDarkMode, logout, textSub }) {
  const t = useT();
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