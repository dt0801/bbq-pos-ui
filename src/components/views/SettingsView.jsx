// ─── SettingsView — cài đặt cửa hàng + máy in ───────────────────────────────
import React from "react";

export default function SettingsView({
  settings, setSettings, settingsSaved, saveAllSettings,
  printers, printerForm, setPrinterForm, editPrinter, setEditPrinter,
  printJobs, loadingPrinters, printerMsg,
  fetchPrinters, fetchPrintJobs, savePrinter, deletePrinter, togglePrinterActive, retryJob,
  darkMode, bgCard, textSub, inputCls, text,
}) {
  return (
    <div className="flex flex-col gap-5 max-w-lg overflow-y-auto pb-4">
      <h2 className="text-base font-bold"><i className="fa-solid fa-gear mr-2"/>Cài đặt hệ thống</h2>

      {/* Thông tin cửa hàng */}
      <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
        <h3 className="font-bold text-sm"><i className="fa-solid fa-store mr-2 text-orange-400"/>Thông tin cửa hàng</h3>
        {[{label:"Tên cửa hàng",key:"store_name"},{label:"Địa chỉ",key:"store_address"},{label:"Hotline",key:"store_phone"}].map(({label,key}) => (
          <div key={key}><label className={`block text-sm ${textSub} mb-1`}>{label}</label>
            <input value={settings[key]||""} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))} className={inputCls} /></div>
        ))}
        <div><label className={`block text-sm ${textSub} mb-1`}>Số bàn</label>
          <input type="number" min="1" max="100" value={settings.total_tables||"20"} onChange={e=>setSettings(s=>({...s,total_tables:e.target.value}))} className={inputCls} /></div>
      </div>

      {/* Máy in */}
      <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm"><i className="fa-solid fa-print mr-2 text-blue-400"/>Quản lý máy in</h3>
          <button onClick={()=>{fetchPrinters();fetchPrintJobs();}} disabled={loadingPrinters}
            className={`text-xs px-3 py-1.5 rounded-lg border border-slate-600 ${textSub} hover:bg-slate-700 transition`}>
            {loadingPrinters?<><i className="fa-solid fa-spinner fa-spin mr-1"/>Đang tải...</>:<><i className="fa-solid fa-rotate mr-1"/>Làm mới</>}
          </button>
        </div>
        {printerMsg && <div className={`px-3 py-2 rounded-xl text-sm font-semibold ${printerMsg.type==="ok"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{printerMsg.type==="ok"?"✅ ":"❌ "}{printerMsg.text}</div>}
        {/* Form thêm/sửa máy in */}
        <div className={`${darkMode?"bg-slate-700/50 border-slate-600":"bg-white border-gray-200"} border rounded-xl p-5 flex flex-col gap-4 mb-4`}>
          <div className={`text-sm font-bold ${text}`}>{editPrinter?"✏️ Sửa thông tin máy in":"➕ Thêm máy in mới"}</div>
          <div><label className={`block text-xs font-semibold ${textSub} mb-1.5`}>Tên máy in (VD: EPSON TM-T88VI)</label>
            <input value={printerForm.printer_name} onChange={e=>setPrinterForm(f=>({...f,printer_name:e.target.value}))} placeholder="Nhập tên máy in hiển thị trong Windows..." className={inputCls} /></div>
          <div className="flex gap-4">
            <div className="flex-1"><label className={`block text-xs font-semibold ${textSub} mb-1.5`}>Loại phiếu in</label>
              <select value={printerForm.job_type} onChange={e=>setPrinterForm(f=>({...f,job_type:e.target.value}))} className={`${inputCls} w-full`}>
                <option value="KITCHEN">Bếp (KITCHEN)</option><option value="TAMTINH">Tạm tính (TAMTINH)</option><option value="BILL">Thanh toán (BILL)</option><option value="ALL">Tất cả (ALL)</option>
              </select></div>
            <div className="w-24"><label className={`block text-xs font-semibold ${textSub} mb-1.5`}>Khổ giấy</label>
              <input type="number" value={printerForm.paper_width} onChange={e=>setPrinterForm(f=>({...f,paper_width:e.target.value}))} placeholder="80" className={`${inputCls} w-full text-center`} /></div>
          </div>
          <div className="flex gap-3 mt-1">
            {editPrinter && <button onClick={()=>{setEditPrinter(null);setPrinterForm({printer_name:"",job_type:"KITCHEN",paper_width:"80"});}} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border ${darkMode?"border-slate-600 text-slate-300 hover:bg-slate-700":"border-gray-300 text-gray-600 hover:bg-gray-100"} transition`}>Hủy bỏ</button>}
            <button onClick={savePrinter} className={`${editPrinter?"flex-1":"w-full"} py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white text-sm transition`}>
              <i className={`fa-solid ${editPrinter?"fa-floppy-disk":"fa-plus"} mr-2`}/>{editPrinter?"Lưu thay đổi":"Thêm máy in"}
            </button>
          </div>
        </div>
        {/* Danh sách máy in */}
        {printers.length===0 ? <div className={`text-sm ${textSub} text-center py-3`}>Chưa có máy in — nhấn Làm mới hoặc Thêm mới</div> : (
          <div className="flex flex-col gap-2">
            {printers.map(p => (
              <div key={p.id} className={`${darkMode?"bg-slate-700":"bg-gray-100"} rounded-xl px-4 py-3 flex items-center gap-3`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{p.printer_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.job_type==="KITCHEN"?"bg-orange-500/20 text-orange-400":p.job_type==="TAMTINH"?"bg-yellow-500/20 text-yellow-400":p.job_type==="BILL"?"bg-green-500/20 text-green-400":"bg-blue-500/20 text-blue-400"}`}>{p.job_type}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.is_active?"bg-green-500/10 text-green-400":"bg-slate-600 text-slate-400"}`}>{p.is_active?"Bật":"Tắt"}</span>
                  </div>
                  <div className={`text-xs mt-0.5 ${textSub}`}>{p.paper_width}mm</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={()=>togglePrinterActive(p)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${p.is_active?(darkMode?"bg-green-500/20 hover:bg-slate-600 text-green-400":"bg-green-100 text-green-600"):darkMode?"bg-slate-600 text-slate-400":"bg-gray-200 text-gray-500"}`}><i className={`fa-solid ${p.is_active?"fa-toggle-on":"fa-toggle-off"}`}/></button>
                  <button onClick={()=>{setEditPrinter(p);setPrinterForm({printer_name:p.printer_name,job_type:p.job_type,paper_width:String(p.paper_width||80)});}} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${darkMode?"bg-slate-600 hover:bg-blue-500":"bg-gray-200 hover:bg-blue-500 hover:text-white"}`}><i className="fa-solid fa-pen"/></button>
                  <button onClick={()=>deletePrinter(p.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${darkMode?"bg-slate-600 hover:bg-red-500 hover:text-white":"bg-gray-200 hover:bg-red-500 hover:text-white"}`}><i className="fa-solid fa-trash"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job lỗi */}
      {printJobs.length>0 && (
        <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3`}>
          <h3 className="font-bold text-sm"><i className="fa-solid fa-triangle-exclamation mr-2 text-red-400"/>Job in lỗi ({printJobs.length})</h3>
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
            {printJobs.map(j => (
              <div key={j.id} className={`${darkMode?"bg-slate-700":"bg-gray-100"} rounded-xl p-3 flex items-start gap-3`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold">JOB #{j.id}</span><span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-500/20 text-orange-400">{j.job_type}</span>{j.table_num&&<span className={`text-xs ${textSub}`}>Bàn {j.table_num}</span>}</div>
                  {j.error_message&&<div className="text-xs text-red-400 mt-1 truncate">{j.error_message}</div>}
                  <div className={`text-xs ${textSub} mt-0.5`}>{new Date(j.created_at).toLocaleString("vi-VN")}</div>
                </div>
                <button onClick={()=>retryJob(j.id)} className="flex-shrink-0 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition"><i className="fa-solid fa-rotate-right mr-1"/>Retry</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={saveAllSettings} className={`w-full py-3 rounded-xl font-bold text-white transition ${settingsSaved?"bg-green-500":"bg-orange-500 hover:bg-orange-600"}`}>
        {settingsSaved?<><i className="fa-solid fa-circle-check mr-2"/>Đã lưu!</>:<><i className="fa-solid fa-floppy-disk mr-2"/>Lưu cài đặt</>}
      </button>
    </div>
  );
}