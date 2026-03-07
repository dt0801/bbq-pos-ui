import { useState, useCallback } from "react";
import { API_URL } from "../constants";

export function useStats() {
  const [statsToday,       setStatsToday]       = useState(null);
  const [statsMonthlyData, setStatsMonthlyData] = useState(null);
  const [statsYearlyData,  setStatsYearlyData]  = useState(null);
  const [statsTab,         setStatsTab]         = useState("day");
  const [statsMonth,       setStatsMonth]       = useState(new Date().toISOString().slice(0,7));
  const [statsYear,        setStatsYear]        = useState(new Date().getFullYear().toString());
  const [statsPickedDate,  setStatsPickedDate]  = useState(new Date().toISOString().split("T")[0]);

  // ── [MỚI] State nhân viên ─────────────────────────────────────────────────
  const [staffStatsDay,   setStaffStatsDay]   = useState([]);
  const [staffStatsMonth, setStaffStatsMonth] = useState([]);
  const [staffStatsYear,  setStaffStatsYear]  = useState([]);

  const fetchStatsByDate  = useCallback((date) => {
    fetch(`${API_URL}/stats/today?date=${date}`).then(r=>r.json()).then(setStatsToday).catch(()=>{});
    // ── [MỚI] Fetch nhân viên theo ngày ──────────────────────────────────────
    fetch(`${API_URL}/stats/staff/day?date=${date}`)
      .then(r=>r.json()).then(d => Array.isArray(d) && setStaffStatsDay(d)).catch(()=>{});
  }, []);

  const fetchStatsToday   = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setStatsPickedDate(today);
    fetch(`${API_URL}/stats/today?date=${today}`).then(r=>r.json()).then(setStatsToday).catch(()=>{});
    // ── [MỚI] ─────────────────────────────────────────────────────────────────
    fetch(`${API_URL}/stats/staff/day?date=${today}`)
      .then(r=>r.json()).then(d => Array.isArray(d) && setStaffStatsDay(d)).catch(()=>{});
  }, []);

  const fetchStatsDaily   = useCallback((m) => {
    fetch(`${API_URL}/stats/daily?month=${m}`).then(r=>r.json()).catch(()=>{});
  }, []);

  const fetchStatsMonthly = useCallback((m) => {
    fetch(`${API_URL}/stats/monthly?month=${m}`).then(r=>r.json()).then(setStatsMonthlyData).catch(()=>{});
    // ── [MỚI] Fetch nhân viên theo tháng ────────────────────────────────────
    fetch(`${API_URL}/stats/staff/month?month=${m}`)
      .then(r=>r.json()).then(d => Array.isArray(d) && setStaffStatsMonth(d)).catch(()=>{});
  }, []);

  const fetchStatsYearly  = useCallback((y) => {
    fetch(`${API_URL}/stats/yearly?year=${y}`).then(r=>r.json()).then(setStatsYearlyData).catch(()=>{});
    // ── [MỚI] Fetch nhân viên theo năm ──────────────────────────────────────
    fetch(`${API_URL}/stats/staff/year?year=${y}`)
      .then(r=>r.json()).then(d => Array.isArray(d) && setStaffStatsYear(d)).catch(()=>{});
  }, []);

  const fetchAllStats = useCallback(() => {
    fetchStatsToday();
    fetchStatsDaily(statsMonth);
    fetchStatsMonthly(statsMonth);
    fetchStatsYearly(statsYear);
  }, [statsMonth, statsYear, fetchStatsToday, fetchStatsDaily, fetchStatsMonthly, fetchStatsYearly]);

  return {
    statsToday, statsMonthlyData, statsYearlyData,
    statsTab,   setStatsTab,
    statsMonth, setStatsMonth,
    statsYear,  setStatsYear,
    statsPickedDate, setStatsPickedDate,
    fetchStatsToday, fetchStatsByDate, fetchStatsDaily, fetchStatsMonthly, fetchStatsYearly,
    fetchAllStats,
    // ── [MỚI] ─────────────────────────────────────────────────────────────────
    staffStatsDay, staffStatsMonth, staffStatsYear,
  };
}