import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { OrderTrackingInput } from "@/components/admin/OrderTrackingInput";

function statusClass(status: string) {
  const base = "rounded-full px-2 py-1 text-xs font-medium";
  switch (status) {
    case "PAID":
      return `${base} bg-green-100 text-green-700`;
    case "FULFILLED":
      return `${base} bg-blue-100 text-blue-700`;
    case "CANCELLED":
    case "REFUNDED":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-gray-100 text-gray-600`;
  }
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Supplier tracking</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <div>{o.fullName}</div>
                  <div className="text-xs text-gray-400">{o.email}</div>
                </td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 font-medium">{formatMoney(o.total, o.currency, "en")}</td>
                <td className="px-4 py-3">
                  <span className={statusClass(o.status)}>{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <OrderTrackingInput orderId={o.id} initialValue={o.supplierTrackingNumber ?? ""} />
                </td>
                <td className="px-4 py-3 text-gray-500">{o.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
