import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { useAuth } from "./AuthContext";
import LoginScreen from "./LoginScreen";

const TOTAL_TABLES = 20;
const FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "COMBO", label: "Combo" },
  { key: "KHAI_VI", label: "Khai vị" },
  { key: "SIGNATURE", label: "Signature" },
  { key: "NHAU", label: "Nhậu" },
  { key: "GA", label: "Gà" },
  { key: "BO", label: "Bò" },
  { key: "HEO", label: "Heo/Nai" },
  { key: "ECH", label: "Ếch" },
  { key: "CA", label: "Cá" },
  { key: "LUON", label: "Lươn" },
  { key: "SO_DIEP", label: "Sò điệp" },
  { key: "HAISAN", label: "Hải sản" },
  { key: "RAU", label: "Rau xào" },
  { key: "LAU", label: "Lẩu" },
  { key: "COM_MI", label: "Cơm - Mì" },
  { key: "DRINK", label: "Đồ uống" },
];

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const formatMoney = (n) =>
  new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";

const removeTones = (str) => {
  const map = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ắ: "a",
    ằ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ấ: "a",
    ầ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    đ: "d",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ế: "e",
    ề: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ố: "o",
    ồ: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ớ: "o",
    ờ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ứ: "u",
    ừ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
  };
  return str
    .toLowerCase()
    .split("")
    .map((c) => map[c] || c)
    .join("");
};

const filterMenu = (menu, filter) => {
  if (filter === "ALL") return menu;
  const r = (m) => removeTones(m.name);
  const has = (m, ...keys) => keys.some((k) => r(m).includes(removeTones(k)));
  const hasN = (m, ...keys) => !keys.some((k) => r(m).includes(removeTones(k)));
  const map = {
    COMBO: (m) => m.type === "COMBO",
    DRINK: (m) => m.type === "DRINK",
    KHAI_VI: (m) => has(m, "xuc xich", "khoai tay", "salad"),
    SIGNATURE: (m) =>
      has(
        m,
        "oc nhoi",
        "heo moi",
        "nai xao",
        "nai xong",
        "dat vang",
        "tieu xanh",
      ),
    NHAU: (m) =>
      has(
        m,
        "sun ga chien",
        "chan ga chien",
        "canh ga chien",
        "ech chien gion",
        "ca trung chien",
      ),
    GA: (m) =>
      has(m, "ga") && hasN(m, "chien man", "sun ga", "ca trum", "ra lau"),
    BO: (m) => has(m, "bo") && hasN(m, "bun bo", "ra bo"),
    HEO: (m) => has(m, "heo", "nai", "suon heo"),
    ECH: (m) => has(m, "ech"),
    CA: (m) => has(m, "ca trung nuong", "ca tam nuong"),
    LUON: (m) => has(m, "luon ngong"),
    SO_DIEP: (m) => has(m, "so diep"),
    HAISAN: (m) => has(m, "tom", "muc", "bach tuoc"),
    RAU: (m) => has(m, "rau muong", "rau cu xao", "rau rung", "mang tay xao"),
    LAU: (m) =>
      has(m, "lau", "dia lau", "nam kim cham", "mi goi", "rau lau") &&
      hasN(m, "ca tau mang"),
    COM_MI: (m) => has(m, "com chien", "mi xao", "com lam"),
  };
  const fn = map[filter];
  return fn ? menu.filter(fn) : menu;
};

const calcTotal = (td = {}) =>
  Object.values(td).reduce((s, i) => s + i.price * i.qty, 0);
const calcTotalQty = (td = {}) =>
  Object.values(td).reduce((s, i) => s + i.qty, 0);

function AppInner() {
  const { logout, user, getToken } = useAuth();
  const role = user?.role || "waiter"; // "admin" | "cashier" | "waiter"

  // Auto-logout khi token hết hạn
  const apiFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token && !(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      alert("Phiên làm việc đã hết. Vui lòng đăng nhập lại.");
      logout();
      return null;
    }
    return res;
  };
  const canPay = role === "admin" || role === "cashier"; // thanh toán & tạm tính
  const canManage = role === "admin" || role === "cashier"; // quản lý món

  const [menu, setMenu] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [tableOrders, setTableOrders] = useState({});
  const [tableStatus, setTableStatus] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [sidebarView, setSidebarView] = useState("order");
  const [darkMode, setDarkMode] = useState(true);

  // mobile
  const [mobileTab, setMobileTab] = useState("tables");
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Fetch printers when opening settings
  useEffect(() => {
    if (sidebarView === "settings") {
      fetchPrinters();
      fetchPrintJobs();
    }
  }, [sidebarView]);

  const [printerStatus, setPrinterStatus] = useState(null);
  const [settings, setSettings] = useState({
    store_name: "Tiệm Nướng Đà Lạt Và Em",
    store_address: "24 đường 3 tháng 4, Đà Lạt",
    store_phone: "081 366 5665",
    total_tables: "20",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [printerForm, setPrinterForm] = useState({
    printer_name: "",
    job_type: "KITCHEN",
    paper_width: "80",
  });
  const [editPrinter, setEditPrinter] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [printerMsg, setPrinterMsg] = useState(null);
  const [splitModal, setSplitModal] = useState(false);
  const [splitTarget, setSplitTarget] = useState("");
  const [splitSelected, setSplitSelected] = useState([]);
  const [statsTab, setStatsTab] = useState("day");
  const [statsMonthlyData, setStatsMonthlyData] = useState(null);
  const [statsYearlyData, setStatsYearlyData] = useState(null);
  const [statsYear, setStatsYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [kitchenSent, setKitchenSent] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [manageTab, setManageTab] = useState("add");

  // User management state (admin only)
  const [staffList, setStaffList] = useState([]);
  const [staffForm, setStaffForm] = useState({
    username: "",
    password: "",
    role: "waiter",
    full_name: "",
  });
  const [staffEditing, setStaffEditing] = useState(null);
  const [staffShowForm, setStaffShowForm] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [newItem, setNewItem] = useState({ name: "", price: "", type: "FOOD" });
  const [file, setFile] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [tableList, setTableList] = useState([]);
  const [newTableNum, setNewTableNum] = useState("");
  const [editingTable, setEditingTable] = useState(null);
  const [tableMsg, setTableMsg] = useState(null);
  const [bills, setBills] = useState([]);
  const [historyDate, setHistoryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedBill, setSelectedBill] = useState(null);
  const [statsToday, setStatsToday] = useState(null);
  const [, setStatsDaily] = useState([]);
  const [statsMonth, setStatsMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  // theme
  const bg = darkMode ? "bg-[#0f172a]" : "bg-gray-100";
  const bgPanel = darkMode ? "bg-[#111827]" : "bg-white";
  const bgSide = darkMode ? "bg-[#0b1220]" : "bg-gray-200";
  const bgCard = darkMode
    ? "bg-[#1e293b]"
    : "bg-gray-50 border border-gray-200";
  const text = darkMode ? "text-white" : "text-gray-900";
  const textSub = darkMode ? "text-slate-400" : "text-gray-500";
  const inputCls = darkMode
    ? "bg-[#1e293b] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 w-full"
    : "bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 w-full";

  const tables =
    tableList.length > 0
      ? tableList.map((t) => t.table_num)
      : Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);
  const currentItems = Object.values(tableOrders[currentTable] || {});
  const total = calcTotal(tableOrders[currentTable]);
  const filteredMenu = filterMenu(menu, filter);

  // effects
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((d) => setSettings((p) => ({ ...p, ...d })))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const chk = () =>
      fetch(`${API_URL}/print/status`)
        .then((r) => r.json())
        .then((d) => setPrinterStatus(d.connected ? "online" : "offline"))
        .catch(() => setPrinterStatus("offline"));
    chk();
    const iv = setInterval(chk, 30000);
    return () => clearInterval(iv);
  }, []);

  const fetchMenu = useCallback(() => {
    fetch(`${API_URL}/menu`)
      .then((r) => r.json())
      .then(setMenu)
      .catch(() => {});
  }, []);
  const fetchTableStatus = useCallback(() => {
    fetch(`${API_URL}/tables`)
      .then((r) => r.json())
      .then((rows) => {
        const m = {};
        rows.forEach((r) => {
          m[r.table_num] = r.status;
        });
        setTableStatus(m);
      })
      .catch(() => {});
  }, []);
  const fetchBills = useCallback((date) => {
    fetch(`${API_URL}/bills?date=${date}`)
      .then((r) => r.json())
      .then(setBills)
      .catch(() => {});
  }, []);
  const fetchStatsToday = useCallback(() => {
    fetch(`${API_URL}/stats/today`)
      .then((r) => r.json())
      .then(setStatsToday)
      .catch(() => {});
  }, []);
  const fetchStatsDaily = useCallback((m) => {
    fetch(`${API_URL}/stats/daily?month=${m}`)
      .then((r) => r.json())
      .then(setStatsDaily)
      .catch(() => {});
  }, []);
  const fetchStatsMonthly = useCallback((m) => {
    fetch(`${API_URL}/stats/monthly?month=${m}`)
      .then((r) => r.json())
      .then(setStatsMonthlyData)
      .catch(() => {});
  }, []);
  const fetchStatsYearly = useCallback((y) => {
    fetch(`${API_URL}/stats/yearly?year=${y}`)
      .then((r) => r.json())
      .then(setStatsYearlyData)
      .catch(() => {});
  }, []);
  const fetchBillDetail = async (id) => {
    const d = await fetch(`${API_URL}/bills/${id}`).then((r) => r.json());
    setSelectedBill(d);
  };
  const fetchTableList = useCallback(() => {
    Promise.all([
      fetch(`${API_URL}/tables`).then((r) => r.json()),
      fetch(`${API_URL}/settings`).then((r) => r.json()),
    ])
      .then(([rows, cfg]) => {
        const tot = Math.max(
          Number(cfg.total_tables) || 20,
          rows.reduce((mx, r) => Math.max(mx, r.table_num), 0),
        );
        const dbMap = {};
        rows.forEach((r) => {
          dbMap[r.table_num] = r.status;
        });
        setTableList(
          Array.from({ length: tot }, (_, i) => ({
            table_num: i + 1,
            status: dbMap[i + 1] || "PAID",
          })),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchTableStatus();
    fetchTableList();
  }, [fetchMenu, fetchTableStatus, fetchTableList]);
  useEffect(() => {
    if (sidebarView === "manage") fetchTableList();
  }, [sidebarView, fetchTableList]);
  useEffect(() => {
    if (sidebarView === "history") fetchBills(historyDate);
  }, [sidebarView, historyDate, fetchBills]);
  useEffect(() => {
    if (sidebarView === "stats") {
      fetchStatsToday();
      fetchStatsDaily(statsMonth);
      fetchStatsMonthly(statsMonth);
      fetchStatsYearly(statsYear);
    }
  }, [
    sidebarView,
    statsMonth,
    statsYear,
    fetchStatsToday,
    fetchStatsDaily,
    fetchStatsMonthly,
    fetchStatsYearly,
  ]);

  // handlers
  const updateTableStatus = async (num, status) => {
    setTableStatus((p) => ({ ...p, [num]: status }));
    await fetch(`${API_URL}/tables/${num}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };
  const addItem = useCallback(
    (item) => {
      if (!currentTable) return alert("Vui lòng chọn bàn trước!");
      setTableOrders((prev) => {
        const tbl = prev[currentTable] || {},
          ex = tbl[item.id];
        return {
          ...prev,
          [currentTable]: {
            ...tbl,
            [item.id]: ex ? { ...ex, qty: ex.qty + 1 } : { ...item, qty: 1 },
          },
        };
      });
      if (!tableStatus[currentTable] || tableStatus[currentTable] === "PAID")
        updateTableStatus(currentTable, "OPEN"); // eslint-disable-line
    },
    [currentTable, tableStatus],
  ); // eslint-disable-line
  const updateQty = useCallback(
    (itemId, action) => {
      if (!currentTable) return;
      setTableOrders((prev) => {
        const tbl = prev[currentTable];
        if (!tbl || !tbl[itemId]) return prev;
        const nq = action === "inc" ? tbl[itemId].qty + 1 : tbl[itemId].qty - 1;
        const upd = { ...tbl };
        if (nq <= 0) delete upd[itemId];
        else upd[itemId] = { ...tbl[itemId], qty: nq };
        return { ...prev, [currentTable]: upd };
      });
    },
    [currentTable],
  );

  const saveAllSettings = async () => {
    await Promise.all(
      Object.entries(settings).map(([k, v]) =>
        fetch(`${API_URL}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: k, value: v }),
        }),
      ),
    );
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };
  const fetchPrinters = async () => {
    setLoadingPrinters(true);
    try {
      const d = await fetch(`${API_URL}/print/printers`).then((r) => r.json());
      setPrinters(Array.isArray(d) ? d : []);
    } catch {
      setPrinters([]);
    }
    setLoadingPrinters(false);
  };
  const fetchPrintJobs = async () => {
    try {
      const d = await fetch(
        `${API_URL}/print/jobs?status=failed&limit=20`,
      ).then((r) => r.json());
      setPrintJobs(Array.isArray(d) ? d : []);
    } catch {
      setPrintJobs([]);
    }
  };
  const showPrinterMsg = (type, txt) => {
    setPrinterMsg({ type, text: txt });
    setTimeout(() => setPrinterMsg(null), 3000);
  };
  const savePrinter = async () => {
    const body = {
      printer_name: printerForm.printer_name,
      job_type: printerForm.job_type,
      paper_width: Number(printerForm.paper_width) || 80,
    };
    if (!body.printer_name || !body.job_type)
      return showPrinterMsg("err", "Thiếu thông tin máy in");
    try {
      let res;
      if (editPrinter)
        res = await fetch(`${API_URL}/print/printers/${editPrinter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      else
        res = await fetch(`${API_URL}/print/printers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      if (!res.ok) throw new Error((await res.json()).error || "Lỗi");
      setEditPrinter(null);
      setPrinterForm({
        printer_name: "",
        job_type: "KITCHEN",
        paper_width: "80",
      });
      showPrinterMsg("ok", editPrinter ? "Cập nhật OK" : "Thêm OK");
      fetchPrinters();
    } catch (e) {
      showPrinterMsg("err", e.message);
    }
  };
  const deletePrinter = async (id) => {
    if (!window.confirm("Xóa máy in này?")) return;
    try {
      const res = await fetch(`${API_URL}/print/printers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      showPrinterMsg("ok", "Đã xóa");
      fetchPrinters();
    } catch {
      showPrinterMsg("err", "Không thể xóa");
    }
  };
  const togglePrinterActive = async (p) => {
    try {
      await fetch(`${API_URL}/print/printers/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !p.is_active }),
      });
      fetchPrinters();
    } catch {}
  };
  const retryJob = async (id) => {
    try {
      const res = await fetch(`${API_URL}/print/jobs/${id}/retry`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      showPrinterMsg("ok", "Đã thử in lại");
      fetchPrintJobs();
    } catch {
      showPrinterMsg("err", "Lỗi retry");
    }
  };

  const printKitchenTicket = async () => {
    if (!currentTable || currentItems.length === 0)
      return alert("Chưa có món!");
    const notes = itemNotes[currentTable] || {};
    const browserPrint = () => {
      const win = window.open("", "_blank", "width=500,height=600");
      win.document.write(
        `<html><head><title>Phiếu Bếp</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:15px;padding:20px}h2{text-align:center;font-size:20px;margin-bottom:4px}.sub{text-align:center;color:#666;font-size:13px;margin-bottom:14px}hr{border:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;margin:8px 0;font-size:16px}.qty{font-weight:bold;font-size:20px}.note{font-size:12px;color:#c00;margin-left:16px}.footer{text-align:center;margin-top:14px;font-size:12px;color:#666}</style></head><body><h2>🍳 PHIẾU BẾP</h2><div class="sub">Bàn ${currentTable} | ${new Date().toLocaleTimeString("vi-VN")}</div><hr/>${currentItems.map((i) => `<div class="row"><span>${i.name}</span><span class="qty">x${i.qty}</span></div>${notes[i.id] ? `<div class="note">📝 ${notes[i.id]}</div>` : ""}`).join("")}<hr/><div class="footer">Giao bếp lúc ${new Date().toLocaleTimeString("vi-VN")}</div></body></html>`,
      );
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
    };
    try {
      const res = await fetch(`${API_URL}/print/kitchen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_num: currentTable,
          items: currentItems.map((i) => ({
            name: i.name,
            price: i.price,
            qty: i.qty,
            note: notes[i.id] || "",
          })),
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      browserPrint();
    }
    setKitchenSent((p) => ({
      ...p,
      [currentTable]: Object.fromEntries(
        currentItems.map((i) => [i.id, i.qty]),
      ),
    }));
  };

  const handlePayment = async () => {
    if (!currentTable || currentItems.length === 0)
      return alert("Bàn chưa có món!");
    await fetch(`${API_URL}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_num: currentTable,
        total,
        items: currentItems.map((i) => ({
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
      }),
    });
    const printBrowser = () => {
      const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";
      const win = window.open("", "_blank", "width=794,height=900");
      win.document.write(
        `<html><head><title>Hóa Đơn</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;width:100%;max-width:400px;margin:0 auto;padding:20px}h2{text-align:center;font-size:15px;margin-bottom:2px}.sub{text-align:center;font-size:11px;color:#555;margin-bottom:10px}.info{font-size:12px;margin-bottom:6px}table{width:100%;border-collapse:collapse;margin:6px 0}th{border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 2px;font-size:12px}td{padding:3px 2px;font-size:12px;vertical-align:top}.total-row{border-top:1px dashed #000;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:bold;font-size:14px}.footer{text-align:center;margin-top:10px;font-size:11px;color:#555}@media print{@page{size:A4;margin:20mm}}</style></head><body><h2>${settings.store_name || "TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}</h2><div class="sub">${settings.store_address || ""}<br/>${settings.store_phone || ""}</div><div class="info">Bàn: <b>${currentTable}</b></div><div class="info">Ngày: ${new Date().toLocaleString("vi-VN")}</div><table><thead><tr><th style="text-align:left">TÊN HÀNG</th><th>SL</th><th style="text-align:right">T.TIỀN</th></tr></thead><tbody>${currentItems.map((it, i) => `<tr><td>${i + 1}. ${it.name}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">${fmt(it.price * it.qty)}</td></tr>`).join("")}</tbody></table><div class="total-row"><span>THÀNH TIỀN</span><span>${fmt(total)}</span></div><div class="footer">Cảm Ơn Quý Khách - Hẹn Gặp Lại!</div></body></html>`,
      );
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
    };
    try {
      const r = await fetch(`${API_URL}/print/bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_num: currentTable,
          total,
          items: currentItems.map((i) => ({
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
        }),
      });
      if (!r.ok) throw new Error();
    } catch {
      printBrowser();
    }
    updateTableStatus(currentTable, "PAYING");
  };

  const resetTable = () => {
    if (!currentTable || !window.confirm(`Reset bàn ${currentTable}?`)) return;
    setTableOrders((p) => {
      const c = { ...p };
      delete c[currentTable];
      return c;
    });
    setKitchenSent((p) => {
      const c = { ...p };
      delete c[currentTable];
      return c;
    });
    setItemNotes((p) => {
      const c = { ...p };
      delete c[currentTable];
      return c;
    });
    updateTableStatus(currentTable, "PAID");
  };
  const printTamTinh = async () => {
    if (!currentTable || currentItems.length === 0)
      return alert("Chưa có món!");
    const tot = currentItems.reduce((s, i) => s + i.price * i.qty, 0);
    try {
      const r = await fetch(`${API_URL}/print/tamtinh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_num: currentTable,
          items: currentItems.map((i) => ({
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
          total: tot,
        }),
      });
      if (!r.ok) throw new Error();
    } catch {
      const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
      const win = window.open("", "_blank", "width=500,height=600");
      win.document.write(
        `<html><head><title>Tạm Tính</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;padding:16px}h2{text-align:center;margin-bottom:8px}.line{border-top:1px dashed #000;margin:8px 0}.row{display:flex;justify-content:space-between}.bold{font-weight:bold}.footer{text-align:center;margin-top:8px;font-style:italic;font-size:11px}</style></head><body><h2>** TẠM TÍNH **</h2><div>Bàn: ${currentTable}</div><div>Giờ: ${new Date().toLocaleString("vi-VN")}</div><div class="line"></div>${currentItems.map((i) => `<div class="row"><span>${i.name} x${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join("")}<div class="line"></div><div class="row bold"><span>TẠM TÍNH</span><span>${fmt(tot)}</span></div><div class="footer">(Chưa thanh toán chính thức)</div></body></html>`,
      );
      win.document.close();
      win.print();
    }
  };

  const transferTable = async (target) => {
    if (!currentTable || currentTable === target) return;
    if (tableStatus[target] === "OPEN" || tableStatus[target] === "PAYING") {
      alert(`Bàn ${target} đang có khách!`);
      return;
    }
    setTableOrders((p) => {
      const u = { ...p };
      u[target] = p[currentTable] || {};
      delete u[currentTable];
      return u;
    });
    setKitchenSent((p) => {
      const u = { ...p };
      u[target] = p[currentTable] || {};
      delete u[currentTable];
      return u;
    });
    setItemNotes((p) => {
      const u = { ...p };
      u[target] = p[currentTable] || {};
      delete u[currentTable];
      return u;
    });
    await updateTableStatus(currentTable, "PAID");
    await updateTableStatus(target, "OPEN");
    setTableStatus((p) => ({ ...p, [currentTable]: "PAID", [target]: "OPEN" }));
    setCurrentTable(target);
    setShowTransferModal(false);
  };

  const executeSplit = () => {
    if (!splitTarget || splitSelected.length === 0) return;
    const move = currentItems.filter((i) => splitSelected.includes(i.id)),
      rest = currentItems.filter((i) => !splitSelected.includes(i.id));
    setTableOrders((p) => {
      const dest = [...(p[splitTarget] || [])];
      move.forEach((it) => {
        const ex = dest.find((x) => x.id === it.id);
        if (ex) ex.qty += it.qty;
        else dest.push({ ...it });
      });
      return { ...p, [splitTarget]: dest, [currentTable]: rest };
    });
    setTableStatus((p) => ({
      ...p,
      [splitTarget]: "OPEN",
      ...(rest.length === 0 ? { [currentTable]: "PAID" } : {}),
    }));
    updateTableStatus(splitTarget, "OPEN");
    if (rest.length === 0) updateTableStatus(currentTable, "PAID");
    setSplitModal(false);
    setSplitSelected([]);
    setSplitTarget("");
  };

  const addMenu = async () => {
    if (!newItem.name || !newItem.price) return alert("Vui lòng nhập tên và giá món!");
    const fd = new FormData();
    fd.append("name", newItem.name);
    fd.append("price", newItem.price);
    fd.append("type", newItem.type);
    if (file) fd.append("image", file);
    const res = await apiFetch(`${API_URL}/menu`, { method: "POST", body: fd });
    if (!res || !res.ok) {
      if (res) { const d = await res.json().catch(() => ({})); alert(d.error || "Lỗi thêm món!"); }
      return;
    }
    setNewItem({ name: "", price: "", type: "FOOD" });
    setFile(null);
    setFilter("ALL");
    fetchMenu();
  };
  const updateMenu = async () => {
    if (!editItem) return;
    const fd = new FormData();
    fd.append("name", editItem.name);
    fd.append("price", editItem.price);
    fd.append("type", editItem.type);
    if (editFile) fd.append("image", editFile);
    const res = await apiFetch(`${API_URL}/menu/${editItem.id}`, { method: "PUT", body: fd });
    if (!res || !res.ok) {
      if (res) { const d = await res.json().catch(() => ({})); alert(d.error || "Lỗi cập nhật món!"); }
      return;
    }
    setEditItem(null);
    setEditFile(null);
    fetchMenu();
  };
  const deleteMenu = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    await apiFetch(`${API_URL}/menu/${id}`, { method: "DELETE" });
    fetchMenu();
  };
  const showTableMsg = (type, txt) => {
    setTableMsg({ type, text: txt });
    setTimeout(() => setTableMsg(null), 3000);
  };
  const addTable = async () => {
    const num = Number(newTableNum);
    if (!num || num < 1) return showTableMsg("err", "Số bàn không hợp lệ");
    if (tableList.some((t) => t.table_num === num))
      return showTableMsg("err", `Bàn ${num} đã tồn tại`);
    await fetch(`${API_URL}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_num: num }),
    });
    if (num > tableList.length)
      await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "total_tables", value: String(num) }),
      });
    setNewTableNum("");
    showTableMsg("ok", `Đã thêm Bàn ${num}`);
    fetchTableList();
    fetchTableStatus();
  };
  const renameTable = async () => {
    if (!editingTable) return;
    const { table_num, new_num } = editingTable;
    if (!new_num || Number(new_num) < 1)
      return showTableMsg("err", "Số bàn không hợp lệ");
    if (Number(new_num) === table_num) {
      setEditingTable(null);
      return;
    }
    const res = await fetch(`${API_URL}/tables/${table_num}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_num: Number(new_num) }),
    });
    const d = await res.json();
    if (!res.ok) return showTableMsg("err", d.error);
    setEditingTable(null);
    showTableMsg("ok", `Đã đổi Bàn ${table_num} → Bàn ${new_num}`);
    fetchTableList();
    fetchTableStatus();
  };
  const deleteTable = async (num) => {
    if (!window.confirm(`Xóa Bàn ${num}?`)) return;
    const inDb = tableList.find((t) => t.table_num === num);
    if (inDb) {
      const res = await fetch(`${API_URL}/tables/${num}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) return showTableMsg("err", d.error);
    }
    setTableList((p) => p.filter((t) => t.table_num !== num));
    showTableMsg("ok", `Đã xóa Bàn ${num}`);
    fetchTableStatus();
  };

  // ─── User management handlers ─────────────────────────────────────────────
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchStaff = useCallback(() => {
    fetch(`${API_URL}/users`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setStaffList)
      .catch(() => {});
  }, []); // eslint-disable-line

  useEffect(() => {
    if (role === "admin") fetchStaff();
  }, [role]); // eslint-disable-line

  const openCreateStaff = () => {
    setStaffEditing(null);
    setStaffForm({ username: "", password: "", role: "waiter", full_name: "" });
    setStaffError("");
    setStaffShowForm(true);
  };
  const openEditStaff = (u) => {
    setStaffEditing(u);
    setStaffForm({
      username: u.username,
      password: "",
      role: u.role,
      full_name: u.full_name || "",
      active: u.active,
    });
    setStaffError("");
    setStaffShowForm(true);
  };

  const submitStaff = async () => {
    setStaffError("");
    try {
      let res;
      if (staffEditing) {
        const body = {
          full_name: staffForm.full_name,
          role: staffForm.role,
          active: staffForm.active,
        };
        if (staffForm.password) body.password = staffForm.password;
        res = await fetch(`${API_URL}/users/${staffEditing.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        if (!staffForm.username || !staffForm.password)
          return setStaffError("Vui lòng điền đầy đủ thông tin");
        res = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(staffForm),
        });
      }
      const d = await res.json();
      if (!res.ok) return setStaffError(d.error || "Lỗi không xác định");
      setStaffShowForm(false);
      fetchStaff();
    } catch (e) {
      setStaffError(e.message);
    }
  };

  const deleteStaff = async (u) => {
    if (!window.confirm(`Xóa tài khoản "${u.username}"?`)) return;
    await fetch(`${API_URL}/users/${u.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    fetchStaff();
  };

  // ─── Sub-components ───────────────────────────────────────────────────────

  const OrderPanel = () => (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold">ORDER</h2>
          <div className={`text-xs ${textSub} mt-0.5`}>
            {currentTable ? (
              <span>
                Bàn {currentTable} ·{" "}
                <span
                  className={
                    tableStatus[currentTable] === "OPEN"
                      ? "text-orange-400"
                      : tableStatus[currentTable] === "PAYING"
                        ? "text-purple-400"
                        : "text-slate-400"
                  }
                >
                  {tableStatus[currentTable] === "OPEN"
                    ? "Đang order"
                    : tableStatus[currentTable] === "PAYING"
                      ? "Chờ reset"
                      : "Trống"}
                </span>
              </span>
            ) : (
              "Chưa chọn bàn"
            )}
          </div>
        </div>
        {tableStatus[currentTable] === "OPEN" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSplitModal(true);
                setSplitSelected([]);
                setSplitTarget("");
              }}
              disabled={currentItems.length === 0}
              className="flex items-center gap-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-40"
            >
              <i className="fa-solid fa-code-branch text-xs" />
              Tách
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition"
            >
              <i className="fa-solid fa-right-left text-xs" />
              Chuyển
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 mb-3">
        {currentItems.length === 0 ? (
          <div className={`${textSub} text-center py-8 text-sm`}>
            Chưa có món nào
          </div>
        ) : (
          currentItems.map((item) => {
            const sentQty = kitchenSent[currentTable]?.[item.id] || 0,
              newQty = item.qty - sentQty,
              note = itemNotes[currentTable]?.[item.id] || "";
            return (
              <div key={item.id} className={`${bgCard} rounded-xl p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{item.name}</span>
                    {newQty > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                        +{newQty}
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
                        if (item.qty - 1 < sentQty)
                          setKitchenSent((p) => ({
                            ...p,
                            [currentTable]: {
                              ...(p[currentTable] || {}),
                              [item.id]: Math.max(0, item.qty - 1),
                            },
                          }));
                        updateQty(item.id, "dec");
                      }}
                      className="w-6 h-6 bg-slate-600 hover:bg-red-500 rounded font-bold text-sm transition"
                    >
                      −
                    </button>
                    <span className="font-bold text-sm w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, "inc")}
                      className="w-6 h-6 bg-slate-600 hover:bg-green-500 rounded font-bold text-sm transition"
                    >
                      +
                    </button>
                  </div>
                  <span className={`text-xs ${textSub}`}>
                    {formatMoney(item.price)}/món
                  </span>
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) =>
                    setItemNotes((p) => ({
                      ...p,
                      [currentTable]: {
                        ...(p[currentTable] || {}),
                        [item.id]: e.target.value,
                      },
                    }))
                  }
                  placeholder="Ghi chú..."
                  className={`mt-2 w-full text-xs px-2 py-1 rounded-lg outline-none ${darkMode ? "bg-slate-700 text-slate-300 placeholder-slate-500" : "bg-gray-200 text-gray-600 placeholder-gray-400"}`}
                />
              </div>
            );
          })
        )}
      </div>
      <div
        className={`border-t ${darkMode ? "border-slate-600" : "border-gray-300"} pt-3 flex flex-col gap-2`}
      >
        <div className="flex justify-between font-bold mb-1">
          <span>Total:</span>
          <span className="text-green-400">{formatMoney(total)}</span>
        </div>
        <button
          onClick={printKitchenTicket}
          disabled={currentItems.length === 0}
          className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm ${currentItems.length > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-slate-600 opacity-50 cursor-not-allowed"}`}
        >
          <i className="fa-solid fa-fire-burner mr-2" />
          In phiếu bếp
        </button>
        {canPay && (
          <button
            onClick={printTamTinh}
            disabled={currentItems.length === 0}
            className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm ${currentItems.length > 0 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-slate-600 opacity-50 cursor-not-allowed"}`}
          >
            <i className="fa-solid fa-file-invoice mr-2" />
            Tạm tính
          </button>
        )}
        {canPay && (
          <button
            onClick={handlePayment}
            disabled={
              currentItems.length === 0 ||
              tableStatus[currentTable] === "PAYING"
            }
            className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm ${currentItems.length > 0 && tableStatus[currentTable] !== "PAYING" ? "bg-blue-500 hover:bg-blue-600" : "bg-slate-600 opacity-50 cursor-not-allowed"}`}
          >
            <i className="fa-solid fa-money-bill-wave mr-2" />
            Thanh toán & In HĐ
          </button>
        )}
        {canPay && (
          <button
            onClick={resetTable}
            disabled={tableStatus[currentTable] !== "PAYING"}
            className={`w-full py-2.5 rounded-xl font-bold transition text-sm ${tableStatus[currentTable] === "PAYING" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-600 opacity-50 cursor-not-allowed text-slate-400"}`}
          >
            <i className="fa-solid fa-rotate mr-2" />
            Reset bàn
          </button>
        )}
        {!canPay && (
          <div className={`text-xs text-center py-2 ${textSub}`}>
            <i className="fa-solid fa-lock mr-1" />
            Nhân viên order không có quyền thanh toán
          </div>
        )}
      </div>
    </div>
  );

  const TableGrid = ({ onSelect }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
      {tables.map((t) => {
        const status = tableStatus[t] || "PAID",
          qty = calcTotalQty(tableOrders[t]),
          isSel = currentTable === t;
        return (
          <div
            key={t}
            onClick={() => {
              setCurrentTable(t);
              onSelect && onSelect(t);
            }}
            className={`p-3 rounded-xl text-center cursor-pointer transition font-semibold ${isSel ? "bg-blue-500 text-white" : status === "OPEN" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
          >
            <div className="text-sm">Bàn {t}</div>
            <div
              className={`text-xs mt-0.5 font-normal ${status === "OPEN" ? "text-yellow-200" : "text-slate-400"}`}
            >
              {status === "OPEN" ? (qty > 0 ? `${qty} món` : "OPEN") : "Trống"}
            </div>
          </div>
        );
      })}
    </div>
  );

  const FilterBar = () => (
    <div className="flex gap-1.5 mb-3 flex-wrap flex-shrink-0">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`px-3 py-1.5 rounded-full text-xs transition font-semibold whitespace-nowrap ${filter === f.key ? "bg-blue-500 text-white" : `${bgCard} ${textSub} hover:bg-slate-600`}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const MenuGrid = () => (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredMenu.map((m) => {
          const qty = tableOrders[currentTable]?.[m.id]?.qty || 0;
          return (
            <div
              key={m.id}
              className={`${bgCard} rounded-xl p-3 flex flex-col`}
            >
              <div onClick={() => addItem(m)} className="cursor-pointer flex-1">
                {m.image && (
                  <img
                    src={`${API_URL}/uploads/${m.image}`}
                    className="h-24 w-full object-cover rounded-lg mb-2"
                    alt={m.name}
                  />
                )}
                <div className="font-semibold text-sm leading-tight">
                  {m.name}
                </div>
                <div className="text-red-400 text-xs mt-1 mb-2">
                  {formatMoney(m.price)}
                </div>
              </div>
              {qty > 0 ? (
                <div className="flex items-center justify-between bg-slate-700 rounded-lg px-2 py-1 mt-1">
                  <button
                    onClick={() => updateQty(m.id, "dec")}
                    className="w-7 h-7 bg-slate-600 hover:bg-red-500 rounded-md font-bold transition"
                  >
                    −
                  </button>
                  <span className="font-bold text-green-400">{qty}</span>
                  <button
                    onClick={() => updateQty(m.id, "inc")}
                    className="w-7 h-7 bg-slate-600 hover:bg-green-500 rounded-md font-bold transition"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(m)}
                  className="mt-1 w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-1.5 text-xs font-semibold transition"
                >
                  + Thêm
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const ManageView = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        {[
          [
            "add",
            <>
              <i className="fa-solid fa-plus mr-1" />
              Thêm món
            </>,
          ],
          [
            "edit",
            <>
              <i className="fa-solid fa-pen-to-square mr-1" />
              Sửa món
            </>,
          ],
          [
            "table",
            <>
              <i className="fa-solid fa-chair mr-1" />
              Bàn
            </>,
          ],
          ...(role === "admin"
            ? [
                [
                  "staff",
                  <>
                    <i className="fa-solid fa-users mr-1" />
                    Nhân viên
                  </>,
                ],
              ]
            : []),
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => {
              setManageTab(tab);
              setEditItem(null);
              setEditingTable(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${manageTab === tab ? "bg-blue-500 text-white" : `${bgCard} ${textSub} hover:bg-slate-600`}`}
          >
            {label}
          </button>
        ))}
      </div>
      {manageTab === "add" && (
        <div className="flex flex-col gap-4 overflow-y-auto pb-4 max-w-md">
          <div>
            <label className={`block text-sm ${textSub} mb-1`}>Tên món</label>
            <input
              type="text"
              value={newItem.name}
              placeholder="VD: Gà nướng muối ớt"
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={`block text-sm ${textSub} mb-1`}>
              Giá (nghìn đồng)
            </label>
            <input
              type="number"
              value={newItem.price}
              placeholder="VD: 85"
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className={`block text-sm ${textSub} mb-1`}>Loại</label>
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className={inputCls}
            >
              <option value="FOOD">FOOD</option>
              <option value="DRINK">DRINK</option>
              <option value="COMBO">COMBO</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm ${textSub} mb-1`}>Ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer`}
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                className="mt-3 h-28 w-full object-cover rounded-xl"
                alt="preview"
              />
            )}
          </div>
          <button
            onClick={addMenu}
            className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold transition text-white"
          >
            <i className="fa-solid fa-check mr-2" />
            Thêm vào menu
          </button>
        </div>
      )}
      {manageTab === "edit" && (
        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
          <div className="lg:w-72 overflow-y-auto flex flex-col gap-2 max-h-60 lg:max-h-none">
            {menu.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setEditItem({ ...m });
                  setEditFile(null);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${editItem?.id === m.id ? "bg-blue-600 text-white" : `${bgCard} hover:bg-slate-700`}`}
              >
                {m.image && (
                  <img
                    src={`${API_URL}/uploads/${m.image}`}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    alt={m.name}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-sm">{m.name}</div>
                  <div className="text-xs text-red-400">
                    {formatMoney(m.price)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMenu(m.id);
                  }}
                  className={`${textSub} hover:text-red-400 transition text-lg px-1`}
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
          {editItem ? (
            <div className="flex flex-col gap-3 overflow-y-auto pb-4 flex-1 max-w-md">
              <h3 className="font-bold">Sửa: {editItem.name}</h3>
              <input
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
                className={inputCls}
                placeholder="Tên món"
              />
              <input
                type="number"
                value={editItem.price}
                onChange={(e) =>
                  setEditItem({ ...editItem, price: e.target.value })
                }
                className={inputCls}
                placeholder="Giá"
              />
              <select
                value={editItem.type}
                onChange={(e) =>
                  setEditItem({ ...editItem, type: e.target.value })
                }
                className={inputCls}
              >
                <option value="FOOD">FOOD</option>
                <option value="DRINK">DRINK</option>
                <option value="COMBO">COMBO</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditFile(e.target.files[0])}
                className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer`}
              />
              <img
                src={
                  editFile
                    ? URL.createObjectURL(editFile)
                    : `${API_URL}/uploads/${editItem.image}`
                }
                className="h-28 w-full object-cover rounded-xl"
                alt="preview"
                onError={(e) => (e.target.style.display = "none")}
              />
              <div className="flex gap-2">
                <button
                  onClick={updateMenu}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 py-2.5 rounded-xl font-bold transition text-white text-sm"
                >
                  <i className="fa-solid fa-floppy-disk mr-1" />
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditItem(null);
                    setEditFile(null);
                  }}
                  className={`flex-1 ${bgCard} hover:bg-slate-600 py-2.5 rounded-xl font-bold transition text-sm`}
                >
                  Huỷ
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`hidden lg:flex items-center justify-center flex-1 ${textSub} text-sm`}
            >
              ← Chọn món để sửa
            </div>
          )}
        </div>
      )}
      {manageTab === "table" && (
        <div className="flex flex-col gap-4 overflow-y-auto pb-4">
          {tableMsg && (
            <div
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${tableMsg.type === "ok" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              {tableMsg.type === "ok" ? "✅ " : "❌ "}
              {tableMsg.text}
            </div>
          )}
          <div className={`${bgCard} rounded-2xl p-4 max-w-md`}>
            <h3 className="font-bold mb-3 text-sm">
              <i className="fa-solid fa-plus mr-2 text-green-400" />
              Thêm bàn mới
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Số bàn"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTable()}
                className={inputCls}
              />
              <button
                onClick={addTable}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-white transition whitespace-nowrap text-sm"
              >
                Thêm
              </button>
            </div>
          </div>
          <div className={`${bgCard} rounded-2xl p-4 max-w-md`}>
            <h3 className="font-bold mb-3 text-sm">
              <i className="fa-solid fa-list mr-2 text-blue-400" />
              Danh sách bàn ({tableList.length})
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {tableList.map((t) => (
                <div
                  key={t.table_num}
                  className={`${darkMode ? "bg-slate-700" : "bg-gray-100"} rounded-xl p-3`}
                >
                  {editingTable?.table_num === t.table_num ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-slate-400">
                        Đổi bàn {t.table_num} →
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={editingTable.new_num}
                        onChange={(e) =>
                          setEditingTable({
                            ...editingTable,
                            new_num: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameTable();
                          if (e.key === "Escape") setEditingTable(null);
                        }}
                        autoFocus
                        className={`w-full text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-600 text-white" : "bg-white border border-gray-300"}`}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={renameTable}
                          className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-bold transition"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingTable(null)}
                          className={`flex-1 py-1 ${darkMode ? "bg-slate-600" : "bg-gray-200"} rounded-lg text-xs font-bold transition`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">
                          Bàn {t.table_num}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${t.status === "OPEN" ? "text-orange-400" : "text-slate-400"}`}
                        >
                          {t.status === "OPEN" ? "Có khách" : "Trống"}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setEditingTable({
                              table_num: t.table_num,
                              new_num: String(t.table_num),
                            })
                          }
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${darkMode ? "bg-slate-600 hover:bg-blue-500" : "bg-gray-200 hover:bg-blue-500 hover:text-white"} transition`}
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          onClick={() => deleteTable(t.table_num)}
                          disabled={t.status === "OPEN"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${t.status === "OPEN" ? "bg-slate-700 text-slate-600 cursor-not-allowed" : darkMode ? "bg-slate-600 hover:bg-red-500 text-slate-300 hover:text-white" : "bg-gray-200 hover:bg-red-500 hover:text-white"}`}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Nhân viên (admin only) ── */}
      {manageTab === "staff" && role === "admin" && (
        <div className="flex flex-col gap-4 overflow-y-auto pb-4 max-w-lg">
          {/* Modal tạo/sửa */}
          {staffShowForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div
                className={`${bgCard} rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">
                    {staffEditing ? "Sửa tài khoản" : "Tạo tài khoản mới"}
                  </h3>
                  <button
                    onClick={() => setStaffShowForm(false)}
                    className={`${textSub} hover:text-white text-xl`}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                {!staffEditing && (
                  <div>
                    <label className={`block text-sm ${textSub} mb-1`}>
                      Username
                    </label>
                    <input
                      value={staffForm.username}
                      onChange={(e) =>
                        setStaffForm((f) => ({
                          ...f,
                          username: e.target.value,
                        }))
                      }
                      placeholder="vd: nhanvien1"
                      className={inputCls}
                    />
                  </div>
                )}
                <div>
                  <label className={`block text-sm ${textSub} mb-1`}>
                    Họ tên
                  </label>
                  <input
                    value={staffForm.full_name}
                    onChange={(e) =>
                      setStaffForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    placeholder="Tên nhân viên"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSub} mb-1`}>
                    {staffEditing
                      ? "Mật khẩu mới (để trống nếu không đổi)"
                      : "Mật khẩu"}
                  </label>
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) =>
                      setStaffForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="••••••"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSub} mb-1`}>
                    Vai trò
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) =>
                      setStaffForm((f) => ({ ...f, role: e.target.value }))
                    }
                    className={inputCls}
                  >
                    <option value="waiter">Nhân viên order</option>
                    <option value="cashier">Thu ngân</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {staffEditing && (
                  <label
                    className={`flex items-center gap-3 cursor-pointer text-sm ${textSub}`}
                  >
                    <input
                      type="checkbox"
                      checked={staffForm.active !== false}
                      onChange={(e) =>
                        setStaffForm((f) => ({
                          ...f,
                          active: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-blue-500"
                    />
                    Tài khoản đang hoạt động
                  </label>
                )}
                {staffError && (
                  <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-xl">
                    {staffError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={submitStaff}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 py-2.5 rounded-xl font-bold text-white text-sm transition"
                  >
                    {staffEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
                  </button>
                  <button
                    onClick={() => setStaffShowForm(false)}
                    className={`flex-1 ${bgCard} py-2.5 rounded-xl font-bold text-sm transition hover:bg-slate-600`}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">
              <i className="fa-solid fa-users mr-2 text-blue-400" />
              Danh sách nhân viên
            </h3>
            <button
              onClick={openCreateStaff}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition"
            >
              <i className="fa-solid fa-plus mr-1" />
              Thêm
            </button>
          </div>

          {staffList.length === 0 ? (
            <div
              className={`${bgCard} rounded-2xl p-8 text-center ${textSub} text-sm`}
            >
              Chưa có nhân viên nào
            </div>
          ) : (
            staffList.map((u) => {
              const roleColor =
                u.role === "admin"
                  ? "text-red-400 bg-red-500/10"
                  : u.role === "cashier"
                    ? "text-yellow-400 bg-yellow-500/10"
                    : "text-green-400 bg-green-500/10";
              const roleLabel =
                u.role === "admin"
                  ? "Admin"
                  : u.role === "cashier"
                    ? "Thu ngân"
                    : "NV Order";
              return (
                <div
                  key={u.id}
                  className={`${bgCard} rounded-2xl p-4 flex items-center gap-3`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 font-bold text-white text-base">
                    {(u.full_name || u.username || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">
                        {u.full_name || u.username}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColor}`}
                      >
                        {roleLabel}
                      </span>
                      {!u.active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-400">
                          Đã khóa
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 ${textSub}`}>
                      @{u.username}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditStaff(u)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? "bg-slate-600 hover:bg-blue-500" : "bg-gray-200 hover:bg-blue-500 hover:text-white"} transition`}
                    >
                      <i className="fa-solid fa-pen text-xs" />
                    </button>
                    <button
                      onClick={() => deleteStaff(u)}
                      disabled={u.username === "admin"}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${u.username === "admin" ? "bg-slate-700 text-slate-600 cursor-not-allowed" : darkMode ? "bg-slate-600 hover:bg-red-500 hover:text-white" : "bg-gray-200 hover:bg-red-500 hover:text-white"}`}
                    >
                      <i className="fa-solid fa-trash text-xs" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  const HistoryView = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 flex-wrap flex-shrink-0">
        <h2 className="text-base font-bold">
          <i className="fa-solid fa-clock-rotate-left mr-2" />
          Lịch sử
        </h2>
        <input
          type="date"
          value={historyDate}
          onChange={(e) => {
            setHistoryDate(e.target.value);
            setSelectedBill(null);
          }}
          className={`${inputCls} w-auto`}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        <div className="lg:w-80 overflow-y-auto flex flex-col gap-2 max-h-56 lg:max-h-none">
          {bills.length === 0 ? (
            <div className={`${textSub} text-center mt-6 text-sm`}>
              Không có hóa đơn nào
            </div>
          ) : (
            bills.map((b) => (
              <div
                key={b.id}
                onClick={() => fetchBillDetail(b.id)}
                className={`p-3 rounded-xl cursor-pointer transition ${selectedBill?.id === b.id ? "bg-blue-600 text-white" : `${bgCard} hover:bg-slate-700`}`}
              >
                <div className="flex justify-between font-semibold text-sm">
                  <span>Bàn {b.table_num}</span>
                  <span className="text-green-400">{formatMoney(b.total)}</span>
                </div>
                <div
                  className={`text-xs mt-1 ${selectedBill?.id === b.id ? "text-blue-200" : textSub}`}
                >
                  {new Date(b.created_at).toLocaleTimeString("vi-VN")} · HD#
                  {b.id}
                </div>
                <div
                  className={`text-xs mt-1 truncate ${selectedBill?.id === b.id ? "text-blue-200" : textSub}`}
                >
                  {b.items_summary}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedBill ? (
            <div className="flex flex-col gap-3 max-w-sm">
              <button
                onClick={async () => {
                  const printBrowser = (bill) => {
                    const fmt = (n) =>
                      new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";
                    const now = new Date(bill.created_at).toLocaleString(
                      "vi-VN",
                    );
                    const win = window.open(
                      "",
                      "_blank",
                      "width=794,height=900",
                    );
                    win.document.write(
                      `<html><head><title>Hóa Đơn</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;width:100%;max-width:400px;margin:0 auto;padding:20px}h2{text-align:center;font-size:15px}table{width:100%;border-collapse:collapse;margin:6px 0}th{border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 2px;font-size:12px}td{padding:3px 2px;font-size:12px}.total-row{border-top:1px dashed #000;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:bold}.footer{text-align:center;margin-top:10px;font-size:11px;color:#555}</style></head><body><h2>${settings.store_name || "TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}</h2><div style="text-align:center;font-size:11px;color:#555;margin-bottom:10px">${settings.store_address || ""}<br/>${settings.store_phone || ""}</div><div style="font-size:12px;margin-bottom:6px">HD#${bill.id}·Bàn:<b>${bill.table_num}</b></div><div style="font-size:12px;margin-bottom:6px">Ngày:${now}</div><table><thead><tr><th style="text-align:left">TÊN HÀNG</th><th>SL</th><th style="text-align:right">T.TIỀN</th></tr></thead><tbody>${(bill.items || []).map((it, i) => `<tr><td>${i + 1}.${it.name}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">${fmt(it.price * it.qty)}</td></tr>`).join("")}</tbody></table><div class="total-row"><span>THÀNH TIỀN</span><span>${fmt(bill.total)}</span></div><div style="text-align:center;font-size:11px;margin-top:4px">***IN LẠI***</div><div class="footer">Cảm Ơn Quý Khách-Hẹn Gặp Lại!</div></body></html>`,
                    );
                    win.document.close();
                    win.focus();
                    setTimeout(() => {
                      win.print();
                      win.close();
                    }, 300);
                  };
                  try {
                    const r = await fetch(
                      `${API_URL}/print/bill/${selectedBill.id}`,
                      { method: "POST" },
                    );
                    if (!r.ok) throw new Error();
                  } catch {
                    printBrowser(selectedBill);
                  }
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 py-2.5 rounded-xl font-bold transition text-white text-sm"
              >
                <i className="fa-solid fa-print mr-2" />
                In lại hóa đơn
              </button>
              <div className={`${bgCard} rounded-xl p-4`}>
                <div className="text-center font-bold mb-3">
                  <div className="text-base">
                    {settings.store_name || "TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}
                  </div>
                  <div className={`text-xs ${textSub}`}>
                    {settings.store_address}
                  </div>
                </div>
                <div className={`text-xs ${textSub} mb-1`}>
                  HD#{selectedBill.id} · Bàn {selectedBill.table_num}
                </div>
                <div className={`text-xs ${textSub} mb-3`}>
                  {new Date(selectedBill.created_at).toLocaleString("vi-VN")}
                </div>
                <hr className="border-slate-600 mb-2" />
                {(selectedBill.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span>{formatMoney(item.price * item.qty)}</span>
                  </div>
                ))}
                <hr className="border-slate-600 my-2" />
                <div className="flex justify-between font-bold">
                  <span>THÀNH TIỀN</span>
                  <span className="text-green-400">
                    {formatMoney(selectedBill.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`flex items-center justify-center h-24 ${textSub} text-sm`}
            >
              Chọn hóa đơn để xem
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const StatsView = () => {
    const fmt = formatMoney;
    const BarChart = ({ data, labelKey, valueKey }) => {
      const max = Math.max(...data.map((d) => d[valueKey]), 1);
      return (
        <div className="flex items-end gap-1 h-28">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group min-w-0"
            >
              <div className="relative w-full flex flex-col items-center">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                  <div className="bg-slate-900 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                    <div className="font-bold text-emerald-400">
                      {fmt(d[valueKey])}
                    </div>
                    <div className="text-slate-400">{d.bill_count} HĐ</div>
                  </div>
                </div>
                <div
                  className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max((d[valueKey] / max) * 100, 3)}px`,
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 truncate w-full text-center">
                {d[labelKey]}
              </div>
            </div>
          ))}
        </div>
      );
    };
    const KPI = ({ icon, label, value, color }) => (
      <div className={`${bgCard} rounded-2xl p-4 flex items-center gap-3`}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <i className={`fa-solid ${icon} ${color}`} />
        </div>
        <div className="min-w-0">
          <div className={`text-base font-bold ${color} truncate`}>{value}</div>
          <div className={`text-xs ${textSub}`}>{label}</div>
        </div>
      </div>
    );
    const TopItems = ({ items, label }) => (
      <div className={`${bgCard} rounded-2xl p-4`}>
        <div
          className={`text-xs font-semibold ${textSub} uppercase tracking-wider mb-3`}
        >
          <i className="fa-solid fa-ranking-star mr-2 text-orange-400" />
          {label}
        </div>
        {!items?.length ? (
          <div className={`text-sm ${textSub} text-center py-4`}>
            Chưa có dữ liệu
          </div>
        ) : (
          items.map((item, i) => {
            const maxQ = items[0].total_qty;
            return (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-slate-400 text-black" : i === 2 ? "bg-orange-600 text-white" : "bg-slate-700"}`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">
                    {item.name}
                  </span>
                  <span className="text-emerald-400 text-sm font-bold whitespace-nowrap">
                    {fmt(item.total_revenue)}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${(item.total_qty / maxQ) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs ${textSub} w-12 text-right whitespace-nowrap`}
                  >
                    {item.total_qty} phần
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
    return (
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold">
            <i className="fa-solid fa-chart-line mr-2 text-emerald-400" />
            Thống kê
          </h2>
          <div className={`flex gap-1 p-1 rounded-xl ${bgCard}`}>
            {[
              ["day", "Hôm nay", "fa-sun"],
              ["month", "Tháng", "fa-calendar"],
              ["year", "Năm", "fa-chart-bar"],
            ].map(([v, l, ic]) => (
              <button
                key={v}
                onClick={() => setStatsTab(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statsTab === v ? "bg-emerald-500 text-white shadow" : `${textSub} hover:bg-slate-700`}`}
              >
                <i className={`fa-solid ${ic} mr-1`} />
                {l}
              </button>
            ))}
          </div>
        </div>
        {statsTab === "month" && (
          <input
            type="month"
            value={statsMonth}
            onChange={(e) => {
              setStatsMonth(e.target.value);
              fetchStatsMonthly(e.target.value);
              fetchStatsDaily(e.target.value);
            }}
            className={`${inputCls} w-auto text-sm`}
          />
        )}
        {statsTab === "year" && (
          <select
            value={statsYear}
            onChange={(e) => {
              setStatsYear(e.target.value);
              fetchStatsYearly(e.target.value);
            }}
            className={`${inputCls} w-auto text-sm`}
          >
            {Array.from({ length: 5 }, (_, i) =>
              (new Date().getFullYear() - i).toString(),
            ).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        )}
        {statsTab === "day" && statsToday && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {KPI({
                icon: "fa-receipt",
                label: "Hóa đơn hôm nay",
                value: statsToday.bill_count,
                color: "text-blue-400",
              })}
              {KPI({
                icon: "fa-sack-dollar",
                label: "Doanh thu",
                value: fmt(statsToday.revenue),
                color: "text-emerald-400",
              })}
              {KPI({
                icon: "fa-fire",
                label: "TB/hóa đơn",
                value: statsToday.bill_count
                  ? fmt(Math.round(statsToday.revenue / statsToday.bill_count))
                  : "–",
                color: "text-orange-400",
              })}
            </div>
            {TopItems({
              items: statsToday.top_items,
              label: "Top món hôm nay",
            })}
          </>
        )}
        {statsTab === "month" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {KPI({
                icon: "fa-receipt",
                label: "Hóa đơn tháng",
                value: statsMonthlyData?.bill_count ?? "–",
                color: "text-blue-400",
              })}
              {KPI({
                icon: "fa-sack-dollar",
                label: "Doanh thu tháng",
                value: fmt(statsMonthlyData?.revenue ?? 0),
                color: "text-emerald-400",
              })}
              {KPI({
                icon: "fa-fire",
                label: "TB/ngày",
                value: statsMonthlyData?.days?.length
                  ? fmt(
                      Math.round(
                        statsMonthlyData.revenue / statsMonthlyData.days.length,
                      ),
                    )
                  : "–",
                color: "text-orange-400",
              })}
            </div>
            <div className={`${bgCard} rounded-2xl p-4`}>
              <div
                className={`text-xs font-semibold ${textSub} uppercase tracking-wider mb-3`}
              >
                <i className="fa-solid fa-chart-column mr-2 text-emerald-400" />
                Doanh thu theo ngày
              </div>
              {statsMonthlyData?.days?.length ? (
                BarChart({
                  data: statsMonthlyData.days.map((d) => ({
                    ...d,
                    label: d.date.slice(8),
                  })),
                  labelKey: "label",
                  valueKey: "revenue",
                })
              ) : (
                <div className={`text-sm ${textSub} text-center py-8`}>
                  Chưa có dữ liệu
                </div>
              )}
            </div>
            {TopItems({
              items: statsMonthlyData?.top_items,
              label: `Top món — tháng ${statsMonth}`,
            })}
          </>
        )}
        {statsTab === "year" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {KPI({
                icon: "fa-receipt",
                label: `HĐ năm ${statsYear}`,
                value: statsYearlyData?.bill_count ?? "–",
                color: "text-blue-400",
              })}
              {KPI({
                icon: "fa-sack-dollar",
                label: `DT năm ${statsYear}`,
                value: fmt(statsYearlyData?.revenue ?? 0),
                color: "text-emerald-400",
              })}
              {KPI({
                icon: "fa-fire",
                label: "TB/tháng",
                value: statsYearlyData?.months?.length
                  ? fmt(
                      Math.round(
                        statsYearlyData.revenue / statsYearlyData.months.length,
                      ),
                    )
                  : "–",
                color: "text-orange-400",
              })}
            </div>
            <div className={`${bgCard} rounded-2xl p-4`}>
              <div
                className={`text-xs font-semibold ${textSub} uppercase tracking-wider mb-3`}
              >
                <i className="fa-solid fa-chart-column mr-2 text-emerald-400" />
                Doanh thu theo tháng
              </div>
              {statsYearlyData?.months?.length ? (
                BarChart({
                  data: statsYearlyData.months.map((d) => ({
                    ...d,
                    label: "T" + d.month.slice(5),
                  })),
                  labelKey: "label",
                  valueKey: "revenue",
                })
              ) : (
                <div className={`text-sm ${textSub} text-center py-8`}>
                  Chưa có dữ liệu
                </div>
              )}
            </div>
            {TopItems({
              items: statsYearlyData?.top_items,
              label: `Top món — năm ${statsYear}`,
            })}
          </>
        )}
      </div>
    );
  };

  const SettingsView = () => (
    <div className="flex flex-col gap-5 max-w-lg overflow-y-auto pb-4">
      <h2 className="text-base font-bold">
        <i className="fa-solid fa-gear mr-2" />
        Cài đặt hệ thống
      </h2>
      <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
        <h3 className="font-bold text-sm">
          <i className="fa-solid fa-store mr-2 text-orange-400" />
          Thông tin cửa hàng
        </h3>
        {[
          { label: "Tên cửa hàng", key: "store_name" },
          { label: "Địa chỉ", key: "store_address" },
          { label: "Hotline", key: "store_phone" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className={`block text-sm ${textSub} mb-1`}>{label}</label>
            <input
              value={settings[key] || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, [key]: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        ))}
        <div>
          <label className={`block text-sm ${textSub} mb-1`}>Số bàn</label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.total_tables || "20"}
            onChange={(e) =>
              setSettings((s) => ({ ...s, total_tables: e.target.value }))
            }
            className={inputCls}
          />
        </div>
      </div>

      <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">
            <i className="fa-solid fa-print mr-2 text-blue-400" />
            Quản lý máy in
          </h3>
          <button
            onClick={() => {
              fetchPrinters();
              fetchPrintJobs();
            }}
            disabled={loadingPrinters}
            className={`text-xs px-3 py-1.5 rounded-lg border border-slate-600 ${textSub} hover:bg-slate-700 transition`}
          >
            {loadingPrinters ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Đang tải...
              </>
            ) : (
              <>
                <i className="fa-solid fa-rotate mr-1" />
                Làm mới
              </>
            )}
          </button>
        </div>
        {printerMsg && (
          <div
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${printerMsg.type === "ok" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
          >
            {printerMsg.type === "ok" ? "✅ " : "❌ "}
            {printerMsg.text}
          </div>
        )}
        <div
          className={`${darkMode ? "bg-slate-700/50 border-slate-600" : "bg-white border-gray-200"} border rounded-xl p-5 flex flex-col gap-4 mb-4`}
        >
          <div className={`text-sm font-bold ${text}`}>
            {editPrinter ? "✏️ Sửa thông tin máy in" : "➕ Thêm máy in mới"}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label
                className={`block text-xs font-semibold ${textSub} mb-1.5`}
              >
                Tên máy in (VD: EPSON TM-T88VI)
              </label>
              <input
                value={printerForm.printer_name}
                onChange={(e) =>
                  setPrinterForm((f) => ({
                    ...f,
                    printer_name: e.target.value,
                  }))
                }
                placeholder="Nhập tên máy in hiển thị trong Windows..."
                className={inputCls}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  className={`block text-xs font-semibold ${textSub} mb-1.5`}
                >
                  Loại phiếu in
                </label>
                <select
                  value={printerForm.job_type}
                  onChange={(e) =>
                    setPrinterForm((f) => ({ ...f, job_type: e.target.value }))
                  }
                  className={`${inputCls} w-full`}
                >
                  <option value="KITCHEN">Bếp (KITCHEN)</option>
                  <option value="TAMTINH">Tạm tính (TAMTINH)</option>
                  <option value="BILL">Thanh toán (BILL)</option>
                  <option value="ALL">Tất cả (ALL)</option>
                </select>
              </div>
              <div className="w-24">
                <label
                  className={`block text-xs font-semibold ${textSub} mb-1.5`}
                >
                  Khổ giấy
                </label>
                <input
                  type="number"
                  value={printerForm.paper_width}
                  onChange={(e) =>
                    setPrinterForm((f) => ({
                      ...f,
                      paper_width: e.target.value,
                    }))
                  }
                  placeholder="80"
                  className={`${inputCls} w-full text-center`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            {editPrinter && (
              <button
                onClick={() => {
                  setEditPrinter(null);
                  setPrinterForm({
                    printer_name: "",
                    job_type: "KITCHEN",
                    paper_width: "80",
                  });
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border ${darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"} transition`}
              >
                Hủy bỏ
              </button>
            )}
            <button
              onClick={savePrinter}
              className={`${editPrinter ? "flex-1" : "w-full"} py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white text-sm transition shadow-lg shadow-blue-500/20`}
            >
              <i
                className={`fa-solid ${editPrinter ? "fa-floppy-disk" : "fa-plus"} mr-2`}
              />
              {editPrinter ? "Lưu thay đổi" : "Thêm máy in"}
            </button>
          </div>
        </div>
        {printers.length === 0 ? (
          <div className={`text-sm ${textSub} text-center py-3`}>
            Chưa có máy in — nhấn Làm mới hoặc Thêm mới
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {printers.map((p) => (
              <div
                key={p.id}
                className={`${darkMode ? "bg-slate-700" : "bg-gray-100"} rounded-xl px-4 py-3 flex items-center gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">
                      {p.printer_name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.job_type === "KITCHEN" ? "bg-orange-500/20 text-orange-400" : p.job_type === "TAMTINH" ? "bg-yellow-500/20 text-yellow-400" : p.job_type === "BILL" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}
                    >
                      {p.job_type}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${p.is_active ? "bg-green-500/10 text-green-400" : "bg-slate-600 text-slate-400"}`}
                    >
                      {p.is_active ? "Bật" : "Tắt"}
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 ${textSub}`}>
                    {p.paper_width}mm
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => togglePrinterActive(p)}
                    title={p.is_active ? "Tắt" : "Bật"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${p.is_active ? (darkMode ? "bg-green-500/20 hover:bg-slate-600 text-green-400" : "bg-green-100 text-green-600") : darkMode ? "bg-slate-600 text-slate-400" : "bg-gray-200 text-gray-500"}`}
                  >
                    <i
                      className={`fa-solid ${p.is_active ? "fa-toggle-on" : "fa-toggle-off"}`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setEditPrinter(p);
                      setPrinterForm({
                        printer_name: p.printer_name,
                        job_type: p.job_type,
                        paper_width: String(p.paper_width || 80),
                      });
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${darkMode ? "bg-slate-600 hover:bg-blue-500" : "bg-gray-200 hover:bg-blue-500 hover:text-white"}`}
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    onClick={() => deletePrinter(p.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${darkMode ? "bg-slate-600 hover:bg-red-500 hover:text-white" : "bg-gray-200 hover:bg-red-500 hover:text-white"}`}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {printJobs.length > 0 && (
        <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3`}>
          <h3 className="font-bold text-sm">
            <i className="fa-solid fa-triangle-exclamation mr-2 text-red-400" />
            Job in lỗi ({printJobs.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
            {printJobs.map((j) => (
              <div
                key={j.id}
                className={`${darkMode ? "bg-slate-700" : "bg-gray-100"} rounded-xl p-3 flex items-start gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">JOB #{j.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-500/20 text-orange-400">
                      {j.job_type}
                    </span>
                    {j.table_num && (
                      <span className={`text-xs ${textSub}`}>
                        Bàn {j.table_num}
                      </span>
                    )}
                  </div>
                  {j.error_message && (
                    <div className="text-xs text-red-400 mt-1 truncate">
                      {j.error_message}
                    </div>
                  )}
                  <div className={`text-xs ${textSub} mt-0.5`}>
                    {new Date(j.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>
                <button
                  onClick={() => retryJob(j.id)}
                  className="flex-shrink-0 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition"
                >
                  <i className="fa-solid fa-rotate-right mr-1" />
                  Retry
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={saveAllSettings}
        className={`w-full py-3 rounded-xl font-bold text-white transition ${settingsSaved ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"}`}
      >
        {settingsSaved ? (
          <>
            <i className="fa-solid fa-circle-check mr-2" />
            Đã lưu!
          </>
        ) : (
          <>
            <i className="fa-solid fa-floppy-disk mr-2" />
            Lưu cài đặt
          </>
        )}
      </button>
    </div>
  );

  // ─── Modals ───────────────────────────────────────────────────────────────
  const Modals = () => (
    <>
      {splitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className={`${bgCard} rounded-2xl p-5 w-full max-w-md flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold">
                <i className="fa-solid fa-code-branch mr-2 text-purple-400" />
                Tách bàn
              </h3>
              <button
                onClick={() => setSplitModal(false)}
                className={`${textSub} hover:text-white`}
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setSplitSelected((p) =>
                      p.includes(item.id)
                        ? p.filter((x) => x !== item.id)
                        : [...p, item.id],
                    )
                  }
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${splitSelected.includes(item.id) ? "border-purple-500 bg-purple-500/10" : "border-slate-600 hover:bg-slate-700"}`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${splitSelected.includes(item.id) ? "bg-purple-500 border-purple-500" : "border-slate-500"}`}
                  >
                    {splitSelected.includes(item.id) && (
                      <i className="fa-solid fa-check text-white text-xs" />
                    )}
                  </div>
                  <span className="flex-1 text-sm">{item.name}</span>
                  <span className={`text-sm font-bold ${textSub}`}>
                    x{item.qty}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <label className={`block text-sm ${textSub} mb-2`}>
                Chuyển sang bàn:
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                {tables
                  .filter((t) => t !== currentTable)
                  .map((t) => (
                    <button
                      key={t}
                      onClick={() => setSplitTarget(t)}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${splitTarget === t ? "bg-purple-500 border-purple-500 text-white" : tableStatus[t] === "OPEN" ? "border-orange-500 text-orange-400" : "border-slate-600 hover:bg-slate-700"}`}
                    >
                      {t}
                    </button>
                  ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSplitModal(false)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-600 ${textSub} hover:bg-slate-700 transition`}
              >
                Hủy
              </button>
              <button
                onClick={executeSplit}
                disabled={splitSelected.length === 0 || !splitTarget}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${splitSelected.length > 0 && splitTarget ? "bg-purple-500 hover:bg-purple-600 text-white" : "bg-slate-600 opacity-50 cursor-not-allowed text-slate-400"}`}
              >
                <i className="fa-solid fa-arrows-split-up-and-left mr-2" />
                Chuyển
                {splitSelected.length > 0 ? ` (${splitSelected.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`${bgPanel} ${text} rounded-2xl p-5 w-full max-w-sm shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">
                <i className="fa-solid fa-right-left mr-2 text-yellow-400" />
                Chuyển bàn {currentTable}
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
              {tables
                .filter((t) => t !== currentTable)
                .map((t) => {
                  const s = tableStatus[t];
                  const occ = s === "OPEN" || s === "PAYING";
                  return (
                    <button
                      key={t}
                      onClick={() => !occ && transferTable(t)}
                      disabled={occ}
                      className={`h-12 rounded-xl font-bold text-sm transition ${occ ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50" : "bg-green-600 hover:bg-green-500 text-white"}`}
                    >
                      {t}
                      {occ && (
                        <div className="text-xs font-normal opacity-70">
                          có khách
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-400">
              <span>
                <span className="inline-block w-3 h-3 rounded bg-green-600 mr-1" />
                Trống
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded bg-slate-700 mr-1" />
                Có khách
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ─── Desktop nav item ─────────────────────────────────────────────────────
  const NavItem = ({ icon, label, view }) => (
    <div
      onClick={() => setSidebarView(view)}
      title={label}
      className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition w-full ${sidebarView === view ? "bg-blue-600 text-white" : `${textSub} hover:bg-slate-700`}`}
    >
      <span className="text-base">{icon}</span>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className={`${bg} ${text} transition-colors duration-300`}
      style={{ minHeight: "100svh" }}
    >
      {Modals()}

      {/* ═══ DESKTOP (md+) ════════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Left sidebar */}
        <div
          className={`w-16 ${bgSide} flex flex-col items-center py-4 gap-2 flex-shrink-0`}
        >
          <div className="text-2xl mb-2 text-orange-400">
            <i className="fa-solid fa-fire-flame-curved" />
          </div>
          {NavItem({
            icon: <i className="fa-solid fa-table-cells-large" />,
            label: "Order",
            view: "order",
          })}
          {canManage &&
            NavItem({
              icon: <i className="fa-solid fa-utensils" />,
              label: "Quản lý món",
              view: "manage",
            })}
          {canPay &&
            NavItem({
              icon: <i className="fa-solid fa-clock-rotate-left" />,
              label: "Lịch sử",
              view: "history",
            })}
          {canPay &&
            NavItem({
              icon: <i className="fa-solid fa-chart-line" />,
              label: "Thống kê",
              view: "stats",
            })}
          {role === "admin" &&
            NavItem({
              icon: <i className="fa-solid fa-gear" />,
              label: "Cài đặt",
              view: "settings",
            })}
          <div className="mt-auto flex flex-col items-center gap-2">
            <div
              title={
                printerStatus === "online"
                  ? "Online"
                  : printerStatus === "offline"
                    ? "Offline"
                    : "Kiểm tra..."
              }
              className="flex flex-col items-center gap-1"
            >
              <span className="text-lg">
                <i className="fa-solid fa-print" />
              </span>
              <span
                className={`w-2 h-2 rounded-full ${printerStatus === "online" ? "bg-green-400" : printerStatus === "offline" ? "bg-red-500" : "bg-yellow-400 animate-pulse"}`}
              />
            </div>
            <div
              onClick={() => setDarkMode((d) => !d)}
              className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-slate-700`}
            >
              {darkMode ? (
                <i className="fa-solid fa-sun" />
              ) : (
                <i className="fa-solid fa-moon" />
              )}
            </div>
            <div
              onClick={() => {
                if (window.confirm("Đăng xuất?")) logout();
              }}
              className={`cursor-pointer p-2 rounded-xl transition ${textSub} hover:bg-red-700 hover:text-white`}
            >
              <i className="fa-solid fa-right-from-bracket" />
            </div>
          </div>
        </div>

        {/* Table panel */}
        {sidebarView === "order" && (
          <div className={`w-56 ${bgPanel} p-4 overflow-y-auto flex-shrink-0`}>
            <h2 className="mb-3 font-bold">BÀN</h2>
            <div className="flex gap-3 mb-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
                Trống
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                Có khách
              </span>
            </div>
            {TableGrid({})}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-5 flex flex-col overflow-hidden min-w-0">
          {sidebarView === "order" && (
            <>
              {FilterBar()}
              <div className="flex-1 overflow-y-auto">{MenuGrid()}</div>
            </>
          )}
          {sidebarView === "manage" && ManageView()}
          {sidebarView === "history" && HistoryView()}
          {sidebarView === "stats" && StatsView()}
          {sidebarView === "settings" && SettingsView()}
        </div>

        {/* Order panel */}
        {sidebarView === "order" && (
          <div className={`w-72 ${bgSide} p-4 flex flex-col flex-shrink-0`}>
            {OrderPanel()}
          </div>
        )}
      </div>

      {/* ═══ MOBILE (< md) ════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:hidden" style={{ height: "100svh" }}>
        {/* Header */}
        <div
          className={`${bgSide} px-4 py-3 flex items-center justify-between flex-shrink-0 border-b ${darkMode ? "border-slate-700" : "border-gray-300"}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-xl">
              <i className="fa-solid fa-fire-flame-curved" />
            </span>
            <span className="font-bold text-sm">BBQ POS</span>
            {currentTable && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tableStatus[currentTable] === "OPEN" ? "bg-orange-500/20 text-orange-400" : tableStatus[currentTable] === "PAYING" ? "bg-purple-500/20 text-purple-400" : "bg-slate-700 text-slate-400"}`}
              >
                Bàn {currentTable}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${printerStatus === "online" ? "bg-green-400" : printerStatus === "offline" ? "bg-red-500" : "bg-yellow-400 animate-pulse"}`}
            />
            <button
              onClick={() => setDarkMode((d) => !d)}
              className={`${textSub} text-lg`}
            >
              {darkMode ? (
                <i className="fa-solid fa-sun" />
              ) : (
                <i className="fa-solid fa-moon" />
              )}
            </button>
            <button
              onClick={() => {
                if (window.confirm("Đăng xuất?")) logout();
              }}
              className={`${textSub} text-lg`}
            >
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === "tables" && (
            <div className="h-full overflow-y-auto p-3">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-bold text-sm">CHỌN BÀN</h2>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                    Trống
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                    Có khách
                  </span>
                </div>
              </div>
              {TableGrid({ onSelect: () => setMobileTab("menu") })}
            </div>
          )}

          {mobileTab === "menu" && (
            <div className="h-full overflow-y-auto p-3">
              {currentTable ? (
                <div
                  className={`mb-3 px-3 py-2 rounded-xl ${bgCard} flex items-center justify-between`}
                >
                  <span className="text-sm font-semibold">
                    Bàn {currentTable}
                  </span>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setMobileTab("tables")}
                      className={`text-xs ${textSub}`}
                    >
                      <i className="fa-solid fa-arrow-left mr-1" />
                      Đổi bàn
                    </button>
                    <button
                      onClick={() => setMobileTab("order")}
                      className="relative text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold"
                    >
                      <i className="fa-solid fa-receipt mr-1" />
                      Order
                      {currentItems.reduce((s, i) => s + i.qty, 0) > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {currentItems.reduce((s, i) => s + i.qty, 0)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-sm">
                  ⚠️ Chưa chọn bàn —{" "}
                  <button
                    onClick={() => setMobileTab("tables")}
                    className="underline font-semibold"
                  >
                    chọn bàn
                  </button>
                </div>
              )}
              {FilterBar()}
              <div className="flex-1 overflow-y-auto">{MenuGrid()}</div>
            </div>
          )}

          {mobileTab === "order" && (
            <div className="h-full overflow-hidden p-3">{OrderPanel()}</div>
          )}

          {mobileTab === "manage" && (
            <div className="h-full overflow-hidden p-3">{ManageView()}</div>
          )}

          {mobileTab === "history" && (
            <div className="h-full overflow-hidden p-3">{HistoryView()}</div>
          )}

          {mobileTab === "stats" && (
            <div className="h-full overflow-y-auto p-3">{StatsView()}</div>
          )}

          {mobileTab === "settings" && (
            <div className="h-full overflow-y-auto p-3">{SettingsView()}</div>
          )}
        </div>

        {/* Bottom nav */}
        <div
          className={`${bgSide} border-t ${darkMode ? "border-slate-700" : "border-gray-300"} flex-shrink-0 safe-bottom`}
        >
          <div className="flex">
            {[
              {
                tab: "tables",
                icon: "fa-table-cells-large",
                label: "Bàn",
                show: true,
              },
              {
                tab: "menu",
                icon: "fa-utensils",
                label: "Thực đơn",
                show: true,
              },
              { tab: "order", icon: "fa-receipt", label: "Order", show: true },
              {
                tab: "history",
                icon: "fa-clock-rotate-left",
                label: "Lịch sử",
                show: canPay,
              },
              {
                tab: "stats",
                icon: "fa-chart-line",
                label: "Thống kê",
                show: canPay,
              },
              {
                tab: "manage",
                icon: "fa-gear",
                label: "Quản lý",
                show: canManage,
              },
            ]
              .filter((t) => t.show)
              .map(({ tab, icon, label }) => {
                const isActive = mobileTab === tab;
                const badge =
                  tab === "order"
                    ? currentItems.reduce((s, i) => s + i.qty, 0)
                    : 0;
                return (
                  <button
                    key={tab}
                    onClick={() => setMobileTab(tab)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition relative ${isActive ? "text-orange-400" : textSub}`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-full" />
                    )}
                    <div className="relative">
                      <i className={`fa-solid ${icon} text-base`} />
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none text-center">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs leading-none">{label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <LoginScreen />;
  return <AppInner />;
}