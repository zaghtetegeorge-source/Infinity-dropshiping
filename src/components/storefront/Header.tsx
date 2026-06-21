"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, MessageCircle, User } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCart } from "@/components/storefront/CartContext";
import { siteConfig } from "@/lib/siteConfig";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const { count, currency, setCurrency } = useCart();

  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image src="/logo.png" alt={siteConfig.name} width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="text-xl font-bold tracking-tight">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href={`/${locale}`} className="hover:text-brand">
            {dict.nav.home}
          </Link>
          <Link href={`/${locale}/products`} className="hover:text-brand">
            {dict.nav.shop}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
            aria-label="Currency"
          >
            {siteConfig.supportedCurrencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <Link
            href={switchedPath || `/${otherLocale}`}
            className="rounded border px-2 py-1 text-sm font-medium hover:bg-gray-50"
          >
            {otherLocale === "ar" ? "العربية" : "English"}
          </Link>

          {siteConfig.whatsappNumber ? (
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-6 w-6 text-[#25D366]" />
            </a>
          ) : null}

          <Link
            href="/admin/login"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label={dict.footer.admin}
            title={dict.footer.admin}
          >
            <User className="h-5 w-5" />
          </Link>

          <Link href={`/${locale}/cart`} className="relative">
            <ShoppingCart className="h-6 w-6" />
            {count > 0 ? (
              <span className="absolute -top-2 -end-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
