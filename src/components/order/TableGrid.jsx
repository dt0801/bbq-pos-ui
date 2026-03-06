// ─── TableGrid — lưới chọn bàn ────────────────────────────────────────────────
import React from "react";
import { calcTotalQty } from "../../constants";
import { useT } from "../../i18n";

export default function TableGrid({ tables, tableStatus, tableOrders, currentTable, setCurrentTable, onSelect }) {
  const t = useT();
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
      {tables.map(tb => {
        const status = tableStatus[tb] || "PAID";
        const qty    = calcTotalQty(tableOrders[tb]);
        const isSel  = currentTable === tb;
        return (
          <div key={tb} onClick={() => { setCurrentTable(tb); onSelect && onSelect(tb); }}
            className={`p-3 rounded-xl text-center cursor-pointer transition font-semibold ${isSel ? "bg-blue-500 text-white" : status === "OPEN" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}>
            <div className="text-sm">{t('table.table')} {tb}</div>
            <div className={`text-xs mt-0.5 font-normal ${status === "OPEN" ? "text-yellow-200" : "text-slate-400"}`}>
              {status === "OPEN"
                ? (qty > 0 ? `${qty} ${t('order.itemCount')}` : t('table.occupied'))
                : t('table.empty')}
            </div>
          </div>
        );
      })}
    </div>
  );
}