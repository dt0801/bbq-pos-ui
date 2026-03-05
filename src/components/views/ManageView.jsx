// ─── ManageView — thêm/sửa món, quản lý bàn, nhân viên ──────────────────────
import React from "react";
import { API_URL, formatMoney } from "../../constants";

export default function ManageView({
  role, manageTab, setManageTab,
  menu, newItem, setNewItem, file, setFile, editItem, setEditItem, editFile, setEditFile, addMenu, updateMenu, deleteMenu,
  tableList, newTableNum, setNewTableNum, editingTable, setEditingTable, tableMsg, addTable, renameTable, deleteTable,
  staffList, staffForm, setStaffForm, staffEditing, staffShowForm, setStaffShowForm, staffError, openCreateStaff, openEditStaff, submitStaff, deleteStaff,
  darkMode, bgCard, textSub, inputCls,
}) {
  const tabs = [
    ["add",   <><i className="fa-solid fa-plus mr-1"/>Thêm món</>],
    ["edit",  <><i className="fa-solid fa-pen-to-square mr-1"/>Sửa món</>],
    ["table", <><i className="fa-solid fa-chair mr-1"/>Bàn</>],
    ...(role==="admin" ? [["staff", <><i className="fa-solid fa-users mr-1"/>Nhân viên</>]] : []),
  ];
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        {tabs.map(([tab,label]) => (
          <button key={tab} onClick={() => { setManageTab(tab); setEditItem(null); setEditingTable(null); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${manageTab===tab?"bg-blue-500 text-white":`${bgCard} ${textSub} hover:bg-slate-600`}`}>{label}</button>
        ))}
      </div>

      {/* ── Thêm món ── */}
      {manageTab==="add" && (
        <div className="flex flex-col gap-4 overflow-y-auto pb-4 max-w-md">
          <div><label className={`block text-sm ${textSub} mb-1`}>Tên món</label>
            <input type="text" value={newItem.name} placeholder="VD: Gà nướng muối ớt" onChange={e=>setNewItem({...newItem,name:e.target.value})} className={inputCls} /></div>
          <div><label className={`block text-sm ${textSub} mb-1`}>Giá (nghìn đồng)</label>
            <input type="number" value={newItem.price} placeholder="VD: 85" onChange={e=>setNewItem({...newItem,price:e.target.value})} className={inputCls} /></div>
          <div><label className={`block text-sm ${textSub} mb-1`}>Loại</label>
            <select value={newItem.type} onChange={e=>setNewItem({...newItem,type:e.target.value})} className={inputCls}>
              <option value="FOOD">FOOD</option><option value="DRINK">DRINK</option><option value="COMBO">COMBO</option>
            </select></div>
          <div><label className={`block text-sm ${textSub} mb-1`}>Ảnh</label>
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer`} />
            {file && <img src={URL.createObjectURL(file)} className="mt-3 h-28 w-full object-cover rounded-xl" alt="preview" />}
          </div>
          <button onClick={addMenu} className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold transition text-white"><i className="fa-solid fa-check mr-2"/>Thêm vào menu</button>
        </div>
      )}

      {/* ── Sửa món ── */}
      {manageTab==="edit" && (
        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
          <div className="lg:w-72 overflow-y-auto flex flex-col gap-2 max-h-60 lg:max-h-none">
            {menu.map(m => (
              <div key={m.id} onClick={() => { setEditItem({...m}); setEditFile(null); }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${editItem?.id===m.id?"bg-blue-600 text-white":`${bgCard} hover:bg-slate-700`}`}>
                {m.image && <img src={`${API_URL}/uploads/${m.image}`} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" alt={m.name} />}
                <div className="flex-1 min-w-0"><div className="font-semibold truncate text-sm">{m.name}</div><div className="text-xs text-red-400">{formatMoney(m.price)}</div></div>
                <button onClick={e=>{e.stopPropagation();deleteMenu(m.id);}} className={`${textSub} hover:text-red-400 transition text-lg px-1`}><i className="fa-solid fa-trash"/></button>
              </div>
            ))}
          </div>
          {editItem ? (
            <div className="flex flex-col gap-3 overflow-y-auto pb-4 flex-1 max-w-md">
              <h3 className="font-bold">Sửa: {editItem.name}</h3>
              <input value={editItem.name} onChange={e=>setEditItem({...editItem,name:e.target.value})} className={inputCls} placeholder="Tên món" />
              <input type="number" value={editItem.price} onChange={e=>setEditItem({...editItem,price:e.target.value})} className={inputCls} placeholder="Giá" />
              <select value={editItem.type} onChange={e=>setEditItem({...editItem,type:e.target.value})} className={inputCls}>
                <option value="FOOD">FOOD</option><option value="DRINK">DRINK</option><option value="COMBO">COMBO</option>
              </select>
              <input type="file" accept="image/*" onChange={e=>setEditFile(e.target.files[0])} className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer`} />
              <img src={editFile?URL.createObjectURL(editFile):`${API_URL}/uploads/${editItem.image}`} className="h-28 w-full object-cover rounded-xl" alt="preview" onError={e=>e.target.style.display="none"} />
              <div className="flex gap-2">
                <button onClick={updateMenu} className="flex-1 bg-blue-500 hover:bg-blue-600 py-2.5 rounded-xl font-bold transition text-white text-sm"><i className="fa-solid fa-floppy-disk mr-1"/>Lưu</button>
                <button onClick={()=>{setEditItem(null);setEditFile(null);}} className={`flex-1 ${bgCard} hover:bg-slate-600 py-2.5 rounded-xl font-bold transition text-sm`}>Huỷ</button>
              </div>
            </div>
          ) : <div className={`hidden lg:flex items-center justify-center flex-1 ${textSub} text-sm`}>← Chọn món để sửa</div>}
        </div>
      )}

      {/* ── Quản lý bàn ── */}
      {manageTab==="table" && (
        <div className="flex flex-col gap-4 overflow-y-auto pb-4">
          {tableMsg && <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${tableMsg.type==="ok"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{tableMsg.type==="ok"?"✅ ":"❌ "}{tableMsg.text}</div>}
          <div className={`${bgCard} rounded-2xl p-4 max-w-md`}>
            <h3 className="font-bold mb-3 text-sm"><i className="fa-solid fa-plus mr-2 text-green-400"/>Thêm bàn mới</h3>
            <div className="flex gap-2">
              <input type="number" min="1" placeholder="Số bàn" value={newTableNum} onChange={e=>setNewTableNum(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTable()} className={inputCls} />
              <button onClick={addTable} className="px-4 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-white transition whitespace-nowrap text-sm">Thêm</button>
            </div>
          </div>
          <div className={`${bgCard} rounded-2xl p-4 max-w-md`}>
            <h3 className="font-bold mb-3 text-sm"><i className="fa-solid fa-list mr-2 text-blue-400"/>Danh sách bàn ({tableList.length})</h3>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {tableList.map(t => (
                <div key={t.table_num} className={`${darkMode?"bg-slate-700":"bg-gray-100"} rounded-xl p-3`}>
                  {editingTable?.table_num===t.table_num ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-slate-400">Đổi bàn {t.table_num} →</div>
                      <input type="number" min="1" value={editingTable.new_num} autoFocus
                        onChange={e=>setEditingTable({...editingTable,new_num:e.target.value})}
                        onKeyDown={e=>{if(e.key==="Enter")renameTable();if(e.key==="Escape")setEditingTable(null);}}
                        className={`w-full text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${darkMode?"bg-slate-600 text-white":"bg-white border border-gray-300"}`} />
                      <div className="flex gap-1">
                        <button onClick={renameTable}          className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-bold transition">✓</button>
                        <button onClick={()=>setEditingTable(null)} className={`flex-1 py-1 ${darkMode?"bg-slate-600":"bg-gray-200"} rounded-lg text-xs font-bold transition`}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">Bàn {t.table_num}</div>
                        <div className={`text-xs mt-0.5 ${t.status==="OPEN"?"text-orange-400":"text-slate-400"}`}>{t.status==="OPEN"?"Có khách":"Trống"}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={()=>setEditingTable({table_num:t.table_num,new_num:String(t.table_num)})}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${darkMode?"bg-slate-600 hover:bg-blue-500":"bg-gray-200 hover:bg-blue-500 hover:text-white"} transition`}><i className="fa-solid fa-pen"/></button>
                        <button onClick={()=>deleteTable(t.table_num)} disabled={t.status==="OPEN"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${t.status==="OPEN"?"bg-slate-700 text-slate-600 cursor-not-allowed":darkMode?"bg-slate-600 hover:bg-red-500 text-slate-300 hover:text-white":"bg-gray-200 hover:bg-red-500 hover:text-white"}`}><i className="fa-solid fa-trash"/></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Nhân viên (admin) ── */}
      {manageTab==="staff" && role==="admin" && (
        <div className="flex flex-col gap-4 overflow-y-auto pb-4 max-w-lg">
          {staffShowForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">{staffEditing?"Sửa tài khoản":"Tạo tài khoản mới"}</h3>
                  <button onClick={()=>setStaffShowForm(false)} className={`${textSub} hover:text-white text-xl`}><i className="fa-solid fa-xmark"/></button>
                </div>
                {!staffEditing && <div><label className={`block text-sm ${textSub} mb-1`}>Username</label><input value={staffForm.username} onChange={e=>setStaffForm(f=>({...f,username:e.target.value}))} placeholder="vd: nhanvien1" className={inputCls} /></div>}
                <div><label className={`block text-sm ${textSub} mb-1`}>Họ tên</label><input value={staffForm.full_name} onChange={e=>setStaffForm(f=>({...f,full_name:e.target.value}))} placeholder="Tên nhân viên" className={inputCls} /></div>
                <div><label className={`block text-sm ${textSub} mb-1`}>{staffEditing?"Mật khẩu mới (để trống nếu không đổi)":"Mật khẩu"}</label><input type="password" value={staffForm.password} onChange={e=>setStaffForm(f=>({...f,password:e.target.value}))} placeholder="••••••" className={inputCls} /></div>
                <div><label className={`block text-sm ${textSub} mb-1`}>Vai trò</label>
                  <select value={staffForm.role} onChange={e=>setStaffForm(f=>({...f,role:e.target.value}))} className={inputCls}>
                    <option value="waiter">Nhân viên order</option><option value="cashier">Thu ngân</option><option value="admin">Admin</option>
                  </select></div>
                {staffEditing && <label className={`flex items-center gap-3 cursor-pointer text-sm ${textSub}`}><input type="checkbox" checked={staffForm.active!==false} onChange={e=>setStaffForm(f=>({...f,active:e.target.checked}))} className="w-4 h-4 accent-blue-500"/>Tài khoản đang hoạt động</label>}
                {staffError && <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-xl">{staffError}</div>}
                <div className="flex gap-3">
                  <button onClick={submitStaff} className="flex-1 bg-blue-500 hover:bg-blue-600 py-2.5 rounded-xl font-bold text-white text-sm transition">{staffEditing?"Lưu thay đổi":"Tạo tài khoản"}</button>
                  <button onClick={()=>setStaffShowForm(false)} className={`flex-1 ${bgCard} py-2.5 rounded-xl font-bold text-sm transition hover:bg-slate-600`}>Hủy</button>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base"><i className="fa-solid fa-users mr-2 text-blue-400"/>Danh sách nhân viên</h3>
            <button onClick={openCreateStaff} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition"><i className="fa-solid fa-plus mr-1"/>Thêm</button>
          </div>
          {staffList.length===0 ? <div className={`${bgCard} rounded-2xl p-8 text-center ${textSub} text-sm`}>Chưa có nhân viên nào</div> : staffList.map(u => {
            const rc = u.role==="admin"?"text-red-400 bg-red-500/10":u.role==="cashier"?"text-yellow-400 bg-yellow-500/10":"text-green-400 bg-green-500/10";
            const rl = u.role==="admin"?"Admin":u.role==="cashier"?"Thu ngân":"NV Order";
            return (
              <div key={u.id} className={`${bgCard} rounded-2xl p-4 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 font-bold text-white text-base">{(u.full_name||u.username||"?")[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{u.full_name||u.username}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rc}`}>{rl}</span>
                    {!u.active && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-400">Đã khóa</span>}
                  </div>
                  <div className={`text-xs mt-0.5 ${textSub}`}>@{u.username}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={()=>openEditStaff(u)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode?"bg-slate-600 hover:bg-blue-500":"bg-gray-200 hover:bg-blue-500 hover:text-white"} transition`}><i className="fa-solid fa-pen text-xs"/></button>
                  <button onClick={()=>deleteStaff(u)} disabled={u.username==="admin"} className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${u.username==="admin"?"bg-slate-700 text-slate-600 cursor-not-allowed":darkMode?"bg-slate-600 hover:bg-red-500 hover:text-white":"bg-gray-200 hover:bg-red-500 hover:text-white"}`}><i className="fa-solid fa-trash text-xs"/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}