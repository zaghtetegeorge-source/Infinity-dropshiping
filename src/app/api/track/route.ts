import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/tracking/metaCapi";
import { sendTikTokEventsApiEvent } from "@/lib/tracking/tiktokEventsApi";
import type { TrackEventPayload } from "@/lib/tracking/events";

// Receives a tracked event from the browser (after the client-side Pixel
// already fired) and mirrors it server-side to Meta Conversions API + TikTok
// Events API using the same event_id, enabling deduplication on both
// platforms. This keeps Catalog Sales / Performance Max / Smart Performance
// signal accurate even when client-side pixels are blocked.
export async function POST(req: NextRequest) {
  const payload = (await req.json()) as TrackEventPayload;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const cookies = req.cookies;
  const fbp = cookies.get("_fbp")?.value;
  const fbc = cookies.get("_fbc")?.value;
  const ttclid = cookies.get("ttclid")?.value;

  const [meta, tiktok] = await Promise.allSettled([
    sendMetaCapiEvent(payload, { ip, userAgent, fbp, fbc }),
    sendTikTokEventsApiEvent(payload, { ip, userAgent, ttclid }),
  ]);

  return NextResponse.json({ meta, tiktok });
}
