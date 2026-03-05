// StatsView -- redesigned stats dashboard
import React from "react";
import { formatMoney } from "../../constants";

const KPI = ({ icon, label, value, sub, accent, bgCard }) => (
  <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden`}>
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
      style={{ background: accent, transform: "translate(30%, -30%)" }} />
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: accent + "22" }}>
        <i className={`fa-solid ${icon} text-sm`} style={{ color: accent }} />
      </div>
    </div>
    <div className="text-2xl font-black" style={{ color: accent }}>{value}</div>
    {sub && <div className="text-xs text-slate-500">{sub}</div>}
  </div>
);

const BarChart = ({ data, labelKey, valueKey, accent = "#10b981" }) => {
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-1 h-36 mt-2">
      {data.map((d, i) => {
        const pct = Math.max((Number(d[valueKey]) / max) * 100, 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
            <div className="relative w-full">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                <div className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-2xl">
                  <div className="font-bold" style={{ color: accent }}>{formatMoney(d[valueKey])}</div>
                  <div className="text-slate-400">{d.bill_count} {"\u0068\u00f3\u0061 \u0111\u01a1\u006e"}</div>
                </div>
                <div className="w-2 h-2 rotate-45 bg-slate-900 border-r border-b border-slate-700 -mt-1" />
              </div>
              <div className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${pct * 1.36}px`,
                  background: `linear-gradient(to top, ${accent}99, ${accent})`,
                  boxShadow: `0 0 8px ${accent}44`,
                }} />
            </div>
            <div className="text-xs text-slate-500 truncate w-full text-center">{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
};

const TopItems = ({ items, label, bgCard }) => {
  const totalRevenue = items?.reduce((s, i) => s + Number(i.total_revenue), 0) || 1;
  const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
  const colors  = ["#f59e0b", "#94a3b8", "#ea580c", "#6366f1", "#10b981"];
  return (
    <div className={`${bgCard} rounded-2xl p-5`}>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        <i className="fa-solid fa-ranking-star mr-2 text-orange-400" />{label}
      </div>
      {!items?.length
        ? <div className="text-sm text-slate-500 text-center py-6">Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u</div>
        : items.map((item, i) => {
          const revPct = (Number(item.total_revenue) / totalRevenue * 100).toFixed(1);
          const maxQty = items[0].total_qty;
          const qtyPct = (item.total_qty / maxQty) * 100;
          const color  = colors[i] || "#6366f1";
          return (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-lg w-7 flex-shrink-0">{medals[i] || `${i+1}.`}</span>
                <span className="flex-1 text-sm font-semibold truncate">{item.name}</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold" style={{ color }}>{formatMoney(item.total_revenue)}</span>
                  <span className="text-xs text-slate-500">{item.total_qty} ph\u1ea7n &middot; {revPct}%</span>
                </div>
              </div>
              <div className="ml-10 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${qtyPct}%`, background: `linear-gradient(to right, ${color}88, ${color})` }} />
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default function StatsView({
  statsToday, statsMonthlyData, statsYearlyData,
  statsTab, setStatsTab,
  statsMonth, setStatsMonth,
  statsYear, setStatsYear,
  fetchStatsMonthly, fetchStatsDaily, fetchStatsYearly,
  bgCard, inputCls,
}) {
  const tabs = [
    { id: "day",   label: "H\u00f4m nay", icon: "fa-sun"       },
    { id: "month", label: "Th\u00e1ng",   icon: "fa-calendar"  },
    { id: "year",  label: "N\u0103m",     icon: "fa-chart-bar" },
  ];

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-bold flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-emerald-400" />Th\u1ed1ng k\u00ea
        </h2>
        <div className={`flex gap-1 p-1 rounded-xl ${bgCard}`}>
          {tabs.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setStatsTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statsTab === id
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}>
              <i className={`fa-solid ${icon} mr-1.5`} />{label}
            </button>
          ))}
        </div>
      </div>

      {statsTab === "month" && (
        <input type="month" value={statsMonth}
          onChange={e => { setStatsMonth(e.target.value); fetchStatsMonthly(e.target.value); fetchStatsDaily(e.target.value); }}
          className={`${inputCls} w-auto text-sm`} />
      )}
      {statsTab === "year" && (
        <select value={statsYear}
          onChange={e => { setStatsYear(e.target.value); fetchStatsYearly(e.target.value); }}
          className={`${inputCls} w-auto text-sm`}>
          {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(y => (
            <option key={y}>{y}</option>
          ))}
        </select>
      )}

      {statsTab === "day" && statsToday && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"     label="H\u00f3a \u0111\u01a1n h\u00f4m nay"
              value={statsToday.bill_count} sub="T\u1ed5ng s\u1ed1 h\u00f3a \u0111\u01a1n \u0111\u00e3 thanh to\u00e1n" accent="#60a5fa" />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label="Doanh thu"
              value={formatMoney(statsToday.revenue)} sub="T\u1ed5ng doanh thu trong ng\u00e0y" accent="#34d399" />
            <KPI bgCard={bgCard} icon="fa-fire"        label="Trung b\u00ecnh / H\u0110"
              value={statsToday.bill_count ? formatMoney(Math.round(statsToday.revenue / statsToday.bill_count)) : "\u2013"}
              sub="Gi\u00e1 tr\u1ecb trung b\u00ecnh m\u1ed7i h\u00f3a \u0111\u01a1n" accent="#fb923c" />
          </div>
          <TopItems bgCard={bgCard} items={statsToday.top_items} label="Top m\u00f3n h\u00f4m nay" />
        </>
      )}

      {statsTab === "month" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"     label="H\u00f3a \u0111\u01a1n th\u00e1ng"
              value={statsMonthlyData?.bill_count ?? "\u2013"} sub={`Th\u00e1ng ${statsMonth}`} accent="#60a5fa" />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label="Doanh thu th\u00e1ng"
              value={formatMoney(statsMonthlyData?.revenue ?? 0)} sub={`Th\u00e1ng ${statsMonth}`} accent="#34d399" />
            <KPI bgCard={bgCard} icon="fa-fire"        label="Trung b\u00ecnh / ng\u00e0y"
              value={statsMonthlyData?.days?.length ? formatMoney(Math.round(statsMonthlyData.revenue / statsMonthlyData.days.length)) : "\u2013"}
              sub="Doanh thu trung b\u00ecnh m\u1ed7i ng\u00e0y" accent="#fb923c" />
          </div>
          <div className={`${bgCard} rounded-2xl p-5`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              <i className="fa-solid fa-chart-column mr-2 text-emerald-400" />Doanh thu theo ng\u00e0y
            </div>
            {statsMonthlyData?.days?.length
              ? <BarChart data={statsMonthlyData.days.map(d => ({ ...d, label: d.date.slice(8) }))} labelKey="label" valueKey="revenue" accent="#34d399" />
              : <div className="text-sm text-slate-500 text-center py-10">Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u</div>}
          </div>
          <TopItems bgCard={bgCard} items={statsMonthlyData?.top_items} label={`Top m\u00f3n \u2014 th\u00e1ng ${statsMonth}`} />
        </>
      )}

      {statsTab === "year" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"     label={`H\u00f3a \u0111\u01a1n ${statsYear}`}
              value={statsYearlyData?.bill_count ?? "\u2013"} sub={`N\u0103m ${statsYear}`} accent="#60a5fa" />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label={`Doanh thu ${statsYear}`}
              value={formatMoney(statsYearlyData?.revenue ?? 0)} sub={`N\u0103m ${statsYear}`} accent="#34d399" />
            <KPI bgCard={bgCard} icon="fa-fire"        label="Trung b\u00ecnh / th\u00e1ng"
              value={statsYearlyData?.months?.length ? formatMoney(Math.round(statsYearlyData.revenue / statsYearlyData.months.length)) : "\u2013"}
              sub="Doanh thu trung b\u00ecnh m\u1ed7i th\u00e1ng" accent="#fb923c" />
          </div>
          <div className={`${bgCard} rounded-2xl p-5`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              <i className="fa-solid fa-chart-column mr-2 text-emerald-400" />Doanh thu theo th\u00e1ng
            </div>
            {statsYearlyData?.months?.length
              ? <BarChart data={statsYearlyData.months.map(d => ({ ...d, label: "T" + d.month.slice(5) }))} labelKey="label" valueKey="revenue" accent="#34d399" />
              : <div className="text-sm text-slate-500 text-center py-10">Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u</div>}
          </div>
          <TopItems bgCard={bgCard} items={statsYearlyData?.top_items} label={`Top m\u00f3n \u2014 n\u0103m ${statsYear}`} />
        </>
      )}
    </div>
  );
}