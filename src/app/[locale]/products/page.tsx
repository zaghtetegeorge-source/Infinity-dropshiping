import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/ProductCard";
import { siteConfig } from "@/lib/siteConfig";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "المتجر" : "Shop" };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const dict = getDictionary(locale);

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, ...(category ? { category: { slug: category } } : {}) },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{dict.nav.shop}</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <a href={`/${locale}/products`} className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "bg-black text-white" : ""}`}>
          {locale === "ar" ? "الكل" : "All"}
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/${locale}/products?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${category === c.slug ? "bg-black text-white" : ""}`}
          >
            {locale === "ar" ? c.nameAr : c.nameEn}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            locale={locale}
            currency={siteConfig.defaultCurrency}
            product={{
              id: p.id,
              slug: p.slug,
              titleEn: p.titleEn,
              titleAr: p.titleAr,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              image: p.images[0]?.url,
              categoryName: p.category?.nameEn,
            }}
          />
        ))}
      </div>
    </div>
  );
}
