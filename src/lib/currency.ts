import type { Locale } from "@/lib/i18n/dictionaries";

// Static FX rates relative to AED (the store's base currency). Update these
// from a live FX source if you need real-time accuracy; for dropshipping
// storefronts a daily-updated static table is the common, predictable choice.
export const FX_RATES_FROM_AED: Record<string, number> = {
  AED: 1,
  SAR: 1.0205,
  USD: 0.2723,
};

export const CURRENCY_LOCALE_MAP: Record<string, string> = {
  AED: "ar-AE",
  SAR: "ar-SA",
  USD: "en-US",
};

export function convertFromAed(amountInAed: number, currency: string): number {
  const rate = FX_RATES_FROM_AED[currency] ?? 1;
  return Math.round(amountInAed * rate * 100) / 100;
}

// Formats a value already expressed in AED, converting it to `currency` first.
// Use for product/cart prices, which are always stored in AED.
export function formatPrice(amountInAed: number, currency: string, locale: Locale): string {
  return formatMoney(convertFromAed(amountInAed, currency), currency, locale);
}

// Formats a value that is already expressed in `currency` (no conversion).
// Use for Order totals, which are persisted in the currency the order was
// placed in.
export function formatMoney(amount: number, currency: string, locale: Locale): string {
  const intlLocale = locale === "ar" ? "ar-AE" : "en-US";
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
