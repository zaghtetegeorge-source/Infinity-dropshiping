import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(50),
});

const cartSchema = z.object({
  sessionId: z.string().min(8),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  currency: z.string().default("AED"),
  items: z.array(cartItemSchema),
  checkoutStarted: z.boolean().optional(),
});

// Persists the guest cart server-side. Called on every cart mutation and
// again as soon as the checkout contact form is filled in — that second
// call (with checkoutStarted=true) is what powers abandoned-cart recovery:
// from this point on we know the shopper's email even if they never pay.
export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = cartSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { sessionId, email, phone, currency, items, checkoutStarted } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { variants: true },
  });

  const resolvedItems = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return [];
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    const unitPrice = product.price + (variant?.priceDelta ?? 0);
    return [{ productId: product.id, variantId: variant?.id ?? null, quantity: item.quantity, unitPrice }];
  });

  const cart = await prisma.cart.upsert({
    where: { sessionId },
    create: {
      sessionId,
      email,
      phone,
      currency,
      status: checkoutStarted ? "CHECKOUT_STARTED" : "ACTIVE",
      items: { create: resolvedItems },
    },
    update: {
      email: email ?? undefined,
      phone: phone ?? undefined,
      currency,
      status: checkoutStarted ? "CHECKOUT_STARTED" : undefined,
      items: { deleteMany: {}, create: resolvedItems },
    },
    include: { items: { include: { product: true, variant: true } } },
  });

  return NextResponse.json({ cart });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { product: { include: { images: true } }, variant: true } } },
  });

  return NextResponse.json({ cart });
}
