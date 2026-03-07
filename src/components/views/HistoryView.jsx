// ─── HistoryView — lịch sử hóa đơn theo ngày ────────────────────────────────
import React from "react";
import { useT, useFormatMoney } from "../../i18n";

export default function HistoryView({ bills, selectedBill, setSelectedBill, historyDate, setHistoryDate, fetchBills, fetchBillDetail, reprintBill, settings, bgCard, textSub, inputCls }) {
  const t = useT();
  const formatMoney = useFormatMoney();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 flex-wrap flex-shrink-0">
        <h2 className="text-base font-bold"><i className="fa-solid fa-clock-rotate-left mr-2" />{t('history.title')}</h2>
        <input type="date" value={historyDate}
          onChange={e => { setHistoryDate(e.target.value); setSelectedBill(null); fetchBills(e.target.value); }}
          className={`${inputCls} w-auto`} />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        {/* Danh sách hóa đơn */}
        <div className="lg:w-80 overflow-y-auto flex flex-col gap-2 max-h-56 lg:max-h-none">
          {bills.length === 0 ? (
            <div className={`${textSub} text-center mt-6 text-sm`}>{t('history.noBills')}</div>
          ) : bills.map(b => (
            <div key={b.id} onClick={() => fetchBillDetail(b.id)}
              className={`p-3 rounded-xl cursor-pointer transition ${selectedBill?.id===b.id?"bg-blue-600 text-white":`${bgCard} hover:bg-slate-700`}`}>
              <div className="flex justify-between font-semibold text-sm">
                <span>{t('table.table')} {b.table_num}</span><span className="text-green-400">{formatMoney(b.total)}</span>
              </div>
              <div className={`text-xs mt-1 ${selectedBill?.id===b.id?"text-blue-200":textSub}`}>{new Date(b.created_at).toLocaleTimeString("vi-VN")} · {t('bill.billNumber')}{b.id}</div>
              <div className={`text-xs mt-1 truncate ${selectedBill?.id===b.id?"text-blue-200":textSub}`}>{b.items_summary}</div>
            </div>
          ))}
        </div>
        {/* Chi tiết */}
        <div className="flex-1 overflow-y-auto">
          {selectedBill ? (
            <div className="flex flex-col gap-3 max-w-sm">
              <button onClick={() => reprintBill(selectedBill)} className="w-full bg-orange-500 hover:bg-orange-600 py-2.5 rounded-xl font-bold transition text-white text-sm">
                <i className="fa-solid fa-print mr-2" />{t('history.reprintBill')}
              </button>
              <div className={`${bgCard} rounded-xl p-4`}>
                <div className="text-center font-bold mb-3">
                  <div className="text-base">{settings.store_name||"TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}</div>
                  <div className={`text-xs ${textSub}`}>{settings.store_address}</div>
                </div>
                <div className={`text-xs ${textSub} mb-1`}>{t('bill.billNumber')}{selectedBill.id} · {t('table.table')} {selectedBill.table_num}</div>
                <div className={`text-xs ${textSub} mb-3`}>{new Date(selectedBill.created_at).toLocaleString("vi-VN")}</div>
                <hr className="border-slate-600 mb-2" />
                {(selectedBill.items||[]).map((item,i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <span>{item.name} x{item.qty}</span><span>{formatMoney(item.price*item.qty)}</span>
                  </div>
                ))}
                <hr className="border-slate-600 my-2" />
                <div className="flex justify-between font-bold">
                  <span>{t('history.grandTotal')}</span><span className="text-green-400">{formatMoney(selectedBill.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-center h-24 ${textSub} text-sm`}>{t('history.selectBill')}</div>
          )}
        </div>
      </div>
    </div>
  );
}