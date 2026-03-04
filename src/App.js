import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';

// =============================================
// CONSTANTS
// =============================================

const TOTAL_TABLES = 20;
const FILTERS = [
  { key: "ALL",      label: "Tất cả"    },
  { key: "COMBO",    label: "Combo"     },
  { key: "KHAI_VI",  label: "Khai vị"   },
  { key: "SIGNATURE",label: "Signature" },
  { key: "NHAU",     label: "Nhậu"      },
  { key: "GA",       label: "Gà"        },
  { key: "BO",       label: "Bò"        },
  { key: "HEO",      label: "Heo/Nai"   },
  { key: "ECH",      label: "Ếch"       },
  { key: "CA",       label: "Cá"        },
  { key: "LUON",     label: "Lươn"      },
  { key: "SO_DIEP",  label: "Sò điệp"   },
  { key: "HAISAN",   label: "Hải sản"   },
  { key: "RAU",      label: "Rau xào"   },
  { key: "LAU",      label: "Lẩu"       },
  { key: "COM_MI",   label: "Cơm - Mì"  },
  { key: "DRINK",    label: "Đồ uống"   },
];

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// =============================================
// HELPER FUNCTIONS
// =============================================

const formatMoney = (n) => new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";

const removeTones = (str) => {
  const map = {
    'à':'a','á':'a','ả':'a','ã':'a','ạ':'a',
    'ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a',
    'â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a',
    'đ':'d',
    'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e',
    'ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e',
    'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
    'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o',
    'ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o',
    'ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o',
    'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u',
    'ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u',
    'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
  };
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
};

const filterMenu = (menu, filter) => {
  if (filter === "ALL") return menu;
  const r = (m) => removeTones(m.name);
  const has  = (m, ...keys) => keys.some(k => r(m).includes(removeTones(k)));
  const hasN = (m, ...keys) => !keys.some(k => r(m).includes(removeTones(k)));

  const map = {
    COMBO:     (m) => m.type === "COMBO",
    DRINK:     (m) => m.type === "DRINK",
    KHAI_VI:   (m) => has(m, "xuc xich", "khoai tay", "salad"),
    SIGNATURE: (m) => has(m, "oc nhoi", "heo moi", "nai xao", "nai xong", "dat vang", "tieu xanh"),
    NHAU:      (m) => has(m, "sun ga chien", "chan ga chien", "canh ga chien", "ech chien gion", "ca trung chien"),
    GA:        (m) => has(m, "ga") && hasN(m, "chien man", "sun ga", "ca trum", "ra lau"),
    BO:        (m) => has(m, "bo") && hasN(m, "bun bo", "ra bo"),
    HEO:       (m) => has(m, "heo", "nai", "suon heo"),
    ECH:       (m) => has(m, "ech"),
    CA:        (m) => has(m, "ca trung nuong", "ca tam nuong"),
    LUON:      (m) => has(m, "luon ngong"),
    SO_DIEP:   (m) => has(m, "so diep"),
    HAISAN:    (m) => has(m, "tom", "muc", "bach tuoc"),
    RAU:       (m) => has(m, "rau muong", "rau cu xao", "rau rung", "mang tay xao"),
    LAU:       (m) => has(m, "lau", "dia lau", "nam kim cham", "mi goi", "rau lau") && hasN(m, "ca tau mang"),
    COM_MI:    (m) => has(m, "com chien", "mi xao", "com lam"),
  };
  const fn = map[filter];
  return fn ? menu.filter(fn) : menu;
};

const calcTotal = (tableData = {}) =>
  Object.values(tableData).reduce((s, i) => s + i.price * i.qty, 0);

const calcTotalQty = (tableData = {}) =>
  Object.values(tableData).reduce((s, i) => s + i.qty, 0);

const tableColor = (status, isSelected) => {
  if (isSelected) return "bg-blue-500 text-white";
  if (status === "OPEN") return "bg-orange-500 text-white";
  return "bg-slate-700 hover:bg-slate-600 text-white";
};

// =============================================
// MAIN APP COMPONENT (all hooks here, no early returns before hooks)
// =============================================
function AppInner() {
  const { logout } = useAuth();

  // ----- CORE STATE -----
  const [menu, setMenu]               = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [tableOrders, setTableOrders] = useState({});
  const [tableStatus, setTableStatus] = useState({});
  const [filter, setFilter]           = useState("ALL");
  const [sidebarView, setSidebarView] = useState("order");

  // ----- CHUYỂN BÀN -----
  const [showTransferModal, setShowTransferModal] = useState(false);

  // ----- DARK/LIGHT MODE -----
  const [darkMode, setDarkMode] = useState(true);

  const [printerStatus, setPrinterStatus] = useState(null);
  const [windowsPrinters, setWindowsPrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    kitchen_printer_connection: "IP", kitchen_printer_ip: "192.168.1.100", kitchen_printer_usb_name: "",
    tamtinh_printer_connection: "IP", tamtinh_printer_ip: "192.168.1.100", tamtinh_printer_usb_name: "",
    payment_printer_connection: "IP", payment_printer_ip: "192.168.1.100", payment_printer_usb_name: "",
    printer_ip:    "192.168.1.100",
    printer_type:  "EPSON",
    store_name:    "Tiệm Nướng Đà Lạt Và Em",
    store_address: "24 đường 3 tháng 4, Đà Lạt",
    store_phone:   "081 366 5665",
    total_tables:  "20",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [testingPrinter, setTestingPrinter] = useState({ kitchen: false, tamtinh: false, payment: false });
  const [testResult,     setTestResult]     = useState({ kitchen: null,  tamtinh: null,  payment: null  });
  const [splitModal,    setSplitModal]    = useState(false);
  const [splitTarget,   setSplitTarget]   = useState("");
  const [splitSelected, setSplitSelected] = useState([]);
  const [statsTab,      setStatsTab]      = useState("day");
  const [statsMonthlyData, setStatsMonthlyData] = useState(null);
  const [statsYearlyData,  setStatsYearlyData]  = useState(null);
  const [statsYear,     setStatsYear]     = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(r => r.json())
      .then(d => setSettings(prev => ({ ...prev, ...d })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const checkPrinter = () => {
      fetch(`${API_URL}/print/status`)
        .then(r => r.json())
        .then(d => setPrinterStatus(d.connected ? "online" : "offline"))
        .catch(() => setPrinterStatus("offline"));
    };
    checkPrinter();
    const interval = setInterval(checkPrinter, 30000);
    return () => clearInterval(interval);
  }, []);

  const saveSetting = async (key, value) => {
    await fetch(`${API_URL}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  };

  const saveAllSettings = async () => {
    await Promise.all(Object.entries(settings).map(([k, v]) => saveSetting(k, v)));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const fetchWindowsPrinters = async () => {
    setLoadingPrinters(true);
    try {
      const res  = await fetch(`${API_URL}/printers`);
      const data = await res.json();
      setWindowsPrinters(data);
    } catch {
      setWindowsPrinters([]);
    }
    setLoadingPrinters(false);
  };

  const testPrinterByKey = async (key) => {
    setTestingPrinter(p => ({ ...p, [key]: true }));
    setTestResult(p => ({ ...p, [key]: null, [`${key}_method`]: null }));
    try {
      const ip      = settings[`${key}_printer_ip`]       || "";
      const usbName = settings[`${key}_printer_usb_name`] || "";
      const res = await fetch(`${API_URL}/print/test`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printer_key: key, ip, usb_name: usbName }),
      });
      const data = await res.json();
      setTestResult(p => ({
        ...p,
        [key]: data.connected ? "ok" : "fail",
        [`${key}_method`]: data.method || null,
      }));
    } catch {
      setTestResult(p => ({ ...p, [key]: "fail", [`${key}_method`]: null }));
    } finally {
      setTestingPrinter(p => ({ ...p, [key]: false }));
    }
  };

  const [kitchenSent, setKitchenSent] = useState({});
  const [itemNotes, setItemNotes] = useState({});

  // ----- MANAGE STATE -----
  const [manageTab, setManageTab]   = useState("add");
  const [newItem, setNewItem]       = useState({ name: "", price: "", type: "FOOD" });
  const [file, setFile]             = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [editFile, setEditFile]     = useState(null);

  // ----- TABLE MANAGE STATE -----
  const [tableList, setTableList]       = useState([]);
  const [newTableNum, setNewTableNum]   = useState("");
  const [editingTable, setEditingTable] = useState(null);
  const [tableMsg, setTableMsg]         = useState(null);

  // ----- HISTORY STATE -----
  const [bills, setBills]             = useState([]);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedBill, setSelectedBill] = useState(null);

  // ----- STATS STATE -----
  const [statsToday, setStatsToday]   = useState(null);
  const [, setStatsDaily] = useState([]);
  const [statsMonth, setStatsMonth]   = useState(new Date().toISOString().slice(0, 7));

  // ----- DERIVED -----
  const tables = tableList.length > 0
    ? tableList.map(t => t.table_num)
    : Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);

  const currentItems  = Object.values(tableOrders[currentTable] || {});
  const total         = calcTotal(tableOrders[currentTable]);
  const filteredMenu  = filterMenu(menu, filter);

  // Theme classes
  const bg      = darkMode ? "bg-[#0f172a]"  : "bg-gray-100";
  const bgPanel = darkMode ? "bg-[#111827]"  : "bg-white";
  const bgSide  = darkMode ? "bg-[#0b1220]"  : "bg-gray-200";
  const bgCard  = darkMode ? "bg-[#1e293b]"  : "bg-gray-50 border border-gray-200";
  const text    = darkMode ? "text-white"    : "text-gray-900";
  const textSub = darkMode ? "text-slate-400": "text-gray-500";
  const inputCls= darkMode
    ? "bg-[#1e293b] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 w-full"
    : "bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 w-full";

  // =============================================
  // DATA FETCHING
  // =============================================

  const fetchMenu = useCallback(() => {
    fetch(`${API_URL}/menu`).then(r => r.json()).then(setMenu)
      .catch(e => console.error("Lỗi fetch menu:", e));
  }, []);

  const fetchTableStatus = useCallback(() => {
    fetch(`${API_URL}/tables`).then(r => r.json()).then(rows => {
      const map = {};
      rows.forEach(r => { map[r.table_num] = r.status; });
      setTableStatus(map);
    }).catch(e => console.error("Lỗi fetch tables:", e));
  }, []);

  const fetchBills = useCallback((date) => {
    fetch(`${API_URL}/bills?date=${date}`).then(r => r.json()).then(setBills)
      .catch(e => console.error("Lỗi fetch bills:", e));
  }, []);

  const fetchStatsToday = useCallback(() => {
    fetch(`${API_URL}/stats/today`).then(r => r.json()).then(setStatsToday)
      .catch(e => console.error("Lỗi fetch stats today:", e));
  }, []);

  const fetchStatsDaily = useCallback((month) => {
    fetch(`${API_URL}/stats/daily?month=${month}`).then(r => r.json()).then(setStatsDaily)
      .catch(e => console.error("Lỗi fetch stats daily:", e));
  }, []);

  const fetchBillDetail = async (id) => {
    const data = await fetch(`${API_URL}/bills/${id}`).then(r => r.json());
    setSelectedBill(data);
  };

  const fetchTableList = useCallback(() => {
    Promise.all([
      fetch(`${API_URL}/tables`).then(r => r.json()),
      fetch(`${API_URL}/settings`).then(r => r.json()),
    ]).then(([rows, cfg]) => {
      const settingTotal = Number(cfg.total_tables) || 20;
      const dbMax = rows.reduce((max, r) => Math.max(max, r.table_num), 0);
      const total = Math.max(settingTotal, dbMax);
      const dbMap = {};
      rows.forEach(r => { dbMap[r.table_num] = r.status; });
      const full = Array.from({ length: total }, (_, i) => ({
        table_num: i + 1,
        status: dbMap[i + 1] || "PAID",
      }));
      setTableList(full);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchMenu(); fetchTableStatus(); fetchTableList(); }, [fetchMenu, fetchTableStatus, fetchTableList]);

  useEffect(() => {
    if (sidebarView === "manage") fetchTableList();
  }, [sidebarView, fetchTableList]);

  useEffect(() => {
    if (sidebarView === "history") fetchBills(historyDate);
  }, [sidebarView, historyDate, fetchBills]);

  const fetchStatsMonthly = useCallback((month) => {
    fetch(`${API_URL}/stats/monthly?month=${month}`).then(r=>r.json()).then(setStatsMonthlyData).catch(()=>{});
  }, []);
  const fetchStatsYearly = useCallback((year) => {
    fetch(`${API_URL}/stats/yearly?year=${year}`).then(r=>r.json()).then(setStatsYearlyData).catch(()=>{});
  }, []);

  useEffect(() => {
    if (sidebarView === "stats") {
      fetchStatsToday();
      fetchStatsDaily(statsMonth);
      fetchStatsMonthly(statsMonth);
      fetchStatsYearly(statsYear);
    }
  }, [sidebarView, statsMonth, statsYear, fetchStatsToday, fetchStatsDaily, fetchStatsMonthly, fetchStatsYearly]);

  // =============================================
  // ORDER HANDLERS
  // =============================================

  const addItem = useCallback((item) => {
    if (!currentTable) return alert("Vui lòng chọn bàn trước!");

    setTableOrders(prev => {
      const table = prev[currentTable] || {};
      const exist = table[item.id];
      return {
        ...prev,
        [currentTable]: {
          ...table,
          [item.id]: exist ? { ...exist, qty: exist.qty + 1 } : { ...item, qty: 1 },
        },
      };
    });

    if (!tableStatus[currentTable] || tableStatus[currentTable] === "PAID") {
      updateTableStatus(currentTable, "OPEN");
    }
  }, [currentTable, tableStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateQty = useCallback((itemId, action) => {
    if (!currentTable) return;
    setTableOrders(prev => {
      const table = prev[currentTable];
      if (!table || !table[itemId]) return prev;
      const newQty = action === "inc" ? table[itemId].qty + 1 : table[itemId].qty - 1;
      const updated = { ...table };
      if (newQty <= 0) delete updated[itemId];
      else updated[itemId] = { ...table[itemId], qty: newQty };
      return { ...prev, [currentTable]: updated };
    });
  }, [currentTable]);

  // =============================================
  // TABLE STATUS
  // =============================================

  const updateTableStatus = async (tableNum, status) => {
    setTableStatus(prev => ({ ...prev, [tableNum]: status }));
    await fetch(`${API_URL}/tables/${tableNum}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  // =============================================
  // BILLING
  // =============================================

  const printKitchenTicket = async () => {
    if (!currentTable) return alert("Vui lòng chọn bàn!");
    if (currentItems.length === 0) return alert("Chưa có món nào!");

    const notes = itemNotes[currentTable] || {};

    try {
      const res = await fetch(`${API_URL}/print/kitchen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_num: currentTable,
          items: currentItems.map(i => ({
            name: i.name,
            qty:  i.qty,
            note: notes[i.id] || "",
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi máy in");

      setKitchenSent(prev => ({
        ...prev,
        [currentTable]: Object.fromEntries(currentItems.map(i => [i.id, i.qty])),
      }));

    } catch (err) {
      const notes = itemNotes[currentTable] || {};
      const win = window.open("", "_blank", "width=500,height=600");
      win.document.write(`
        <html><head><title>Phiếu Bếp</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: monospace; font-size: 15px; padding: 20px; }
          h2 { text-align:center; font-size:20px; margin-bottom:4px; }
          .sub { text-align:center; color:#666; font-size:13px; margin-bottom:14px; }
          hr { border: 1px dashed #999; margin: 8px 0; }
          .row { display:flex; justify-content:space-between; margin: 8px 0; font-size:16px; }
          .qty { font-weight:bold; font-size:20px; }
          .note { font-size:12px; color:#c00; margin-left:16px; }
          .footer { text-align:center; margin-top:14px; font-size:12px; color:#666; }
          @media print { @page { size: A5; margin: 10mm; } }
        </style></head><body>
        <h2>🍳 PHIẾU BẾP</h2>
        <div class="sub">Bàn ${currentTable} &nbsp;|&nbsp; ${new Date().toLocaleTimeString("vi-VN")}</div>
        <hr/>
        ${currentItems.map(item => `
          <div class="row">
            <span>${item.name}</span>
            <span class="qty">x${item.qty}</span>
          </div>
          ${notes[item.id] ? `<div class="note">📝 ${notes[item.id]}</div>` : ""}
        `).join("")}
        <hr/>
        <div class="footer">Giao bếp lúc ${new Date().toLocaleTimeString("vi-VN")}</div>
        </body></html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);

      setKitchenSent(prev => ({
        ...prev,
        [currentTable]: Object.fromEntries(currentItems.map(i => [i.id, i.qty])),
      }));
    }
  };

  const handlePayment = async () => {
    if (!currentTable) return;
    if (currentItems.length === 0) return alert("Bàn chưa có món!");

    await fetch(`${API_URL}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_num: currentTable,
        total,
        items: currentItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
      }),
    });

    const printBill = (items, total, tableNum) => {
      const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";
      const now = new Date().toLocaleString("vi-VN");
      const rows = items.map((item, i) => `
        <tr>
          <td>${i + 1}. ${item.name}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">${fmt(item.price * item.qty)}</td>
        </tr>
      `).join("");

      const win = window.open("", "_blank", "width=794,height=900");
      win.document.write(`
        <html><head><title>Hóa Đơn</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: monospace; font-size: 13px; width: 100%; max-width: 400px; margin: 0 auto; padding: 20px; }
          h2 { text-align: center; font-size: 15px; margin-bottom: 2px; }
          .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 10px; }
          .info { font-size: 12px; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin: 6px 0; }
          th { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 2px; font-size: 12px; }
          td { padding: 3px 2px; font-size: 12px; vertical-align: top; }
          td:nth-child(1) { width: 55%; }
          td:nth-child(2) { width: 10%; text-align: center; }
          td:nth-child(3) { width: 35%; text-align: right; }
          .total-row { border-top: 1px dashed #000; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 10px; font-size: 11px; color: #555; }
          @media print { @page { size: A4; margin: 20mm; } }
        </style></head>
        <body>
          <h2>TIỆM NƯỚNG ĐÀ LẠT VÀ EM</h2>
          <div class="sub">24 đường 3 tháng 4, Đà Lạt<br/>Hotline: 081 366 5665</div>
          <div class="info">Bàn: <b>${tableNum}</b></div>
          <div class="info">Ngày: ${now}</div>
          <table>
            <thead><tr><th style="text-align:left">TÊN HÀNG</th><th>SL</th><th style="text-align:right">T.TIỀN</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="total-row"><span>THÀNH TIỀN</span><span>${fmt(total)}</span></div>
          <div class="footer">Cảm Ơn Quý Khách - Hẹn Gặp Lại!</div>
        </body></html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
    };

    try {
      const printRes = await fetch(`${API_URL}/print/bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_num: currentTable,
          total,
          items: currentItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        }),
      });
      const printData = await printRes.json();
      if (!printRes.ok) throw new Error(printData.error);
    } catch (err) {
      printBill(currentItems, total, currentTable);
    }

    updateTableStatus(currentTable, "PAYING");
  };

  const resetTable = () => {
    if (!currentTable) return;
    if (!window.confirm(`Reset bàn ${currentTable}? Toàn bộ order sẽ bị xóa.`)) return;

    setTableOrders(prev => { const c = { ...prev }; delete c[currentTable]; return c; });
    setKitchenSent(prev => { const c = { ...prev }; delete c[currentTable]; return c; });
    setItemNotes(prev => { const c = { ...prev }; delete c[currentTable]; return c; });
    updateTableStatus(currentTable, "PAID");
  };

  const transferTable = async (targetTable) => {
    if (!currentTable || currentTable === targetTable) return;

    const targetStatus = tableStatus[targetTable];
    if (targetStatus === "OPEN" || targetStatus === "PAYING") {
      alert(`Bàn ${targetTable} đang có khách, không thể chuyển!`);
      return;
    }

    setTableOrders(prev => {
      const updated = { ...prev };
      updated[targetTable] = prev[currentTable] || {};
      delete updated[currentTable];
      return updated;
    });

    setKitchenSent(prev => {
      const updated = { ...prev };
      updated[targetTable] = prev[currentTable] || {};
      delete updated[currentTable];
      return updated;
    });

    setItemNotes(prev => {
      const updated = { ...prev };
      updated[targetTable] = prev[currentTable] || {};
      delete updated[currentTable];
      return updated;
    });

    await updateTableStatus(currentTable, "PAID");
    await updateTableStatus(targetTable, "OPEN");
    setTableStatus(prev => ({ ...prev, [currentTable]: "PAID", [targetTable]: "OPEN" }));
    setCurrentTable(targetTable);
    setShowTransferModal(false);
  };

  const executeSplit = () => {
    if (!splitTarget || splitSelected.length === 0) return;
    const itemsToMove = currentItems.filter(i => splitSelected.includes(i.id));
    const remaining   = currentItems.filter(i => !splitSelected.includes(i.id));
    setTableOrders(prev => {
      const dest = [...(prev[splitTarget] || [])];
      itemsToMove.forEach(item => {
        const ex = dest.find(x => x.id === item.id);
        if (ex) ex.qty += item.qty; else dest.push({ ...item });
      });
      return { ...prev, [splitTarget]: dest, [currentTable]: remaining };
    });
    setTableStatus(p => ({
      ...p, [splitTarget]: "OPEN",
      ...(remaining.length === 0 ? { [currentTable]: "PAID" } : {}),
    }));
    updateTableStatus(splitTarget, "OPEN");
    if (remaining.length === 0) updateTableStatus(currentTable, "PAID");
    setSplitModal(false); setSplitSelected([]); setSplitTarget("");
  };

  const printTamTinh = async () => {
    if (!currentTable) return alert("Vui lòng chọn bàn!");
    if (currentItems.length === 0) return alert("Chưa có món nào!");
    const total = currentItems.reduce((s, i) => s + i.price * i.qty, 0);
    try {
      const res = await fetch(`${API_URL}/print/tamtinh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_num: currentTable, items: currentItems, total }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Lỗi");
    } catch {
      const fmt = n => new Intl.NumberFormat("vi-VN").format(n) + "đ";
      const win = window.open("", "_blank", "width=500,height=600");
      win.document.write(`<html><head><title>Tạm Tính</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;padding:16px}
        h2{text-align:center;margin-bottom:8px}.line{border-top:1px dashed #000;margin:8px 0}
        .row{display:flex;justify-content:space-between}.bold{font-weight:bold}
        .footer{text-align:center;margin-top:8px;font-style:italic;font-size:11px}</style></head>
        <body><h2>** TẠM TÍNH **</h2><div>Bàn: ${currentTable}</div>
        <div>Giờ: ${new Date().toLocaleString("vi-VN")}</div><div class="line"></div>
        ${currentItems.map(i => `<div class="row"><span>${i.name} x${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join("")}
        <div class="line"></div>
        <div class="row bold"><span>TẠM TÍNH</span><span>${fmt(total)}</span></div>
        <div class="footer">(Chưa thanh toán chính thức)</div></body></html>`);
      win.document.close(); win.print();
    }
  };

  // =============================================
  // MENU MANAGEMENT
  // =============================================

  const addMenu = async () => {
    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("price", newItem.price);
    formData.append("type", newItem.type);
    if (file) formData.append("image", file);
    await fetch(`${API_URL}/menu`, { method: "POST", body: formData });
    setNewItem({ name: "", price: "", type: "FOOD" });
    setFile(null);
    fetchMenu();
  };

  const updateMenu = async () => {
    if (!editItem) return;
    const formData = new FormData();
    formData.append("name", editItem.name);
    formData.append("price", editItem.price);
    formData.append("type", editItem.type);
    if (editFile) formData.append("image", editFile);
    await fetch(`${API_URL}/menu/${editItem.id}`, { method: "PUT", body: formData });
    setEditItem(null);
    setEditFile(null);
    fetchMenu();
  };

  const deleteMenu = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    await fetch(`${API_URL}/menu/${id}`, { method: "DELETE" });
    fetchMenu();
  };

  // =============================================
  // TABLE MANAGEMENT HANDLERS
  // =============================================

  const showTableMsg = (type, text) => {
    setTableMsg({ type, text });
    setTimeout(() => setTableMsg(null), 3000);
  };

  const addTable = async () => {
    const num = Number(newTableNum);
    if (!num || num < 1) return showTableMsg("err", "Số bàn không hợp lệ");

    if (tableList.some(t => t.table_num === num)) {
      return showTableMsg("err", `Bàn ${num} đã tồn tại`);
    }

    await fetch(`${API_URL}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_num: num }),
    });

    const currentTotal = tableList.length;
    if (num > currentTotal) {
      await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "total_tables", value: String(num) }),
      });
    }

    setNewTableNum("");
    showTableMsg("ok", `Đã thêm Bàn ${num}`);
    fetchTableList();
    fetchTableStatus();
  };

  const renameTable = async () => {
    if (!editingTable) return;
    const { table_num, new_num } = editingTable;
    if (!new_num || Number(new_num) < 1) return showTableMsg("err", "Số bàn không hợp lệ");
    if (Number(new_num) === table_num) { setEditingTable(null); return; }
    const res  = await fetch(`${API_URL}/tables/${table_num}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_num: Number(new_num) }),
    });
    const data = await res.json();
    if (!res.ok) return showTableMsg("err", data.error);
    setEditingTable(null);
    showTableMsg("ok", `Đã đổi Bàn ${table_num} → Bàn ${new_num}`);
    fetchTableList();
    fetchTableStatus();
  };

  const deleteTable = async (num) => {
    if (!window.confirm(`Xóa Bàn ${num}? Bàn sẽ bị xóa khỏi danh sách.`)) return;
    const inDb = tableList.find(t => t.table_num === num);
    if (inDb) {
      const res  = await fetch(`${API_URL}/tables/${num}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return showTableMsg("err", data.error);
    }
    setTableList(prev => prev.filter(t => t.table_num !== num));
    showTableMsg("ok", `Đã xóa Bàn ${num}`);
    fetchTableStatus();
  };

  // =============================================
  // RENDER HELPERS
  // =============================================

  const NavItem = ({ icon, label, view }) => (
    <div
      onClick={() => setSidebarView(view)}
      title={label}
      className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition w-full
        ${sidebarView === view ? "bg-blue-600 text-white" : `${textSub} hover:bg-slate-700`}`}
    >
      <span className="text-base">{icon}</span>
    </div>
  );

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className={`h-screen ${bg} ${text} flex transition-colors duration-300`}>

      {/* ==================== MODAL TÁCH BÀN ==================== */}
      {splitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`${bgCard} rounded-2xl p-6 w-full max-w-md flex flex-col gap-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg"><i className="fa-solid fa-code-branch mr-2 text-purple-400"/>Tách bàn</h3>
              <button onClick={() => setSplitModal(false)} className={`${textSub} hover:text-white`}>
                <i className="fa-solid fa-xmark text-xl"/>
              </button>
            </div>
            <p className={`text-sm ${textSub}`}>Chọn món muốn chuyển từ <b className="text-white">Bàn {currentTable}</b>:</p>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
              {currentItems.map(item => (
                <div key={item.id}
                  onClick={() => setSplitSelected(prev =>
                    prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                  )}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border
                    ${splitSelected.includes(item.id) ? "border-purple-500 bg-purple-500/10" : "border-slate-600 hover:bg-slate-700"}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0
                    ${splitSelected.includes(item.id) ? "bg-purple-500 border-purple-500" : "border-slate-500"}`}>
                    {splitSelected.includes(item.id) && <i className="fa-solid fa-check text-white text-xs"/>}
                  </div>
                  <span className="flex-1 text-sm">{item.name}</span>
                  <span className={`text-sm font-bold ${textSub}`}>x{item.qty}</span>
                </div>
              ))}
            </div>
            <div>
              <label className={`block text-sm ${textSub} mb-2`}>Chuyển sang bàn:</label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto">
                {tables.filter(t => t !== currentTable).map(t => (
                  <button key={t} onClick={() => setSplitTarget(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition border
                      ${splitTarget === t ? "bg-purple-500 border-purple-500 text-white"
                        : tableStatus[t]==="OPEN" ? "border-orange-500 text-orange-400 hover:bg-orange-500/10"
                        : "border-slate-600 hover:bg-slate-700"}`}>
                    {t}
                    {tableStatus[t]==="OPEN" && <div className="text-xs font-normal opacity-70">có khách</div>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSplitModal(false)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-600 ${textSub} hover:bg-slate-700 transition`}>
                Hủy
              </button>
              <button onClick={executeSplit}
                disabled={splitSelected.length === 0 || !splitTarget}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition
                  ${splitSelected.length > 0 && splitTarget ? "bg-purple-500 hover:bg-purple-600 text-white" : "bg-slate-600 opacity-50 cursor-not-allowed text-slate-400"}`}>
                <i className="fa-solid fa-arrows-split-up-and-left mr-2"/>
                Chuyển {splitSelected.length > 0 ? `(${splitSelected.length} món)` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== LEFT SIDEBAR ==================== */}
      <div className={`w-16 ${bgSide} flex flex-col items-center py-4 gap-2`}>
        <div className="text-2xl mb-2 text-orange-400"><i className="fa-solid fa-fire-flame-curved"/></div>
        <NavItem icon={<i className="fa-solid fa-table-cells-large"/>} label="Order" view="order"   />
        <NavItem icon={<i className="fa-solid fa-utensils"/>} label="Quản lý món" view="manage"  />
        <NavItem icon={<i className="fa-solid fa-clock-rotate-left"/>} label="Lịch sử" view="history" />
        <NavItem icon={<i className="fa-solid fa-chart-line"/>} label="Thống kê" view="stats"   />
        <NavItem icon={<i className="fa-solid fa-gear"/>}       label="Cài đặt"  view="settings"/>

        <div className="mt-auto flex flex-col items-center gap-2">
          <div
            title={printerStatus === "online" ? "Máy in: Online" : printerStatus === "offline" ? "Máy in: Offline" : "Đang kiểm tra máy in..."}
            className="flex flex-col items-center gap-1 cursor-default"
          >
            <span className="text-lg"><i className="fa-solid fa-print"/></span>
            <span className={`w-2 h-2 rounded-full ${
              printerStatus === "online"  ? "bg-green-400" :
              printerStatus === "offline" ? "bg-red-500"   :
              "bg-yellow-400 animate-pulse"
            }`}/>
          </div>

          <div
            onClick={() => fetch(`${API_URL}/open-log`, { method: "POST" })}
            title="Mở Log" className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-slate-700`}>
            <i className="fa-solid fa-terminal"/>
          </div>
          <div
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? "Chuyển Light mode" : "Chuyển Dark mode"}
            className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-slate-700`}
          >
            {darkMode ? <i className="fa-solid fa-sun"/> : <i className="fa-solid fa-moon"/>}
          </div>

          {/* Nút đăng xuất */}
          <div
            onClick={() => { if (window.confirm("Đăng xuất?")) logout(); }}
            title="Đăng xuất"
            className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-red-700 hover:text-white`}
          >
            <i className="fa-solid fa-right-from-bracket"/>
          </div>
        </div>
      </div>

      {/* ==================== TABLE PANEL ==================== */}
      {sidebarView === "order" && (
        <div className={`w-64 ${bgPanel} p-4 overflow-y-auto`}>
          <h2 className="mb-4 font-bold text-lg">BÀN</h2>

          <div className="flex gap-3 mb-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-600 inline-block"/>Trống</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"/>Đang dùng</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {tables.map(t => {
              const status = tableStatus[t] || "PAID";
              const qty    = calcTotalQty(tableOrders[t]);
              return (
                <div
                  key={t}
                  onClick={() => setCurrentTable(t)}
                  className={`p-3 rounded-xl text-center cursor-pointer transition font-semibold
                    ${tableColor(status, currentTable === t)}`}
                >
                  <div>Bàn {t}</div>
                  <div className={`text-xs mt-1 font-normal
                    ${status === "OPEN" ? "text-yellow-200" : "text-slate-400"}`}>
                    {status === "OPEN" ? (qty > 0 ? `${qty} món` : "OPEN") : "Trống"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== MAIN PANEL ==================== */}
      <div className="flex-1 p-6 flex flex-col overflow-hidden">

        {/* ===== ORDER VIEW ===== */}
        {sidebarView === "order" && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm transition font-semibold whitespace-nowrap
                    ${filter === f.key ? "bg-blue-500 text-white" : `${bgCard} ${textSub} hover:bg-slate-600`}`}
                >{f.label}</button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4 overflow-y-auto">
              {filteredMenu.map(m => {
                const qty = tableOrders[currentTable]?.[m.id]?.qty || 0;
                return (
                  <div key={m.id} className={`${bgCard} rounded-xl p-4 flex flex-col hover:scale-105 transition`}>
                    <div onClick={() => addItem(m)} className="cursor-pointer flex-1">
                      {m.image && (
                        <img src={`${API_URL}/uploads/${m.image}`}
                          className="h-32 w-full object-cover rounded-lg mb-3" alt={m.name} />
                      )}
                      <div className="font-semibold text-sm">{m.name}</div>
                      <div className="text-red-400 text-sm mb-2">{formatMoney(m.price)}</div>
                    </div>
                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-slate-700 rounded-lg px-2 py-1 mt-1">
                        <button onClick={() => updateQty(m.id, "dec")}
                          className="w-7 h-7 bg-slate-600 hover:bg-red-500 rounded-md font-bold transition">−</button>
                        <span className="font-bold text-green-400">{qty}</span>
                        <button onClick={() => updateQty(m.id, "inc")}
                          className="w-7 h-7 bg-slate-600 hover:bg-green-500 rounded-md font-bold transition">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addItem(m)}
                        className="mt-1 w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-1 text-sm font-semibold transition">
                        + Thêm
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== MANAGE VIEW ===== */}
        {sidebarView === "manage" && (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-6">
              {[
                ["add",  <><i className="fa-solid fa-plus mr-2"/>Thêm món</>],
                ["edit", <><i className="fa-solid fa-pen-to-square mr-2"/>Chỉnh sửa món</>],
                ["table",<><i className="fa-solid fa-chair mr-2"/>Quản lý bàn</>],
              ].map(([tab, label]) => (
                <button key={tab} onClick={() => { setManageTab(tab); setEditItem(null); setEditingTable(null); }}
                  className={`px-6 py-2 rounded-full font-semibold transition
                    ${manageTab === tab ? "bg-blue-500 text-white" : `${bgCard} ${textSub} hover:bg-slate-600`}`}
                >{label}</button>
              ))}
            </div>

            {manageTab === "add" ? (
              <div className="max-w-md flex flex-col gap-4">
                {[
                  { label: "Tên món", key: "name", type: "text", placeholder: "VD: Gà nướng muối ớt" },
                  { label: "Giá (VND)", key: "price", type: "number", placeholder: "VD: 85000" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className={`block text-sm ${textSub} mb-1`}>{label}</label>
                    <input type={type} value={newItem[key]} placeholder={placeholder}
                      onChange={e => setNewItem({ ...newItem, [key]: e.target.value })}
                      className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={`block text-sm ${textSub} mb-1`}>Loại</label>
                  <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className={inputCls}>
                    <option value="FOOD">FOOD</option>
                    <option value="DRINK">DRINK</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm ${textSub} mb-1`}>Ảnh</label>
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
                    className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer`} />
                  {file && <img src={URL.createObjectURL(file)} className="mt-3 h-32 w-full object-cover rounded-xl" alt="preview" />}
                </div>
                <button onClick={addMenu} className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold transition text-white">
                  <i className="fa-solid fa-check mr-2"/>Thêm vào menu
                </button>
              </div>
            ) : manageTab === "edit" ? (
              <div className="flex gap-6 flex-1 overflow-hidden">
                <div className="w-72 overflow-y-auto flex flex-col gap-2">
                  {menu.map(m => (
                    <div key={m.id} onClick={() => { setEditItem({ ...m }); setEditFile(null); }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                        ${editItem?.id === m.id ? "bg-blue-600 text-white" : `${bgCard} hover:bg-slate-700`}`}
                    >
                      {m.image && <img src={`${API_URL}/uploads/${m.image}`} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" alt={m.name} />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-sm text-red-400">{formatMoney(m.price)}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteMenu(m.id); }}
                        className={`${textSub} hover:text-red-400 transition text-lg px-1`}><i className="fa-solid fa-trash"/></button>
                    </div>
                  ))}
                </div>

                <div className="flex-1 max-w-md">
                  {editItem ? (
                    <div className="flex flex-col gap-4">
                      <h3 className="font-bold text-lg">Chỉnh sửa: {editItem.name}</h3>
                      <div>
                        <label className={`block text-sm ${textSub} mb-1`}>Tên món</label>
                        <input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={`block text-sm ${textSub} mb-1`}>Giá (VND)</label>
                        <input type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={`block text-sm ${textSub} mb-1`}>Loại</label>
                        <select value={editItem.type} onChange={e => setEditItem({ ...editItem, type: e.target.value })} className={inputCls}>
                          <option value="FOOD">FOOD</option>
                          <option value="DRINK">DRINK</option>
                          <option value="COMBO">COMBO</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm ${textSub} mb-1`}>Đổi ảnh (tuỳ chọn)</label>
                        <input type="file" accept="image/*" onChange={e => setEditFile(e.target.files[0])}
                          className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer`} />
                        <img
                          src={editFile ? URL.createObjectURL(editFile) : `${API_URL}/uploads/${editItem.image}`}
                          className="mt-3 h-32 w-full object-cover rounded-xl" alt="preview"
                          onError={e => e.target.style.display = "none"}
                        />
                      </div>
                      <button onClick={updateMenu} className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-bold transition text-white"><i className="fa-solid fa-floppy-disk mr-2"/>Lưu thay đổi</button>
                      <button onClick={() => { setEditItem(null); setEditFile(null); }} className={`w-full ${bgCard} hover:bg-slate-600 py-3 rounded-xl font-bold transition`}>Huỷ</button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center h-full ${textSub} text-center`}>
                      <div><div className="text-4xl mb-3"><i className="fa-solid fa-arrow-left"/></div><div>Chọn món để chỉnh sửa</div></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ---- Tab quản lý bàn ---- */
              <div className="flex flex-col gap-5 max-w-lg">
                {tableMsg && (
                  <div className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${tableMsg.type === "ok" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {tableMsg.type === "ok" ? "✅ " : "❌ "}{tableMsg.text}
                  </div>
                )}

                <div className={`${bgCard} rounded-2xl p-5`}>
                  <h3 className="font-bold mb-3"><i className="fa-solid fa-plus mr-2 text-green-400"/>Thêm bàn mới</h3>
                  <div className="flex gap-3">
                    <input
                      type="number" min="1" placeholder="Số bàn (VD: 21)"
                      value={newTableNum}
                      onChange={e => setNewTableNum(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addTable()}
                      className={inputCls}
                    />
                    <button onClick={addTable}
                      className="px-5 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-white transition whitespace-nowrap">
                      <i className="fa-solid fa-plus mr-1"/>Thêm
                    </button>
                  </div>
                </div>

                <div className={`${bgCard} rounded-2xl p-5`}>
                  <h3 className="font-bold mb-3">
                    <i className="fa-solid fa-list mr-2 text-blue-400"/>
                    Danh sách bàn ({tableList.length} bàn)
                  </h3>
                  {tableList.length === 0 ? (
                    <div className={`${textSub} text-center py-6`}>Chưa có bàn nào trong DB</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {tableList.map(t => (
                        <div key={t.table_num} className={`${darkMode ? "bg-slate-700" : "bg-gray-100"} rounded-xl p-3`}>
                          {editingTable?.table_num === t.table_num ? (
                            <div className="flex flex-col gap-2">
                              <div className="text-xs text-slate-400 mb-1">Đổi số bàn {t.table_num} →</div>
                              <input
                                type="number" min="1"
                                value={editingTable.new_num}
                                onChange={e => setEditingTable({ ...editingTable, new_num: e.target.value })}
                                onKeyDown={e => { if (e.key === "Enter") renameTable(); if (e.key === "Escape") setEditingTable(null); }}
                                autoFocus
                                className={`w-full text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500
                                  ${darkMode ? "bg-slate-600 text-white" : "bg-white border border-gray-300"}`}
                              />
                              <div className="flex gap-2">
                                <button onClick={renameTable}
                                  className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-bold transition">
                                  ✓ Lưu
                                </button>
                                <button onClick={() => setEditingTable(null)}
                                  className={`flex-1 py-1 ${darkMode ? "bg-slate-600 hover:bg-slate-500" : "bg-gray-200 hover:bg-gray-300"} rounded-lg text-xs font-bold transition`}>
                                  ✕ Huỷ
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-sm">Bàn {t.table_num}</div>
                                <div className={`text-xs mt-0.5 ${t.status === "OPEN" ? "text-orange-400" : "text-slate-400"}`}>
                                  {t.status === "OPEN" ? "Đang có khách" : "Trống"}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingTable({ table_num: t.table_num, new_num: String(t.table_num) })}
                                  title="Đổi số bàn"
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs
                                    ${darkMode ? "bg-slate-600 hover:bg-blue-500" : "bg-gray-200 hover:bg-blue-500 hover:text-white"} transition`}>
                                  <i className="fa-solid fa-pen"/>
                                </button>
                                <button
                                  onClick={() => deleteTable(t.table_num)}
                                  title="Xóa bàn"
                                  disabled={t.status === "OPEN"}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition
                                    ${t.status === "OPEN"
                                      ? "bg-slate-700 text-slate-600 cursor-not-allowed"
                                      : darkMode ? "bg-slate-600 hover:bg-red-500 text-slate-300 hover:text-white"
                                                 : "bg-gray-200 hover:bg-red-500 hover:text-white"}`}>
                                  <i className="fa-solid fa-trash"/>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== HISTORY VIEW ===== */}
        {sidebarView === "history" && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold"><i className="fa-solid fa-clock-rotate-left mr-2"/>Lịch sử hóa đơn</h2>
              <input type="date" value={historyDate}
                onChange={e => { setHistoryDate(e.target.value); setSelectedBill(null); }}
                className={inputCls + " w-auto"} />
            </div>

            <div className="flex gap-6 flex-1 overflow-hidden">
              <div className="w-80 overflow-y-auto flex flex-col gap-2">
                {bills.length === 0 ? (
                  <div className={`${textSub} text-center mt-10`}>Không có hóa đơn nào</div>
                ) : bills.map(b => (
                  <div key={b.id} onClick={() => fetchBillDetail(b.id)}
                    className={`p-4 rounded-xl cursor-pointer transition
                      ${selectedBill?.id === b.id ? "bg-blue-600 text-white" : `${bgCard} hover:bg-slate-700`}`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span>Bàn {b.table_num}</span>
                      <span className="text-green-400">{formatMoney(b.total)}</span>
                    </div>
                    <div className={`text-xs mt-1 ${selectedBill?.id === b.id ? "text-blue-200" : textSub}`}>
                      {new Date(b.created_at).toLocaleTimeString("vi-VN")} · HD#{b.id}
                    </div>
                    <div className={`text-xs mt-1 truncate ${selectedBill?.id === b.id ? "text-blue-200" : textSub}`}>
                      {b.items_summary}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedBill ? (
                  <div className="flex flex-col gap-3 max-w-sm">
                    <button
                      onClick={async () => {
                        const printBillBrowser = (bill) => {
                          const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";
                          const now = new Date(bill.created_at).toLocaleString("vi-VN");
                          const rows = (bill.items || []).map((item, i) => `
                            <tr>
                              <td>${i + 1}. ${item.name}</td>
                              <td style="text-align:center">${item.qty}</td>
                              <td style="text-align:right">${fmt(item.price * item.qty)}</td>
                            </tr>
                          `).join("");
                          const win = window.open("", "_blank", "width=794,height=900");
                          win.document.write(`
                            <html><head><title>Hóa Đơn</title>
                            <style>
                              * { margin: 0; padding: 0; box-sizing: border-box; }
                              body { font-family: monospace; font-size: 13px; width: 100%; max-width: 400px; margin: 0 auto; padding: 20px; }
                              h2 { text-align: center; font-size: 15px; margin-bottom: 2px; }
                              .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 10px; }
                              .info { font-size: 12px; margin-bottom: 6px; }
                              table { width: 100%; border-collapse: collapse; margin: 6px 0; }
                              th { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 2px; font-size: 12px; }
                              td { padding: 3px 2px; font-size: 12px; vertical-align: top; }
                              .total-row { border-top: 1px dashed #000; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
                              .footer { text-align: center; margin-top: 10px; font-size: 11px; color: #555; }
                              .reprint { text-align: center; font-size: 11px; margin-top: 4px; }
                              @media print { @page { size: A4; margin: 20mm; } }
                            </style></head>
                            <body>
                              <h2>TIỆM NƯỚNG ĐÀ LẠT VÀ EM</h2>
                              <div class="sub">24 đường 3 tháng 4, Đà Lạt<br/>Hotline: 081 366 5665</div>
                              <div class="info">HD#${bill.id} · Bàn: <b>${bill.table_num}</b></div>
                              <div class="info">Ngày: ${now}</div>
                              <table>
                                <thead><tr><th style="text-align:left">TÊN HÀNG</th><th>SL</th><th style="text-align:right">T.TIỀN</th></tr></thead>
                                <tbody>${rows}</tbody>
                              </table>
                              <div class="total-row"><span>THÀNH TIỀN</span><span>${fmt(bill.total)}</span></div>
                              <div class="reprint">*** IN LẠI ***</div>
                              <div class="footer">Cảm Ơn Quý Khách - Hẹn Gặp Lại!</div>
                            </body></html>
                          `);
                          win.document.close();
                          win.focus();
                          setTimeout(() => { win.print(); win.close(); }, 300);
                        };

                        try {
                          const res = await fetch(`${API_URL}/print/bill/${selectedBill.id}`, { method: "POST" });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error);
                        } catch (err) {
                          printBillBrowser(selectedBill);
                        }
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 py-2.5 rounded-xl font-bold transition text-white text-sm"
                    >
                      <i className="fa-solid fa-print mr-2"/>In lại hóa đơn này
                    </button>

                    <div className={`${bgCard} rounded-xl p-6`}>
                      <div className="text-center font-bold mb-4">
                        <div className="text-lg">TIỆM NƯỚNG ĐÀ LẠT VÀ EM</div>
                        <div className={`text-sm ${textSub}`}>24 đường 3 tháng 4, Đà Lạt</div>
                      </div>
                      <div className={`text-sm ${textSub} mb-1`}>HD#{selectedBill.id} · Bàn {selectedBill.table_num}</div>
                      <div className={`text-sm ${textSub} mb-4`}>{new Date(selectedBill.created_at).toLocaleString("vi-VN")}</div>
                      <hr className="border-slate-600 mb-3" />
                      {(selectedBill.items || []).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm mb-2">
                          <span>{item.name} x{item.qty}</span>
                          <span>{formatMoney(item.price * item.qty)}</span>
                        </div>
                      ))}
                      <hr className="border-slate-600 my-3" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>THÀNH TIỀN</span>
                        <span className="text-green-400">{formatMoney(selectedBill.total)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-full ${textSub}`}>
                    <div className="text-center"><div className="text-4xl mb-3"><i className="fa-solid fa-arrow-left"/></div><div>Chọn hóa đơn để xem chi tiết</div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== SETTINGS VIEW ===== */}
        {sidebarView === "settings" && (
          <div className="flex flex-col gap-6 max-w-lg overflow-y-auto">
            <h2 className="text-xl font-bold"><i className="fa-solid fa-gear mr-2"/>Cài đặt hệ thống</h2>

            <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
              <h3 className="font-bold text-base"><i className="fa-solid fa-store mr-2 text-orange-400"/>Thông tin cửa hàng</h3>
              {[
                { label: "Tên cửa hàng",  key: "store_name"    },
                { label: "Địa chỉ",       key: "store_address"  },
                { label: "Hotline",        key: "store_phone"    },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className={`block text-sm ${textSub} mb-1`}>{label}</label>
                  <input
                    value={settings[key] || ""}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}
              <div>
                <label className={`block text-sm ${textSub} mb-1`}>Số bàn</label>
                <input
                  type="number" min="1" max="100"
                  value={settings.total_tables || "20"}
                  onChange={e => setSettings(s => ({ ...s, total_tables: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {[
              { key:"kitchen", label:"Báo chế biến (Bếp)", icon:"fa-fire-burner",    color:"text-orange-400" },
              { key:"tamtinh", label:"Tạm tính",            icon:"fa-file-invoice",   color:"text-yellow-400" },
              { key:"payment", label:"Thanh toán",           icon:"fa-money-bill-wave",color:"text-green-400"  },
            ].map(({ key, label, icon, color }) => (
              <div key={key} className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">
                    <i className={`fa-solid ${icon} mr-2 ${color}`}/>{label}
                  </h3>
                  {testResult[key] === "ok" && (
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>Online
                    </span>
                  )}
                  {testResult[key] === "fail" && (
                    <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500"/>Offline
                    </span>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${textSub} mb-1.5`}>
                    <i className="fa-solid fa-wifi mr-1.5"/>IP / LAN
                  </label>
                  <input
                    value={settings[`${key}_printer_ip`] || ""}
                    onChange={e => setSettings(s => ({ ...s, [`${key}_printer_ip`]: e.target.value }))}
                    placeholder="192.168.1.100"
                    className={inputCls}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs font-semibold ${textSub}`}>
                      <i className="fa-solid fa-print mr-1.5"/>USB (tên máy in Windows)
                    </label>
                    <button
                      onClick={fetchWindowsPrinters}
                      disabled={loadingPrinters}
                      className={`text-xs px-2.5 py-1 rounded-lg transition border border-slate-600 ${textSub} hover:bg-slate-700`}
                    >
                      {loadingPrinters
                        ? <><i className="fa-solid fa-spinner fa-spin mr-1"/>Đang tải...</>
                        : <><i className="fa-solid fa-rotate mr-1"/>Tải DS</>}
                    </button>
                  </div>
                  <input
                    value={settings[`${key}_printer_usb_name`] || ""}
                    onChange={e => setSettings(s => ({ ...s, [`${key}_printer_usb_name`]: e.target.value }))}
                    placeholder="VD: EPSON TM-T82III"
                    className={inputCls}
                  />
                  {windowsPrinters.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2 max-h-32 overflow-y-auto">
                      {windowsPrinters.map((p, i) => (
                        <div
                          key={i}
                          onClick={() => setSettings(s => ({ ...s, [`${key}_printer_usb_name`]: p.name }))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition border text-sm
                            ${settings[`${key}_printer_usb_name`] === p.name
                              ? "border-blue-500 bg-blue-500/10 text-white"
                              : `border-transparent ${bgCard} hover:bg-slate-600 ${textSub}`}`}
                        >
                          <i className={`fa-solid fa-print text-xs ${settings[`${key}_printer_usb_name`] === p.name ? "text-blue-400" : ""}`}/>
                          <span className="flex-1 truncate font-medium">{p.name}</span>
                          <span className="text-xs opacity-60">{p.port}</span>
                          {settings[`${key}_printer_usb_name`] === p.name && (
                            <i className="fa-solid fa-circle-check text-blue-400 text-xs"/>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => testPrinterByKey(key)}
                  disabled={testingPrinter[key]}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2
                    ${testingPrinter[key]
                      ? "bg-slate-600 cursor-not-allowed text-slate-400"
                      : testResult[key] === "ok"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : testResult[key] === "fail"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                >
                  {testingPrinter[key]
                    ? <><i className="fa-solid fa-spinner fa-spin"/>Đang kết nối...</>
                    : testResult[key] === "ok"
                      ? <><i className="fa-solid fa-circle-check"/>Đã kết nối</>
                      : testResult[key] === "fail"
                        ? <><i className="fa-solid fa-rotate"/>Thử lại</>
                        : <><i className="fa-solid fa-plug"/>Kết nối</>}
                </button>

                {testResult[key] === "ok" && (
                  <div className="text-green-400 text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check"/>Kết nối thành công
                    {testResult[`${key}_method`] ? ` qua ${testResult[`${key}_method`]}` : ""}
                  </div>
                )}
                {testResult[key] === "fail" && (
                  <div className="text-red-400 text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-triangle-exclamation"/>Không kết nối được – xem Log để biết chi tiết
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={saveAllSettings}
              className={`w-full py-3 rounded-xl font-bold text-white transition
                ${settingsSaved ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              {settingsSaved
                ? <><i className="fa-solid fa-circle-check mr-2"/>Đã lưu!</>
                : <><i className="fa-solid fa-floppy-disk mr-2"/>Lưu cài đặt</>}
            </button>
          </div>
        )}

        {/* ===== STATS VIEW ===== */}
        {sidebarView === "stats" && (() => {
          const fmt = formatMoney;
          const BarChart = ({ data, labelKey, valueKey }) => {
            const max = Math.max(...data.map(d => d[valueKey]), 1);
            return (
              <div className="flex items-end gap-1 h-32">
                {data.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                    <div className="relative w-full flex flex-col items-center">
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                        <div className="bg-slate-900 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                          <div className="font-bold text-emerald-400">{fmt(d[valueKey])}</div>
                          <div className="text-slate-400">{d.bill_count} HĐ</div>
                        </div>
                      </div>
                      <div className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all"
                        style={{ height: `${Math.max((d[valueKey]/max)*112, 3)}px` }}/>
                    </div>
                    <div className="text-xs text-slate-500 truncate w-full text-center">{d[labelKey]}</div>
                  </div>
                ))}
              </div>
            );
          };
          const KPI = ({ icon, label, value, color }) => (
            <div className={`${bgCard} rounded-2xl p-4 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(255,255,255,0.05)"}}>
                <i className={`fa-solid ${icon} ${color}`}/>
              </div>
              <div className="min-w-0">
                <div className={`text-lg font-bold ${color} truncate`}>{value}</div>
                <div className={`text-xs ${textSub}`}>{label}</div>
              </div>
            </div>
          );
          const TopItems = ({ items, label }) => (
            <div className={`${bgCard} rounded-2xl p-4`}>
              <div className={`text-xs font-semibold ${textSub} uppercase tracking-wider mb-3`}>
                <i className="fa-solid fa-ranking-star mr-2 text-orange-400"/>{label}
              </div>
              {!items?.length
                ? <div className={`text-sm ${textSub} text-center py-4`}>Chưa có dữ liệu</div>
                : items.map((item, i) => {
                    const maxQ = items[0].total_qty;
                    return (
                      <div key={i} className="mb-3 last:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${i===0?"bg-yellow-500 text-black":i===1?"bg-slate-400 text-black":i===2?"bg-orange-600 text-white":"bg-slate-700"}`}>{i+1}</span>
                          <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                          <span className="text-emerald-400 text-sm font-bold whitespace-nowrap">{fmt(item.total_revenue)}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-7">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full" style={{width:`${(item.total_qty/maxQ)*100}%`}}/>
                          </div>
                          <span className={`text-xs ${textSub} w-12 text-right whitespace-nowrap`}>{item.total_qty} phần</span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          );
          const DataTable = ({ rows, cols }) => (
            <div className={`${bgCard} rounded-2xl p-4`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${darkMode?"border-slate-700":"border-slate-200"}`}>
                    {cols.map(c => <th key={c.key} className={`py-2 px-1 font-semibold ${textSub} text-${c.align||"left"}`}>{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.length===0
                    ? <tr><td colSpan={cols.length} className={`py-6 text-center ${textSub}`}>Chưa có dữ liệu</td></tr>
                    : rows.map((r,i) => (
                        <tr key={i} className={`border-b ${darkMode?"border-slate-800":"border-slate-100"}`}>
                          {cols.map(c => <td key={c.key} className={`py-2 px-1 text-${c.align||"left"} ${c.cls||""}`}>{c.render?c.render(r):r[c.key]}</td>)}
                        </tr>
                      ))
                  }
                </tbody>
                {rows.length>0 && (
                  <tfoot>
                    <tr className={`border-t-2 ${darkMode?"border-slate-600":"border-slate-300"} font-bold`}>
                      {cols.map((c,i) => <td key={c.key} className={`py-2 px-1 text-${c.align||"left"}`}>{i===0?"Tổng":c.footer?c.footer(rows):""}</td>)}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          );

          return (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold"><i className="fa-solid fa-chart-line mr-2 text-emerald-400"/>Thống kê</h2>
                  <div className={`flex gap-1 p-1 rounded-xl ${bgCard}`}>
                    {[["day","Hôm nay","fa-sun"],["month","Tháng","fa-calendar"],["year","Năm","fa-chart-bar"]].map(([v,l,ic]) => (
                      <button key={v} onClick={()=>setStatsTab(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                          ${statsTab===v?"bg-emerald-500 text-white shadow":`${textSub} hover:bg-slate-700`}`}>
                        <i className={`fa-solid ${ic} mr-1`}/>{l}
                      </button>
                    ))}
                  </div>
                </div>
                {statsTab==="month" && (
                  <input type="month" value={statsMonth}
                    onChange={e=>{setStatsMonth(e.target.value);fetchStatsMonthly(e.target.value);fetchStatsDaily(e.target.value);}}
                    className={`${inputCls} w-auto text-sm`}/>
                )}
                {statsTab==="year" && (
                  <select value={statsYear} onChange={e=>{setStatsYear(e.target.value);fetchStatsYearly(e.target.value);}}
                    className={`${inputCls} w-auto text-sm`}>
                    {Array.from({length:5},(_,i)=>(new Date().getFullYear()-i).toString()).map(y=><option key={y}>{y}</option>)}
                  </select>
                )}
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {statsTab==="day" && statsToday && (<>
                  <div className="grid grid-cols-3 gap-3">
                    <KPI icon="fa-receipt"     label="Hóa đơn hôm nay"  value={statsToday.bill_count}        color="text-blue-400"/>
                    <KPI icon="fa-sack-dollar" label="Doanh thu hôm nay" value={fmt(statsToday.revenue)}      color="text-emerald-400"/>
                    <KPI icon="fa-fire"        label="TB / hóa đơn"
                      value={statsToday.bill_count?fmt(Math.round(statsToday.revenue/statsToday.bill_count)):"–"} color="text-orange-400"/>
                  </div>
                  <TopItems items={statsToday.top_items} label="Top món bán chạy hôm nay"/>
                </>)}

                {statsTab==="month" && (<>
                  <div className="grid grid-cols-3 gap-3">
                    <KPI icon="fa-receipt"     label="Hóa đơn tháng"    value={statsMonthlyData?.bill_count??"–"}         color="text-blue-400"/>
                    <KPI icon="fa-sack-dollar" label="Doanh thu tháng"   value={fmt(statsMonthlyData?.revenue??0)}         color="text-emerald-400"/>
                    <KPI icon="fa-fire"        label="TB / ngày"
                      value={statsMonthlyData?.days?.length?fmt(Math.round(statsMonthlyData.revenue/statsMonthlyData.days.length)):"–"} color="text-orange-400"/>
                  </div>
                  <div className={`${bgCard} rounded-2xl p-4`}>
                    <div className={`text-xs font-semibold ${textSub} uppercase tracking-wider mb-3`}>
                      <i className="fa-solid fa-chart-column mr-2 text-emerald-400"/>Doanh thu theo ngày
                    </div>
                    {statsMonthlyData?.days?.length
                      ? <BarChart data={statsMonthlyData.days.map(d=>({...d,label:d.date.slice(8)}))} labelKey="label" valueKey="revenue"/>
                      : <div className={`text-sm ${textSub} text-center py-8`}>Chưa có dữ liệu</div>}
                  </div>
                  <TopItems items={statsMonthlyData?.top_items} label={`Top món — tháng ${statsMonth}`}/>
                  <DataTable
                    rows={(statsMonthlyData?.days||[]).map(d=>({...d,ngay:new Date(d.date+"T00:00:00").toLocaleDateString("vi-VN")}))}
                    cols={[
                      {key:"ngay", label:"Ngày"},
                      {key:"bill_count", label:"HĐ", align:"center"},
                      {key:"revenue", label:"Doanh thu", align:"right", cls:"text-emerald-400 font-semibold",
                        render:r=>fmt(r.revenue), footer:rows=><span className="text-emerald-400">{fmt(rows.reduce((s,r)=>s+r.revenue,0))}</span>},
                    ]}/>
                </>)}

                {statsTab==="year" && (<>
                  <div className="grid grid-cols-3 gap-3">
                    <KPI icon="fa-receipt"     label={`HĐ năm ${statsYear}`}  value={statsYearlyData?.bill_count??"–"}         color="text-blue-400"/>
                    <KPI icon="fa-sack-dollar" label={`DT năm ${statsYear}`}   value={fmt(statsYearlyData?.revenue??0)}          color="text-emerald-400"/>
                    <KPI icon="fa-fire"        label="TB / tháng"
                      value={statsYearlyData?.months?.length?fmt(Math.round(statsYearlyData.revenue/statsYearlyData.months.length)):"–"} color="text-orange-400"/>
                  </div>
                  <div className={`${bgCard} rounded-2xl p-4`}>
                    <div className={`text-xs font-semibold ${textSub} uppercase tracking-wider mb-3`}>
                      <i className="fa-solid fa-chart-column mr-2 text-emerald-400"/>Doanh thu theo tháng
                    </div>
                    {statsYearlyData?.months?.length
                      ? <BarChart data={statsYearlyData.months.map(d=>({...d,label:"T"+d.month.slice(5)}))} labelKey="label" valueKey="revenue"/>
                      : <div className={`text-sm ${textSub} text-center py-8`}>Chưa có dữ liệu</div>}
                  </div>
                  <TopItems items={statsYearlyData?.top_items} label={`Top món — năm ${statsYear}`}/>
                  <DataTable
                    rows={(statsYearlyData?.months||[]).map(d=>({...d,thang:`Tháng ${parseInt(d.month.slice(5))}`}))}
                    cols={[
                      {key:"thang", label:"Tháng"},
                      {key:"bill_count", label:"HĐ", align:"center"},
                      {key:"revenue", label:"Doanh thu", align:"right", cls:"text-emerald-400 font-semibold",
                        render:r=>fmt(r.revenue), footer:rows=><span className="text-emerald-400">{fmt(rows.reduce((s,r)=>s+r.revenue,0))}</span>},
                    ]}/>
                </>)}
              </div>
            </div>
          );
        })()}

      </div>

      {/* ==================== MODAL CHUYỂN BÀN ==================== */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`${bgPanel} ${text} rounded-2xl p-6 w-96 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                <i className="fa-solid fa-right-left mr-2 text-yellow-400"/>
                Chuyển bàn {currentTable} sang...
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto">
              {tables.filter(t => t !== currentTable).map(t => {
                const status = tableStatus[t];
                const isOccupied = status === "OPEN" || status === "PAYING";
                return (
                  <button
                    key={t}
                    onClick={() => !isOccupied && transferTable(t)}
                    disabled={isOccupied}
                    className={`h-12 rounded-xl font-bold text-sm transition
                      ${isOccupied
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                        : "bg-green-600 hover:bg-green-500 text-white cursor-pointer"
                      }`}
                    title={isOccupied ? `Bàn ${t} đang có khách` : `Chuyển sang bàn ${t}`}
                  >
                    {t}
                    {isOccupied && <div className="text-xs font-normal opacity-70">có khách</div>}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-4 text-xs text-slate-400">
              <span><span className="inline-block w-3 h-3 rounded bg-green-600 mr-1"/>Trống – có thể chuyển</span>
              <span><span className="inline-block w-3 h-3 rounded bg-slate-700 mr-1"/>Có khách – không thể</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ORDER PANEL ==================== */}
      {sidebarView === "order" && (
        <div className={`w-80 ${bgSide} p-4 flex flex-col`}>

          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">ORDER</h2>
              {tableStatus[currentTable] === "OPEN" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSplitModal(true); setSplitSelected([]); setSplitTarget(""); }}
                    disabled={currentItems.length === 0}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-40"
                  >
                    <i className="fa-solid fa-code-branch text-xs"/>Tách bàn
                  </button>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition"
                  >
                    <i className="fa-solid fa-right-left text-xs"/>Chuyển bàn
                  </button>
                </div>
              )}
            </div>
            <div className={`text-sm ${textSub} mt-1`}>
              {currentTable ? (
                <span>
                  Bàn {currentTable} ·{" "}
                  <span className={
                    tableStatus[currentTable] === "OPEN"   ? "text-orange-400" :
                    tableStatus[currentTable] === "PAYING" ? "text-purple-400" :
                    "text-slate-400"
                  }>
                    {tableStatus[currentTable] === "OPEN"   ? "Đang order" :
                     tableStatus[currentTable] === "PAYING" ? "Đã thanh toán – chờ reset" :
                     "Trống"}
                  </span>
                </span>
              ) : "Chưa chọn bàn"}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1 mb-3">
            {currentItems.length === 0 ? (
              <div className={`${textSub} text-center py-8 text-sm`}>Chưa có món nào</div>
            ) : currentItems.map((item) => {
              const sentQty = kitchenSent[currentTable]?.[item.id] || 0;
              const newQty  = item.qty - sentQty;
              const note    = itemNotes[currentTable]?.[item.id] || "";

              return (
                <div key={item.id} className={`${bgCard} rounded-xl p-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{item.name}</span>
                      {newQty > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                          +{newQty} mới
                        </span>
                      )}
                    </div>
                    <span className="text-green-400 text-sm font-semibold whitespace-nowrap">
                      {formatMoney(item.price * item.qty)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-1 py-0.5">
                      <button
                        onClick={() => {
                          if (item.qty - 1 < sentQty) {
                            setKitchenSent(prev => ({
                              ...prev,
                              [currentTable]: { ...(prev[currentTable] || {}), [item.id]: Math.max(0, item.qty - 1) }
                            }));
                          }
                          updateQty(item.id, "dec");
                        }}
                        className="w-6 h-6 bg-slate-600 hover:bg-red-500 rounded font-bold text-sm transition"
                      >−</button>
                      <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, "inc")}
                        className="w-6 h-6 bg-slate-600 hover:bg-green-500 rounded font-bold text-sm transition"
                      >+</button>
                    </div>
                    <span className={`text-xs ${textSub}`}>{formatMoney(item.price)}/món</span>
                  </div>

                  <input
                    type="text"
                    value={note}
                    onChange={e => setItemNotes(prev => ({
                      ...prev,
                      [currentTable]: { ...(prev[currentTable] || {}), [item.id]: e.target.value }
                    }))}
                    placeholder="Ghi chú (ít muối, không cay...)"
                    className={`mt-2 w-full text-xs px-2 py-1 rounded-lg outline-none
                      ${darkMode ? "bg-slate-700 text-slate-300 placeholder-slate-500"
                                 : "bg-gray-200 text-gray-600 placeholder-gray-400"}`}
                  />
                </div>
              );
            })}
          </div>

          <div className={`border-t ${darkMode ? "border-slate-600" : "border-gray-300"} pt-3 flex flex-col gap-2`}>

            <div className="flex justify-between text-base font-bold mb-1">
              <span>Total:</span>
              <span className="text-green-400">{formatMoney(total)}</span>
            </div>

            <button
              onClick={printKitchenTicket}
              disabled={currentItems.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm
                ${currentItems.length > 0
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-slate-600 opacity-50 cursor-not-allowed"}`}
            >
              <i className="fa-solid fa-fire-burner mr-2"/>In phiếu bếp
            </button>

            <button
              onClick={printTamTinh}
              disabled={currentItems.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm
                ${currentItems.length > 0 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-slate-600 opacity-50 cursor-not-allowed"}`}
            >
              <i className="fa-solid fa-file-invoice mr-2"/>Tạm tính
            </button>

            <button
              onClick={handlePayment}
              disabled={currentItems.length === 0 || tableStatus[currentTable] === "PAYING"}
              className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm
                ${currentItems.length > 0 && tableStatus[currentTable] !== "PAYING"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-slate-600 opacity-50 cursor-not-allowed"}`}
            >
              <i className="fa-solid fa-money-bill-wave mr-2"/>Thanh toán & In HĐ
            </button>

            <button
              onClick={resetTable}
              disabled={tableStatus[currentTable] !== "PAYING"}
              className={`w-full py-2.5 rounded-xl font-bold transition text-sm
                ${tableStatus[currentTable] === "PAYING"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-slate-600 opacity-50 cursor-not-allowed text-slate-400"}`}
            >
              <i className="fa-solid fa-rotate mr-2"/>Reset bàn
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

// =============================================
// ROOT COMPONENT – auth guard here, NOT in AppInner
// =============================================
export default function App() {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <LoginScreen />;

  return <AppInner />;
}