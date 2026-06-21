import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
