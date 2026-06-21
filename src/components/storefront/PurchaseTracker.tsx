"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/storefront/CartContext";
import { trackEvent } from "@/lib/tracking/client";

interface Props {
  orderId: string;
  currency: string;
  total: number;
  email: string;
  phone?: string;
  items: { productId: string; titleSnap: string; unitPrice: number; quantity: number }[];
}

// Fires the client-side Purchase pixel once, then empties the cart. The
// server already recorded the authoritative Purchase event via the Stripe
// webhook (Meta CAPI + TikTok Events API) — this client-side fire uses the
// same logical event so both platforms can de-duplicate.
export function PurchaseTracker({ orderId, currency, total, email, phone, items }: Props) {
  const { clearCart } = useCart();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    trackEvent({
      event: "Purchase",
      currency,
      value: total,
      orderId,
      email,
      phone,
      items: items.map((i) => ({ id: i.productId, name: i.titleSnap, price: i.unitPrice, quantity: i.quantity })),
    });
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
