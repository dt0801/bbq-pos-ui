// ─── useBills — in phiếu bếp, tạm tính, thanh toán, lịch sử ─────────────────
import { useState, useCallback, useEffect } from "react";
import { API_URL } from "../constants";

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
      const win = window.open("","_blank","width=500,height=600");
      win.document.write(`<html><head><title>Phiếu Bếp</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:15px;padding:20px}h2{text-align:center;font-size:20px;margin-bottom:4px}.sub{text-align:center;color:#666;font-size:13px;margin-bottom:14px}hr{border:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;margin:8px 0;font-size:16px}.qty{font-weight:bold;font-size:20px}.note{font-size:12px;color:#c00;margin-left:16px}.footer{text-align:center;margin-top:14px;font-size:12px;color:#666}</style></head><body><h2>🍳 PHIẾU BẾP</h2><div class="sub">Bàn ${currentTable} | ${new Date().toLocaleTimeString("vi-VN")}</div><hr/>${kitchenItems.map(i=>`<div class="row"><span>${i.name}</span><span class="qty">x${i.qty}</span></div>${notes[i.id]?`<div class="note">📝 ${notes[i.id]}</div>`:""}`).join("")}<hr/><div class="footer">Giao bếp lúc ${new Date().toLocaleTimeString("vi-VN")}</div></body></html>`);
      win.document.close(); win.focus();
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
    await apiFetch(`${API_URL}/bills`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ table_num:currentTable, total, items:currentItems.map(i=>({name:i.name,price:i.price,qty:i.qty})) }) });
    const fmt = n => new Intl.NumberFormat("vi-VN").format(n*1000)+"đ";
    const browserPrint = () => {
      const win = window.open("","_blank","width=794,height=900");
      win.document.write(`<html><head><title>Hóa Đơn</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;width:100%;max-width:400px;margin:0 auto;padding:20px}h2{text-align:center;font-size:15px;margin-bottom:2px}.sub{text-align:center;font-size:11px;color:#555;margin-bottom:10px}.info{font-size:12px;margin-bottom:6px}table{width:100%;border-collapse:collapse;margin:6px 0}th{border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 2px;font-size:12px}td{padding:3px 2px;font-size:12px;vertical-align:top}.total-row{border-top:1px dashed #000;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:bold;font-size:14px}.footer{text-align:center;margin-top:10px;font-size:11px;color:#555}@media print{@page{size:A4;margin:20mm}}</style></head><body><h2>${settings.store_name||"TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}</h2><div class="sub">${settings.store_address||""}<br/>${settings.store_phone||""}</div><div class="info">Bàn: <b>${currentTable}</b></div><div class="info">Ngày: ${new Date().toLocaleString("vi-VN")}</div><table><thead><tr><th style="text-align:left">TÊN HÀNG</th><th>SL</th><th style="text-align:right">T.TIỀN</th></tr></thead><tbody>${currentItems.map((it,i)=>`<tr><td>${i+1}. ${it.name}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">${fmt(it.price*it.qty)}</td></tr>`).join("")}</tbody></table><div class="total-row"><span>THÀNH TIỀN</span><span>${fmt(total)}</span></div><div class="footer">Cảm Ơn Quý Khách - Hẹn Gặp Lại!</div></body></html>`);
      win.document.close(); win.focus();
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
      const fmt = n => new Intl.NumberFormat("vi-VN").format(n)+"đ";
      const win = window.open("","_blank","width=500,height=600");
      win.document.write(`<html><head><title>Tạm Tính</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;padding:16px}h2{text-align:center;margin-bottom:8px}.line{border-top:1px dashed #000;margin:8px 0}.row{display:flex;justify-content:space-between}.bold{font-weight:bold}.footer{text-align:center;margin-top:8px;font-style:italic;font-size:11px}</style></head><body><h2>** TẠM TÍNH **</h2><div>Bàn: ${currentTable}</div><div>Giờ: ${new Date().toLocaleString("vi-VN")}</div><div class="line"></div>${currentItems.map(i=>`<div class="row"><span>${i.name} x${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join("")}<div class="line"></div><div class="row bold"><span>TẠM TÍNH</span><span>${fmt(tot)}</span></div><div class="footer">(Chưa thanh toán chính thức)</div></body></html>`);
      win.document.close(); win.print();
    }
  };

  // ── In lại hóa đơn ────────────────────────────────────────────────────────
  const reprintBill = async (bill) => {
    const fmt = n => new Intl.NumberFormat("vi-VN").format(n*1000)+"đ";
    const browserPrint = (b) => {
      const now = new Date(b.created_at).toLocaleString("vi-VN");
      const win = window.open("","_blank","width=794,height=900");
      win.document.write(`<html><head><title>Hóa Đơn</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;width:100%;max-width:400px;margin:0 auto;padding:20px}h2{text-align:center;font-size:15px}table{width:100%;border-collapse:collapse;margin:6px 0}th{border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 2px;font-size:12px}td{padding:3px 2px;font-size:12px}.total-row{border-top:1px dashed #000;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:bold}.footer{text-align:center;margin-top:10px;font-size:11px;color:#555}</style></head><body><h2>${settings.store_name||"TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}</h2><div style="text-align:center;font-size:11px;color:#555;margin-bottom:10px">${settings.store_address||""}<br/>${settings.store_phone||""}</div><div style="font-size:12px;margin-bottom:6px">HD#${b.id}·Bàn:<b>${b.table_num}</b></div><div style="font-size:12px;margin-bottom:6px">Ngày:${now}</div><table><thead><tr><th style="text-align:left">TÊN HÀNG</th><th>SL</th><th style="text-align:right">T.TIỀN</th></tr></thead><tbody>${(b.items||[]).map((it,i)=>`<tr><td>${i+1}.${it.name}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">${fmt(it.price*it.qty)}</td></tr>`).join("")}</tbody></table><div class="total-row"><span>THÀNH TIỀN</span><span>${fmt(b.total)}</span></div><div style="text-align:center;font-size:11px;margin-top:4px">***IN LẠI***</div><div class="footer">Cảm Ơn Quý Khách-Hẹn Gặp Lại!</div></body></html>`);
      win.document.close(); win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
    };
    try {
      const r = await apiFetch(`${API_URL}/print/bill/${bill.id}`, { method:"POST" });
      if (!r.ok) throw new Error();
    } catch { browserPrint(bill); }
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