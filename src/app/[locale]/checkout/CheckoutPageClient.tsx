"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/components/storefront/CartContext";
import { formatPrice } from "@/lib/currency";
import { calculateShippingFeeAed, GCC_COUNTRIES } from "@/lib/shipping";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

const COUNTRY_NAMES: Record<string, { ar: string; en: string }> = {
  AE: { ar: "الإمارات", en: "United Arab Emirates" },
  SA: { ar: "السعودية", en: "Saudi Arabia" },
  KW: { ar: "الكويت", en: "Kuwait" },
  QA: { ar: "قطر", en: "Qatar" },
  BH: { ar: "البحرين", en: "Bahrain" },
  OM: { ar: "عمان", en: "Oman" },
};

export function CheckoutPageClient({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { items, currency, subtotalAed, sessionId } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "AE",
    city: "",
    address: "",
  });

  const shippingFeeAed = calculateShippingFeeAed(form.country, subtotalAed);
  const totalAed = subtotalAed + shippingFeeAed;

  async function captureCheckoutStarted() {
    if (!form.email) return;
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        email: form.email,
        phone: form.phone,
        currency,
        checkoutStarted: true,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      }),
    }).catch(() => {});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      router.push(`/${locale}/products`);
      return;
    }
    setSubmitting(true);
    await captureCheckoutStarted();

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, currency, locale, ...form }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "checkout_failed");
      window.location.href = data.url;
    } catch {
      toast.error(locale === "ar" ? "تعذر إتمام الطلب، حاول مرة أخرى" : "Could not start checkout, try again");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 text-lg text-gray-500">{dict.cart.empty}</p>
        <Link href={`/${locale}/products`} className="rounded-lg bg-black px-6 py-3 font-bold text-white">
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h1 className="text-2xl font-bold">{dict.checkout.title}</h1>

        <section className="space-y-3">
          <h2 className="font-bold text-gray-700">{dict.checkout.contact}</h2>
          <input
            required
            type="email"
            placeholder={dict.checkout.email}
            value={form.email}
            onBlur={captureCheckoutStarted}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
          <input
            required
            placeholder={dict.checkout.phone}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-gray-700">{dict.checkout.shipping}</h2>
          <input
            required
            placeholder={dict.checkout.fullName}
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
          <select
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          >
            {GCC_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {locale === "ar" ? COUNTRY_NAMES[c].ar : COUNTRY_NAMES[c].en}
              </option>
            ))}
          </select>
          <input
            required
            placeholder={dict.checkout.city}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
          <input
            required
            placeholder={dict.checkout.address}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </section>

        <button disabled={submitting} className="w-full rounded-lg bg-black px-6 py-3 font-bold text-white disabled:opacity-50">
          {submitting ? "..." : dict.checkout.placeOrder}
        </button>
        <p className="text-center text-xs text-gray-400">Apple Pay · Google Pay · Visa · Mastercard — Powered by Stripe</p>
      </form>

      <div className="rounded-xl border p-5">
        <h2 className="mb-4 font-bold">{dict.cart.title}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between text-sm">
              <span>
                {locale === "ar" ? item.titleAr : item.titleEn} × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPriceAed * item.quantity, currency, locale)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>{dict.cart.subtotal}</span>
            <span>{formatPrice(subtotalAed, currency, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span>{locale === "ar" ? "الشحن" : "Shipping"}</span>
            <span>{shippingFeeAed === 0 ? (locale === "ar" ? "مجاني" : "Free") : formatPrice(shippingFeeAed, currency, locale)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>{dict.cart.total}</span>
            <span>{formatPrice(totalAed, currency, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
