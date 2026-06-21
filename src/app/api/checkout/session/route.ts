import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { siteConfig } from "@/lib/env";
import { convertFromAed } from "@/lib/currency";
import { calculateShippingFeeAed, GCC_COUNTRIES } from "@/lib/shipping";
import { generateOrderNumber } from "@/lib/orderNumber";

const checkoutSchema = z.object({
  sessionId: z.string().min(8),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  country: z.string().length(2),
  city: z.string().min(1),
  address: z.string().min(3),
  currency: z.string().default("AED"),
  locale: z.enum(["ar", "en"]).default("ar"),
});

// Creates the pending Order + a Stripe Checkout Session. Stripe Checkout
// (the hosted page) is used specifically because it auto-enables Apple Pay
// and Google Pay for eligible buyers with zero extra domain-verification
// steps — see SETUP.md "Stripe / Apple Pay / Google Pay".
export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { sessionId: data.sessionId },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotalAed = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFeeAed = calculateShippingFeeAed(data.country, subtotalAed);
  const totalAed = subtotalAed + shippingFeeAed;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      email: data.email,
      phone: data.phone,
      fullName: data.fullName,
      country: data.country,
      city: data.city,
      address: data.address,
      currency: data.currency,
      cartSessionId: data.sessionId,
      subtotal: convertFromAed(subtotalAed, data.currency),
      shippingFee: convertFromAed(shippingFeeAed, data.currency),
      total: convertFromAed(totalAed, data.currency),
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          titleSnap: item.variant ? `${item.product.titleEn} - ${item.variant.nameEn}` : item.product.titleEn,
          quantity: item.quantity,
          unitPrice: convertFromAed(item.unitPrice, data.currency),
        })),
      },
    },
  });

  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; images?: string[] };
      unit_amount: number;
    };
    quantity: number;
  }> = cart.items.map((item) => ({
    price_data: {
      currency: data.currency.toLowerCase(),
      product_data: {
        name: item.variant ? `${item.product.titleEn} - ${item.variant.nameEn}` : item.product.titleEn,
      },
      unit_amount: Math.round(convertFromAed(item.unitPrice, data.currency) * 100),
    },
    quantity: item.quantity,
  }));

  if (shippingFeeAed > 0) {
    lineItems.push({
      price_data: {
        currency: data.currency.toLowerCase(),
        product_data: { name: data.locale === "ar" ? "رسوم الشحن" : "Shipping fee" },
        unit_amount: Math.round(convertFromAed(shippingFeeAed, data.currency) * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: data.email,
    line_items: lineItems,
    // Stripe Checkout's hosted page has no Arabic locale option, so Arabic
    // shoppers get "auto" (browser-detected) rather than a hard "en" override.
    locale: data.locale === "ar" ? "auto" : "en",
    success_url: `${siteConfig.url}/${data.locale}/checkout/success?order=${orderNumber}`,
    cancel_url: `${siteConfig.url}/${data.locale}/checkout?cancelled=1`,
    metadata: {
      orderId: order.id,
      orderNumber,
      sessionId: data.sessionId,
      eventId: order.eventId,
    },
    shipping_address_collection: { allowed_countries: [...GCC_COUNTRIES, "US", "GB"] },
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

  return NextResponse.json({ url: session.url, orderNumber, eventId: order.eventId });
}
