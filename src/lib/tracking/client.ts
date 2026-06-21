"use client";

import {
  GA4_EVENT_MAP,
  TIKTOK_EVENT_MAP,
  generateEventId,
  type StandardEventName,
  type TrackedItem,
} from "@/lib/tracking/events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data: Record<string, unknown>) => void };
  }
}

interface FireEventArgs {
  event: StandardEventName;
  currency: string;
  value: number;
  items: TrackedItem[];
  email?: string;
  phone?: string;
  orderId?: string;
}

// Single entry point used across the storefront (product page, cart,
// checkout, order confirmation) to record the four required funnel events:
// ViewContent, AddToCart, InitiateCheckout, Purchase.
//
// It fans the event out to every connected channel using one shared eventId
// so Meta and TikTok can de-duplicate the client Pixel hit against the
// server-side Conversions API hit fired from /api/track.
export function trackEvent(args: FireEventArgs): string {
  const eventId = generateEventId();
  if (typeof window === "undefined") return eventId;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: args.event,
    ecommerce: {
      currency: args.currency,
      value: args.value,
      items: args.items,
    },
  });

  if (window.gtag) {
    window.gtag("event", GA4_EVENT_MAP[args.event], {
      currency: args.currency,
      value: args.value,
      transaction_id: args.orderId,
      items: args.items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        item_category: i.category,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
    });
  }

  if (window.fbq) {
    window.fbq(
      "track",
      args.event,
      {
        currency: args.currency,
        value: args.value,
        content_type: "product",
        content_ids: args.items.map((i) => i.id),
        contents: args.items.map((i) => ({ id: i.id, quantity: i.quantity ?? 1, item_price: i.price })),
      },
      { eventID: eventId }
    );
  }

  if (window.ttq) {
    window.ttq.track(TIKTOK_EVENT_MAP[args.event], {
      event_id: eventId,
      currency: args.currency,
      value: args.value,
      contents: args.items.map((i) => ({
        content_id: i.id,
        content_name: i.name,
        content_category: i.category,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
    });
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: args.event,
      eventId,
      currency: args.currency,
      value: args.value,
      items: args.items,
      email: args.email,
      phone: args.phone,
      orderId: args.orderId,
      sourceUrl: window.location.href,
    }),
    keepalive: true,
  }).catch(() => {});

  return eventId;
}
