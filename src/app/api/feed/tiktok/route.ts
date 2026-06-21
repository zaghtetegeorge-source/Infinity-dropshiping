import { NextRequest, NextResponse } from "next/server";
import { authConfig, siteConfig } from "@/lib/env";
import { checkFeedToken, getFeedProducts, priceWithCurrency, productUrl } from "@/lib/feeds/common";

// TikTok Shop / Catalog Manager product feed (CSV) for Catalog Sales / Smart
// Performance campaigns. Add this URL as a scheduled feed in TikTok Events
// Manager > Assets > Catalogs > Data Feeds.
// Spec: https://ads.tiktok.com/help/article/catalog-feed-requirements
export const revalidate = 0;

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!checkFeedToken(searchParams, authConfig.feedSecret)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const currency = searchParams.get("currency") || siteConfig.defaultCurrency;
  const locale = (searchParams.get("locale") as "ar" | "en") || "en";

  const products = await getFeedProducts();

  const header = [
    "sku_id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
    "inventory",
    "product_type",
  ];

  const rows = products.map((p) => {
    const title = locale === "ar" ? p.titleAr : p.titleEn;
    const description = locale === "ar" ? p.descriptionAr : p.descriptionEn;
    const image = p.images[0]?.url ?? "";
    const availability = p.stock > 0 ? "in stock" : "out of stock";

    return [
      p.id,
      title,
      description,
      availability,
      p.condition,
      priceWithCurrency(p.price, currency),
      productUrl(p.slug, locale),
      image,
      p.brand,
      String(p.stock),
      p.category?.nameEn ?? "",
    ]
      .map(csvCell)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
