// ─── useFormatMoney — format tiền theo ngôn ngữ hiện tại ─────────────────────
import { useLanguage } from "./LanguageContext";
import { formatMoneyWithCurrency } from "../constants";

export function useFormatMoney() {
  const { lang } = useLanguage();
  return (n) => formatMoneyWithCurrency(n, lang);
}