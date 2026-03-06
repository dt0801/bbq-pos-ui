// ─── FilterBar — thanh lọc danh mục món ──────────────────────────────────────
import React from "react";
import { FILTERS } from "../../constants";

export default function FilterBar({ filter, setFilter, bgCard, textSub }) {
  return (
    <div className="flex gap-1.5 mb-3 flex-wrap flex-shrink-0">
      {FILTERS.map(f => (
        <button key={f.key} onClick={() => setFilter(f.key)}
          className={`px-3 py-1.5 rounded-full text-xs transition font-semibold whitespace-nowrap ${filter === f.key ? "bg-blue-500 text-white" : `${bgCard} ${textSub} hover:bg-slate-600`}`}>
          {f.label}
        </button>
      ))}
    </div>
  );
}