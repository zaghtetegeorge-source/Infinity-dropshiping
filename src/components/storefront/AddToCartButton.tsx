"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/components/storefront/CartContext";
import { trackEvent } from "@/lib/tracking/client";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface Props {
  locale: Locale;
  productId: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  image?: string;
  priceAed: number;
  category?: string;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({
  locale,
  productId,
  slug,
  titleEn,
  titleAr,
  image,
  priceAed,
  category,
  quantity = 1,
  className,
}: Props) {
  const { addItem, currency } = useCart();
  const dict = getDictionary(locale);
  const [adding, setAdding] = useState(false);

  function handleAdd() {
    setAdding(true);
    addItem({ productId, slug, titleEn, titleAr, image, unitPriceAed: priceAed, quantity, category });

    trackEvent({
      event: "AddToCart",
      currency,
      value: priceAed * quantity,
      items: [{ id: productId, name: locale === "ar" ? titleAr : titleEn, category, price: priceAed, quantity }],
    });

    toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
    setTimeout(() => setAdding(false), 400);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className={className ?? "w-full rounded-lg bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:opacity-60"}
    >
      {dict.product.addToCart}
    </button>
  );
}
