import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuickAddProductForm } from "@/components/admin/QuickAddProductForm";

export default async function QuickAddProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add product from a supplier link</h1>
        <Link href="/admin/products" className="text-sm font-medium text-gray-500 hover:underline">
          ← Back to products
        </Link>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-5 text-sm text-gray-600">
        <p>
          Paste a product link from AliExpress, Alibaba, or anywhere else. We&apos;ll try to grab the title, image
          and price automatically — some supplier sites block this, so if nothing comes through, just fill in the
          fields yourself. Either way, you&apos;ll still need to type the Arabic title and description.
        </p>
      </div>

      <QuickAddProductForm categories={categories} />
    </div>
  );
}
