import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authConfig, emailConfig, siteConfig } from "@/lib/env";
import { getResendClient } from "@/lib/email/resend";
import { abandonedCartEmailHtml } from "@/lib/email/templates";
import { formatPrice } from "@/lib/currency";

const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_REMINDERS = 3;

// Trigger this on a schedule (Vercel Cron / cron-job.org / any scheduler)
// hitting GET with `Authorization: Bearer ${CRON_SECRET}`. It finds carts
// where the shopper gave their email but never paid for >1h, emails a
// recovery link, and stops after 3 reminders. See SETUP.md "Abandoned cart
// recovery".
export async function GET(req: NextRequest) {
  if (!authConfig.cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 400 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${authConfig.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = getResendClient();
  const cutoff = new Date(Date.now() - ONE_HOUR_MS);

  const carts = await prisma.cart.findMany({
    where: {
      status: "CHECKOUT_STARTED",
      email: { not: null },
      updatedAt: { lte: cutoff },
      remindersSent: { lt: MAX_REMINDERS },
    },
    include: { items: { include: { product: { include: { images: true } } } } },
  });

  let sent = 0;
  for (const cart of carts) {
    if (!cart.email || cart.items.length === 0) continue;

    const totalAed = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const recoveryUrl = `${siteConfig.url}/ar/cart?recover=${cart.sessionId}`;

    if (resend) {
      await resend.emails.send({
        from: `Infinity Store <${emailConfig.fromAddress}>`,
        to: cart.email,
        subject: "نسيت شيئاً في سلتك؟ 🛒 / You left something in your cart",
        html: abandonedCartEmailHtml({
          items: cart.items.map((item) => ({
            titleEn: item.product.titleEn,
            titleAr: item.product.titleAr,
            quantity: item.quantity,
            imageUrl: item.product.images[0]?.url,
          })),
          recoveryUrl,
          currency: cart.currency,
          total: formatPrice(totalAed, cart.currency, "en"),
        }),
      });
      sent += 1;
    }

    const remindersSent = cart.remindersSent + 1;
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        remindersSent,
        lastEmailAt: new Date(),
        recoveryUrl,
        status: remindersSent >= MAX_REMINDERS ? "ABANDONED" : "CHECKOUT_STARTED",
      },
    });
  }

  return NextResponse.json({ processed: carts.length, emailsSent: sent, resendConfigured: !!resend });
}
