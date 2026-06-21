import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";
import { locales } from "@/lib/i18n/dictionaries";

// The build environment has no DB connection, and product slugs change at
// any time from the admin dashboard — render per-request instead of
// prerendering (and caching) at build time.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/products",
  "/cart",
  "/legal/privacy",
  "/legal/returns",
  "/legal/shipping",
  "/legal/terms",
  "/shipping-uae",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
    })),
  );

  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const productEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    products.map((p) => ({
      url: `${base}/${locale}/products/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  );

  return [...staticEntries, ...productEntries];
}
