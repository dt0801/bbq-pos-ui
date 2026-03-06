// ─── SplitModal — tách món sang bàn khác ─────────────────────────────────────
import React from "react";
import { useT } from "../../i18n";

export default function SplitModal({ currentTable, currentItems, tables, tableStatus, splitSelected, setSplitSelected, splitTarget, setSplitTarget, setSplitModal, executeSplit, bgCard, textSub }) {
  const t = useT();
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className={`${bgCard} rounded-2xl p-5 w-full max-w-md flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold"><i className="fa-solid fa-code-branch mr-2 text-purple-400" />{t('modal.splitTitle')}</h3>
          <button onClick={() => setSplitModal(false)} className={`${textSub} hover:text-white`}><i className="fa-solid fa-xmark text-xl" /></button>
        </div>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {currentItems.map(item => (
            <div key={item.id} onClick={() => setSplitSelected(p => p.includes(item.id) ? p.filter(x=>x!==item.id) : [...p,item.id])}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${splitSelected.includes(item.id)?"border-purple-500 bg-purple-500/10":"border-slate-600 hover:bg-slate-700"}`}>
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${splitSelected.includes(item.id)?"bg-purple-500 border-purple-500":"border-slate-500"}`}>
                {splitSelected.includes(item.id) && <i className="fa-solid fa-check text-white text-xs" />}
              </div>
              <span className="flex-1 text-sm">{item.name}</span>
              <span className={`text-sm font-bold ${textSub}`}>x{item.qty}</span>
            </div>
          ))}
        </div>
        <div>
          <label className={`block text-sm ${textSub} mb-2`}>{t('modal.splitTarget')}</label>
          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {tables.filter(tb => tb !== currentTable).map(tb => (
              <button key={tb} onClick={() => setSplitTarget(tb)}
                className={`py-2 rounded-xl text-xs font-bold transition border ${splitTarget===tb?"bg-purple-500 border-purple-500 text-white":tableStatus[tb]==="OPEN"?"border-orange-500 text-orange-400":"border-slate-600 hover:bg-slate-700"}`}>
                {tb}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setSplitModal(false)} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-600 ${textSub} hover:bg-slate-700 transition`}>{t('common.cancel')}</button>
          <button onClick={() => executeSplit({ currentItems, splitTarget, splitSelected, setSplitModal, setSplitSelected, setSplitTarget })} disabled={splitSelected.length===0||!splitTarget}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${splitSelected.length>0&&splitTarget?"bg-purple-500 hover:bg-purple-600 text-white":"bg-slate-600 opacity-50 cursor-not-allowed text-slate-400"}`}>
            <i className="fa-solid fa-arrows-split-up-and-left mr-2" />{t('modal.splitConfirm')}{splitSelected.length>0?` (${splitSelected.length})`:""}
          </button>
        </div>
      </div>
    </div>
  );
}