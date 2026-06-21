import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/env";
import { convertFromAed } from "@/lib/currency";

export async function getFeedProducts() {
  return prisma.product.findMany({
    where: { published: true },
    include: { images: { orderBy: { position: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function productUrl(slug: string, locale: "ar" | "en" = "en") {
  return `${siteConfig.url}/${locale}/products/${slug}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function priceWithCurrency(amountInAed: number, currency: string): string {
  return `${convertFromAed(amountInAed, currency).toFixed(2)} ${currency}`;
}

export function checkFeedToken(searchParams: URLSearchParams, configuredToken: string): boolean {
  if (!configuredToken) return true; // no token configured -> feed is public (required for crawlers)
  return searchParams.get("token") === configuredToken;
}
