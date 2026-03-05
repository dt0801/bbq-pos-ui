// ─── OrderPanel — panel phải: danh sách đã order, tổng tiền, in ──────────────
import React from "react";
import { formatMoney, calcTotal } from "../../constants";

export default function OrderPanel({
  currentTable, tableStatus, tableOrders,
  kitchenSent, itemNotes, setItemNotes, updateQty, setKitchenSent,
  canPay, darkMode, bgCard, textSub,
  setSplitModal, setSplitSelected, setSplitTarget, setShowTransferModal,
  printKitchenTicket, printTamTinh, handlePayment, resetTable,
}) {
  const currentItems = Object.values(tableOrders[currentTable] || {});
  const total        = calcTotal(tableOrders[currentTable]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold">ORDER</h2>
          <div className={`text-xs ${textSub} mt-0.5`}>
            {currentTable ? (
              <span>Bàn {currentTable} · <span className={tableStatus[currentTable]==="OPEN"?"text-orange-400":tableStatus[currentTable]==="PAYING"?"text-purple-400":"text-slate-400"}>{tableStatus[currentTable]==="OPEN"?"Đang order":tableStatus[currentTable]==="PAYING"?"Chờ reset":"Trống"}</span></span>
            ) : "Chưa chọn bàn"}
          </div>
        </div>
        {tableStatus[currentTable] === "OPEN" && (
          <div className="flex gap-2">
            <button onClick={() => { setSplitModal(true); setSplitSelected([]); setSplitTarget(""); }} disabled={currentItems.length===0}
              className="flex items-center gap-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-40">
              <i className="fa-solid fa-code-branch text-xs" /> Tách
            </button>
            <button onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition">
              <i className="fa-solid fa-right-left text-xs" /> Chuyển
            </button>
          </div>
        )}
      </div>

      {/* Danh sách món */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 mb-3">
        {currentItems.length === 0 ? (
          <div className={`${textSub} text-center py-8 text-sm`}>Chưa có món nào</div>
        ) : currentItems.map(item => {
          const sentQty = kitchenSent[currentTable]?.[item.id] || 0;
          const newQty  = item.qty - sentQty;
          const note    = itemNotes[currentTable]?.[item.id] || "";
          return (
            <div key={item.id} className={`${bgCard} rounded-xl p-3`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{item.name}</span>
                  {newQty > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">+{newQty}</span>}
                </div>
                <span className="text-green-400 text-sm font-semibold whitespace-nowrap">{formatMoney(item.price*item.qty)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-1 py-0.5">
                  <button onClick={() => { if(item.qty-1<sentQty) setKitchenSent(p=>({...p,[currentTable]:{...(p[currentTable]||{}),[item.id]:Math.max(0,item.qty-1)}})); updateQty(item.id,"dec"); }}
                    className="w-6 h-6 bg-slate-600 hover:bg-red-500 rounded font-bold text-sm transition">−</button>
                  <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id,"inc")} className="w-6 h-6 bg-slate-600 hover:bg-green-500 rounded font-bold text-sm transition">+</button>
                </div>
                <span className={`text-xs ${textSub}`}>{formatMoney(item.price)}/món</span>
              </div>
              <input type="text" value={note} placeholder="Ghi chú..."
                onChange={e => setItemNotes(p=>({...p,[currentTable]:{...(p[currentTable]||{}),[item.id]:e.target.value}}))}
                className={`mt-2 w-full text-xs px-2 py-1 rounded-lg outline-none ${darkMode?"bg-slate-700 text-slate-300 placeholder-slate-500":"bg-gray-200 text-gray-600 placeholder-gray-400"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={`border-t ${darkMode?"border-slate-600":"border-gray-300"} pt-3 flex flex-col gap-2`}>
        <div className="flex justify-between font-bold mb-1">
          <span>Total:</span><span className="text-green-400">{formatMoney(total)}</span>
        </div>
        <button onClick={() => printKitchenTicket({ currentTable, currentItems, itemNotes, setKitchenSent })} disabled={currentItems.length===0}
          className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm ${currentItems.length>0?"bg-orange-500 hover:bg-orange-600":"bg-slate-600 opacity-50 cursor-not-allowed"}`}>
          <i className="fa-solid fa-fire-burner mr-2" />In phiếu bếp
        </button>
        {canPay && (
          <button onClick={() => printTamTinh({ currentTable, currentItems })} disabled={currentItems.length===0}
            className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm ${currentItems.length>0?"bg-yellow-500 hover:bg-yellow-600":"bg-slate-600 opacity-50 cursor-not-allowed"}`}>
            <i className="fa-solid fa-file-invoice mr-2" />Tạm tính
          </button>
        )}
        {canPay && (
          <button onClick={() => handlePayment({ currentTable, currentItems, total })} disabled={currentItems.length===0||tableStatus[currentTable]==="PAYING"}
            className={`w-full py-2.5 rounded-xl font-bold transition text-white text-sm ${currentItems.length>0&&tableStatus[currentTable]!=="PAYING"?"bg-blue-500 hover:bg-blue-600":"bg-slate-600 opacity-50 cursor-not-allowed"}`}>
            <i className="fa-solid fa-money-bill-wave mr-2" />Thanh toán & In HĐ
          </button>
        )}
        {canPay && (
          <button onClick={resetTable} disabled={tableStatus[currentTable]!=="PAYING"}
            className={`w-full py-2.5 rounded-xl font-bold transition text-sm ${tableStatus[currentTable]==="PAYING"?"bg-red-500 hover:bg-red-600 text-white":"bg-slate-600 opacity-50 cursor-not-allowed text-slate-400"}`}>
            <i className="fa-solid fa-rotate mr-2" />Reset bàn
          </button>
        )}
        {!canPay && <div className={`text-xs text-center py-2 ${textSub}`}><i className="fa-solid fa-lock mr-1" />Nhân viên order không có quyền thanh toán</div>}
      </div>
    </div>
  );
}