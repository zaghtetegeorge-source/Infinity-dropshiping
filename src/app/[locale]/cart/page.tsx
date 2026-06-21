import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { CartPageClient } from "./CartPageClient";

export default async function CartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <Suspense>
      <CartPageClient locale={locale} />
    </Suspense>
  );
}
