// ─── MobileNav — bottom tab bar mobile ───────────────────────────────────────
import React from "react";

export default function MobileNav({ mobileTab, setMobileTab, canPay, canManage, currentItems, darkMode, textSub }) {
  const totalQty = currentItems.reduce((s, i) => s + i.qty, 0);
  const tabs = [
    { tab:"tables",  icon:"fa-table-cells-large", label:"Bàn",      show:true      },
    { tab:"menu",    icon:"fa-utensils",           label:"Thực đơn", show:true      },
    { tab:"order",   icon:"fa-receipt",            label:"Order",    show:true      },
    { tab:"history", icon:"fa-clock-rotate-left",  label:"Lịch sử", show:canPay    },
    { tab:"stats",   icon:"fa-chart-line",         label:"Thống kê", show:canPay    },
    { tab:"manage",  icon:"fa-gear",               label:"Quản lý",  show:canManage },
  ].filter(t => t.show);
  return (
    <div className={`bg-[#0b1220] border-t ${darkMode ? "border-slate-700" : "border-gray-300"} flex-shrink-0 safe-bottom`}>
      <div className="flex">
        {tabs.map(({ tab, icon, label }) => {
          const isActive = mobileTab === tab;
          const badge    = tab === "order" ? totalQty : 0;
          return (
            <button key={tab} onClick={() => setMobileTab(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition relative ${isActive ? "text-orange-400" : textSub}`}>
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-full" />}
              <div className="relative">
                <i className={`fa-solid ${icon} text-base`} />
                {badge > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">{badge}</span>}
              </div>
              <span className="text-xs leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}