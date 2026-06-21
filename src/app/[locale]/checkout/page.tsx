import type { Locale } from "@/lib/i18n/dictionaries";
import { CheckoutPageClient } from "./CheckoutPageClient";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <CheckoutPageClient locale={locale} />;
}
