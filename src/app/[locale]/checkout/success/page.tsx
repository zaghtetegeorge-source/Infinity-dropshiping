import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { PurchaseTracker } from "@/components/storefront/PurchaseTracker";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order: orderNumber } = await searchParams;

  const order = orderNumber ? await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } }) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-gray-500">{locale === "ar" ? "لم يتم العثور على الطلب" : "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <PurchaseTracker
        orderId={order.orderNumber}
        currency={order.currency}
        total={order.total}
        email={order.email}
        phone={order.phone ?? undefined}
        items={order.items}
      />
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
      <h1 className="mb-2 text-2xl font-bold">
        {locale === "ar" ? "تم استلام طلبك بنجاح!" : "Your order has been placed!"}
      </h1>
      <p className="mb-6 text-gray-500">
        {locale === "ar" ? "رقم الطلب" : "Order number"}: <strong>{order.orderNumber}</strong>
      </p>
      <p className="mb-8 text-lg font-bold">{formatMoney(order.total, order.currency, locale)}</p>
      <Link href={`/${locale}/products`} className="rounded-lg bg-black px-6 py-3 font-bold text-white">
        {locale === "ar" ? "استمر في التسوق" : "Continue shopping"}
      </Link>
    </div>
  );
}
