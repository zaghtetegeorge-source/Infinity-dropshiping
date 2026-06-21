import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { stripeConfig, siteConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendMetaCapiEvent } from "@/lib/tracking/metaCapi";
import { sendTikTokEventsApiEvent } from "@/lib/tracking/tiktokEventsApi";

// Stripe webhook — the single source of truth for "did this order actually
// get paid". This is also where the Purchase event is sent server-side to
// Meta Conversions API + TikTok Events API, since it fires reliably even if
// the buyer closes the tab before the success page's client-side pixel can.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!stripeConfig.webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order || order.status === "PAID") return NextResponse.json({ received: true });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", stripePaymentId: String(session.payment_intent ?? "") },
    });

    await Promise.all(
      order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    if (order.cartSessionId) {
      await prisma.cart.updateMany({
        where: { sessionId: order.cartSessionId },
        data: { status: "CONVERTED" },
      });
    }

    const trackPayload = {
      event: "Purchase" as const,
      eventId: order.eventId,
      currency: order.currency,
      value: order.total,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.titleSnap,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
      email: order.email,
      phone: order.phone ?? undefined,
      orderId: order.orderNumber,
      sourceUrl: `${siteConfig.url}/checkout/success?order=${order.orderNumber}`,
    };

    const [metaResult, tiktokResult] = await Promise.allSettled([
      sendMetaCapiEvent(trackPayload, {}),
      sendTikTokEventsApiEvent(trackPayload, {}),
    ]);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        capiSentAt: metaResult.status === "fulfilled" ? new Date() : null,
        ttApiSentAt: tiktokResult.status === "fulfilled" ? new Date() : null,
      },
    });
  }

  return NextResponse.json({ received: true });
}
