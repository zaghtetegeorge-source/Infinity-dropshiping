"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";

export interface CartLineItem {
  productId: string;
  variantId?: string | null;
  slug: string;
  titleEn: string;
  titleAr: string;
  image?: string;
  unitPriceAed: number;
  quantity: number;
  category?: string;
}

interface CartContextValue {
  items: CartLineItem[];
  currency: string;
  sessionId: string;
  setCurrency: (currency: string) => void;
  addItem: (item: CartLineItem) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  subtotalAed: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "infinity_cart_v1";
const SESSION_KEY = "infinity_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getStoredItems(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function getStoredCurrency(): string {
  if (typeof window === "undefined") return siteConfig.defaultCurrency;
  return localStorage.getItem("infinity_currency") || siteConfig.defaultCurrency;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>(() => getStoredItems());
  const [currency, setCurrencyState] = useState(() => getStoredCurrency());
  const [sessionId] = useState(() => getOrCreateSessionId());

  const persist = useCallback((next: CartLineItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const syncServer = useCallback(
    (next: CartLineItem[], currentCurrency: string, currentSessionId: string) => {
      if (!currentSessionId) return;
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          currency: currentCurrency,
          items: next.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        }),
      }).catch(() => {});
    },
    []
  );

  const addItem = useCallback(
    (item: CartLineItem) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId && i.variantId === item.variantId);
        const next = existing
          ? prev.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          : [...prev, item];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        syncServer(next, currency, sessionId);
        return next;
      });
    },
    [currency, sessionId, syncServer]
  );

  const removeItem = useCallback(
    (productId: string, variantId?: string | null) => {
      setItems((prev) => {
        const next = prev.filter((i) => !(i.productId === productId && i.variantId === variantId));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        syncServer(next, currency, sessionId);
        return next;
      });
    },
    [currency, sessionId, syncServer]
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null | undefined, quantity: number) => {
      setItems((prev) => {
        const next = prev
          .map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        syncServer(next, currency, sessionId);
        return next;
      });
    },
    [currency, sessionId, syncServer]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const setCurrency = useCallback((next: string) => {
    setCurrencyState(next);
    localStorage.setItem("infinity_currency", next);
  }, []);

  const subtotalAed = useMemo(() => items.reduce((sum, i) => sum + i.unitPriceAed * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, currency, sessionId, setCurrency, addItem, removeItem, updateQuantity, clearCart, subtotalAed, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
