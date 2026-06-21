import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";

export default async function AdminCartsPage() {
  const carts = await prisma.cart.findMany({
    where: { status: { in: ["CHECKOUT_STARTED", "ABANDONED"] } },
    include: { items: { include: { product: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Abandoned carts</h1>
      <div className="space-y-4">
        {carts.map((cart) => {
          const subtotalAed = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
          return (
            <div key={cart.id} className="rounded-xl border bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{cart.email ?? "No email"}</p>
                  <p className="text-xs text-gray-400">{cart.phone ?? "No phone"}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{cart.status}</span>
              </div>
              <ul className="mb-3 space-y-1 text-sm text-gray-600">
                {cart.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product.titleEn}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">{formatPrice(subtotalAed, cart.currency, "en")}</span>
                <span className="text-gray-400">Reminders sent: {cart.remindersSent}</span>
              </div>
            </div>
          );
        })}
        {carts.length === 0 ? <p className="text-gray-400">No abandoned carts right now.</p> : null}
      </div>
    </div>
  );
}
