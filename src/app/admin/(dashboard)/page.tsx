import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";

export default async function AdminOverviewPage() {
  const [productCount, orderCount, abandonedCount, paidOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.cart.count({ where: { status: { in: ["CHECKOUT_STARTED", "ABANDONED"] } } }),
    prisma.order.findMany({ where: { status: "PAID" }, select: { total: true, currency: true } }),
  ]);

  const revenueByCurrency = paidOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.currency] = (acc[o.currency] || 0) + o.total;
    return acc;
  }, {});

  const stats = [
    { label: "Products", value: productCount },
    { label: "Orders", value: orderCount },
    { label: "Abandoned Carts", value: abandonedCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-5">
        <p className="mb-2 text-sm font-bold text-gray-500">Revenue (paid orders)</p>
        {Object.keys(revenueByCurrency).length === 0 ? (
          <p className="text-sm text-gray-400">No paid orders yet.</p>
        ) : (
          <ul className="space-y-1">
            {Object.entries(revenueByCurrency).map(([currency, total]) => (
              <li key={currency} className="text-lg font-bold">
                {formatMoney(total, currency, "en")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
