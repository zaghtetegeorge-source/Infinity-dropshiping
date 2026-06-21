import { metaConfig } from "@/lib/env";
import { normalizeEmail, normalizePhone } from "@/lib/tracking/hash";
import type { TrackEventPayload } from "@/lib/tracking/events";

const GRAPH_VERSION = "v21.0";

// Sends a server-side event to the Meta Conversions API. This is the
// fallback channel that keeps Catalog Sales / ASC campaigns fed with
// reliable signal even when the browser Pixel is blocked (ad blockers,
// Safari ITP, iOS 14.5+ ATT opt-outs).
export async function sendMetaCapiEvent(
  payload: TrackEventPayload,
  clientInfo: { ip?: string; userAgent?: string; fbp?: string; fbc?: string }
) {
  if (!metaConfig.pixelId || !metaConfig.accessToken) {
    return { skipped: true, reason: "META_PIXEL_ID or META_CONVERSIONS_API_TOKEN not configured" };
  }

  const body = {
    data: [
      {
        event_name: payload.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        action_source: "website",
        event_source_url: payload.sourceUrl,
        user_data: {
          em: normalizeEmail(payload.email),
          ph: normalizePhone(payload.phone),
          client_ip_address: clientInfo.ip,
          client_user_agent: clientInfo.userAgent,
          fbp: clientInfo.fbp,
          fbc: clientInfo.fbc,
        },
        custom_data: {
          currency: payload.currency,
          value: payload.value,
          content_type: "product",
          content_ids: payload.items.map((i) => i.id),
          contents: payload.items.map((i) => ({
            id: i.id,
            quantity: i.quantity ?? 1,
            item_price: i.price,
          })),
        },
      },
    ],
    ...(metaConfig.testEventCode ? { test_event_code: metaConfig.testEventCode } : {}),
  };

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${metaConfig.pixelId}/events?access_token=${metaConfig.accessToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Meta CAPI error", res.status, text);
    return { skipped: false, ok: false, status: res.status, error: text };
  }

  return { skipped: false, ok: true };
}
