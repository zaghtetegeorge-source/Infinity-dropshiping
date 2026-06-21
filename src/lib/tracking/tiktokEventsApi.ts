import { tiktokConfig } from "@/lib/env";
import { normalizeEmail, normalizePhone } from "@/lib/tracking/hash";
import { TIKTOK_EVENT_MAP, type TrackEventPayload } from "@/lib/tracking/events";

const API_VERSION = "v1.3";

// Sends a server-side event to the TikTok Events API, mirroring the browser
// Pixel hit so Catalog Sales / Smart Performance campaigns keep accurate
// signal even when the client-side pixel does not fire.
export async function sendTikTokEventsApiEvent(
  payload: TrackEventPayload,
  clientInfo: { ip?: string; userAgent?: string; ttclid?: string }
) {
  if (!tiktokConfig.pixelId || !tiktokConfig.accessToken) {
    return { skipped: true, reason: "TIKTOK_PIXEL_ID or TIKTOK_EVENTS_API_TOKEN not configured" };
  }

  const body = {
    event_source: "web",
    event_source_id: tiktokConfig.pixelId,
    data: [
      {
        event: TIKTOK_EVENT_MAP[payload.event],
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        user: {
          email: normalizeEmail(payload.email),
          phone: normalizePhone(payload.phone),
          ip: clientInfo.ip,
          user_agent: clientInfo.userAgent,
          ttclid: clientInfo.ttclid,
        },
        properties: {
          currency: payload.currency,
          value: payload.value,
          contents: payload.items.map((i) => ({
            content_id: i.id,
            content_name: i.name,
            content_category: i.category,
            price: i.price,
            quantity: i.quantity ?? 1,
          })),
        },
        page: { url: payload.sourceUrl },
      },
    ],
  };

  const url = `https://business-api.tiktok.com/open_api/${API_VERSION}/event/track/`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": tiktokConfig.accessToken,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("TikTok Events API error", res.status, text);
    return { skipped: false, ok: false, status: res.status, error: text };
  }

  return { skipped: false, ok: true };
}
