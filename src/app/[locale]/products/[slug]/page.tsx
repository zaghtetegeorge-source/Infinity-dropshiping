import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductOptions } from "@/components/storefront/ProductOptions";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";
import { ProductCard } from "@/components/storefront/ProductCard";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, published: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const title = (locale === "ar" ? product.metaTitleAr : product.metaTitleEn) || (locale === "ar" ? product.titleAr : product.titleEn);
  const description =
    (locale === "ar" ? product.metaDescAr : product.metaDescEn) || (locale === "ar" ? product.descriptionAr : product.descriptionEn).slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images[0] ? [product.images[0].url] : [],
    },
    alternates: { canonical: `/${locale}/products/${slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { published: true, categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
    include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
  });

  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.brand },
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.defaultCurrency,
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/${locale}/products/${product.slug}`,
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <div className="grid gap-10 sm:grid-cols-2">
        <ProductGallery images={product.images} videoUrl={product.videoUrl} title={title} />

        <div>
          <h1 className="mb-2 text-2xl font-bold">{title}</h1>
          {avgRating ? (
            <p className="mb-4 text-sm text-gray-500">
              ⭐ {avgRating.toFixed(1)} ({product.reviews.length} {dict.product.reviews})
            </p>
          ) : null}

          <ProductOptions
            locale={locale}
            productId={product.id}
            slug={product.slug}
            titleEn={product.titleEn}
            titleAr={product.titleAr}
            image={product.images[0]?.url}
            basePrice={product.price}
            stock={product.stock}
            category={product.category?.nameEn}
            variants={product.variants}
          />

          <dl className="mt-6 space-y-1 text-sm text-gray-500">
            <div className="flex gap-2">
              <dt className="font-medium">{dict.product.sku}:</dt>
              <dd>{product.id.slice(-8).toUpperCase()}</dd>
            </div>
            {product.category ? (
              <div className="flex gap-2">
                <dt className="font-medium">{dict.product.category}:</dt>
                <dd>{locale === "ar" ? product.category.nameAr : product.category.nameEn}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="mt-12 max-w-3xl">
        <h2 className="mb-3 text-xl font-bold">{dict.product.description}</h2>
        <p className="whitespace-pre-line text-gray-700">{description}</p>
      </div>

      <div className="mt-12 max-w-3xl">
        <ReviewsSection
          locale={locale}
          productId={product.id}
          initialReviews={product.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        />
      </div>

      {related.length > 0 ? (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold">{dict.product.relatedProducts}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
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
      ) : null}
    </div>
  );
}
