// ─── useFormatMoney — format tiền theo ngôn ngữ hiện tại ─────────────────────
import { useLanguage } from "./LanguageContext";
import { formatMoneyWithCurrency } from "../constants";

export function useFormatMoney() {
  const { language } = useLanguage();
  return (n) => formatMoneyWithCurrency(n, language);
}