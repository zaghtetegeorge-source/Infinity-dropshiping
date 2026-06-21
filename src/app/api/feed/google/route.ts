import { NextRequest, NextResponse } from "next/server";
import { authConfig, siteConfig } from "@/lib/env";
import { checkFeedToken, escapeXml, getFeedProducts, priceWithCurrency, productUrl } from "@/lib/feeds/common";

// Google Merchant Center / Performance Max product feed.
// Submit this URL as a "Scheduled fetch" in Merchant Center > Products > Feeds.
// Spec: https://support.google.com/merchants/answer/7052112
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!checkFeedToken(searchParams, authConfig.feedSecret)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const currency = searchParams.get("currency") || siteConfig.defaultCurrency;
  const locale = (searchParams.get("locale") as "ar" | "en") || "en";

  const products = await getFeedProducts();

  const items = products
    .map((p) => {
      const title = locale === "ar" ? p.titleAr : p.titleEn;
      const description = locale === "ar" ? p.descriptionAr : p.descriptionEn;
      const image = p.images[0]?.url;
      const extraImages = p.images.slice(1, 11);
      const availability = p.stock > 0 ? "in stock" : "out of stock";

      return `
  <item>
    <g:id>${escapeXml(p.id)}</g:id>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${escapeXml(productUrl(p.slug, locale))}</link>
    ${image ? `<g:image_link>${escapeXml(image)}</g:image_link>` : ""}
    ${extraImages.map((img) => `<g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`).join("\n    ")}
    <g:availability>${availability}</g:availability>
    <g:price>${priceWithCurrency(p.price, currency)}</g:price>
    <g:condition>${escapeXml(p.condition)}</g:condition>
    <g:brand>${escapeXml(p.brand)}</g:brand>
    ${p.gtin ? `<g:gtin>${escapeXml(p.gtin)}</g:gtin>` : `<g:identifier_exists>no</g:identifier_exists>`}
    ${p.mpn ? `<g:mpn>${escapeXml(p.mpn)}</g:mpn>` : ""}
    ${p.category ? `<g:product_type>${escapeXml(p.category.nameEn)}</g:product_type>` : ""}
    <g:shipping_label>${escapeXml(p.category?.nameEn ?? "general")}</g:shipping_label>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(siteConfig.name)} Product Feed</title>
  <link>${escapeXml(siteConfig.url)}</link>
  <description>Dynamic product feed for Google Merchant Center / Performance Max</description>
  ${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
