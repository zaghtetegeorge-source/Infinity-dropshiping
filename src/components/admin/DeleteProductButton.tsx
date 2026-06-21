"use client";

import { useRouter } from "next/navigation";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="font-medium text-red-600 hover:underline">
      Delete
    </button>
  );
}
