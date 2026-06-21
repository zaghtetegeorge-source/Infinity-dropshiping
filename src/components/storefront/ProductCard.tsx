import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/currency";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";

export interface ProductCardData {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string;
  categoryName?: string;
  avgRating?: number;
  reviewCount?: number;
}

export function ProductCard({ product, locale, currency }: { product: ProductCardData; locale: Locale; currency: string }) {
  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/${locale}/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : null}
        {onSale ? (
          <span className="absolute top-2 start-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
            SALE
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/${locale}/products/${product.slug}`} className="line-clamp-2 font-medium hover:text-brand">
          {title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPrice(product.price, currency, locale)}</span>
          {onSale ? (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!, currency, locale)}
            </span>
          ) : null}
        </div>
        <AddToCartButton
          locale={locale}
          productId={product.id}
          slug={product.slug}
          titleEn={product.titleEn}
          titleAr={product.titleAr}
          image={product.image}
          priceAed={product.price}
          category={product.categoryName}
          className="mt-auto rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-dark"
        />
      </div>
    </div>
  );
}
