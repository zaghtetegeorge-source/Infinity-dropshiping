// Canonical event model shared by the browser pixels (Meta/TikTok/GA4/GTM)
// and the server-side Conversions APIs. One `eventId` per logical event is
// generated client-side and reused everywhere so Meta/TikTok can de-duplicate
// the browser pixel hit against the server-side API hit for the same event.

export type StandardEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface TrackedItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
}

export interface TrackEventPayload {
  event: StandardEventName;
  eventId: string;
  currency: string;
  value: number;
  items: TrackedItem[];
  email?: string;
  phone?: string;
  orderId?: string;
  sourceUrl: string;
}

export function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// GA4 (gtag.js) recommended ecommerce event name for each standard event.
export const GA4_EVENT_MAP: Record<StandardEventName, string> = {
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
};

// TikTok Pixel/Events API standard event name for each canonical event.
export const TIKTOK_EVENT_MAP: Record<StandardEventName, string> = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};
