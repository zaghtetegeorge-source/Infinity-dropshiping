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
    <aside className="flex shrink-0 flex-col border-b bg-white px-4 py-3 md:w-56 md:border-b-0 md:border-r md:py-6">
      <div className="flex items-center justify-between gap-3 md:mb-6 md:block">
        <p className="text-lg font-bold whitespace-nowrap">Infinity Admin</p>
        <button onClick={handleLogout} className="text-xs font-medium text-red-600 hover:underline md:hidden">
          Log out
        </button>
      </div>
      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pt-2 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible md:px-0 md:pt-0">
        {LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t pt-4 text-xs text-gray-400 md:block">
        <p className="mb-2 truncate">{adminName}</p>
        <button onClick={handleLogout} className="font-medium text-red-600 hover:underline">
          Log out
        </button>
      </div>
    </aside>
  );
}
