// ─── useTables — quản lý bàn, order, chuyển bàn, tách bàn ───────────────────
import { useState, useCallback, useRef } from "react";
import { API_URL } from "../constants";

export function useTables(apiFetch) {
  const [tableList,    setTableList]    = useState([]);
  const [tableStatus,  setTableStatus]  = useState({});
  const [tableOrders,  setTableOrders]  = useState({});
  const [currentTable, setCurrentTable] = useState(null);
  const [kitchenSent,  setKitchenSent]  = useState({});
  const [itemNotes,    setItemNotes]    = useState({});
  // quản lý bàn (tab Manage)
  const [newTableNum,  setNewTableNum]  = useState("");
  const [editingTable, setEditingTable] = useState(null);
  const [tableMsg,     setTableMsg]     = useState(null);

  // ── Lưu orders lên server (debounced) ────────────────────────────────────
  const saveOrdersTimer = useRef(null);
  const saveOrders = useCallback((tableNum, orders) => {
    clearTimeout(saveOrdersTimer.current);
    saveOrdersTimer.current = setTimeout(() => {
      apiFetch(`${API_URL}/tables/${tableNum}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
    }, 500); // debounce 500ms
  }, []); // eslint-disable-line

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTableStatus = useCallback(() => {
    apiFetch(`${API_URL}/tables`)
      .then(r => r && r.json())
      .then(async rows => {
        if (!rows) return;
        const m = {};
        rows.forEach(r => { m[r.table_num] = r.status; });
        setTableStatus(m);
        // Load orders cho các bàn đang OPEN
        const openTables = rows.filter(r => r.status === "OPEN" || r.status === "PAYING");
        for (const t of openTables) {
          if (t.orders && Object.keys(t.orders).length > 0) {
            setTableOrders(prev => ({ ...prev, [t.table_num]: t.orders }));
          }
        }
      }).catch(() => {});
  }, []); // eslint-disable-line

  const fetchTableList = useCallback(() => {
    Promise.all([
      apiFetch(`${API_URL}/tables`).then(r => r && r.json()),
      apiFetch(`${API_URL}/settings`).then(r => r && r.json()),
    ]).then(([rows, cfg]) => {
      if (!rows || !cfg) return;
      const tot = Math.max(Number(cfg.total_tables) || 20, rows.reduce((mx,r) => Math.max(mx,r.table_num), 0));
      const dbMap = {};
      rows.forEach(r => { dbMap[r.table_num] = r.status; });
      setTableList(Array.from({ length: tot }, (_, i) => ({
        table_num: i + 1,
        status: dbMap[i + 1] || "PAID",
      })));
    }).catch(() => {});
  }, []); // eslint-disable-line

  // ── Cập nhật trạng thái bàn ───────────────────────────────────────────────
  const updateTableStatus = async (num, status) => {
    setTableStatus(p => ({ ...p, [num]: status }));
    await apiFetch(`${API_URL}/tables/${num}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  // ── Thêm / sửa số lượng món ───────────────────────────────────────────────
  const addItem = useCallback((item) => {
    if (!currentTable) return alert("Vui lòng chọn bàn trước!");
    setTableOrders(prev => {
      const tbl = prev[currentTable] || {}, ex = tbl[item.id];
      return { ...prev, [currentTable]: { ...tbl, [item.id]: ex ? { ...ex, qty: ex.qty + 1 } : { ...item, qty: 1 } } };
    });
    if (!tableStatus[currentTable] || tableStatus[currentTable] === "PAID")
      updateTableStatus(currentTable, "OPEN"); // eslint-disable-line
  }, [currentTable, tableStatus]); // eslint-disable-line

  const updateQty = useCallback((itemId, action) => {
    if (!currentTable) return;
    setTableOrders(prev => {
      const tbl = prev[currentTable];
      if (!tbl || !tbl[itemId]) return prev;
      const nq  = action === "inc" ? tbl[itemId].qty + 1 : tbl[itemId].qty - 1;
      const upd = { ...tbl };
      if (nq <= 0) delete upd[itemId];
      else upd[itemId] = { ...tbl[itemId], qty: nq };
      return { ...prev, [currentTable]: upd };
    });
  }, [currentTable]);

  // ── Chuyển bàn ────────────────────────────────────────────────────────────
  const transferTable = async (target, setShowTransferModal) => {
    if (!currentTable || currentTable === target) return;
    if (tableStatus[target] === "OPEN" || tableStatus[target] === "PAYING")
      return alert(`Bàn ${target} đang có khách!`);
    setTableOrders(p  => { const u = {...p};  u[target] = p[currentTable]||{}; delete u[currentTable]; return u; });
    setKitchenSent(p  => { const u = {...p};  u[target] = p[currentTable]||{}; delete u[currentTable]; return u; });
    setItemNotes(p    => { const u = {...p};  u[target] = p[currentTable]||{}; delete u[currentTable]; return u; });
    await updateTableStatus(currentTable, "PAID");
    await updateTableStatus(target, "OPEN");
    setTableStatus(p => ({ ...p, [currentTable]: "PAID", [target]: "OPEN" }));
    setCurrentTable(target);
    setShowTransferModal(false);
  };

  // ── Tách bàn ──────────────────────────────────────────────────────────────
  const executeSplit = ({ currentItems, splitTarget, splitSelected, setSplitModal, setSplitSelected, setSplitTarget }) => {
    if (!splitTarget || splitSelected.length === 0) return;
    const move = currentItems.filter(i =>  splitSelected.includes(i.id));
    const rest = currentItems.filter(i => !splitSelected.includes(i.id));
    setTableOrders(p => {
      const dest = { ...(p[splitTarget] || {}) };
      move.forEach(it => {
        if (dest[it.id]) dest[it.id] = { ...dest[it.id], qty: dest[it.id].qty + it.qty };
        else dest[it.id] = { ...it };
      });
      const restObj = {};
      rest.forEach(it => { restObj[it.id] = it; });
      return { ...p, [splitTarget]: dest, [currentTable]: restObj };
    });
    setTableStatus(p => ({ ...p, [splitTarget]: "OPEN", ...(rest.length === 0 ? { [currentTable]: "PAID" } : {}) }));
    updateTableStatus(splitTarget, "OPEN");
    if (rest.length === 0) updateTableStatus(currentTable, "PAID");
    setSplitModal(false); setSplitSelected([]); setSplitTarget("");
  };

  // ── Reset bàn ─────────────────────────────────────────────────────────────
  const resetTable = () => {
    if (!currentTable || !window.confirm(`Reset bàn ${currentTable}?`)) return;
    setTableOrders(p  => { const c = {...p}; delete c[currentTable]; return c; });
    setKitchenSent(p  => { const c = {...p}; delete c[currentTable]; return c; });
    setItemNotes(p    => { const c = {...p}; delete c[currentTable]; return c; });
    saveOrders(currentTable, {});
    updateTableStatus(currentTable, "PAID");
  };

  // ── CRUD bàn (tab Manage) ─────────────────────────────────────────────────
  const showTableMsg = (type, txt) => { setTableMsg({ type, text: txt }); setTimeout(() => setTableMsg(null), 3000); };

  const addTable = async () => {
    const num = Number(newTableNum);
    if (!num || num < 1)                            return showTableMsg("err", "Số bàn không hợp lệ");
    if (tableList.some(t => t.table_num === num))   return showTableMsg("err", `Bàn ${num} đã tồn tại`);
    await apiFetch(`${API_URL}/tables`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ table_num: num }) });
    if (num > tableList.length)
      await apiFetch(`${API_URL}/settings`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ key:"total_tables", value:String(num) }) });
    setNewTableNum("");
    showTableMsg("ok", `Đã thêm Bàn ${num}`);
    fetchTableList(); fetchTableStatus();
  };

  const renameTable = async () => {
    if (!editingTable) return;
    const { table_num, new_num } = editingTable;
    if (!new_num || Number(new_num) < 1) return showTableMsg("err", "Số bàn không hợp lệ");
    if (Number(new_num) === table_num)   { setEditingTable(null); return; }
    const res = await apiFetch(`${API_URL}/tables/${table_num}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ new_num: Number(new_num) }) });
    const d   = await res.json();
    if (!res.ok) return showTableMsg("err", d.error);
    setEditingTable(null);
    showTableMsg("ok", `Đã đổi Bàn ${table_num} → Bàn ${new_num}`);
    fetchTableList(); fetchTableStatus();
  };

  const deleteTable = async (num) => {
    if (!window.confirm(`Xóa Bàn ${num}?`)) return;
    const inDb = tableList.find(t => t.table_num === num);
    if (inDb) {
      const res = await apiFetch(`${API_URL}/tables/${num}`, { method:"DELETE" });
      const d   = await res.json();
      if (!res.ok) return showTableMsg("err", d.error);
    }
    setTableList(p => p.filter(t => t.table_num !== num));
    showTableMsg("ok", `Đã xóa Bàn ${num}`);
    fetchTableStatus();
  };

  return {
    tableList, setTableList,
    tableStatus, setTableStatus,
    tableOrders, setTableOrders,
    currentTable, setCurrentTable,
    kitchenSent,  setKitchenSent,
    itemNotes,    setItemNotes,
    newTableNum,  setNewTableNum,
    editingTable, setEditingTable,
    tableMsg,
    fetchTableStatus, fetchTableList,
    updateTableStatus,
    addItem, updateQty, saveOrders,
    transferTable, executeSplit, resetTable,
    addTable, renameTable, deleteTable,
  };
}