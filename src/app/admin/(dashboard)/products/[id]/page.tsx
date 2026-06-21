import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: true, variants: true } }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit product</h1>
      <ProductForm
        productId={product.id}
        categories={categories}
        initial={{
          slug: product.slug,
          titleEn: product.titleEn,
          titleAr: product.titleAr,
          descriptionEn: product.descriptionEn,
          descriptionAr: product.descriptionAr,
          brand: product.brand,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          videoUrl: product.videoUrl ?? "",
          published: product.published,
          featured: product.featured,
          categoryId: product.categoryId ?? "",
          metaTitleEn: product.metaTitleEn ?? "",
          metaTitleAr: product.metaTitleAr ?? "",
          metaDescEn: product.metaDescEn ?? "",
          metaDescAr: product.metaDescAr ?? "",
          images: product.images.length
            ? product.images.map((img) => ({ url: img.url, alt: img.alt }))
            : [{ url: "", alt: "" }],
          variants: product.variants.map((v) => ({
            nameEn: v.nameEn,
            nameAr: v.nameAr,
            sku: v.sku,
            priceDelta: v.priceDelta,
            stock: v.stock,
          })),
        }}
      />
    </div>
  );
}
