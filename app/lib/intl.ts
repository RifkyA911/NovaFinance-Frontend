// NovaJournal Internationalization & Regional Formatting Utility
// Integrates localStorage preferences with ECMAScript Intl standards across the platform

export interface IntlPreferences {
  currency: string;
  numberFormat: "id" | "en";
  dateFormat: string;
  timezone: string;
}

export function getStoredIntlPreferences(): IntlPreferences {
  if (typeof window === "undefined") {
    return {
      currency: "IDR",
      numberFormat: "id",
      dateFormat: "DD/MM/YYYY",
      timezone: "Asia/Jakarta (WIB)",
    };
  }

  return {
    currency: localStorage.getItem("novajournal_currency") || "IDR",
    numberFormat: (localStorage.getItem("novajournal_number_format") as "id" | "en") || "id",
    dateFormat: localStorage.getItem("novajournal_date_format") || "DD/MM/YYYY",
    timezone: localStorage.getItem("novajournal_timezone") || "Asia/Jakarta (WIB)",
  };
}

export function formatSystemCurrency(
  val: number | string,
  overrideCurrency?: string
): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";

  const prefs = getStoredIntlPreferences();
  const currency = overrideCurrency || prefs.currency;
  const locale = prefs.numberFormat === "id" ? "id-ID" : "en-US";
  const isNoDecimal = currency === "IDR" || currency === "JPY";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: isNoDecimal ? 0 : 2,
    maximumFractionDigits: isNoDecimal ? 0 : 2,
  }).format(num);
}

export function formatCompactNumber(
  val: number | string,
  overrideCurrency?: string
): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0";

  const prefs = getStoredIntlPreferences();
  const locale = prefs.numberFormat === "id" ? "id-ID" : "en-US";

  const formatted = new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);

  if (overrideCurrency || prefs.currency) {
    const symbol = (overrideCurrency || prefs.currency) === "IDR" ? "Rp " : "$ ";
    return `${symbol}${formatted}`;
  }
  return formatted;
}

export function formatSystemDate(
  dateInput: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const prefs = getStoredIntlPreferences();
  const locale = prefs.numberFormat === "id" ? "id-ID" : "en-US";

  return new Intl.DateTimeFormat(locale, options || {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
