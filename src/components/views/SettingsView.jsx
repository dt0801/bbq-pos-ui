// ─── SettingsView — 3 tab: Máy in | Tài khoản | Report Bill ──────────────────
import React, { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// BILL PREVIEW
// ═══════════════════════════════════════════════════════════════════
function BillPreview({ cfg, type }) {
  const fmt  = (n) => new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";
  const fs   = Number(cfg.font_size  || 13);
  const align = cfg.header_align || "center";
  const style = cfg.font_style   || "normal"; // normal | bold | italic

  const sampleBill = [
    { name:"Gà nướng muối ớt",    qty:2, price:85  },
    { name:"Bò lúc lắc tỏi đen",  qty:1, price:120 },
    { name:"Nước ngọt lon",        qty:3, price:15  },
  ];
  const sampleKitchen = [
    { name:"Gà nướng muối ớt",    qty:2, note:"Ít cay" },
    { name:"Bò lúc lắc tỏi đen",  qty:1, note:""       },
    { name:"Nước ngọt lon",        qty:3, note:""       },
  ];
  const total = sampleBill.reduce((s,i)=>s+i.price*i.qty,0);

  const box = {
    fontFamily:"monospace",
    fontSize:`${fs}px`,
    fontWeight: style==="bold" ? "bold" : "normal",
    fontStyle:  style==="italic" ? "italic" : "normal",
    width:"100%", maxWidth:"300px", margin:"0 auto",
    background:"#fff", color:"#000", padding:"16px",
    borderRadius:"8px", lineHeight:1.6,
  };

  const Header = () => (
    <div style={{textAlign:align, marginBottom:"8px"}}>
      <div style={{fontSize:`${fs+2}px`, fontWeight:"bold"}}>
        {cfg.store_name || "TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}
      </div>
      {cfg.store_address && <div style={{fontSize:`${fs-1}px`,color:"#555"}}>{cfg.store_address}</div>}
      {cfg.store_phone   && <div style={{fontSize:`${fs-1}px`,color:"#555"}}>ĐT: {cfg.store_phone}</div>}
      {cfg.extra_header  && <div style={{fontSize:`${fs-1}px`,color:"#555",marginTop:"2px"}}>{cfg.extra_header}</div>}
    </div>
  );

  const Dashed = () => <div style={{borderTop:"1px dashed #999",margin:"5px 0"}}/>;

  if (type === "kitchen") return (
    <div style={box}>
      <div style={{textAlign:"center",fontSize:`${fs+3}px`,fontWeight:"bold",marginBottom:"4px"}}>🍳 PHIẾU BẾP</div>
      <div style={{textAlign:"center",fontSize:`${fs-1}px`,color:"#666",marginBottom:"8px"}}>
        Bàn <b>5</b> | {new Date().toLocaleTimeString("vi-VN")}
      </div>
      <Dashed/>
      {sampleKitchen.map((i,idx)=>(
        <div key={idx} style={{marginBottom:"6px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:`${fs+1}px`}}>
            <span>{i.name}</span><span style={{fontWeight:"bold",fontSize:`${fs+3}px`}}>x{i.qty}</span>
          </div>
          {i.note&&<div style={{fontSize:`${fs-2}px`,color:"#c00",marginLeft:"12px"}}>📝 {i.note}</div>}
        </div>
      ))}
      <Dashed/>
      {cfg.footer&&<div style={{textAlign:"center",fontSize:`${fs-1}px`,color:"#555",fontStyle:"italic"}}>{cfg.footer}</div>}
    </div>
  );

  return (
    <div style={box}>
      <Header/>
      <Dashed/>
      <div style={{fontSize:`${fs-1}px`,overflow:"hidden"}}>
        <span>Bàn: <b>5</b></span>
        <span style={{float:"right"}}>{new Date().toLocaleString("vi-VN")}</span>
      </div>
      <Dashed/>
      {type==="tamtinh" ? (
        <>
          <div style={{textAlign:"center",fontWeight:"bold",fontSize:`${fs+1}px`,marginBottom:"6px"}}>** TẠM TÍNH **</div>
          {sampleBill.map((i,idx)=>(
            <div key={idx} style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
              <span>{i.name} x{i.qty}</span><span>{fmt(i.price*i.qty)}</span>
            </div>
          ))}
          <Dashed/>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:`${fs+1}px`}}>
            <span>TẠM TÍNH</span><span>{fmt(total)}</span>
          </div>
          <div style={{textAlign:"center",fontSize:`${fs-2}px`,color:"#888",marginTop:"4px",fontStyle:"italic"}}>(Chưa thanh toán chính thức)</div>
        </>
      ) : (
        <>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px dashed #999"}}>
                <th style={{textAlign:"left",paddingBottom:"3px"}}>Tên món</th>
                {cfg.show_qty!=="false"        && <th style={{textAlign:"center",width:"28px"}}>SL</th>}
                {cfg.show_unit_price!=="false"  && <th style={{textAlign:"right", width:"60px"}}>Đơn</th>}
                <th style={{textAlign:"right",width:"70px"}}>T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {sampleBill.map((i,idx)=>(
                <tr key={idx}>
                  <td style={{paddingTop:"3px"}}>{idx+1}. {i.name}</td>
                  {cfg.show_qty!=="false"       && <td style={{textAlign:"center"}}>{i.qty}</td>}
                  {cfg.show_unit_price!=="false" && <td style={{textAlign:"right",color:"#555"}}>{fmt(i.price)}</td>}
                  <td style={{textAlign:"right"}}>{fmt(i.price*i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Dashed/>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:`${fs+1}px`}}>
            <span>THÀNH TIỀN</span><span>{fmt(total)}</span>
          </div>
        </>
      )}
      {cfg.footer&&(
        <>
          <Dashed/>
          <div style={{textAlign:"center",fontSize:`${fs-1}px`,color:"#555",fontStyle:"italic"}}>{cfg.footer}</div>
        </>
      )}
      {cfg.extra_footer&&<div style={{textAlign:"center",fontSize:`${fs-2}px`,color:"#888",marginTop:"2px"}}>{cfg.extra_footer}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REPORT BILL TAB — 3 sub-tab
// ═══════════════════════════════════════════════════════════════════
function ReportBillTab({ settings, setSettings, saveAllSettings, settingsSaved, darkMode, bgCard, textSub, inputCls }) {
  const [billType, setBillType] = useState("bill");

  // prefix cho từng loại: bill_ | tamtinh_ | kitchen_
  const P = { bill:"bill_", tamtinh:"tamtinh_", kitchen:"kitchen_" }[billType];

  const get = (k)       => settings[P+k] || "";
  const set = (k, v)    => setSettings(s => ({ ...s, [P+k]: v }));
  const tog = (k)       => set(k, settings[P+k] !== "false" ? "false" : "true");

  // Dùng chung store info cho cả 3 loại bill (lấy từ settings gốc)
  const previewCfg = {
    store_name:     settings.store_name    || "",
    store_address:  settings.store_address || "",
    store_phone:    settings.store_phone   || "",
    extra_header:   get("extra_header"),
    extra_footer:   get("extra_footer"),
    footer:         get("footer"),
    font_size:      get("font_size") || "13",
    font_style:     get("font_style") || "normal",
    header_align:   get("header_align") || "center",
    show_qty:       settings[P+"show_qty"],
    show_unit_price:settings[P+"show_unit_price"],
  };

  const subTabs = [
    { key:"bill",    icon:"fa-receipt",      label:"Bill TT",   color:"text-green-400"  },
    { key:"tamtinh", icon:"fa-file-invoice", label:"Tạm tính",  color:"text-yellow-400" },
    { key:"kitchen", icon:"fa-fire-burner",  label:"Phiếu bếp", color:"text-orange-400" },
  ];

  const Field = ({ label, k, placeholder, type="text" }) => (
    <div>
      <label className={`block text-xs font-semibold ${textSub} mb-1`}>{label}</label>
      {type==="textarea"
        ? <textarea rows={2} value={get(k)} placeholder={placeholder} onChange={e=>set(k,e.target.value)} className={`${inputCls} resize-none`}/>
        : <input type={type} value={get(k)} placeholder={placeholder} onChange={e=>set(k,e.target.value)} className={inputCls}/>}
    </div>
  );

  const Toggle = ({ label, k, desc }) => (
    <label className="flex items-center justify-between cursor-pointer gap-3">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {desc && <div className={`text-xs ${textSub}`}>{desc}</div>}
      </div>
      <div onClick={()=>tog(k)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${settings[P+k]!=="false"?"bg-blue-500":darkMode?"bg-slate-600":"bg-gray-300"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[P+k]!=="false"?"translate-x-5":"translate-x-0.5"}`}/>
      </div>
    </label>
  );

  return (
    <div className="flex gap-5 h-full min-h-0">

      {/* ── CỘT TRÁI: Settings ── */}
      <div className="flex flex-col gap-4 w-full max-w-sm flex-shrink-0 overflow-y-auto pb-4 pr-1">

        {/* Sub-tab chọn loại bill */}
        <div className={`${bgCard} rounded-2xl p-1 flex gap-1`}>
          {subTabs.map(t=>(
            <button key={t.key} onClick={()=>setBillType(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${billType===t.key?"bg-blue-500 text-white":`${textSub} hover:bg-slate-700`}`}>
              <i className={`fa-solid ${t.icon} ${billType===t.key?"text-white":t.color}`}/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Thông tin cửa hàng — chỉ hiện cho bill & tamtinh */}
        {billType !== "kitchen" && (
          <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
            <h3 className="font-bold text-sm"><i className="fa-solid fa-store mr-2 text-orange-400"/>Thông tin hiển thị</h3>
            <div className={`text-xs px-3 py-2 rounded-xl ${darkMode?"bg-slate-700 text-slate-400":"bg-gray-100 text-gray-500"}`}>
              <i className="fa-solid fa-circle-info mr-1"/>
              Tên, địa chỉ, hotline lấy từ cài đặt cửa hàng bên dưới
            </div>
            <Field label="Dòng phụ đề (tuỳ chọn)" k="extra_header" placeholder="VD: MST: 0123456789" type="textarea"/>
            <div>
              <label className={`block text-xs font-semibold ${textSub} mb-1`}>Căn lề tiêu đề</label>
              <div className="flex gap-2">
                {[["left","◀ Trái"],["center","▣ Giữa"],["right","Phải ▶"]].map(([v,l])=>(
                  <button key={v} onClick={()=>set("header_align",v)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition border ${(get("header_align")||"center")===v?"bg-blue-500 text-white border-blue-500":darkMode?"border-slate-600 text-slate-300 hover:bg-slate-700":"border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Định dạng chữ */}
        <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
          <h3 className="font-bold text-sm"><i className="fa-solid fa-font mr-2 text-blue-400"/>Định dạng chữ</h3>
          <div>
            <label className={`block text-xs font-semibold ${textSub} mb-2`}>Cỡ chữ</label>
            <div className="flex items-center gap-3">
              <input type="range" min="11" max="16" value={get("font_size")||"13"} onChange={e=>set("font_size",e.target.value)} className="flex-1 accent-blue-500"/>
              <span className={`text-sm font-bold w-10 text-center py-1 rounded-lg ${darkMode?"bg-slate-700":"bg-gray-200"}`}>{get("font_size")||"13"}px</span>
            </div>
          </div>
          <div>
            <label className={`block text-xs font-semibold ${textSub} mb-1`}>Kiểu chữ</label>
            <div className="flex gap-2">
              {[["normal","Thường"],["bold","Đậm"],["italic","Nghiêng"]].map(([v,l])=>(
                <button key={v} onClick={()=>set("font_style",v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition border ${(get("font_style")||"normal")===v?"bg-blue-500 text-white border-blue-500":darkMode?"border-slate-600 text-slate-300 hover:bg-slate-700":"border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                  style={{fontWeight:v==="bold"?"bold":"normal", fontStyle:v==="italic"?"italic":"normal"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cột hiển thị — chỉ bill thanh toán */}
        {billType === "bill" && (
          <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3`}>
            <h3 className="font-bold text-sm"><i className="fa-solid fa-table-columns mr-2 text-purple-400"/>Cột hiển thị</h3>
            <Toggle label="Cột Số lượng" k="show_qty"        desc="Hiện cột SL trong bảng món"/>
            <Toggle label="Cột Đơn giá"  k="show_unit_price" desc="Hiện giá mỗi món trước khi nhân"/>
          </div>
        )}

        {/* Lời nhắn */}
        <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
          <h3 className="font-bold text-sm"><i className="fa-solid fa-comment-dots mr-2 text-green-400"/>
            {billType==="kitchen" ? "Ghi chú phiếu bếp" : "Lời nhắn cuối bill"}
          </h3>
          <Field
            label={billType==="kitchen" ? "Dòng chú thích (tuỳ chọn)" : "Lời cảm ơn"}
            k="footer"
            placeholder={billType==="kitchen" ? "VD: Giao bếp nhanh!" : "Cảm Ơn Quý Khách - Hẹn Gặp Lại!"}
            type="textarea"
          />
          {billType !== "kitchen" && (
            <Field label="Dòng phụ cuối (tuỳ chọn)" k="extra_footer" placeholder="VD: ⭐ Đánh giá Google Maps giúp chúng mình!" type="textarea"/>
          )}
        </div>

        {/* Thông tin cửa hàng chung */}
        <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
          <h3 className="font-bold text-sm"><i className="fa-solid fa-store mr-2 text-orange-400"/>Thông tin cửa hàng (dùng chung)</h3>
          {[
            {label:"Tên cửa hàng",           k:"store_name",    placeholder:"TIỆM NƯỚNG ĐÀ LẠT VÀ EM"},
            {label:"Địa chỉ",                k:"store_address", placeholder:"24 đường 3 tháng 4, Đà Lạt"},
            {label:"Số điện thoại / Hotline", k:"store_phone",   placeholder:"081 366 5665"},
          ].map(({label,k,placeholder})=>(
            <div key={k}>
              <label className={`block text-xs font-semibold ${textSub} mb-1`}>{label}</label>
              <input value={settings[k]||""} placeholder={placeholder} onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))} className={inputCls}/>
            </div>
          ))}
        </div>

        <button onClick={saveAllSettings}
          className={`w-full py-3 rounded-xl font-bold text-white transition ${settingsSaved?"bg-green-500":"bg-orange-500 hover:bg-orange-600"}`}>
          {settingsSaved
            ? <><i className="fa-solid fa-circle-check mr-2"/>Đã lưu!</>
            : <><i className="fa-solid fa-floppy-disk mr-2"/>Lưu cài đặt</>}
        </button>
      </div>

      {/* ── CỘT PHẢI: Preview bill cố định ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header preview */}
        <div className={`flex items-center gap-2 mb-3 flex-shrink-0`}>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${darkMode?"bg-slate-700 text-slate-300":"bg-gray-200 text-gray-600"}`}>
            <i className="fa-solid fa-eye text-blue-400"/>
            Preview — {subTabs.find(t=>t.key===billType)?.label}
          </div>
          <div className={`text-xs ${textSub} italic`}>cập nhật realtime</div>
        </div>

        {/* Paper preview area */}
        <div className={`flex-1 overflow-y-auto rounded-2xl flex items-start justify-center py-6 px-4 ${darkMode?"bg-[#0b1220]":"bg-gray-200"}`}
          style={{backgroundImage: darkMode
            ? "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)"
            : "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
            backgroundSize:"24px 24px"}}>

          {/* Receipt paper with shadow */}
          <div style={{
            filter:"drop-shadow(0 8px 32px rgba(0,0,0,0.4))",
            maxWidth:"320px", width:"100%",
          }}>
            {/* Top jagged edge */}
            <div style={{
              height:"10px", background:"#fff",
              clipPath:"polygon(0% 100%,2% 0%,4% 100%,6% 0%,8% 100%,10% 0%,12% 100%,14% 0%,16% 100%,18% 0%,20% 100%,22% 0%,24% 100%,26% 0%,28% 100%,30% 0%,32% 100%,34% 0%,36% 100%,38% 0%,40% 100%,42% 0%,44% 100%,46% 0%,48% 100%,50% 0%,52% 100%,54% 0%,56% 100%,58% 0%,60% 100%,62% 0%,64% 100%,66% 0%,68% 100%,70% 0%,72% 100%,74% 0%,76% 100%,78% 0%,80% 100%,82% 0%,84% 100%,86% 0%,88% 100%,90% 0%,92% 100%,94% 0%,96% 100%,98% 0%,100% 100%)"
            }}/>
            <BillPreview cfg={previewCfg} type={billType}/>
            {/* Bottom jagged edge */}
            <div style={{
              height:"10px", background:"#fff",
              clipPath:"polygon(0% 0%,2% 100%,4% 0%,6% 100%,8% 0%,10% 100%,12% 0%,14% 100%,16% 0%,18% 100%,20% 0%,22% 100%,24% 0%,26% 100%,28% 0%,30% 100%,32% 0%,34% 100%,36% 0%,38% 100%,40% 0%,42% 100%,44% 0%,46% 100%,48% 0%,50% 100%,52% 0%,54% 100%,56% 0%,58% 100%,60% 0%,62% 100%,64% 0%,66% 100%,68% 0%,70% 100%,72% 0%,74% 100%,76% 0%,78% 100%,80% 0%,82% 100%,84% 0%,86% 100%,88% 0%,90% 100%,92% 0%,94% 100%,96% 0%,98% 100%,100% 0%)"
            }}/>
          </div>
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRINTER TAB
// ═══════════════════════════════════════════════════════════════════
function PrinterTab({ printers, printerForm, setPrinterForm, editPrinter, setEditPrinter, printJobs, loadingPrinters, printerMsg, fetchPrinters, fetchPrintJobs, savePrinter, deletePrinter, togglePrinterActive, retryJob, darkMode, bgCard, textSub, inputCls, text }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm"><i className="fa-solid fa-print mr-2 text-blue-400"/>Quản lý máy in</h3>
          <button onClick={()=>{fetchPrinters();fetchPrintJobs();}} disabled={loadingPrinters}
            className={`text-xs px-3 py-1.5 rounded-lg border border-slate-600 ${textSub} hover:bg-slate-700 transition`}>
            {loadingPrinters?<><i className="fa-solid fa-spinner fa-spin mr-1"/>Đang tải...</>:<><i className="fa-solid fa-rotate mr-1"/>Làm mới</>}
          </button>
        </div>
        {printerMsg&&<div className={`px-3 py-2 rounded-xl text-sm font-semibold ${printerMsg.type==="ok"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{printerMsg.type==="ok"?"✅ ":"❌ "}{printerMsg.text}</div>}
        <div className={`${darkMode?"bg-slate-700/50 border-slate-600":"bg-white border-gray-200"} border rounded-xl p-4 flex flex-col gap-3`}>
          <div className={`text-sm font-bold ${text}`}>{editPrinter?"✏️ Sửa máy in":"➕ Thêm máy in mới"}</div>
          <div><label className={`block text-xs font-semibold ${textSub} mb-1`}>Tên máy in</label>
            <input value={printerForm.printer_name} onChange={e=>setPrinterForm(f=>({...f,printer_name:e.target.value}))} placeholder="VD: EPSON TM-T88VI" className={inputCls}/></div>
          <div className="flex gap-3">
            <div className="flex-1"><label className={`block text-xs font-semibold ${textSub} mb-1`}>Loại phiếu</label>
              <select value={printerForm.job_type} onChange={e=>setPrinterForm(f=>({...f,job_type:e.target.value}))} className={`${inputCls} w-full`}>
                <option value="KITCHEN">Bếp (KITCHEN)</option><option value="TAMTINH">Tạm tính (TAMTINH)</option><option value="BILL">Thanh toán (BILL)</option><option value="ALL">Tất cả (ALL)</option>
              </select></div>
            <div className="w-24"><label className={`block text-xs font-semibold ${textSub} mb-1`}>Khổ giấy</label>
              <input type="number" value={printerForm.paper_width} onChange={e=>setPrinterForm(f=>({...f,paper_width:e.target.value}))} placeholder="80" className={`${inputCls} text-center`}/></div>
          </div>
          <div className="flex gap-2">
            {editPrinter&&<button onClick={()=>{setEditPrinter(null);setPrinterForm({printer_name:"",job_type:"KITCHEN",paper_width:"80"});}} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border ${darkMode?"border-slate-600 text-slate-300 hover:bg-slate-700":"border-gray-300 text-gray-600 hover:bg-gray-100"} transition`}>Hủy</button>}
            <button onClick={savePrinter} className={`${editPrinter?"flex-1":"w-full"} py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white text-sm transition`}>
              <i className={`fa-solid ${editPrinter?"fa-floppy-disk":"fa-plus"} mr-2`}/>{editPrinter?"Lưu thay đổi":"Thêm máy in"}
            </button>
          </div>
        </div>
        {printers.length===0
          ?<div className={`text-sm ${textSub} text-center py-3`}>Chưa có máy in</div>
          :<div className="flex flex-col gap-2">
            {printers.map(p=>(
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
                  <button onClick={()=>togglePrinterActive(p)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${p.is_active?(darkMode?"bg-green-500/20 text-green-400 hover:bg-slate-600":"bg-green-100 text-green-600"):darkMode?"bg-slate-600 text-slate-400":"bg-gray-200 text-gray-500"}`}><i className={`fa-solid ${p.is_active?"fa-toggle-on":"fa-toggle-off"}`}/></button>
                  <button onClick={()=>{setEditPrinter(p);setPrinterForm({printer_name:p.printer_name,job_type:p.job_type,paper_width:String(p.paper_width||80)});}} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${darkMode?"bg-slate-600 hover:bg-blue-500":"bg-gray-200 hover:bg-blue-500 hover:text-white"}`}><i className="fa-solid fa-pen"/></button>
                  <button onClick={()=>deletePrinter(p.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition ${darkMode?"bg-slate-600 hover:bg-red-500 hover:text-white":"bg-gray-200 hover:bg-red-500 hover:text-white"}`}><i className="fa-solid fa-trash"/></button>
                </div>
              </div>
            ))}
          </div>}
      </div>
      {printJobs.length>0&&(
        <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3`}>
          <h3 className="font-bold text-sm"><i className="fa-solid fa-triangle-exclamation mr-2 text-red-400"/>Job in lỗi ({printJobs.length})</h3>
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
            {printJobs.map(j=>(
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACCOUNT TAB
// ═══════════════════════════════════════════════════════════════════
function AccountTab({ staffList, staffForm, setStaffForm, staffEditing, staffShowForm, setStaffShowForm, staffError, openCreateStaff, openEditStaff, submitStaff, deleteStaff, darkMode, bgCard, textSub, inputCls }) {
  return (
    <div className="flex flex-col gap-4">
      {staffShowForm&&(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">{staffEditing?"Sửa tài khoản":"Tạo tài khoản mới"}</h3>
              <button onClick={()=>setStaffShowForm(false)} className={`${textSub} hover:text-white text-xl`}><i className="fa-solid fa-xmark"/></button>
            </div>
            {!staffEditing&&<div><label className={`block text-sm ${textSub} mb-1`}>Username</label><input value={staffForm.username} onChange={e=>setStaffForm(f=>({...f,username:e.target.value}))} placeholder="vd: nhanvien1" className={inputCls}/></div>}
            <div><label className={`block text-sm ${textSub} mb-1`}>Họ tên</label><input value={staffForm.full_name} onChange={e=>setStaffForm(f=>({...f,full_name:e.target.value}))} placeholder="Tên nhân viên" className={inputCls}/></div>
            <div><label className={`block text-sm ${textSub} mb-1`}>{staffEditing?"Mật khẩu mới (để trống nếu không đổi)":"Mật khẩu"}</label><input type="password" value={staffForm.password} onChange={e=>setStaffForm(f=>({...f,password:e.target.value}))} placeholder="••••••" className={inputCls}/></div>
            <div><label className={`block text-sm ${textSub} mb-1`}>Vai trò</label>
              <select value={staffForm.role} onChange={e=>setStaffForm(f=>({...f,role:e.target.value}))} className={inputCls}>
                <option value="waiter">Nhân viên order</option><option value="cashier">Thu ngân</option><option value="admin">Admin</option>
              </select></div>
            {staffEditing&&<label className={`flex items-center gap-3 cursor-pointer text-sm ${textSub}`}><input type="checkbox" checked={staffForm.active!==false} onChange={e=>setStaffForm(f=>({...f,active:e.target.checked}))} className="w-4 h-4 accent-blue-500"/>Tài khoản đang hoạt động</label>}
            {staffError&&<div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-xl">{staffError}</div>}
            <div className="flex gap-3">
              <button onClick={submitStaff} className="flex-1 bg-blue-500 hover:bg-blue-600 py-2.5 rounded-xl font-bold text-white text-sm transition">{staffEditing?"Lưu thay đổi":"Tạo tài khoản"}</button>
              <button onClick={()=>setStaffShowForm(false)} className={`flex-1 ${bgCard} py-2.5 rounded-xl font-bold text-sm transition hover:bg-slate-600`}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm"><i className="fa-solid fa-users mr-2 text-blue-400"/>Danh sách tài khoản</h3>
          <button onClick={openCreateStaff} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition"><i className="fa-solid fa-plus"/>Thêm</button>
        </div>
        {staffList.length===0
          ?<div className={`text-sm ${textSub} text-center py-6`}>Chưa có tài khoản nào</div>
          :staffList.map(u=>{
            const rc=u.role==="admin"?"text-red-400 bg-red-500/10":u.role==="cashier"?"text-yellow-400 bg-yellow-500/10":"text-green-400 bg-green-500/10";
            const rl=u.role==="admin"?"Admin":u.role==="cashier"?"Thu ngân":"NV Order";
            return(
              <div key={u.id} className={`${darkMode?"bg-slate-700":"bg-gray-100"} rounded-xl p-3 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">{(u.full_name||u.username||"?")[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm">{u.full_name||u.username}</span><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rc}`}>{rl}</span>{!u.active&&<span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-400">Đã khóa</span>}</div>
                  <div className={`text-xs mt-0.5 ${textSub}`}>@{u.username}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={()=>openEditStaff(u)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode?"bg-slate-600 hover:bg-blue-500":"bg-gray-200 hover:bg-blue-500 hover:text-white"} transition`}><i className="fa-solid fa-pen text-xs"/></button>
                  <button onClick={()=>deleteStaff(u)} disabled={u.username==="admin"} className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${u.username==="admin"?"bg-slate-700 text-slate-600 cursor-not-allowed":darkMode?"bg-slate-600 hover:bg-red-500 hover:text-white":"bg-gray-200 hover:bg-red-500 hover:text-white"}`}><i className="fa-solid fa-trash text-xs"/></button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function SettingsView({
  settings, setSettings, settingsSaved, saveAllSettings,
  printers, printerForm, setPrinterForm, editPrinter, setEditPrinter,
  printJobs, loadingPrinters, printerMsg,
  fetchPrinters, fetchPrintJobs, savePrinter, deletePrinter, togglePrinterActive, retryJob,
  staffList, staffForm, setStaffForm, staffEditing, staffShowForm, setStaffShowForm, staffError,
  openCreateStaff, openEditStaff, submitStaff, deleteStaff,
  darkMode, bgCard, textSub, inputCls, text,
}) {
  const [activeTab, setActiveTab] = useState("printer");
  const tabs = [
    { key:"printer", icon:"fa-print",       label:"Máy in"      },
    { key:"account", icon:"fa-users",        label:"Tài khoản"   },
    { key:"report",  icon:"fa-file-invoice", label:"Report Bill" },
  ];
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab===t.key?"bg-blue-500 text-white":`${bgCard} ${textSub} hover:bg-slate-600`}`}>
            <i className={`fa-solid ${t.icon}`}/>{t.label}
          </button>
        ))}
      </div>
      <div className={`flex-1 overflow-y-auto pb-4 ${activeTab==="report"?"":"max-w-lg"}`}>
        {activeTab==="printer"&&<PrinterTab printers={printers} printerForm={printerForm} setPrinterForm={setPrinterForm} editPrinter={editPrinter} setEditPrinter={setEditPrinter} printJobs={printJobs} loadingPrinters={loadingPrinters} printerMsg={printerMsg} fetchPrinters={fetchPrinters} fetchPrintJobs={fetchPrintJobs} savePrinter={savePrinter} deletePrinter={deletePrinter} togglePrinterActive={togglePrinterActive} retryJob={retryJob} darkMode={darkMode} bgCard={bgCard} textSub={textSub} inputCls={inputCls} text={text}/>}
        {activeTab==="account"&&<AccountTab staffList={staffList} staffForm={staffForm} setStaffForm={setStaffForm} staffEditing={staffEditing} staffShowForm={staffShowForm} setStaffShowForm={setStaffShowForm} staffError={staffError} openCreateStaff={openCreateStaff} openEditStaff={openEditStaff} submitStaff={submitStaff} deleteStaff={deleteStaff} darkMode={darkMode} bgCard={bgCard} textSub={textSub} inputCls={inputCls}/>}
        {activeTab==="report"&&<ReportBillTab settings={settings} setSettings={setSettings} saveAllSettings={saveAllSettings} settingsSaved={settingsSaved} darkMode={darkMode} bgCard={bgCard} textSub={textSub} inputCls={inputCls}/>}
      </div>
    </div>
  );
}