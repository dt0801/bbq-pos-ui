// ─── StatsView — thống kê doanh thu ──────────────────────────────────────────
import React from "react";
import { formatMoney } from "../../constants";

const KPI = ({ icon, label, value, color, bgCard }) => (
  <div className={`${bgCard} rounded-2xl p-4 flex items-center gap-3`}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(255,255,255,0.05)"}}>
      <i className={`fa-solid ${icon} ${color}`} />
    </div>
    <div className="min-w-0">
      <div className={`text-base font-bold ${color} truncate`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  </div>
);

const BarChart = ({ data, labelKey, valueKey }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
          <div className="relative w-full flex flex-col items-center">
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
              <div className="bg-slate-900 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                <div className="font-bold text-emerald-400">{formatMoney(d[valueKey])}</div>
                <div className="text-slate-400">{d.bill_count} HĐ</div>
              </div>
            </div>
            <div className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all" style={{height:`${Math.max((d[valueKey]/max)*100,3)}px`}} />
          </div>
          <div className="text-xs text-slate-500 truncate w-full text-center">{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
};

const TopItems = ({ items, label, bgCard }) => (
  <div className={`${bgCard} rounded-2xl p-4`}>
    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
      <i className="fa-solid fa-ranking-star mr-2 text-orange-400" />{label}
    </div>
    {!items?.length ? <div className="text-sm text-slate-400 text-center py-4">Chưa có dữ liệu</div> : items.map((item,i) => {
      const maxQ = items[0].total_qty;
      return (
        <div key={i} className="mb-3 last:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?"bg-yellow-500 text-black":i===1?"bg-slate-400 text-black":i===2?"bg-orange-600 text-white":"bg-slate-700"}`}>{i+1}</span>
            <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
            <span className="text-emerald-400 text-sm font-bold whitespace-nowrap">{formatMoney(item.total_revenue)}</span>
          </div>
          <div className="flex items-center gap-2 pl-7">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{width:`${(item.total_qty/maxQ)*100}%`}} />
            </div>
            <span className="text-xs text-slate-400 w-12 text-right whitespace-nowrap">{item.total_qty} phần</span>
          </div>
        </div>
      );
    })}
  </div>
);

export default function StatsView({ statsToday, statsMonthlyData, statsYearlyData, statsTab, setStatsTab, statsMonth, setStatsMonth, statsYear, setStatsYear, fetchStatsMonthly, fetchStatsDaily, fetchStatsYearly, bgCard, inputCls }) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto pb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-bold"><i className="fa-solid fa-chart-line mr-2 text-emerald-400" />Thống kê</h2>
        <div className={`flex gap-1 p-1 rounded-xl ${bgCard}`}>
          {[["day","Hôm nay","fa-sun"],["month","Tháng","fa-calendar"],["year","Năm","fa-chart-bar"]].map(([v,l,ic]) => (
            <button key={v} onClick={() => setStatsTab(v)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statsTab===v?"bg-emerald-500 text-white shadow":"text-slate-400 hover:bg-slate-700"}`}>
              <i className={`fa-solid ${ic} mr-1`}/>{l}
            </button>
          ))}
        </div>
      </div>
      {statsTab==="month" && <input type="month" value={statsMonth} onChange={e=>{setStatsMonth(e.target.value);fetchStatsMonthly(e.target.value);fetchStatsDaily(e.target.value);}} className={`${inputCls} w-auto text-sm`} />}
      {statsTab==="year"  && (
        <select value={statsYear} onChange={e=>{setStatsYear(e.target.value);fetchStatsYearly(e.target.value);}} className={`${inputCls} w-auto text-sm`}>
          {Array.from({length:5},(_,i)=>(new Date().getFullYear()-i).toString()).map(y=><option key={y}>{y}</option>)}
        </select>
      )}
      {statsTab==="day" && statsToday && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"    label="Hóa đơn hôm nay" value={statsToday.bill_count}                                                              color="text-blue-400"    />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label="Doanh thu"        value={formatMoney(statsToday.revenue)}                                                    color="text-emerald-400" />
            <KPI bgCard={bgCard} icon="fa-fire"        label="TB/hóa đơn"       value={statsToday.bill_count?formatMoney(Math.round(statsToday.revenue/statsToday.bill_count)):"–"} color="text-orange-400"  />
          </div>
          <TopItems bgCard={bgCard} items={statsToday.top_items} label="Top món hôm nay" />
        </>
      )}
      {statsTab==="month" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"    label="Hóa đơn tháng"  value={statsMonthlyData?.bill_count??"-"}                                                                      color="text-blue-400"    />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label="Doanh thu tháng" value={formatMoney(statsMonthlyData?.revenue??0)}                                                              color="text-emerald-400" />
            <KPI bgCard={bgCard} icon="fa-fire"        label="TB/ngày"          value={statsMonthlyData?.days?.length?formatMoney(Math.round(statsMonthlyData.revenue/statsMonthlyData.days.length)):"–"} color="text-orange-400"  />
          </div>
          <div className={`${bgCard} rounded-2xl p-4`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3"><i className="fa-solid fa-chart-column mr-2 text-emerald-400"/>Doanh thu theo ngày</div>
            {statsMonthlyData?.days?.length ? <BarChart data={statsMonthlyData.days.map(d=>({...d,label:d.date.slice(8)}))} labelKey="label" valueKey="revenue" /> : <div className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</div>}
          </div>
          <TopItems bgCard={bgCard} items={statsMonthlyData?.top_items} label={`Top món — tháng ${statsMonth}`} />
        </>
      )}
      {statsTab==="year" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"    label={`HĐ năm ${statsYear}`} value={statsYearlyData?.bill_count??"-"}                                                                      color="text-blue-400"    />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label={`DT năm ${statsYear}`} value={formatMoney(statsYearlyData?.revenue??0)}                                                              color="text-emerald-400" />
            <KPI bgCard={bgCard} icon="fa-fire"        label="TB/tháng"               value={statsYearlyData?.months?.length?formatMoney(Math.round(statsYearlyData.revenue/statsYearlyData.months.length)):"–"} color="text-orange-400"  />
          </div>
          <div className={`${bgCard} rounded-2xl p-4`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3"><i className="fa-solid fa-chart-column mr-2 text-emerald-400"/>Doanh thu theo tháng</div>
            {statsYearlyData?.months?.length ? <BarChart data={statsYearlyData.months.map(d=>({...d,label:"T"+d.month.slice(5)}))} labelKey="label" valueKey="revenue" /> : <div className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</div>}
          </div>
          <TopItems bgCard={bgCard} items={statsYearlyData?.top_items} label={`Top món — năm ${statsYear}`} />
        </>
      )}
    </div>
  );
}