// ─── TableGrid — lưới chọn bàn ────────────────────────────────────────────────
import React from "react";
import { calcTotalQty } from "../../constants";

export default function TableGrid({ tables, tableStatus, tableOrders, currentTable, setCurrentTable, onSelect }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
      {tables.map(t => {
        const status = tableStatus[t] || "PAID";
        const qty    = calcTotalQty(tableOrders[t]);
        const isSel  = currentTable === t;
        return (
          <div key={t} onClick={() => { setCurrentTable(t); onSelect && onSelect(t); }}
            className={`p-3 rounded-xl text-center cursor-pointer transition font-semibold ${isSel ? "bg-blue-500 text-white" : status === "OPEN" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}>
            <div className="text-sm">Bàn {t}</div>
            <div className={`text-xs mt-0.5 font-normal ${status === "OPEN" ? "text-yellow-200" : "text-slate-400"}`}>
              {status === "OPEN" ? (qty > 0 ? `${qty} món` : "OPEN") : "Trống"}
            </div>
          </div>
        );
      })}
    </div>
  );
}