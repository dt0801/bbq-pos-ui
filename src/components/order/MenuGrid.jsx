// ─── MenuGrid — lưới thực đơn + nút thêm/tăng/giảm ──────────────────────────
import React from "react";
import { API_URL, formatMoney } from "../../constants";

export default function MenuGrid({ filteredMenu, tableOrders, currentTable, addItem, updateQty, bgCard }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {filteredMenu.map(m => {
        const qty = tableOrders[currentTable]?.[m.id]?.qty || 0;
        return (
          <div key={m.id} className={`${bgCard} rounded-xl p-3 flex flex-col`}>
            <div onClick={() => addItem(m)} className="cursor-pointer flex-1">
              {m.image && <img src={`${API_URL}/uploads/${m.image}`} className="h-24 w-full object-cover rounded-lg mb-2" alt={m.name} />}
              <div className="font-semibold text-sm leading-tight">{m.name}</div>
              <div className="text-red-400 text-xs mt-1 mb-2">{formatMoney(m.price)}</div>
            </div>
            {qty > 0 ? (
              <div className="flex items-center justify-between bg-slate-700 rounded-lg px-2 py-1 mt-1">
                <button onClick={() => updateQty(m.id,"dec")} className="w-7 h-7 bg-slate-600 hover:bg-red-500 rounded-md font-bold transition">−</button>
                <span className="font-bold text-green-400">{qty}</span>
                <button onClick={() => updateQty(m.id,"inc")} className="w-7 h-7 bg-slate-600 hover:bg-green-500 rounded-md font-bold transition">+</button>
              </div>
            ) : (
              <button onClick={() => addItem(m)} className="mt-1 w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-1.5 text-xs font-semibold transition">+ Thêm</button>
            )}
          </div>
        );
      })}
    </div>
  );
}