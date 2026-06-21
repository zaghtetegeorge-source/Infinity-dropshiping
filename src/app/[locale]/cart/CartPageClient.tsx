"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/storefront/CartContext";
import { trackEvent } from "@/lib/tracking/client";
import { formatPrice } from "@/lib/currency";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function CartPageClient({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { items, currency, removeItem, updateQuantity, subtotalAed, addItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recoveredRef = useRef(false);

  useEffect(() => {
    const recoverSessionId = searchParams.get("recover");
    if (!recoverSessionId || recoveredRef.current) return;
    recoveredRef.current = true;

    fetch(`/api/cart?sessionId=${encodeURIComponent(recoverSessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        const cart = data.cart;
        if (!cart) return;
        for (const item of cart.items) {
          addItem({
            productId: item.productId,
            variantId: item.variantId,
            slug: item.product.slug,
            titleEn: item.product.titleEn,
            titleAr: item.product.titleAr,
            image: item.product.images?.[0]?.url,
            unitPriceAed: item.unitPrice,
            quantity: item.quantity,
          });
        }
        router.replace(`/${locale}/cart`);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleCheckout() {
    trackEvent({
      event: "InitiateCheckout",
      currency,
      value: items.reduce((s, i) => s + i.unitPriceAed * i.quantity, 0),
      items: items.map((i) => ({
        id: i.productId,
        name: locale === "ar" ? i.titleAr : i.titleEn,
        category: i.category,
        price: i.unitPriceAed,
        quantity: i.quantity,
      })),
    });
    router.push(`/${locale}/checkout`);
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{dict.cart.title}</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex items-center gap-4 rounded-xl border p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.image ? <Image src={item.image} alt={item.titleEn} fill className="object-cover" /> : null}
            </div>
            <div className="flex-1">
              <Link href={`/${locale}/products/${item.slug}`} className="font-medium hover:text-brand">
                {locale === "ar" ? item.titleAr : item.titleEn}
              </Link>
              <div className="mt-1 text-sm text-gray-500">{formatPrice(item.unitPriceAed, currency, locale)}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center rounded-lg border">
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="px-2 py-0.5"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="px-2 py-0.5"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  {dict.cart.remove}
                </button>
              </div>
            </div>
            <div className="font-bold">{formatPrice(item.unitPriceAed * item.quantity, currency, locale)}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <span className="text-lg font-bold">{dict.cart.subtotal}</span>
        <span className="text-lg font-bold">{formatPrice(subtotalAed, currency, locale)}</span>
      </div>

      <button onClick={handleCheckout} className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-bold text-white">
        {dict.cart.checkout}
      </button>
    </div>
  );
}
