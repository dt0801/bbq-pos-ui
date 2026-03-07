import React from "react";
import { formatMoney } from "../../constants";
import { useT } from "../../i18n";

const KPI = ({ icon, label, value, sub, accent, bgCard }) => (
  <div className={`${bgCard} rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden`}>
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
      style={{ background: accent, transform: "translate(30%, -30%)" }} />
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: accent + "22" }}>
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
                  <div className="text-slate-400">{d.bill_count} hóa đơn</div>
                </div>
                <div className="w-2 h-2 rotate-45 bg-slate-900 border-r border-b border-slate-700 -mt-1" />
              </div>
              <div className="w-full rounded-t-md transition-all duration-300"
                style={{ height: `${pct * 1.36}px`, background: `linear-gradient(to top, ${accent}99, ${accent})`, boxShadow: `0 0 8px ${accent}44` }} />
            </div>
            <div className="text-xs text-slate-500 truncate w-full text-center">{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
};

const TopItems = ({ items, label, bgCard }) => {
  const t = useT();
  const totalRevenue = items?.reduce((s, i) => s + Number(i.total_revenue), 0) || 1;
  const medals = ["🥇", "🥈", "🥉"];
  const colors  = ["#f59e0b", "#94a3b8", "#ea580c", "#6366f1", "#10b981"];
  return (
    <div className={`${bgCard} rounded-2xl p-5`}>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        <i className="fa-solid fa-ranking-star mr-2 text-orange-400" />{label}
      </div>
      {!items?.length
        ? <div className="text-sm text-slate-500 text-center py-6">{t('stats.noData')}</div>
        : items.map((item, i) => {
          const revPct = (Number(item.total_revenue) / totalRevenue * 100).toFixed(1);
          const qtyPct = (item.total_qty / items[0].total_qty) * 100;
          const color  = colors[i] || "#6366f1";
          return (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-lg w-7 flex-shrink-0">{medals[i] || `${i+1}.`}</span>
                <span className="flex-1 text-sm font-semibold truncate">{item.name}</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold" style={{ color }}>{formatMoney(item.total_revenue)}</span>
                  <span className="text-xs text-slate-500">{item.total_qty} {t('stats.portions')} · {revPct}%</span>
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

// ── [MỚI] Bảng thống kê hiệu suất nhân viên ─────────────────────────────────
const StaffTable = ({ data, label, bgCard }) => {
  const t = useT();
  const staffColors = ["#f59e0b", "#60a5fa", "#34d399", "#fb923c", "#a78bfa", "#f472b6"];
  const maxBills = Math.max(...(data?.map(s => s.bill_count) || [1]), 1);

  return (
    <div className={`${bgCard} rounded-2xl p-5`}>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        <i className="fa-solid fa-users mr-2 text-blue-400" />{label}
      </div>
      {!data?.length
        ? <div className="text-sm text-slate-500 text-center py-6">{t('stats.noData')}</div>
        : (
          <div className="flex flex-col gap-4">
            {data.map((staff, i) => {
              const color  = staffColors[i % staffColors.length];
              const barPct = (staff.bill_count / maxBills) * 100;
              const avg    = staff.bill_count ? Math.round(staff.revenue / staff.bill_count) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-1">
                    {/* Avatar chữ cái đầu */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: color + "22", color }}>
                      {staff.cashier_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold truncate">{staff.cashier_name}</span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-slate-400">
                            <i className="fa-solid fa-receipt mr-1" />
                            {staff.bill_count} {t('stats.bills')}
                          </span>
                          <span className="text-sm font-bold" style={{ color }}>
                            {formatMoney(staff.revenue)}
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%`, background: `linear-gradient(to right, ${color}55, ${color})` }} />
                      </div>
                    </div>
                  </div>
                  {/* Avg per bill */}
                  <div className="ml-12 text-xs text-slate-500">
                    {t('stats.avgPerBill')}: <span style={{ color }}>{formatMoney(avg)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

const isToday = (d) => d === new Date().toISOString().split("T")[0];

export default function StatsView({
  statsToday, statsMonthlyData, statsYearlyData,
  statsTab, setStatsTab,
  statsMonth, setStatsMonth,
  statsYear, setStatsYear,
  statsPickedDate, setStatsPickedDate,
  fetchStatsByDate, fetchStatsMonthly, fetchStatsDaily, fetchStatsYearly,
  // ── [MỚI] props nhân viên ─────────────────────────────────────────────────
  staffStatsDay, staffStatsMonth, staffStatsYear,
  bgCard, inputCls,
}) {
  const t = useT();

  const tabs = [
    { id: "day",   label: t('stats.day'),   icon: "fa-calendar-day" },
    { id: "month", label: t('stats.month'), icon: "fa-calendar"     },
    { id: "year",  label: t('stats.year'),  icon: "fa-chart-bar"    },
  ];

  const dayLabel = statsPickedDate
    ? isToday(statsPickedDate) ? t('stats.today') : new Date(statsPickedDate).toLocaleDateString("vi-VN")
    : t('stats.day');

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-bold flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-emerald-400" />{t('stats.title')}
        </h2>
        <div className={`flex gap-1 p-1 rounded-xl ${bgCard}`}>
          {tabs.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setStatsTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statsTab === id ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}>
              <i className={`fa-solid ${icon} mr-1.5`} />{id === "day" ? dayLabel : label}
            </button>
          ))}
        </div>
      </div>

      {/* Pickers */}
      {statsTab === "day" && (
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={statsPickedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => { setStatsPickedDate(e.target.value); fetchStatsByDate(e.target.value); }}
            className={`${inputCls} w-auto text-sm`} />
          <button onClick={() => { const d = new Date().toISOString().split("T")[0]; setStatsPickedDate(d); fetchStatsByDate(d); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">
            <i className="fa-solid fa-rotate-right mr-1" />{t('stats.today')}
          </button>
          <button onClick={() => { const y = new Date(); y.setDate(y.getDate()-1); const d = y.toISOString().split("T")[0]; setStatsPickedDate(d); fetchStatsByDate(d); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition">
            <i className="fa-solid fa-arrow-left mr-1" />{t('stats.yesterday')}
          </button>
        </div>
      )}
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

      {/* NGÀY */}
      {statsTab === "day" && statsToday && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"     label={t('stats.bills')}
              value={statsToday.bill_count}
              sub={`Ngày ${new Date(statsPickedDate).toLocaleDateString("vi-VN")}`} accent="#60a5fa" />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label={t('stats.revenue')}
              value={formatMoney(statsToday.revenue)} sub={t('stats.totalRevenue')} accent="#34d399" />
            <KPI bgCard={bgCard} icon="fa-fire"        label={t('stats.avgPerBill')}
              value={statsToday.bill_count ? formatMoney(Math.round(statsToday.revenue / statsToday.bill_count)) : "–"}
              sub={t('stats.avgPerBillSub')} accent="#fb923c" />
          </div>
          <TopItems bgCard={bgCard} items={statsToday.top_items}
            label={`${t('stats.topItems')} — ${new Date(statsPickedDate).toLocaleDateString("vi-VN")}`} />
          {/* ── [MỚI] ──────────────────────────────────────────────────────── */}
          <StaffTable bgCard={bgCard} data={staffStatsDay}
            label={`${t('stats.staffPerformance')} — ${new Date(statsPickedDate).toLocaleDateString("vi-VN")}`} />
        </>
      )}

      {/* THÁNG */}
      {statsTab === "month" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"     label={t('stats.monthlyBills')}
              value={statsMonthlyData?.bill_count ?? "–"} sub={`Tháng ${statsMonth}`} accent="#60a5fa" />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label={t('stats.monthlyRevenue')}
              value={formatMoney(statsMonthlyData?.revenue ?? 0)} sub={`Tháng ${statsMonth}`} accent="#34d399" />
            <KPI bgCard={bgCard} icon="fa-fire"        label={t('stats.avgPerDay')}
              value={statsMonthlyData?.days?.length ? formatMoney(Math.round(statsMonthlyData.revenue / statsMonthlyData.days.length)) : "–"}
              sub={t('stats.avgPerDaySub')} accent="#fb923c" />
          </div>
          <div className={`${bgCard} rounded-2xl p-5`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              <i className="fa-solid fa-chart-column mr-2 text-emerald-400" />{t('stats.revenueByDay')}
            </div>
            {statsMonthlyData?.days?.length
              ? <BarChart data={statsMonthlyData.days.map(d => ({ ...d, label: d.date.slice(8) }))} labelKey="label" valueKey="revenue" accent="#34d399" />
              : <div className="text-sm text-slate-500 text-center py-10">{t('stats.noData')}</div>}
          </div>
          <TopItems bgCard={bgCard} items={statsMonthlyData?.top_items}
            label={`${t('stats.topItems')} — tháng ${statsMonth}`} />
          {/* ── [MỚI] ──────────────────────────────────────────────────────── */}
          <StaffTable bgCard={bgCard} data={staffStatsMonth}
            label={`${t('stats.staffPerformance')} — tháng ${statsMonth}`} />
        </>
      )}

      {/* NĂM */}
      {statsTab === "year" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KPI bgCard={bgCard} icon="fa-receipt"     label={`${t('stats.bills')} ${statsYear}`}
              value={statsYearlyData?.bill_count ?? "–"} sub={`Năm ${statsYear}`} accent="#60a5fa" />
            <KPI bgCard={bgCard} icon="fa-sack-dollar" label={`${t('stats.revenue')} ${statsYear}`}
              value={formatMoney(statsYearlyData?.revenue ?? 0)} sub={`Năm ${statsYear}`} accent="#34d399" />
            <KPI bgCard={bgCard} icon="fa-fire"        label={t('stats.avgPerMonth')}
              value={statsYearlyData?.months?.length ? formatMoney(Math.round(statsYearlyData.revenue / statsYearlyData.months.length)) : "–"}
              sub={t('stats.avgPerMonthSub')} accent="#fb923c" />
          </div>
          <div className={`${bgCard} rounded-2xl p-5`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              <i className="fa-solid fa-chart-column mr-2 text-emerald-400" />{t('stats.revenueByMonth')}
            </div>
            {statsYearlyData?.months?.length
              ? <BarChart data={statsYearlyData.months.map(d => ({ ...d, label: "T" + d.month.slice(5) }))} labelKey="label" valueKey="revenue" accent="#34d399" />
              : <div className="text-sm text-slate-500 text-center py-10">{t('stats.noData')}</div>}
          </div>
          <TopItems bgCard={bgCard} items={statsYearlyData?.top_items}
            label={`${t('stats.topItems')} — năm ${statsYear}`} />
          {/* ── [MỚI] ──────────────────────────────────────────────────────── */}
          <StaffTable bgCard={bgCard} data={staffStatsYear}
            label={`${t('stats.staffPerformance')} — năm ${statsYear}`} />
        </>
      )}
    </div>
  );
}