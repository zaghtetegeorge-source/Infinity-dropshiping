"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/components/storefront/CartContext";
import { trackEvent } from "@/lib/tracking/client";
import { formatPrice } from "@/lib/currency";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface Variant {
  id: string;
  nameEn: string;
  nameAr: string;
  priceDelta: number;
  stock: number;
}

interface Props {
  locale: Locale;
  productId: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  image?: string;
  basePrice: number;
  stock: number;
  category?: string;
  variants: Variant[];
}

export function ProductOptions({ locale, productId, slug, titleEn, titleAr, image, basePrice, stock, category, variants }: Props) {
  const dict = getDictionary(locale);
  const { addItem, currency } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);

  const variant = variants.find((v) => v.id === variantId);
  const unitPrice = basePrice + (variant?.priceDelta ?? 0);
  const effectiveStock = variant ? variant.stock : stock;
  const title = locale === "ar" ? titleAr : titleEn;

  useEffect(() => {
    trackEvent({
      event: "ViewContent",
      currency,
      value: unitPrice,
      items: [{ id: productId, name: title, category, price: unitPrice, quantity: 1 }],
    });
    // Fire once per page view, not on every variant/quantity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildLineItem() {
    return {
      productId,
      variantId: variantId ?? null,
      slug,
      titleEn,
      titleAr,
      image,
      unitPriceAed: unitPrice,
      quantity,
      category,
    };
  }

  function handleAddToCart() {
    addItem(buildLineItem());
    trackEvent({
      event: "AddToCart",
      currency,
      value: unitPrice * quantity,
      items: [{ id: productId, name: title, category, price: unitPrice, quantity }],
    });
    toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
  }

  function handleBuyNow() {
    addItem(buildLineItem());
    trackEvent({
      event: "AddToCart",
      currency,
      value: unitPrice * quantity,
      items: [{ id: productId, name: title, category, price: unitPrice, quantity }],
    });
    router.push(`/${locale}/checkout`);
  }

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">{formatPrice(unitPrice, currency, locale)}</div>

      {effectiveStock > 0 ? (
        <span className="inline-block rounded bg-green-50 px-2 py-1 text-sm font-medium text-green-700">
          {dict.product.inStock}
        </span>
      ) : (
        <span className="inline-block rounded bg-red-50 px-2 py-1 text-sm font-medium text-red-700">
          {dict.product.outOfStock}
        </span>
      )}

      {variants.length > 0 ? (
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {locale === "ar" ? v.nameAr : v.nameEn}
            </option>
          ))}
        </select>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{dict.product.quantity}</span>
        <div className="flex items-center rounded-lg border">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1 text-lg">
            −
          </button>
          <span className="w-10 text-center">{quantity}</span>
          <button onClick={() => setQuantity((q) => Math.min(effectiveStock || 50, q + 1))} className="px-3 py-1 text-lg">
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={effectiveStock <= 0}
          className="flex-1 rounded-lg border-2 border-black px-5 py-3 font-bold transition hover:bg-gray-50 disabled:opacity-50"
        >
          {dict.product.addToCart}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={effectiveStock <= 0}
          className="flex-1 rounded-lg bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {dict.product.buyNow}
        </button>
      </div>
    </div>
  );
}
