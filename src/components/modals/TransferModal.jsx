// ─── TransferModal — chuyển toàn bộ bàn ─────────────────────────────────────
import React from "react";
import { useT } from "../../i18n";

export default function TransferModal({ currentTable, tables, tableStatus, transferTable, setShowTransferModal, bgPanel, text }) {
  const t = useT();
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`${bgPanel} ${text} rounded-2xl p-5 w-full max-w-sm shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold"><i className="fa-solid fa-right-left mr-2 text-yellow-400" />{t('modal.transferTitle')} {currentTable}</h3>
          <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
        </div>
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {tables.filter(tb => tb !== currentTable).map(tb => {
            const occ = tableStatus[tb]==="OPEN" || tableStatus[tb]==="PAYING";
            return (
              <button key={tb} onClick={() => !occ && transferTable(tb, setShowTransferModal)} disabled={occ}
                className={`h-12 rounded-xl font-bold text-sm transition ${occ?"bg-slate-700 text-slate-500 cursor-not-allowed opacity-50":"bg-green-600 hover:bg-green-500 text-white"}`}>
                {tb}{occ && <div className="text-xs font-normal opacity-70">{t('table.occupied')}</div>}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span><span className="inline-block w-3 h-3 rounded bg-green-600 mr-1" />{t('table.empty')}</span>
          <span><span className="inline-block w-3 h-3 rounded bg-slate-700 mr-1" />{t('table.occupied')}</span>
        </div>
      </div>
    </div>
  );
}