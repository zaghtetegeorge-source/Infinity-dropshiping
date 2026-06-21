// Client-safe config: only NEXT_PUBLIC_* values. Never add secrets here —
// this module is imported directly by "use client" components and gets
// bundled into the browser JS. Server-only secrets live in src/lib/env.ts.
export const siteConfig = {
  name: "InGifts",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "AED",
  supportedCurrencies: ["AED", "SAR", "USD"],
  defaultLocale: "ar" as const,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
};
