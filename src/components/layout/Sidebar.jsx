// ─── Sidebar — nav dọc desktop ────────────────────────────────────────────────
import React from "react";

export default function Sidebar({ sidebarView, setSidebarView, canPay, canManage, role, printerStatus, darkMode, setDarkMode, logout, textSub }) {
  const NavItem = ({ icon, label, view }) => (
    <div onClick={() => setSidebarView(view)} title={label}
      className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition w-full ${sidebarView === view ? "bg-blue-600 text-white" : `${textSub} hover:bg-slate-700`}`}>
      <span className="text-base">{icon}</span>
    </div>
  );
  return (
    <div className="w-16 bg-[#0b1220] flex flex-col items-center py-4 gap-2 flex-shrink-0">
      <div className="text-2xl mb-2 text-orange-400"><i className="fa-solid fa-fire-flame-curved" /></div>
      <NavItem icon={<i className="fa-solid fa-table-cells-large" />} label="Order"       view="order"    />
      {canManage && <NavItem icon={<i className="fa-solid fa-utensils"          />} label="Quản lý món" view="manage"   />}
      {canPay    && <NavItem icon={<i className="fa-solid fa-clock-rotate-left" />} label="Lịch sử"    view="history"  />}
      {canPay    && <NavItem icon={<i className="fa-solid fa-chart-line"        />} label="Thống kê"   view="stats"    />}
      {role === "admin" && <NavItem icon={<i className="fa-solid fa-gear" />}       label="Cài đặt"    view="settings" />}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div title={printerStatus === "online" ? "Online" : printerStatus === "offline" ? "Offline" : "Kiểm tra..."} className="flex flex-col items-center gap-1">
          <span className="text-lg"><i className="fa-solid fa-print" /></span>
          <span className={`w-2 h-2 rounded-full ${printerStatus === "online" ? "bg-green-400" : printerStatus === "offline" ? "bg-red-500" : "bg-yellow-400 animate-pulse"}`} />
        </div>
        <div onClick={() => setDarkMode(d => !d)} className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-slate-700`}>
          {darkMode ? <i className="fa-solid fa-sun" /> : <i className="fa-solid fa-moon" />}
        </div>
        <div onClick={() => { if (window.confirm("Đăng xuất?")) logout(); }} className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-red-700 hover:text-white`}>
          <i className="fa-solid fa-right-from-bracket" />
        </div>
      </div>
    </div>
  );
}