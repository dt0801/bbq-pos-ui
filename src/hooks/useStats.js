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

  const fetchStatsByDate  = useCallback((date) => {
    fetch(`${API_URL}/stats/today?date=${date}`).then(r=>r.json()).then(setStatsToday).catch(()=>{});
  }, []);
  const fetchStatsToday   = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setStatsPickedDate(today);
    fetch(`${API_URL}/stats/today?date=${today}`).then(r=>r.json()).then(setStatsToday).catch(()=>{});
  }, []);
  const fetchStatsDaily   = useCallback((m) => { fetch(`${API_URL}/stats/daily?month=${m}`).then(r=>r.json()).catch(()=>{}); }, []);
  const fetchStatsMonthly = useCallback((m) => { fetch(`${API_URL}/stats/monthly?month=${m}`).then(r=>r.json()).then(setStatsMonthlyData).catch(()=>{}); }, []);
  const fetchStatsYearly  = useCallback((y) => { fetch(`${API_URL}/stats/yearly?year=${y}`).then(r=>r.json()).then(setStatsYearlyData).catch(()=>{}); }, []);

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
  };
}