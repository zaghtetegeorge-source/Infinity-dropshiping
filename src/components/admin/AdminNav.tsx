"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/carts", label: "Abandoned Carts" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-white px-4 py-6">
      <p className="mb-6 text-lg font-bold">Infinity Admin</p>
      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t pt-4 text-xs text-gray-400">
        <p className="mb-2 truncate">{adminName}</p>
        <button onClick={handleLogout} className="font-medium text-red-600 hover:underline">
          Log out
        </button>
      </div>
    </aside>
  );
}
