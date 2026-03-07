// ─── useFormatMoney — format tiền theo ngôn ngữ hiện tại ─────────────────────
import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";
import { formatMoneyWithCurrency } from "../constants";

export function useFormatMoney() {
  const { language } = useContext(LanguageContext);
  return (n) => formatMoneyWithCurrency(n, language);
}