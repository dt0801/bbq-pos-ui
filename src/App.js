// ─── App.js — Root: auth check + wire hooks + layout desktop/mobile ───────────
import { useState, useEffect } from "react";
import "./App.css";
import { useAuth } from "./AuthContext";
import LoginScreen from "./LoginScreen";

import { filterMenu, TOTAL_TABLES } from "./constants";
import { useMenu }     from "./hooks/useMenu";
import { useTables }   from "./hooks/useTables";
import { useBills }    from "./hooks/useBills";
import { useStats }    from "./hooks/useStats";
import { useStaff }    from "./hooks/useStaff";
import { useSettings }     from "./hooks/useSettings";
import { useRealtimeSync } from "./hooks/useRealtimeSync";

import Sidebar   from "./components/layout/Sidebar";
import Header    from "./components/layout/Header";
import MobileNav from "./components/layout/MobileNav";

import TableGrid  from "./components/order/TableGrid";
import FilterBar  from "./components/order/FilterBar";
import MenuGrid   from "./components/order/MenuGrid";
import OrderPanel from "./components/order/OrderPanel";

import SplitModal    from "./components/modals/SplitModal";
import TransferModal from "./components/modals/TransferModal";

import ManageView   from "./components/views/ManageView";
import HistoryView  from "./components/views/HistoryView";
import StatsView    from "./components/views/StatsView";
import SettingsView from "./components/views/SettingsView";

import { LanguageProvider } from './i18n';

function AppInner() {
  const { logout, user, getToken } = useAuth();
  const role = user?.role || "waiter";

  const apiFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token && !(options.body instanceof FormData))
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      alert("Phiên làm việc đã hết. Vui lòng đăng nhập lại.");
      logout();
      return null;
    }
    return res;
  };

  const canPay    = role === "admin" || role === "cashier";
  const canManage = role === "admin" || role === "cashier";

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filter,       setFilter]       = useState("ALL");
  const [sidebarView,  setSidebarView]  = useState("order");
  const [darkMode,     setDarkMode]     = useState(true);
  const [mobileTab,    setMobileTab]    = useState("tables");
  const [manageTab,    setManageTab]    = useState("add");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [splitModal,   setSplitModal]   = useState(false);
  const [splitTarget,  setSplitTarget]  = useState("");
  const [splitSelected,setSplitSelected]= useState([]);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const menuHook     = useMenu(apiFetch);
  const tablesHook   = useTables(apiFetch);
  const settingsHook = useSettings(apiFetch);
  const billsHook    = useBills(settingsHook.settings, apiFetch);
  const statsHook    = useStats();
  const staffHook    = useStaff(getToken);

  const { menu, fetchMenu, newItem, setNewItem, file, setFile, editItem, setEditItem, editFile, setEditFile, addMenu, updateMenu, deleteMenu } = menuHook;
  const { tableList, tableStatus, tableOrders, currentTable, setCurrentTable, kitchenSent, setKitchenSent, itemNotes, setItemNotes, newTableNum, setNewTableNum, editingTable, setEditingTable, tableMsg, fetchTableStatus, fetchTableList, updateTableStatus, addItem, updateQty, saveOrders, cancelOrder, transferTable, executeSplit, resetTable, addTable, renameTable, deleteTable } = tablesHook;
  const { bills, selectedBill, setSelectedBill, historyDate, setHistoryDate, printerStatus, fetchBills, fetchBillDetail, printKitchenTicket, handlePayment, printTamTinh, reprintBill } = billsHook;
  const { statsToday, statsMonthlyData, statsYearlyData, statsTab, setStatsTab, statsMonth, setStatsMonth, statsYear, setStatsYear, statsPickedDate, setStatsPickedDate, fetchStatsByDate, fetchStatsMonthly, fetchStatsDaily, fetchStatsYearly, fetchAllStats } = statsHook;
  const { staffList, staffForm, setStaffForm, staffEditing, staffShowForm, setStaffShowForm, staffError, fetchStaff, openCreateStaff, openEditStaff, submitStaff, deleteStaff } = staffHook;
  const { settings, setSettings, settingsSaved, saveAllSettings, printers, printerForm, setPrinterForm, editPrinter, setEditPrinter, printJobs, loadingPrinters, printerMsg, fetchPrinters, fetchPrintJobs, savePrinter, deletePrinter, togglePrinterActive, retryJob } = settingsHook;

  // Realtime sync
  useRealtimeSync({
    getToken,
    setTableStatus: tablesHook.setTableStatus,
    setTableOrders: tablesHook.setTableOrders,
    setKitchenSent: tablesHook.setKitchenSent,
    setItemNotes:   tablesHook.setItemNotes,
  });

  // ── Derived ───────────────────────────────────────────────────────────────
  const tables      = tableList.length > 0 ? tableList.map(t => t.table_num) : Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);
  const currentItems = Object.values(tableOrders[currentTable] || {});
  const filteredMenu = filterMenu(menu, filter);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { fetchMenu(); fetchTableStatus(); fetchTableList(); }, []); // eslint-disable-line
  useEffect(() => { if (sidebarView === "manage")   fetchTableList(); },   [sidebarView]); // eslint-disable-line
  useEffect(() => { if (sidebarView === "history")  fetchBills(historyDate); }, [sidebarView, historyDate]); // eslint-disable-line
  useEffect(() => { if (sidebarView === "stats")    fetchAllStats(); },    [sidebarView, statsMonth, statsYear]); // eslint-disable-line
  useEffect(() => { if (sidebarView === "settings") { fetchPrinters(); fetchPrintJobs(); } }, [sidebarView]); // eslint-disable-line
  useEffect(() => { if (role === "admin") fetchStaff(); }, [role]); // eslint-disable-line

  // ── Theme ─────────────────────────────────────────────────────────────────
  const bg      = darkMode ? "bg-[#0f172a]"   : "bg-gray-100";
  const bgPanel = darkMode ? "bg-[#111827]"   : "bg-white";
  const bgCard  = darkMode ? "bg-[#1e293b]"   : "bg-gray-50 border border-gray-200";
  const text    = darkMode ? "text-white"     : "text-gray-900";
  const textSub = darkMode ? "text-slate-400" : "text-gray-500";
  const inputCls = darkMode
    ? "bg-[#1e293b] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 w-full"
    : "bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 w-full";

  // ── Props bundles ─────────────────────────────────────────────────────────
  const theme = { darkMode, bgCard, textSub, inputCls, text };

  const manageProps = {
    role, manageTab, setManageTab,
    menu, newItem, setNewItem, file, setFile, editItem, setEditItem, editFile, setEditFile,
    addMenu: async () => { const ok = await addMenu(); if (ok) setFilter("ALL"); },
    updateMenu, deleteMenu,
    tableList, newTableNum, setNewTableNum, editingTable, setEditingTable, tableMsg,
    addTable, renameTable, deleteTable,
    staffList, staffForm, setStaffForm, staffEditing, staffShowForm, setStaffShowForm, staffError,
    openCreateStaff, openEditStaff, submitStaff, deleteStaff,
    ...theme,
  };

  const historyProps = {
    bills, selectedBill, setSelectedBill, historyDate, setHistoryDate,
    fetchBills, fetchBillDetail, reprintBill, settings, ...theme,
  };

  const statsProps = {
    statsToday, statsMonthlyData, statsYearlyData,
    statsTab, setStatsTab, statsMonth, setStatsMonth, statsYear, setStatsYear,
    statsPickedDate, setStatsPickedDate, fetchStatsByDate,
    fetchStatsMonthly, fetchStatsDaily, fetchStatsYearly, ...theme,
  };

  const settingsProps = {
    settings, setSettings, settingsSaved, saveAllSettings,
    printers, printerForm, setPrinterForm, editPrinter, setEditPrinter,
    printJobs, loadingPrinters, printerMsg,
    fetchPrinters, fetchPrintJobs, savePrinter, deletePrinter, togglePrinterActive, retryJob,
    // staff (tab Tài khoản trong Settings)
    staffList, staffForm, setStaffForm, staffEditing, staffShowForm, setStaffShowForm, staffError,
    openCreateStaff, openEditStaff, submitStaff, deleteStaff,
    ...theme,
  };

  const orderPanelProps = {
    currentTable, tableStatus, tableOrders,
    kitchenSent, itemNotes, setItemNotes, updateQty, setKitchenSent,
    canPay, darkMode, bgCard, textSub,
    setSplitModal, setSplitSelected, setSplitTarget, setShowTransferModal,
    printKitchenTicket, printTamTinh,
    handlePayment: (p) => handlePayment({ ...p, updateTableStatus }),
    resetTable, saveOrders, cancelOrder,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`${bg} ${text} transition-colors duration-300`} style={{ minHeight: "100svh" }}>

      {/* Modals */}
      {splitModal && (
        <SplitModal currentTable={currentTable} currentItems={currentItems} tables={tables} tableStatus={tableStatus}
          splitSelected={splitSelected} setSplitSelected={setSplitSelected}
          splitTarget={splitTarget} setSplitTarget={setSplitTarget}
          setSplitModal={setSplitModal} executeSplit={executeSplit}
          bgCard={bgCard} textSub={textSub} />
      )}
      {showTransferModal && (
        <TransferModal currentTable={currentTable} tables={tables} tableStatus={tableStatus}
          transferTable={transferTable} setShowTransferModal={setShowTransferModal}
          bgPanel={bgPanel} text={text} />
      )}

      {/* ════ DESKTOP (md+) ════ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <Sidebar sidebarView={sidebarView} setSidebarView={setSidebarView}
          canPay={canPay} canManage={canManage} role={role}
          printerStatus={printerStatus} darkMode={darkMode} setDarkMode={setDarkMode}
          logout={logout} textSub={textSub} />

        {sidebarView === "order" && (
          <div className={`w-56 ${bgPanel} p-4 overflow-y-auto flex-shrink-0`}>
            <h2 className="mb-3 font-bold">BÀN</h2>
            <div className="flex gap-3 mb-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-600 inline-block"/>Trống</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"/>Có khách</span>
            </div>
            <TableGrid tables={tables} tableStatus={tableStatus} tableOrders={tableOrders} currentTable={currentTable} setCurrentTable={setCurrentTable} />
          </div>
        )}

        <div className="flex-1 p-5 flex flex-col overflow-hidden min-w-0">
          {sidebarView === "order" && (
            <>
              <FilterBar filter={filter} setFilter={setFilter} bgCard={bgCard} textSub={textSub} />
              <div className="flex-1 overflow-y-auto">
                <MenuGrid filteredMenu={filteredMenu} tableOrders={tableOrders} currentTable={currentTable} addItem={addItem} updateQty={updateQty} bgCard={bgCard} />
              </div>
            </>
          )}
          {sidebarView === "manage"   && <ManageView   {...manageProps}   />}
          {sidebarView === "history"  && <HistoryView  {...historyProps}  />}
          {sidebarView === "stats"    && <StatsView    {...statsProps}    />}
          {sidebarView === "settings" && <SettingsView {...settingsProps} />}
        </div>

        {sidebarView === "order" && (
          <div className="w-72 bg-[#0b1220] p-4 flex flex-col flex-shrink-0">
            <OrderPanel {...orderPanelProps} />
          </div>
        )}
      </div>

      {/* ════ MOBILE (<md) ════ */}
      <div className="flex flex-col md:hidden" style={{ height: "100svh" }}>
        <Header currentTable={currentTable} tableStatus={tableStatus} printerStatus={printerStatus}
          darkMode={darkMode} setDarkMode={setDarkMode} logout={logout} textSub={textSub} />

        <div className="flex-1 overflow-hidden">
          {mobileTab === "tables" && (
            <div className="h-full overflow-y-auto p-3">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-bold text-sm">CHỌN BÀN</h2>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"/>Trống</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"/>Có khách</span>
                </div>
              </div>
              <TableGrid tables={tables} tableStatus={tableStatus} tableOrders={tableOrders} currentTable={currentTable} setCurrentTable={setCurrentTable} onSelect={() => setMobileTab("menu")} />
            </div>
          )}

          {mobileTab === "menu" && (
            <div className="h-full overflow-y-auto p-3">
              {currentTable ? (
                <div className={`mb-3 px-3 py-2 rounded-xl ${bgCard} flex items-center justify-between`}>
                  <span className="text-sm font-semibold">Bàn {currentTable}</span>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setMobileTab("tables")} className={`text-xs ${textSub}`}><i className="fa-solid fa-arrow-left mr-1"/>Đổi bàn</button>
                    <button onClick={() => setMobileTab("order")} className="relative text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">
                      <i className="fa-solid fa-receipt mr-1"/>Order
                      {currentItems.reduce((s,i) => s+i.qty,0) > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{currentItems.reduce((s,i)=>s+i.qty,0)}</span>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-sm">
                  ⚠️ Chưa chọn bàn — <button onClick={() => setMobileTab("tables")} className="underline font-semibold">chọn bàn</button>
                </div>
              )}
              <FilterBar filter={filter} setFilter={setFilter} bgCard={bgCard} textSub={textSub} />
              <MenuGrid filteredMenu={filteredMenu} tableOrders={tableOrders} currentTable={currentTable} addItem={addItem} updateQty={updateQty} bgCard={bgCard} />
            </div>
          )}

          {mobileTab === "order"    && <div className="h-full overflow-hidden p-3"><OrderPanel {...orderPanelProps} /></div>}
          {mobileTab === "manage"   && <div className="h-full overflow-hidden p-3"><ManageView   {...manageProps}   /></div>}
          {mobileTab === "history"  && <div className="h-full overflow-hidden p-3"><HistoryView  {...historyProps}  /></div>}
          {mobileTab === "stats"    && <div className="h-full overflow-y-auto p-3"><StatsView    {...statsProps}    /></div>}
          {mobileTab === "settings" && <div className="h-full overflow-y-auto p-3"><SettingsView {...settingsProps} /></div>}
        </div>

        <MobileNav mobileTab={mobileTab} setMobileTab={setMobileTab}
          canPay={canPay} canManage={canManage} currentItems={currentItems}
          darkMode={darkMode} textSub={textSub} />
      </div>
    </div>
  );
}

export default function App() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user)  return <LoginScreen />;
  return <AppInner />;
}
root.render(
  <LanguageProvider>                          // thêm
    <App />
  </LanguageProvider>                         // thêm
);