// ─── useBills — in phiếu bếp, tạm tính, thanh toán, lịch sử ─────────────────
import { useState, useCallback, useEffect } from "react";
import { API_URL } from "../constants";
import { generateBillHTML } from "./billHTML";

export function useBills(settings, apiFetch) {
  const [bills,        setBills]        = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [historyDate,  setHistoryDate]  = useState(new Date().toISOString().split("T")[0]);
  const [printerStatus,setPrinterStatus]= useState(null);

  // Kiểm tra trạng thái máy in mỗi 30s
  useEffect(() => {
    const chk = () => fetch(`${API_URL}/print/status`).then(r => r.json())
      .then(d  => setPrinterStatus(d.connected ? "online" : "offline"))
      .catch(() => setPrinterStatus("offline"));
    chk();
    const iv = setInterval(chk, 30000);
    return () => clearInterval(iv);
  }, []);

  const fetchBills = useCallback((date) => {
    apiFetch(`${API_URL}/bills?date=${date}`).then(r => r&&r.json()).then(d=>d&&setBills(d)).catch(() => {});
  }, []); // eslint-disable-line

  const fetchBillDetail = async (id) => {
    const r = await apiFetch(`${API_URL}/bills/${id}`);
    const d = r && await r.json();
    if (d) setSelectedBill(d);
  };

  // ── In phiếu bếp ──────────────────────────────────────────────────────────
  const printKitchenTicket = async ({ currentTable, currentItems, itemNotes, setKitchenSent }) => {
    if (!currentTable || currentItems.length === 0) return alert("Chưa có món!");
    const notes = itemNotes[currentTable] || {};
    // Chỉ in FOOD và COMBO — bỏ DRINK
    const kitchenItems = currentItems.filter(i => i.type !== "DRINK");
    if (kitchenItems.length === 0) return alert("Không có món bếp (chỉ có đồ uống)!");
    const browserPrint = () => {
      const html = generateBillHTML({ settings, type:"kitchen", tableNum:currentTable, items:kitchenItems.map(i=>({...i,note:notes[i.id]||""})), total:0 });
      const win = window.open("","_blank","width=500,height=600");
      win.document.write(html); win.document.close(); win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
    };
    try {
      const res = await apiFetch(`${API_URL}/print/kitchen`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ table_num:currentTable, items:kitchenItems.map(i=>({name:i.name,price:i.price,qty:i.qty,note:notes[i.id]||""})) }) });
      if (!res.ok) throw new Error();
    } catch { browserPrint(); }
    setKitchenSent(p => ({ ...p, [currentTable]: Object.fromEntries(currentItems.map(i=>[i.id,i.qty])) }));
  };

  // ── Thanh toán & in hóa đơn ───────────────────────────────────────────────
  const handlePayment = async ({ currentTable, currentItems, total, updateTableStatus }) => {
    if (!currentTable || currentItems.length === 0) return alert("Bàn chưa có món!");
    
    // ── Lưu bill vào DB — kiểm tra lỗi rõ ràng ───────────────────────────────
    const billRes = await apiFetch(`${API_URL}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_num: currentTable, total, items: currentItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })) })
    });
    if (!billRes || !billRes.ok) {
      const err = billRes ? await billRes.json().catch(() => ({})) : {};
      alert(`Lỗi thanh toán: ${err.error || "Không thể kết nối server"}`);
      return;
    }
    const browserPrint = () => {
      const html = generateBillHTML({ settings, type:"bill", tableNum:currentTable, items:currentItems, total });
      const win = window.open("","_blank","width=794,height=900");
      win.document.write(html); win.document.close(); win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
    };
    try {
      const r = await apiFetch(`${API_URL}/print/bill`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ table_num:currentTable, total, items:currentItems.map(i=>({name:i.name,price:i.price,qty:i.qty})) }) });
      if (!r.ok) throw new Error();
    } catch { browserPrint(); }
    updateTableStatus(currentTable, "PAYING");
  };

  // ── Tạm tính ──────────────────────────────────────────────────────────────
  const printTamTinh = async ({ currentTable, currentItems }) => {
    if (!currentTable || currentItems.length === 0) return alert("Chưa có món!");
    const tot = currentItems.reduce((s,i) => s + i.price * i.qty, 0);
    try {
      const r = await apiFetch(`${API_URL}/print/tamtinh`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ table_num:currentTable, items:currentItems.map(i=>({name:i.name,price:i.price,qty:i.qty})), total:tot }) });
      if (!r.ok) throw new Error();
    } catch {
      const html = generateBillHTML({ settings, type:"tamtinh", tableNum:currentTable, items:currentItems, total:tot });
      const win = window.open("","_blank","width=500,height=600");
      win.document.write(html); win.document.close(); win.print();
    }
  };

  // ── In lại hóa đơn ────────────────────────────────────────────────────────
  const reprintBill = (bill) => {
    const html = generateBillHTML({ settings, type:"bill", tableNum:bill.table_num, items:bill.items||[], total:bill.total, billId:bill.id, createdAt:bill.created_at, isReprint:true });
    const win = window.open("","_blank","width=794,height=900");
    win.document.write(html); win.document.close(); win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return {
    bills, setBills,
    selectedBill, setSelectedBill,
    historyDate,  setHistoryDate,
    printerStatus,
    fetchBills, fetchBillDetail,
    printKitchenTicket, handlePayment, printTamTinh, reprintBill,
  };
}