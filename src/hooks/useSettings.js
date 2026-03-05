// ─── useSettings — cài đặt cửa hàng + quản lý máy in ────────────────────────
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../constants";

export function useSettings(apiFetch) {
  const [settings,      setSettings]      = useState({ store_name:"Tiệm Nướng Đà Lạt Và Em", store_address:"24 đường 3 tháng 4, Đà Lạt", store_phone:"081 366 5665", total_tables:"20" });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [printers,      setPrinters]      = useState([]);
  const [printerForm,   setPrinterForm]   = useState({ printer_name:"", job_type:"KITCHEN", paper_width:"80" });
  const [editPrinter,   setEditPrinter]   = useState(null);
  const [printJobs,     setPrintJobs]     = useState([]);
  const [loadingPrinters,setLoadingPrinters]= useState(false);
  const [printerMsg,    setPrinterMsg]    = useState(null);

  useEffect(() => {
    apiFetch(`${API_URL}/settings`).then(r=>r&&r.json()).then(d=>d&&setSettings(p=>({...p,...d}))).catch(()=>{});
  }, []); // eslint-disable-line

  const saveAllSettings = async () => {
    await Promise.all(Object.entries(settings).map(([k,v]) =>
      apiFetch(`${API_URL}/settings`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({key:k,value:v}) })
    ));
    setSettingsSaved(true); setTimeout(()=>setSettingsSaved(false), 2000);
  };

  const showPrinterMsg = (type, txt) => { setPrinterMsg({type,text:txt}); setTimeout(()=>setPrinterMsg(null),3000); };

  const fetchPrinters = useCallback(async () => {
    setLoadingPrinters(true);
    try { const r = await apiFetch(`${API_URL}/print/printers`); const d = r && await r.json(); setPrinters(Array.isArray(d)?d:[]); }
    catch { setPrinters([]); }
    setLoadingPrinters(false);
  }, []); // eslint-disable-line

  const fetchPrintJobs = useCallback(async () => {
    try { const r = await apiFetch(`${API_URL}/print/jobs?status=failed&limit=20`); const d = r && await r.json(); setPrintJobs(Array.isArray(d)?d:[]); }
    catch { setPrintJobs([]); }
  }, []); // eslint-disable-line

  const savePrinter = async () => {
    const body = { printer_name:printerForm.printer_name, job_type:printerForm.job_type, paper_width:Number(printerForm.paper_width)||80 };
    if (!body.printer_name || !body.job_type) return showPrinterMsg("err","Thiếu thông tin máy in");
    try {
      const res = editPrinter
        ? await apiFetch(`${API_URL}/print/printers/${editPrinter.id}`, { method:"PUT",  headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
        : await apiFetch(`${API_URL}/print/printers`,                   { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (!res || !res.ok) throw new Error(res ? (await res.json()).error||"Lỗi" : "Lỗi");
      setEditPrinter(null); setPrinterForm({ printer_name:"", job_type:"KITCHEN", paper_width:"80" });
      showPrinterMsg("ok", editPrinter?"Cập nhật OK":"Thêm OK");
      fetchPrinters();
    } catch(e) { showPrinterMsg("err", e.message); }
  };

  const deletePrinter = async (id) => {
    if (!window.confirm("Xóa máy in này?")) return;
    try { const res = await apiFetch(`${API_URL}/print/printers/${id}`,{method:"DELETE"}); if(!res||!res.ok)throw new Error(); showPrinterMsg("ok","Đã xóa"); fetchPrinters(); }
    catch { showPrinterMsg("err","Không thể xóa"); }
  };

  const togglePrinterActive = async (p) => {
    try { await apiFetch(`${API_URL}/print/printers/${p.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({is_active:!p.is_active}) }); fetchPrinters(); } catch {}
  };

  const retryJob = async (id) => {
    try { const res = await apiFetch(`${API_URL}/print/jobs/${id}/retry`,{method:"POST"}); if(!res||!res.ok)throw new Error(); showPrinterMsg("ok","Đã thử in lại"); fetchPrintJobs(); }
    catch { showPrinterMsg("err","Lỗi retry"); }
  };

  return {
    settings, setSettings, settingsSaved, saveAllSettings,
    printers, printerForm, setPrinterForm, editPrinter, setEditPrinter,
    printJobs, loadingPrinters, printerMsg,
    fetchPrinters, fetchPrintJobs,
    savePrinter, deletePrinter, togglePrinterActive, retryJob,
  };
}